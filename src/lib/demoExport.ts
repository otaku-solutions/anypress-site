/**
 * "Make this my site" on /try: what the demo running in the visitor's browser holds, read out of its WordPress in the
 * shape the API's demo drafts take (POST /demos/drafts): pages, Site Editor styles, a changed header and footer, menus
 * and the business details. Never plugins, code, users or settings. Photos from the media library become
 * `anypress-demo-image:<name>` and are listed with their file, so the page can send them to their upload links; the
 * rest of the demo's own address becomes a relative link, so theme images and page links work on the new store.
 * Pages and menus the demo's sample business made stay behind unless the visitor changed them, and a changed page
 * loses the tables, charts, booking pages and sample forms that stay in the demo (the forms every store has stay).
 */

export interface DemoImage {
  name: string;
  path: string;
}

export interface DemoExport {
  content: {
    pages: { title: string; slug: string; content: string; status: "publish" | "draft" }[];
    styles?: { settings?: object; styles?: object };
    header?: string;
    footer?: string;
    menus?: { title: string; content: string }[];
    business?: Record<string, string>;
  };
  images: DemoImage[];
}

/** Runs inside the demo's WordPress (Playground's run()); prints the DemoExport as JSON. */
export const DEMO_EXPORT_PHP = String.raw`<?php
require '/wordpress/wp-load.php';

$home = untrailingslashit(home_url());
$uploads = wp_upload_dir();
$images = [];
$names = [];
$photo = function (string $url) use ($uploads, &$images, &$names): ?string {
    if (strpos($url, $uploads['baseurl'] . '/') !== 0) {
        return null;
    }
    if (isset($images[$url])) {
        return 'anypress-demo-image:' . $images[$url]['name'];
    }
    $path = $uploads['basedir'] . substr($url, strlen($uploads['baseurl']));
    $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
    if (count($images) >= 20 || !in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif'], true) || !is_file($path) || filesize($path) > 4 * 1024 * 1024) {
        return null;
    }
    $base = substr(trim((string) preg_replace('/[^a-z0-9._-]+/', '-', strtolower(pathinfo($path, PATHINFO_FILENAME))), '-._'), 0, 60) ?: 'photo';
    $name = $base . '.' . $ext;
    for ($i = 2; isset($names[$name]); $i++) {
        $name = $base . '-' . $i . '.' . $ext;
    }
    $names[$name] = true;
    $images[$url] = ['name' => $name, 'path' => $path];
    return 'anypress-demo-image:' . $name;
};
$clean = function (string $blocks) use ($home, $photo): string {
    $blocks = (string) preg_replace_callback('#https?://[^\s"\'<>()\\\\]+#', function ($m) use ($photo) {
        return $photo($m[0]) ?? $m[0];
    }, $blocks);
    // Theme images, page links: the same paths on the new store.
    return str_replace([$home . '/', str_replace('/', '\/', $home) . '\/'], ['/', '\/'], $blocks);
};

// Records a page shows by id that stay in the demo (a Ninja table or chart, a booking page, a form the sample business
// made): the new store has none of them, or something else under the same id. Their blocks come out, and so does a
// section that only titled one. The forms every store comes with (Fluent Forms' contact and subscription forms, which
// the sample only renames) keep their place.
$ownForms = array_filter(array_map('intval', [get_option('anypress_crm_contact_form')]));
if (function_exists('wpFluent')) {
    $ownForms = array_merge($ownForms, array_map('intval', wpFluent()->table('fluentform_forms')->whereIn('title', ['Contact Form Demo', 'Contact form', 'Subscription Form', 'Newsletter sign-up'])->pluck('id')->toArray()));
}
$stays = function (array $block) use ($ownForms): bool {
    $text = $block['blockName'] === 'core/shortcode' ? (string) $block['innerHTML'] : '';
    if (preg_match('/\[(ninja_tables|ninja_charts|fluent_booking[a-z_]*)\b/', $text)) {
        return true;
    }
    return preg_match('/\[fluentform\b[^\]]*\bid=["\']?(\d+)/', $text, $m) === 1 && !in_array((int) $m[1], $ownForms, true);
};
// Only headings and words (a section's title and intro), with nothing they introduce.
$onlyText = function (array $blocks) use (&$onlyText): bool {
    foreach ($blocks as $b) {
        $text = in_array($b['blockName'], ['core/heading', 'core/paragraph', 'core/spacer', null], true);
        if (!$text && !($b['blockName'] === 'core/group' && $onlyText($b['innerBlocks']))) {
            return false;
        }
    }
    return true;
};
$portable = function (array $blocks) use (&$portable, $stays, $onlyText): array {
    $out = [];
    foreach ($blocks as $block) {
        if ($stays($block)) {
            continue;
        }
        if (!empty($block['innerBlocks'])) {
            $kept = [];
            $content = [];
            $i = 0;
            $dropped = false;
            // The wrapper's own markup sits between its inner blocks, with a null for each: keep them in step.
            foreach ($block['innerContent'] as $piece) {
                if ($piece !== null) {
                    $content[] = $piece;
                    continue;
                }
                $child = $block['innerBlocks'][$i++];
                $left = $portable([$child]);
                if ($left === []) {
                    $dropped = true;
                    continue;
                }
                $dropped = $dropped || $left[0] !== $child;
                $kept[] = $left[0];
                $content[] = null;
            }
            if ($dropped && $onlyText($kept)) {
                continue;
            }
            $block['innerBlocks'] = $kept;
            $block['innerContent'] = $content;
        }
        $out[] = $block;
    }
    return $out;
};

// What the demo's sample business wrote and the visitor left as it was: the store starts from its own pages instead.
$sample = function (WP_Post $post): bool {
    $mark = (string) get_post_meta($post->ID, '_anypress_sample', true);
    return $mark !== '' && hash_equals($mark, md5($post->post_content));
};

$pages = [];
foreach (get_posts(['post_type' => 'page', 'post_status' => ['publish', 'draft'], 'numberposts' => 30, 'orderby' => 'menu_order title', 'order' => 'ASC']) as $page) {
    if (!preg_match('/^[a-z0-9][a-z0-9-]{0,199}$/', $page->post_name) || $sample($page)) {
        continue;
    }
    $pages[] = [
        'title' => mb_substr(get_the_title($page) ?: $page->post_name, 0, 200),
        'slug' => $page->post_name,
        'content' => $clean(serialize_blocks($portable(parse_blocks($page->post_content)))),
        'status' => $page->post_status === 'draft' ? 'draft' : 'publish',
    ];
}
$content = ['pages' => $pages];

$styles_id = WP_Theme_JSON_Resolver::get_user_global_styles_post_id();
$user = json_decode((string) get_post_field('post_content', $styles_id), true) ?: [];
$styles = array_filter(['settings' => $user['settings'] ?? null, 'styles' => $user['styles'] ?? null]);
if ($styles) {
    $content['styles'] = json_decode($clean((string) wp_json_encode($styles)), true);
}

foreach (['header', 'footer'] as $area) {
    $part = get_block_template(get_stylesheet() . '//' . $area, 'wp_template_part');
    if ($part && $part->wp_id && trim((string) $part->content) !== '') {
        $content[$area] = $clean((string) $part->content);
    }
}

$menus = [];
foreach (get_posts(['post_type' => 'wp_navigation', 'post_status' => 'publish', 'numberposts' => 5]) as $menu) {
    if (trim($menu->post_title) !== '' && trim($menu->post_content) !== '' && !$sample($menu)) {
        $menus[] = ['title' => mb_substr($menu->post_title, 0, 200), 'content' => $clean($menu->post_content)];
    }
}
if ($menus) {
    $content['menus'] = $menus;
}

$business = array_filter(array_map('strval', (array) get_option('anypress_business_profile', [])), 'strlen');
$business = array_intersect_key($business, array_flip(['what', 'who', 'area', 'hours', 'contact', 'voice', 'notes']));
if ($business) {
    $content['business'] = $business;
}

echo wp_json_encode(['content' => $content, 'images' => array_values($images)]);
`;
