import { mkdirSync, readFileSync, writeFileSync, cpSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const operators = JSON.parse(readFileSync(join(root, "data/operators.json"), "utf8"));
const siteUrl = "https://michaelheavener4.github.io/dog-sledding-tours";

const STATE_NAMES = {
  AK: "Alaska", AL: "Alabama", AR: "Arkansas", AZ: "Arizona", CA: "California",
  CO: "Colorado", CT: "Connecticut", DC: "District of Columbia", DE: "Delaware",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", IA: "Iowa", ID: "Idaho",
  IL: "Illinois", IN: "Indiana", KS: "Kansas", KY: "Kentucky", LA: "Louisiana",
  MA: "Massachusetts", MD: "Maryland", ME: "Maine", MI: "Michigan", MN: "Minnesota",
  MO: "Missouri", MS: "Mississippi", MT: "Montana", NC: "North Carolina", ND: "North Dakota",
  NE: "Nebraska", NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NV: "Nevada",
  NY: "New York", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania",
  RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee",
  TX: "Texas", UT: "Utah", VA: "Virginia", VT: "Vermont", WA: "Washington",
  WI: "Wisconsin", WV: "West Virginia", WY: "Wyoming",
};

const TYPE_LABELS = {
  "ride-along": "Ride-along",
  "drive-your-own": "Drive your own team",
  overnight: "Overnight",
  "kennel-tour": "Kennel tour",
};

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function money(n) {
  return "$" + Number(n).toLocaleString("en-US");
}

function priceLine(op) {
  if (op.priceMin == null && op.priceMax == null) return "Not published as a per-person range";
  const unit = op.priceBasis === "per-person" || op.priceBasis === "mixed" ? " per person" : "";
  if (op.priceMin != null && op.priceMax != null && op.priceMin !== op.priceMax) {
    return `${money(op.priceMin)}–${money(op.priceMax)}${unit}`;
  }
  if (op.priceMin != null) return `From ${money(op.priceMin)}${unit}`;
  return `Up to ${money(op.priceMax)}${unit}`;
}

function stateSlug(code) {
  return STATE_NAMES[code].toLowerCase().replaceAll(" ", "-");
}

function byName(a, b) {
  return a.name.localeCompare(b.name);
}

const byState = new Map();
for (const op of operators) {
  if (!byState.has(op.state)) byState.set(op.state, []);
  byState.get(op.state).push(op);
}
for (const list of byState.values()) list.sort(byName);
const stateCodes = [...byState.keys()].sort((a, b) => STATE_NAMES[a].localeCompare(STATE_NAMES[b]));

function layout({ title, description, path, depth, body, jsonLd }) {
  const prefix = "../".repeat(depth);
  const canonical = siteUrl + path;
  const ld = jsonLd
    ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`
    : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${esc(canonical)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${esc(canonical)}">
  <link rel="stylesheet" href="${prefix}assets/site.css">
  ${ld}
</head>
<body>
  <a class="skip" href="#content">Skip to content</a>
  <header class="site">
    <div class="wrap bar">
      <a class="brand" href="${prefix}index.html">US Dog Sledding Directory</a>
      <nav aria-label="Primary">
        <a href="${prefix}index.html">Directory</a>
        <a href="${prefix}how-to-choose.html">How to choose</a>
        <a href="${prefix}about.html">About</a>
      </nav>
    </div>
  </header>
  <main id="content" class="wrap">
    ${body}
  </main>
  <footer class="site">
    <div class="wrap">
      <p>Prices and limits are copied only when an operator published them, and they are dated. Blank fields were not on the source page. This directory does not sell tours.</p>
    </div>
  </footer>
</body>
</html>
`;
}

function chips(op) {
  const bits = op.tourTypes.map((t) => `<span class="chip">${esc(TYPE_LABELS[t])}</span>`);
  if (op.driveYourOwn === true) bits.push(`<span class="chip">Guests can drive</span>`);
  if (op.kidFriendly === true) bits.push(`<span class="chip">Kid notes published</span>`);
  return `<div class="chips">${bits.join("")}</div>`;
}

function card(op, depth) {
  const prefix = "../".repeat(depth);
  const href = `${prefix}operators/${op.id}.html`;
  const price = priceLine(op);
  return `<article class="card" data-operator data-state="${esc(op.state)}" data-types="${esc(op.tourTypes.join(" "))}" data-drive="${op.driveYourOwn === null ? "" : String(op.driveYourOwn)}" data-kid="${op.kidFriendly === true ? "true" : ""}" data-price-min="${op.priceMin ?? ""}" data-price-basis="${esc(op.priceBasis || "")}">
    <h3><a href="${href}">${esc(op.name)}</a></h3>
    <p class="meta">${esc(op.town)}, ${esc(STATE_NAMES[op.state])}</p>
    <p>${esc(op.summary)}</p>
    <p class="meta">${esc(price)}${op.priceAsOf ? ` · as of ${esc(op.priceAsOf)}` : ""}</p>
    ${chips(op)}
  </article>`;
}

function partnerSlot(op) {
  if (!op.partnerUrl) {
    return `<aside class="partner-slot" data-partner-slot hidden>
      <a data-partner-link href="">Book via partner</a>
    </aside>`;
  }
  return `<aside class="partner-slot" data-partner-slot>
    <a data-partner-link href="${esc(op.partnerUrl)}" rel="nofollow sponsored">Book via partner</a>
  </aside>`;
}

function factRow(label, value) {
  const shown = value == null || value === "" ? "Not stated" : value;
  return `<tr><th scope="row">${esc(label)}</th><td>${shown}</td></tr>`;
}

const pages = [];

const homeStates = stateCodes.map((code) => {
  const n = byState.get(code).length;
  return `<li><a href="states/${stateSlug(code)}.html">${esc(STATE_NAMES[code])}<span class="count">${n}</span></a></li>`;
}).join("");

const homeCards = [...operators].sort(byName).map((op) => card(op, 0)).join("\n");
const stateOptions = stateCodes.map((code) => `<option value="${code}">${esc(STATE_NAMES[code])}</option>`).join("");
const typeOptions = Object.entries(TYPE_LABELS).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join("");

const homeBody = `
  <h1>Dog sledding tours and kennel rides in the United States</h1>
  <p class="lede">A directory of operators in Alaska and the lower 48 whose own websites were live and selling tours when checked on 19–21 November 2026. Each listing records season, tour type, duration, published prices, and age or weight limits only when the operator stated them.</p>
  <p class="note">${operators.length} operators across ${stateCodes.length} states. ${operators.filter((o) => o.priceMin != null || o.priceMax != null || (o.priceNote && /\d/.test(o.priceNote))).length} have a price on their site. Fields left blank were not published.</p>
  <h2>States</h2>
  <ul class="state-index">${homeStates}</ul>
  <h2>Filter operators</h2>
  <form class="filters" data-filters>
    <div>
      <label for="state">State</label>
      <select id="state" name="state"><option value="">All states</option>${stateOptions}</select>
    </div>
    <div>
      <label for="type">Tour type</label>
      <select id="type" name="type"><option value="">Any type</option>${typeOptions}</select>
    </div>
    <div>
      <label for="drive">Drive your own team</label>
      <select id="drive" name="drive">
        <option value="">Any</option>
        <option value="yes">Yes, stated</option>
        <option value="no">No, guide drives</option>
        <option value="unstated">Not stated</option>
      </select>
    </div>
    <div>
      <label for="price">Price band</label>
      <select id="price" name="price">
        <option value="">Any</option>
        <option value="under-100">Under $100 per person</option>
        <option value="100-199">$100–$199 per person</option>
        <option value="200-349">$200–$349 per person</option>
        <option value="350-up">$350 and up per person</option>
        <option value="unpublished">No per-person price published</option>
      </select>
    </div>
    <div class="checks">
      <span>Kid-friendly</span>
      <label><input type="checkbox" name="kid"> Only where the site states it</label>
    </div>
    <button class="reset" type="reset">Reset filters</button>
  </form>
  <p id="result-count" data-count></p>
  <p data-empty hidden>No operators match these filters.</p>
  <div class="grid">${homeCards}</div>
  <script src="assets/filters.js"></script>
`;

pages.push({
  file: "index.html",
  html: layout({
    title: "US Dog Sledding Directory | Alaska and Lower 48 Tours",
    description: "Dog sledding tours and kennel rides in Alaska and the lower 48, with season dates, tour types, and prices only when the operator published them.",
    path: "/",
    depth: 0,
    body: homeBody,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "US Dog Sledding Directory",
      url: siteUrl + "/",
      description: "Directory of US dog sledding tour operators with sourced prices and seasons.",
    },
  }),
});

