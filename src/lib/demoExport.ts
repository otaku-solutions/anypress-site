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
// Each such code in a block's own text, read the way WordPress reads shortcodes: what's around it stays.
$demoOnly = array_values(array_filter(array_keys($GLOBALS['shortcode_tags']), static fn ($tag) => preg_match('/^(ninja_tables|ninja_charts|fluent_booking[a-z_]*|fluentform)$/', $tag)));
$strip = function (string $text) use ($demoOnly, $ownForms): string {
    if ($demoOnly === [] || strpos($text, '[') === false) {
        return $text;
    }
    return (string) preg_replace_callback('/' . get_shortcode_regex($demoOnly) . '/', static function ($m) use ($ownForms) {
        if ($m[1] === '[' && $m[6] === ']') {
            return $m[0]; // [[escaped]] shows as text
        }
        $atts = (array) shortcode_parse_atts($m[3]);
        $keep = $m[2] === 'fluentform' && in_array((int) ($atts['id'] ?? 0), $ownForms, true);
        return $keep ? $m[0] : '';
    }, $text);
};
// Only a section's title and intro (one heading, one paragraph, spacers), with nothing left for them to introduce.
$onlyTitles = static function (array $blocks): bool {
    $count = array_count_values(array_map(static fn ($b) => (string) $b['blockName'], $blocks));
    $other = array_diff_key($count, array_flip(['core/heading', 'core/paragraph', 'core/spacer']));
    $codes = array_filter($blocks, static fn ($b) => strpos((string) $b['innerHTML'], '[') !== false);
    return $other === [] && $codes === [] && ($count['core/heading'] ?? 0) <= 1 && ($count['core/paragraph'] ?? 0) <= 1;
};
// One block, with its codes taken out: null when nothing of it is left. $gone says whether a code took it all.
$portable = function (array $block, ?bool &$gone = false) use (&$portable, $strip, $onlyTitles): ?array {
    $gone = false;
    if (in_array($block['blockName'], ['core/shortcode', 'core/paragraph', 'core/freeform', null], true) && empty($block['innerBlocks'])) {
        $text = $strip((string) $block['innerHTML']);
        if ($text === $block['innerHTML']) {
            return $block;
        }
        if (trim(strip_tags($text, '<img><video><audio><iframe><svg>')) === '') { // nothing left but empty markup
            $gone = true;
            return null;
        }
        $block['innerHTML'] = $text;
        $block['innerContent'] = [$text];
        return $block;
    }
    if (empty($block['innerBlocks'])) {
        return $block;
    }
    $inner = [];
    $content = [];
    $removed = false;
    $i = 0;
    // The wrapper's own markup sits between its inner blocks, with a null for each: keep them in step.
    foreach ($block['innerContent'] as $piece) {
        if ($piece !== null) {
            $content[] = $piece;
            continue;
        }
        $child = $portable($block['innerBlocks'][$i++], $childGone);
        $removed = $removed || $childGone;
        if ($child !== null) {
            $inner[] = $child;
            $content[] = null;
        }
    }
    // A section that only titled what came out goes too; anything else keeps what's left in it.
    if ($removed && $onlyTitles($inner)) {
        return null;
    }
    $block['innerBlocks'] = $inner;
    $block['innerContent'] = $content;
    return $block;
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
        'content' => $clean(serialize_blocks(array_values(array_filter(array_map(static fn ($b) => $portable($b), parse_blocks($page->post_content)))))),
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
