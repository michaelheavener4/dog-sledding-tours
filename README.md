# US Dog Sledding Directory

Static directory of dog sledding tours and kennel rides in Alaska and the lower 48. Each listing is checked against the operator’s own website. Prices, ages, and weight limits are recorded only when that site publishes them.

The checked data lives in [`data/operators.json`](data/operators.json). `node scripts/build.mjs` writes the site to `dist/`.

## Pages

- Home, with a state index and filters for state, tour type, drive-your-own, price band, and kid-friendly where the site says so
- One page per state that has operators
- One page per operator, including an unused “Book via partner” slot for a future Viator or GetYourGuide link
- How to choose a dog sled tour (`how-to-choose.html`)
- About and methodology (`about.html`)
- `sitemap.xml` and `robots.txt`

Price bands use the lowest published adult or standard-guest per-person rate. A separate kennel-tour price can put an operator in a lower band than the sled ride. Child and lap-child fares stay in the note. Per-sled prices are not converted into a per-person number.

## Nightly growth

A later run can add operators without rewriting the site by hand:

1. Open `data/operators.json`. It is a JSON array. Append one object. Do not remove or renumber existing `id` values.
2. Required fields: `id` (unique kebab-case), `name`, `state` (postal code), `town`, `summary` (original sentences, not copied marketing), `tourTypes` (one or more of `ride-along`, `drive-your-own`, `overnight`, `kennel-tour`), `driveYourOwn` (`true`, `false`, or `null`), `website`, `bookingUrl`, and `sources` (at least one `{ "url", "retrieved", "what" }`).
3. Leave `season`, `duration`, `minAge`, `weightLimit`, `kidFriendly`, and `kidNote` null when the operator’s site does not state them. Do not add phone numbers, email addresses, star ratings, or review text.
4. If the site publishes a per-person rate, set `priceMin` and, when there is a top rate, `priceMax`, plus `priceBasis` of `per-person`. Put per-sled or mixed rates in `priceNote` and set `priceBasis` to `per-sled`, `mixed`, or `unspecified`. Set `priceAsOf` to the date that page was read (`YYYY-MM-DD`). If no number is published, leave the price fields null.
5. Keep `partnerUrl` null unless you are adding that operator’s own Viator or GetYourGuide URL.
6. Run `node scripts/validate.mjs && node scripts/build.mjs`. Validation fails on duplicate ids, missing sources, or a price without an as-of date.
7. Commit `data/operators.json` and push to `main`. The GitHub Actions workflow rebuilds `dist/` and deploys it. Do not commit `dist/`.

Only add an operator whose own site is live and currently selling tours. A name on Sled Dog Central, the Iditarod business directory, or a tourism page is a lead, not a source.

## Coverage

Checked 19–20 November 2026. “With a published price” means the operator’s site showed a dollar figure (per person, per sled, or a booking-page amount). It does not mean every product has a per-person rate.

| State | Operators | With a published price | Sources |
| --- | ---: | ---: | --- |
| Alaska | 16 | 13 | Operator websites, read 2026-11-19 |
| Arizona | 1 | 1 | Operator website, read 2026-11-20 |
| Colorado | 9 | 6 | Operator websites, read 2026-11-19 |
| Idaho | 1 | 1 | Operator website, read 2026-11-20 |
| Maine | 1 | 1 | Operator websites, read 2026-11-19 |
| Maryland | 1 | 1 | Operator website, read 2026-11-20 |
| Massachusetts | 1 | 1 | Operator websites, read 2026-11-19 |
| Michigan | 4 | 4 | Operator websites, read 2026-11-19 |
| Minnesota | 7 | 7 | Operator websites, read 2026-11-19 and 2026-11-20 |
| Montana | 5 | 5 | Operator websites, read 2026-11-19 and 2026-11-20 |
| New Hampshire | 1 | 1 | Operator websites, read 2026-11-19 |
| New York | 1 | 1 | Operator websites, read 2026-11-19 |
| Oregon | 1 | 1 | Operator websites, read 2026-11-19 |
| Utah | 2 | 2 | Operator websites, read 2026-11-19 |
| Vermont | 3 | 2 | Operator websites, read 2026-11-19 |
| Wisconsin | 1 | 0 | Operator websites, read 2026-11-19 |
| Wyoming | 3 | 2 | Operator websites, read 2026-11-19 and 2026-11-20 |
| **Total** | **58** | **49** | |

Operators with no dollar figure on the pages read: Alaska Sled Dog Tours (Talkeetna), Arctic Dog Adventure Co., Last Frontier Mushing Co-op, Alpine Adventures Dogsledding, San Juan Sled Dogs, Idarado Sled Dog Adventures, October Siberians, Wolfsong Adventures in Mushing, and Heart Six Guest Ranch.

## Not included in this pass

- Sled Dog Central’s USA list was used only to find names. It has no prices and is not a source for facts.
- `dogsledrides.com` returns 404 on the homepage. Old kennel pages are self-submitted and were not used.
- Mahoosuc Guide Service states on its site that dogsled trips are discontinued.
- Mornington Crescent Sled Dogs states that tours are no longer offered.
- Dog Sled Rides of Winter Park’s own site says sled, cart, and kennel tours are closed for the season.
- `monarchdogsledrides.com` no longer resolves to a dogsled operator.
- New England Dogsledding’s site did not load; the tourism blurb found was for the 2019–20 season.
- Thunderfeet Kennel appeared on the old dogsledrides list; a working operator site was not found.
- Happy Trails Kennel’s site is a boarding kennel. EarthSong Lodge’s current site is cabin rentals.
- Iditarod.com and alaska.org prices were not copied onto listings.
- Checked 20 November 2026 and not added: `northwestdogsledadventuresllc.com`, `tahoedogsledtours.com`, and `mammothdogteams.com` did not resolve. `huskypowerdogsledding.com` is not a kennel site. `prairieisledogtrekking.com` is a domain-for-sale page. `jhsleddog.com` returned an error page. Tetons and Beyond’s ride page says public locations and reservations are still coming. Arctic Paws Dog Sled Tours states that the 2025–26 season is closed and does not list a later season for sale.

## GitHub Pages

The workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml) validates and builds on pull requests. It deploys only from `main`.

After this is merged, open **Settings → Pages → Build and deployment** and set **Source** to **GitHub Actions** if it is not already. The first successful run on `main` creates the `github-pages` environment. The site URL is `https://michaelheavener4.github.io/dog-sledding-tours/`.