for (const code of stateCodes) {
  const list = byState.get(code);
  const name = STATE_NAMES[code];
  const priced = list.filter((o) => o.priceMin != null || (o.priceNote && /\d/.test(o.priceNote))).length;
  const body = `
    <p class="note"><a href="../index.html">All states</a></p>
    <h1>Dog sledding in ${esc(name)}</h1>
    <p class="lede">${list.length} operator${list.length === 1 ? "" : "s"} with a live site selling tours. ${priced} publish a price on that site.</p>
    <div class="grid">${list.map((op) => card(op, 1)).join("\n")}</div>
  `;
  pages.push({
    file: `states/${stateSlug(code)}.html`,
    html: layout({
      title: `Dog Sledding in ${name} | Operators and Prices`,
      description: `${list.length} dog sledding operators in ${name}, with published seasons, tour types, and prices where the operator states them.`,
      path: `/states/${stateSlug(code)}.html`,
      depth: 1,
      body,
    }),
  });
}

for (const op of operators) {
  const name = STATE_NAMES[op.state];
  const types = op.tourTypes.map((t) => TYPE_LABELS[t]).join(", ");
  const drive = op.driveYourOwn === true ? "Yes" : op.driveYourOwn === false ? "No — a guide drives" : "Not stated";
  const kid = op.kidFriendly === true ? (op.kidNote || "The site says children or families can take part.") : op.kidFriendly === false ? (op.kidNote || "The site limits or excludes children.") : "Not stated";
  const sources = op.sources.map((s) => `<li><a href="${esc(s.url)}">${esc(s.url)}</a> — ${esc(s.what || "operator page")} (retrieved ${esc(s.retrieved)})</li>`).join("");
  const body = `
    <p class="note"><a href="../states/${stateSlug(op.state)}.html">${esc(name)}</a> · <a href="../index.html">Directory</a></p>
    <h1>${esc(op.name)}</h1>
    <p class="lede">${esc(op.summary)}</p>
    <p class="meta">${esc(op.town)}, ${esc(name)}</p>
    ${chips(op)}
    <div class="actions">
      <a class="book" href="${esc(op.bookingUrl)}">Book on the operator site</a>
      ${partnerSlot(op)}
    </div>
    <table class="facts">
      <tbody>
        ${factRow("Season", op.season ? esc(op.season) : null)}
        ${factRow("Tour types", esc(types))}
        ${factRow("Drive your own team", esc(drive))}
        ${factRow("Duration", op.duration ? esc(op.duration) : null)}
        ${factRow("Price", esc(priceLine(op)) + (op.priceNote ? `<br>${esc(op.priceNote)}` : "") + (op.priceAsOf ? `<br><span class="meta">As of ${esc(op.priceAsOf)}, from the operator site.</span>` : ""))}
        ${factRow("Minimum age", op.minAge == null || op.minAge === "" ? null : esc(op.minAge))}
        ${factRow("Weight limit", op.weightLimit ? esc(op.weightLimit) : null)}
        ${factRow("Children", kid === "Not stated" ? null : esc(String(kid).replaceAll("<", "")) )}
      </tbody>
    </table>
    <h2>Sources</h2>
    <ul class="sources">${sources}</ul>
    <p class="note">Summary written for this directory. Booking opens the operator’s own page. The partner slot stays empty until a specific Viator or GetYourGuide URL is added for this operator.</p>
  `;
  const descTown = `${op.name} in ${op.town}, ${name}: ${op.summary}`.slice(0, 155);
  pages.push({
    file: `operators/${op.id}.html`,
    html: layout({
      title: `${op.name} | Dog Sledding in ${op.town}, ${name}`,
      description: descTown,
      path: `/operators/${op.id}.html`,
      depth: 1,
      body,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "TouristAttraction",
        name: op.name,
        description: op.summary,
        url: op.website,
        address: {
          "@type": "PostalAddress",
          addressLocality: op.town,
          addressRegion: op.state,
          addressCountry: "US",
        },
      },
    }),
  });
}

