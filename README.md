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

Checked 19–27 November 2026. “With a published price” means the operator’s site showed a dollar figure (per person, per sled, a booking-page amount, or another printed charge). It does not mean every product has a per-person rate.

| State | Operators | With a published price | Sources |
| --- | ---: | ---: | --- |
| Alaska | 41 | 33 | Operator websites, read 2026-11-19, 2026-11-21, 2026-11-22, 2026-11-23, 2026-11-24, 2026-11-25, 2026-11-26, and 2026-11-27 |
| Arizona | 1 | 1 | Operator website, read 2026-11-20 |
| Colorado | 12 | 8 | Operator websites, read 2026-11-19, 2026-11-21, and 2026-11-23 |
| Idaho | 1 | 1 | Operator website, read 2026-11-20 |
| Maine | 1 | 1 | Operator websites, read 2026-11-19 |
| Maryland | 1 | 1 | Operator website, read 2026-11-20 |
| Massachusetts | 1 | 1 | Operator websites, read 2026-11-19 |
| Michigan | 4 | 4 | Operator websites, read 2026-11-19 |
| Minnesota | 9 | 9 | Operator websites, read 2026-11-19, 2026-11-20, 2026-11-21, and 2026-11-23 |
| Montana | 6 | 6 | Operator websites, read 2026-11-19, 2026-11-20, and 2026-11-22 |
| New Hampshire | 2 | 2 | Operator websites, read 2026-11-19 and 2026-11-26 |
| New York | 1 | 1 | Operator websites, read 2026-11-19 |
| Oregon | 1 | 1 | Operator websites, read 2026-11-19 |
| Utah | 3 | 3 | Operator websites, read 2026-11-19, 2026-11-22, and 2026-11-25 |
| Vermont | 3 | 2 | Operator websites, read 2026-11-19 and 2026-11-22 |
| Wisconsin | 1 | 0 | Operator websites, read 2026-11-19 |
| Wyoming | 4 | 2 | Operator websites, read 2026-11-19, 2026-11-20, and 2026-11-21 |
| **Total** | **92** | **76** | |

