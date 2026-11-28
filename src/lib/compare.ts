import type { DrawingName } from "@/components/drawings.generated";
import { ELSEWHERE, MAINWP_PRO_YEARLY, WP_HOST } from "@/lib/prices";
import { LOWEST_PRICE, WHOLESALE_PERCENT, sitePrice } from "@/lib/site";

const SHOPIFY = ELSEWHERE.store.find((p) => p.who === "Shopify")!;

// Comparison pages (/compare/<slug>). Keep every claim about the other option general and fair:
// say what it is and how it usually works, never anything we can't back up. Dated prices live in src/lib/prices.ts.
export interface Comparison {
  slug: string;
  name: string;
  side: "owners" | "technical";
  drawing: DrawingName;
  title: string;
  lead: string;
  // [what you need, the other option, AnyPress]
  rows: [string, string, string][];
  // When the other option is the better choice. Saying so honestly is part of the page.
  theirs: string;
  ours: string;
  // More side-by-sides under the first one, each about one part of the job.
  more?: CompareSection[];
  // The questions people ask about this comparison, answered plainly.
  questions: [string, string][];
}

export interface CompareSection {
  eyebrow: string;
  title: string;
  lead?: string;
  head: [string, string, string];
  rows: [string, string, string][];
}

export const COMPARISONS: Comparison[] = [
  {
    slug: "hosting",
    name: "WordPress hosting",
    side: "owners",
    drawing: "server",
    title: "Hosting gives you a space. AnyPress gives you a finished site.",
    lead: "With regular hosting you rent room on a server and build the rest yourself. With AnyPress you pick what you're building and it arrives ready to use.",
    rows: [
      ["WordPress installed", "Usually one click, then it's up to you", "Done, with the right tools set up"],
      ["Price", `From $${WP_HOST.price} a month for the server alone (${WP_HOST.who})`, `From $${LOWEST_PRICE} a month, everything included`],
      ["Add-ons", "Buy them one by one, and hope they work together", "Included, and made to work together"],
      ["Payments, bookings or courses", "Find, buy and connect each one", "In the plan you pick"],
      ["Email from your business name", "Often a separate add-on", "Included"],
      ["Security fixes for WordPress", "Your job", "Done for you"],
      ["A copy saved every night", "Depends on the plan", "Included"],
    ],
    theirs: "You want full control of a server, run software that isn't WordPress, or enjoy setting everything up yourself.",
    ours: "You'd rather spend your time on your business than on plugins, updates and settings.",
    more: [
      {
        eyebrow: "after it's live",
        title: "Who looks after the site.",
        lead: "A host keeps the server running. Everything on top of it is still yours to look after.",
        head: ["Looking after it", "Regular hosting", "AnyPress"],
        rows: [
          ["Plugin and theme updates", "You press update, then check nothing broke", "Tested on every kind of site first, then done overnight"],
          ["A copy saved every night", "Depends on the plan, and on you setting it up", "Every night, and checked that it restores"],
          ["Getting yesterday's site back", "Often a support ticket, or a plugin you set up", "One click, from your account"],
          ["Something on the site breaks", "The host looks after the server, not your site", "Roll back, or add a care package and we fix it"],
          ["Spam and hacking attempts", "A security plugin you choose and set up", "Login protection already on"],
        ],
      },
    ],
    questions: [
      ["Is AnyPress a web host?", "Yes, and more. Your site runs on servers we look after, like any host. The difference is what's on it: a finished WordPress site with the right tools for your business already set up, instead of an empty one."],
      ["Can I add my own plugins and themes?", "Yes. You get the full WordPress admin, so you can install any plugin or theme, the same as with any host."],
      ["Do I need to know WordPress?", "No. Your site arrives designed, with pages already written for your kind of business. You change the words and pictures in the editor. If you'd rather not, a care package gets the changes done for you."],
      ["Can I bring the site I already have?", "Yes. Moving a WordPress site in is free and you can do it yourself from your new site. We can also do it for you as a one-time service."],
      ["Can I leave?", "Yes. You can download a full copy of your site at any time, and it works on any WordPress host."],
      ["What's included in the price?", "The hosting, your site's tools, email from your own domain, the security fixes, nightly copies of your site, and a free address until you connect your own domain. No cut of your sales."],
    ],
  },
  {
    slug: "shopify",
    name: "Shopify",
    side: "owners",
    drawing: "store",
    title: "Shopify rents you a store. AnyPress gives you one.",
    lead: "Both get you selling online. With Shopify you add paid apps as you grow and sell by their product rules. With AnyPress the tools come with the site, and the site is yours to take anywhere.",
    rows: [
      ["Starting price", `${SHOPIFY.plan} $${SHOPIFY.price} a month`, `From $${sitePrice("store")} a month`],
      ["Fee on your sales", `${SHOPIFY.note}`, "No AnyPress fee, only the card company's"],
      ["Bookings, courses and a mailing list", "Extra apps, each with its own price", "In the plan you pick"],
      ["What you can sell", "Shopify's rules decide", "Your payment provider's rules decide"],
      ["Moving somewhere else", "Rebuild your store on the new platform", "Download a full copy of your site"],
    ],
    theirs: "You sell at high volume across many sales channels, and want Shopify's in-person checkout and its app store.",
    ours: "You want one price with the tools included, sell something Shopify may not allow, or want a store you fully own.",
    more: [
      {
        eyebrow: "running the shop",
        title: "Day to day, side by side.",
        head: ["Running the shop", "Shopify", "AnyPress"],
        rows: [
          ["Products, stock and orders", "In Shopify's admin", "In your WordPress, with FluentCart"],
          ["An email list and follow-ups", "Usually an extra app", "Included, with FluentCRM"],
          ["Reviews, affiliates and a help desk", "Each an app of its own", "Included in the online store plan"],
          ["Blog and other pages", "Shopify's page editor", "The full WordPress editor"],
          ["Changing the design", "Shopify themes", "Any WordPress theme, or the one your site comes with"],
        ],
      },
    ],
    questions: [
      ["Can I move my Shopify store to AnyPress?", "Yes. Your site's assistant can bring your products over from your Shopify shop, photos included, as drafts you check before they go live. Your pages are rebuilt in WordPress, starting from the pages your new site already has."],
      ["Do you take a cut of my sales?", "No. AnyPress takes nothing from your sales. Your card company's fee is the only fee on a sale."],
      ["What can I sell?", "Anything your payment provider allows: physical products, downloads, memberships and subscriptions."],
      ["Do I need apps?", "Most of what Shopify sells as apps comes with the online store plan: an email list, reviews, affiliates, a help desk and search-friendly pages. You can still add any WordPress plugin."],
      ["Who looks after updates and backups?", "We do. Updates are tested before they reach your shop, and your shop is copied every night."],
    ],
  },
  {
    slug: "multisite",
    name: "WordPress multisite",
    side: "technical",
    drawing: "shops",
    title: "Every site on its own, not one network sharing everything.",
    lead: "Multisite runs many sites from one WordPress install and one database. AnyPress gives every site its own WordPress and its own database, so one site never drags down the rest.",
    rows: [
      ["Database", "One, shared by every site", "Each site has its own"],
      ["Plugins and themes", "Installed once for the whole network", "Each site has its own"],
      ["One site gets busy or breaks", "Can slow down or affect the others", "The others carry on as normal"],
      ["Plugins that don't support multisite", "Can't be used, or need workarounds", "Every site is a normal single site"],
      ["A client wants to leave", "The site has to be pulled out of the network", "It's a normal WordPress site they can take"],
      ["Security fixes and nightly copies", "Your job, for the whole network", "Done for you, site by site"],
    ],
    theirs: "Your sites really do share users and content, like the departments of one organisation, and your team runs the server.",
    ours: "Each site belongs to a different customer, with its own plugins, its own data and its own bill.",
    more: [
      {
        eyebrow: "looking after them",
        title: "Who does the work on each site.",
        head: ["Looking after sites", "Multisite", "AnyPress"],
        rows: [
          ["Updates", "One update for the whole network, tested by you", "Tested on every kind of site first, then done overnight"],
          ["Getting one site back", "Restoring one site out of a shared database is hard", "One click, for that site only"],
          ["Each client's own domain and email", "Domain mapping you set up", "From the dashboard, with the records to add"],
          ["Selling sites to clients", "Not part of it", "From your own shop, under your name"],
        ],
      },
    ],
    questions: [
      ["Is AnyPress built on multisite?", "No. Every site is its own WordPress with its own database. That's why one busy or broken site can't slow down the others."],
      ["Can my sites still look and work alike?", "Yes. Every site of a kind starts from the same design and tools, and you can make your own starting version for your clients' sites."],
      ["Can I move a multisite network to AnyPress?", "Each site can be moved in on its own, as a normal WordPress site."],
      ["Who runs the server?", "We do. You look after your clients, not servers. If you'd rather run it yourself, AnyPress can be set up on your own server."],
    ],
  },
  {
    slug: "wp-ultimo",
    name: "WP Ultimo",
    side: "technical",
    drawing: "tools",
    title: "A finished platform, instead of a plugin you host yourself.",
    lead: "WP Ultimo is a plugin that turns your own WordPress multisite network into a platform for selling sites. AnyPress is the whole platform, hosted and looked after for you.",
    rows: [
      ["What you get", "A plugin for your own multisite network", "A finished platform, hosted for you"],
      ["Servers", "You find, set up and look after them", "Included in the price per site"],
      ["How sites are kept apart", "They share one multisite network", "Each has its own WordPress and database"],
      ["Security fixes and nightly copies", "Your job", "Done for you"],
      ["Selling to your clients", "Checkout built into the plugin", "From your own shop, under your name"],
      ["A client wants to leave", "The site has to be pulled out of the network", "It's a normal WordPress site they can take"],
    ],
    theirs: "You already run a multisite network and want to look after every part of the server yourself.",
    ours: "You want to sell websites, not run servers. And if you ever want to host it yourself, AnyPress is open source.",
    more: [
      {
        eyebrow: "day to day",
        title: "What's left for you to run.",
        head: ["Running the business", "WP Ultimo", "AnyPress"],
        rows: [
          ["Servers, backups and security", "Yours to set up and watch", "Done for you"],
          ["Updates for every client site", "You run them across the network", "Tested on every kind of site first, then done overnight"],
          ["Your shop and its pages", "You build them", "Ready-made, under your name, and yours to change"],
          ["Plans for your clients", "You create them", "Already priced, and you can change them"],
          ["Finding clients", "Not part of it", "Prospect finder, website check and demos in your dashboard"],
        ],
      },
    ],
    questions: [
      ["Do I need my own server?", "No. Your clients' sites and your shop run on servers we look after. If you want your own server, AnyPress can be set up on it."],
      ["Can I change the shop I sell from?", "Yes. It's a full WordPress site: add any plugin or theme, rewrite any page, change your prices and add products of your own."],
      ["Can my clients leave with their site?", "Yes. Every site can be downloaded as a full copy that works on any WordPress host."],
      ["Is there a Pro version?", "No. Everything AnyPress makes is included."],
    ],
  },
  {
    slug: "managewp",
    name: "ManageWP",
    side: "technical",
    drawing: "agency",
    title: "Don't just manage client sites. Sell them.",
    lead: "ManageWP is a dashboard for looking after WordPress sites that are hosted somewhere else. AnyPress hosts the sites, looks after them, and lets you sell them under your own name.",
    rows: [
      ["Where client sites live", "Wherever each client hosts them", "With us, set up the same way"],
      ["Security fixes and copies", "You run them from one dashboard", "Done for you"],
      ["A new client site", "Set up hosting and WordPress, then connect it", "Created when your client checks out"],
      ["Selling sites to clients", "Not what it's for", "From your own shop, at your price"],
      ["Getting paid", "You bill clients separately", "Clients pay your shop every month"],
    ],
    theirs: "You look after sites that already live on many different hosts, and they're staying where they are.",
    ours: "You want to sell websites as a monthly service, without running hosting yourself.",
    more: [
      {
        eyebrow: "after you sell",
        title: "Looking after the sites you've sold.",
        lead: "Both do this. The difference is how much of the work is still yours.",
        head: ["Looking after sites", "ManageWP", "AnyPress"],
        rows: [
          ["Every client site in one list", "Yes", "Yes, with each site's plan, domains and last backup"],
          ["Sign in to a client's WordPress", "One click", "One click"],
          ["Updates", "You run them from the dashboard", "Tested on every kind of site first, then done overnight"],
          ["Backups", "Usually a paid add-on per site", "Every night, checked, included"],
          ["Domains and email from the client's domain", "Not part of it", "From your dashboard"],
          ["Your brand on the dashboard", "A paid add-on", "Included: your name, logo and colour"],
        ],
      },
    ],
    questions: [
      ["Can I keep using ManageWP?", "Yes. You can connect your AnyPress sites to it like any other site. Leave updates and backups to AnyPress on those sites, since we already run them."],
      ["Do I have to move every client?", "No. Move the sites you want, when you want. Moving a WordPress site in is free."],
      ["Who looks after my clients' sites?", "We do the updates, nightly copies and security fixes. You see every site in your dashboard and can step in on any of them."],
      ["Can my clients leave with their site?", "Yes. Every site can be downloaded as a full copy that works on any WordPress host."],
    ],
  },
  {
    slug: "mainwp",
    name: "MainWP",
    side: "technical",
    drawing: "lifebuoy",
    title: "MainWP helps you look after client sites. AnyPress does the looking after.",
    lead: "MainWP is a dashboard you install on your own WordPress site to look after client sites hosted anywhere. AnyPress hosts your clients' sites, looks after them for you, and gives you a shop to sell them from under your own name.",
    rows: [
      ["What it is", "A plugin for your own WordPress, plus a helper plugin on every client site", "Hosting, care and a shop to sell from, in one"],
      ["Where client sites live", "Wherever each client hosts them", "With us, each on its own WordPress and database"],
      ["Who does the updates", "You, from your dashboard", "We do: tested on every kind of site first, then done overnight"],
      ["Selling a new site", "Not what it's for", "Your client checks out in your shop and the site is built"],
      ["Price", `Free to start; Pro is $${MAINWP_PRO_YEARLY} a year, hosting and backup storage extra`, `From $${LOWEST_PRICE} a month per site, hosting and care included`],
    ],
    theirs: "Your clients' sites live on many different hosts and are staying there, and you want one place to look after them yourself.",
    ours: "You want to sell websites as a monthly service and have the hosting, updates and backups done for you.",
    more: [
      {
        eyebrow: "after you sell",
        title: "Looking after the sites you've sold.",
        lead: "Both look after sites you've already built and sold. With MainWP you press the buttons. With AnyPress the work is done for you, and you can still step in on any site.",
        head: ["Looking after sites", "MainWP", "AnyPress"],
        rows: [
          ["Every client site in one list", "Yes, in your own dashboard", "Yes, in your dashboard, with each site's plan, domains and last backup"],
          ["Sign in to a client's WordPress", "One click", "One click"],
          ["Plugin, theme and WordPress updates", "You run them, or set them to run on a schedule", "We test each one on every kind of site first, then update overnight"],
          ["If an update breaks something", "Newer versions can back up first and roll back; you run and check it", "An update that fails our checks never reaches sites, and every site can go back a version"],
          ["Backups", "Built into newer versions: you schedule them and connect storage you pay for", "Every night, stored off the server, with a restore checked every night"],
          ["Security fixes", "You apply them", "Done for you"],
          ["Server, speed and caching", "Up to each client's host", "Run by us, the same on every site"],
          ["Domains and email from the client's domain", "Not part of it", "From your dashboard"],
          ["Your brand on the dashboard", "A paid add-on", "Included: your name, logo and colour"],
          ["Monthly reports for your clients", "With Pro, a branded report you email them", "Your shop sells care packages that include a monthly report, under your name"],
          ["Your client leaving with their site", "It's already on their own host", "They download a full copy that works on any WordPress host"],
        ],
      },
      {
        eyebrow: "before you sell",
        title: "Getting the client in the first place.",
        lead: "MainWP starts once a site exists. AnyPress also covers selling it.",
        head: ["Selling sites", "MainWP", "AnyPress"],
        rows: [
          ["A shop to sell from", "Not part of it", "Your own shop: a full WordPress site you can change with any plugin or theme"],
          ["Taking monthly payments", "You bill clients separately", "Clients pay your shop every month, by card"],
          ["A new site after checkout", "You set up hosting and WordPress, then connect it", "Built for your client in minutes, ready to use"],
          ["Kinds of sites to sell", "Whatever you build", "Websites, bookings, online stores, communities and more, each with the right tools set up"],
          ["Your price", "Whatever you charge", "You set it; we charge you our price and you keep the difference"],
          ["Reselling instead", "Not part of it", `Resellers buy sites at ${WHOLESALE_PERCENT}% off and sell them as their own`],
        ],
      },
    ],
    questions: [
      ["What is MainWP?", "A free WordPress plugin you install on your own site to look after many client sites from one dashboard. Each client site gets a small helper plugin that connects it. Extras like client reports, white label and team roles come with its Pro licence."],
      ["Is AnyPress a MainWP alternative?", "For people who sell websites, yes. MainWP helps you do the care work yourself; AnyPress hosts the sites, does the care work for you, and gives you a shop to sell them from."],
      ["What does each one cost?", `MainWP is free to start, and Pro is $${MAINWP_PRO_YEARLY} a year; you still pay for hosting and backup storage for every site. AnyPress sites start at $${LOWEST_PRICE} a month, with hosting, updates, nightly backups and the tools for that kind of site included.`],
      ["Who does the updates?", "With MainWP, you do, from your dashboard. With AnyPress, we test every update on each kind of site first, then update your clients' sites overnight. You can still step in on any site."],
      ["Do I keep full control of my clients' sites?", "Yes. You and your clients keep full WordPress admin, with any plugin or theme you like. We only lock what keeps the site connected to AnyPress, like its domain settings."],
      ["Can I change my shop?", "Yes. Your shop is a full WordPress site: add any plugin or theme, rewrite any page, set your prices and sell products of your own."],
      ["Can I keep using MainWP with AnyPress sites?", "Yes, you can connect them like any other site. Leave updates and backups on those sites to AnyPress, since we already run them and test each update first."],
      ["Do I have to move every client?", "No. Move the sites you want, when you want, and keep looking after the rest where they are."],
      ["Is there a Pro version of AnyPress?", "No. Everything AnyPress makes is included in every plan."],
    ],
  },
];