const chooseBody = `
  <h1>How to choose a dog sled tour</h1>
  <p class="lede">These are the distinctions operators use on their own pages, and the questions that change what you book. This page does not rank kennels.</p>
  <h2>What the tour types mean</h2>
  <h3>Ride-along</h3>
  <p>You sit in the sled basket or on a seated sled while a musher stands on the runners and drives. Many family tours are ride-alongs. The visit often includes time in the yard before or after the trail.</p>
  <h3>Drive your own team</h3>
  <p>You stand on the runners and drive, usually after a short lesson. Two guests often share one sled and switch halfway. Some operators tether a second “tag sled” behind the guide so you steer without controlling the dogs. A page that says a guide “may” let you try is not the same product as a tour sold as drive-your-own.</p>
  <h3>Overnight</h3>
  <p>More than one day on the trail, with a cabin, lodge, yurt, or camp between days. Price is often a package that includes meals and lodging, so it is not comparable to a one-hour ride.</p>
  <h3>Kennel tour</h3>
  <p>A yard visit: meet the dogs, hear how they are trained, and sometimes watch a short demo or cart run. Some kennels sell this on its own in the shoulder season. A summer “sled” may be a wheeled cart or a training rig, not snow.</p>
  <h2>Questions to ask before you pay</h2>
  <ul>
    <li>What are this year’s start and end dates, and what happens if there is not enough snow? Some operators switch to carts; some cancel.</li>
    <li>Is the price per person or per sled, and what is extra (permit, shuttle, photos, gratuity, a lap child)?</li>
    <li>Will a guide drive the whole way, or will I drive? If I drive, what is the minimum age, and can I ride instead?</li>
    <li>What is the weight limit per person and per sled? What is the minimum age?</li>
    <li>How long is the time on the sled, and how long is the whole visit?</li>
    <li>How many guests share a sled, and do you mix strangers?</li>
    <li>What is the cancellation window, and who decides if weather stops the trip?</li>
    <li>Do you provide parkas or boots, or should I bring ski clothing?</li>
    <li>Where do I meet, and is the shuttle a separate fare?</li>
  </ul>
  <h2>How to read a price on this site</h2>
  <p>A dollar figure appears only when that operator’s website showed it on the retrieval date printed on the listing. “From” means the site published a starting rate. A per-sled price is not divided into a made-up per-person rate. If the site did not state a price, the field says it was not published. Rates change; use the booking link to confirm.</p>
  <p>Price-band filters use the lowest published per-person rate for an adult or a standard guest on a sled ride or kennel visit. A separate kennel-tour price can place an operator in a lower band than the sled ride. Discounted child fares and lap-child add-ons are written in the note and do not set the band when an adult rate is also published. Per-sled-only operators stay in “no per-person price published.”</p>
`;