Operators with no dollar figure on the pages read: Alaska Sled Dog Tours (Talkeetna), Arctic Dog Adventure Co., Last Frontier Mushing Co-op, Squid Acres Kennel, Alpine Adventures Dogsledding, San Juan Sled Dogs, Idarado Sled Dog Adventures, October Siberians, Wolfsong Adventures in Mushing, Heart Six Guest Ranch, Gold Rush Dog Tours, Team Zappa, Jackson Hole Iditarod Sled Dog Tours, Mountain Musher, Happy Trails Kennel, and Howling Bay Kennel (Fairbanks). Alaska Icefield Expeditions prints a $150 weight surcharge and not the tour fare. Dream a Dream Sled Dog Tours prints $1,049 for the musher school and no fare for the 2–2.5 hour visit.

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
- Checked 20 November 2026 and not added: `northwestdogsledadventuresllc.com`, `tahoedogsledtours.com`, and `mammothdogteams.com` did not resolve. `huskypowerdogsledding.com` is not a kennel site. `prairieisledogtrekking.com` is a domain-for-sale page. Tetons and Beyond’s ride page says public locations and reservations are still coming. Arctic Paws Dog Sled Tours states that the 2025–26 season is closed and does not list a later season for sale. `jhsleddog.com` returned an error page that day; it loaded on 21 November 2026 and Jackson Hole Iditarod Sled Dog Tours was added.
- Checked 21 November 2026 and not added: Spirit of the North (`huskypower.com`) still describes Big Sky and West Yellowstone trips, but the only printed fares sit on a Christmas page that cites 2019 and 2020 race results. Gunflint Lodge’s dog-mushing package is marked TBD, with the dollar amounts blank, and dog sledding is not in the current winter activities menu. Wintermoon Summersun’s current site says the homestead burned in May 2025 and the operation is rebuilding. Sno-Trek’s adventure page is still labeled Winter 2022–2023. `barking-brook.com` no longer shows the kennel. Togwotee Mountain Lodge’s dog-sled page is a booking front for Continental Divide Dog Sled Adventures, which is already listed.
- Checked 22 November 2026 and not added: Top of the Hill Huskies still prices the 2025/2026 season that closed on 15 March 2026, and the booking note still says to check back in November 2025. Alyeska Tours still says Girdwood reservations are for the 2025 season (1 June–31 August). Treetops Resort’s `/activities/dog-sledding/` path returned 404. Silver Creek Sled Dogs in Two Harbors appears on tourism pages only; no operator site was found. GoNorth Alaska’s Fairbanks dog-sled page is a quote form with booking codes, not the kennel’s own site. Bearskin Lodge’s mushing page says the trips belong to Sawtooth Racing and the listed dates do not name a year. Devil’s Thumb Ranch offers skijoring with a guest’s own dog, not a sled-dog tour.
- Same tour, so not a second listing: North Forty Escapes, at 1 Stillman Ranch Road in Oakley, sells the Stillman Ranch sled already listed under Wasatch Adventure Guides. Its pages show a one-hour ride from $424 and a split ride at $524, with ages 3+ and a 350-pound sled limit, the same product as the Wasatch page. Stoweflake Mountain Resort’s evening-ride page sends its online calendar to Umiak Outdoor Outfitters’ evening dog sled ride at the resort. Each listing has one `bookingUrl`. `partnerUrl` is only for that operator’s own Viator or GetYourGuide link, so those resort and ranch URLs were not stored as extra booking links.
- Checked 23 November 2026 and not added: Denali Dog Sled Expeditions still prices the 2024–2025 season, and a direct request to `denalidogsled.com` returned HTTP 403. Kiwatchi Adventures has two sites that disagree on tour length and print no season year or price. Deja Vu Sled Dogs in Nome describes rides and asks guests to write; the page has no season, price, or booking calendar. Run By Dogs says the 2026–27 season will open soon. Northwest Dogsled Adventures still has no working operator site. Hotel Yellowstone in Jackson Hole sells the 10-mile and 6-mile Bridger-Teton rides already listed under Continental Divide Dog Sled Adventures. Snow Mountain Ranch is the meeting lot for Redemption Dog Sled Tours, which is the listing. Skagway’s Musher’s Camp is the same Alaska X operation already listed for Juneau. Moose Mountain Inn’s dogsled page does not print a tour fare or a current season. Bearskin Lodge’s Sawtooth dates still do not name a year; the current Sawtooth rides are the Grand Marais listing booked through Border Lakes. Happy Trails Kennel, left out earlier because the site read as a boarding kennel, is included now: `buserdog.com` invites winter bookings and the visit page lists mid-November to mid-April.
- Checked 24 November 2026 and not added: Alyeska Tours still says Girdwood reservations are for the 2025 season (1 June–31 August). Cosmic Cruisers (`gunnisonsleddogs.com`) describes November–April tours near Crested Butte and says to call for rates; the page has no year, no dollar amount, and no booking calendar. Song in the Woods still titles its winter fees “2013-14” and says they took effect 1 December 2013. `peacepupsdogsledding.com` is a general article, not the Lake Elmore kennel. `teamevergreenkennel.com` no longer resolves to the Marquette kennel. Lodge of Whispering Pines’ current site is cabin rentals and does not list a dogsled trip. White Wolf Dogsled Trips still prints a 2023–2024 price list. `huskyworks.com` did not load a kennel site. Thunder Mountain Dog Sled Tours in Lake Placid and Heywood Kennel in Augusta had no working operator site. Klondike Dreams in West Yellowstone appears on TripAdvisor and tourism pages only. `valleysnowdogz.com` returned HTTP 403. Northwest Dogsled Adventures and `mammothdogteams.com` still do not resolve. Within the Wild’s current site does not sell dog sled tours; it says Winterlake Lodge was sold in 2023. A GetYourGuide Jackson Hole dogsled page is Heart Six Guest Ranch, which is already listed.
- Checked 25 November 2026 and not added: Seward Helicopter Tours’ Godwin Glacier page is Turning Heads Kennel, already listed, and the page photo filename names that kennel. Alpine Air Alaska’s Girdwood glacier sled is Seavey’s IdidaRide on Punchbowl Glacier, already listed. 10th Mountain Mushing’s services page says Fairbanks and its contact page says Idaho Springs, Colorado; neither page prints a price, a season year, or a booking calendar. `dogsledmaine.com` did not resolve. Nahmakanta Lake Camps’ current homepage is a wilderness camp and does not list a dogsled trip. Lugdon Lodge’s only printed dogsled fare is a December 2020 weekend package. Sirius Sled Dogs Rescue’s current page is a spay-and-neuter program and does not schedule a sled tour. T-Lazy-7 Ranch’s homepage lists snowmobile, horseback, and fishing, not dog sledding. `snowcapssleddogs.com` is not a kennel site. `grandmaraissleddogadventures.com` and `stoneycreeksleddogs.com` did not resolve. Chugach Outfitters mentions cart rides for cruise guests and does not print a price, a season, or a calendar. Montana Sled Dog Adventures’ indexed page prints half-day and full-day fares with no season year. A direct request to `montanasleddogadventures.com` returned HTTP 403.
- Checked 26 November 2026 and not added: Grand Targhee’s dogsled page is Call of the WYld, already listed, and the printed holiday rates are still the 2024–2025 dates. Salmon Berry Tours’ Talkeetna sled day is Dallas Seavey’s Alaska Sled Dog Tours, already listed. Winter Woods Dog Sled Tours in Whitefish appears on Visit Montana and does not have an operator website. Howling Ridge Kennel in Two Rivers has a live racing site and does not sell a tour; Chena Outdoor Collective, already listed, names that kennel among the teams on its rides. `skookumexpeditions.com` is a parked search page. `briarspatchsleddogs.com` and `mthoodsleddogtours.com` did not resolve. `truenorthexpeditions.com` is a domain-for-sale page. `sierrahuskytours.com` is a coming-soon page. `maryshields.com` is a for-sale lander. `rangeleysleddogs.com`, `rangeleysleddogadventures.com`, and `mainedogsleddingadventures.com` did not resolve. The old Sun Valley Sled Dog Adventures path now lands on a page that is not a kennel. Sunday River’s homepage does not mention dog sledding, and `/explore`, `/things-to-do`, and `/the-mountain/activities` returned 404.
- Checked 27 November 2026 and not added: `dewclawkennel.com` returned HTTP 500 on the homepage and on `/tours`. `hardcorehuskies.com` is a domain-for-sale page. `friskypups.com` is an online shop, not the kennel. `firewalkerkennel.com` shows a logo and a 2026 copyright line and no tour. Sun Dog Kennel’s FareHarbor items still carry a $175 headline, and the morning and afternoon calendars had no bookable day from November 2026 through October 2027. Crazy Dog Kennel’s tours page update is dated 23 March 2025, and the homepage still describes April 2026 rides as current. Bettles Lodge’s dog sled page says short tours are always available and prints no price, season year, or sled booking calendar. Silver Ace Kennel’s stay page sends guests to VRBO or Airbnb for cabins and does not print a sled tour price. Outreach22’s ride page still contains placeholder text and does not print a price. Shemhadar says sled tours are closed until the kennel is rebuilt, and the ride copy still describes the winter of 2021–2022. Wild and Free’s tours page says to write for a price, and the newest expeditions notice is 25 July 2025. `wisemankennel.com` and `rockinridgekennel.com` did not resolve. A Greetwell McCarthy page resells Waylon’s Way Dog Sledding, which is the listing.

## GitHub Pages

The workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml) validates and builds on pull requests. It deploys only from `main`.

After this is merged, open **Settings → Pages → Build and deployment** and set **Source** to **GitHub Actions** if it is not already. The first successful run on `main` creates the `github-pages` environment. The site URL is `https://michaelheavener4.github.io/dog-sledding-tours/`.