pages.push({
  file: "how-to-choose.html",
  html: layout({
    title: "How to Choose a Dog Sled Tour",
    description: "What ride-along, drive-your-own, overnight, and kennel tours mean, and the questions to ask about price, age, weight, and snow.",
    path: "/how-to-choose.html",
    depth: 0,
    body: chooseBody,
  }),
});

const aboutBody = `
  <h1>About this directory</h1>
  <p class="lede">Listings are checked against the operator’s own website. A name on an old directory is not enough to include them.</p>
  <h2>What gets included</h2>
  <ul>
    <li>The operator’s website loads and describes tours they are selling, including a dated season, a booking calendar, or a current price.</li>
    <li>The operation is in the United States. Alaska and the main lower-48 mushing states are the focus of this version.</li>
    <li>Kennel tours count when the kennel sells the visit. A closed-for-the-season page with no current product does not.</li>
  </ul>
  <h2>What is recorded</h2>
  <p>For each operator: town, a short factual summary written for this site, season dates, tour types, duration, the published price range with the date it was read, minimum age and weight limits when stated, whether guests drive, and the booking link. Phone numbers, email addresses, star ratings, and review text are not collected.</p>
  <p>If the site does not state a fact, the field is blank. Prices are not estimated from blogs, tourism roundups, or older directories. A price dated on the listing is the date that page was read, not a promise that the fare is still current.</p>
  <h2>Discovery versus sources</h2>
  <p>Names were first spotted on Sled Dog Central’s USA rides list (a static list last copyrighted through 2020, with no prices used), the Iditarod mushing business directory, Travel Alaska and state tourism pages, and ordinary web search. Those pages were only a way to find a name. Every fact on an operator page here comes from the URLs in that listing’s source list.</p>
  <h2>Partner booking</h2>
  <p>Each operator page has a “Book via partner” slot that stays hidden. It is reserved for a future Viator or GetYourGuide link for that specific operator. No affiliate link is published in this version.</p>
  <h2>Updates</h2>
  <p>The file <code>data/operators.json</code> is the source. See the repository README for how a later run should append an operator without overwriting checked listings.</p>
`;

pages.push({
  file: "about.html",
  html: layout({
    title: "About This Directory | How Listings Are Checked",
    description: "How this dog sledding directory decides which operators to include, and why prices are left blank when a site does not publish them.",
    path: "/about.html",
    depth: 0,
    body: aboutBody,
  }),
});

rmSync(dist, { recursive: true, force: true });
mkdirSync(join(dist, "assets"), { recursive: true });
mkdirSync(join(dist, "data"), { recursive: true });
mkdirSync(join(dist, "states"), { recursive: true });
mkdirSync(join(dist, "operators"), { recursive: true });
cpSync(join(root, "src/site.css"), join(dist, "assets/site.css"));
cpSync(join(root, "src/filters.js"), join(dist, "assets/filters.js"));
cpSync(join(root, "data/operators.json"), join(dist, "data/operators.json"));
writeFileSync(join(dist, ".nojekyll"), "");

for (const page of pages) {
  const out = join(dist, page.file);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, page.html);
}

const urls = [
  "/",
  "/how-to-choose.html",
  "/about.html",
  ...stateCodes.map((code) => `/states/${stateSlug(code)}.html`),
  ...operators.map((op) => `/operators/${op.id}.html`),
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${siteUrl}${u === "/" ? "/" : u}</loc></url>`).join("\n")}
</urlset>
`;
writeFileSync(join(dist, "sitemap.xml"), sitemap);
writeFileSync(join(dist, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);

const priced = operators.filter((o) => o.priceMin != null || o.priceMax != null || (o.priceNote && /\d/.test(o.priceNote))).length;
console.log(`Built ${pages.length} pages, ${operators.length} operators, ${priced} with a published price figure`);
