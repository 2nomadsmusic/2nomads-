# 2 Nomads — Official Site

Single-page landing site for the electronic duo **2 Nomads**, co-founders of Nativo Musik.

Live sections:

- **Hero** with full-bleed photograph and slow Ken Burns zoom
- **About** with bio, "Shared stages with" chip wall, and a featured "Next Event" card pulling from the Nomad Camp Marbella poster
- **Catalog** — three latest singles loading covers directly from Spotify's oEmbed API
- **Watch** — three YouTube videos (covers from the YouTube CDN)
- **Tour** — full 2026 tour calendar (29 dates)
- **Brands** — auto-scrolling marquee of partner logos
- **Playlist** — "2 Nomads Vibes" Spotify playlist with live-loaded cover
- **Booking** — direct email + phone contact

## Stack

Static HTML / CSS / JS. No build step, no framework.

- `index.html` — page structure
- `styles.css` — typography (Unbounded + Inter Tight + JetBrains Mono), liquid-glass surfaces, animated blue beam borders, neon mesh background, kinetic type, scroll-reveal
- `script.js` — custom cursor, mouse parallax, scroll reveal, Spotify oEmbed cover loader, Microlink Open Graph cover loader
- `Assets/image/` — logos, hero photo, event posters

## Running locally

Open `index.html` in any modern browser, or serve with any static server:

```bash
# python
python -m http.server 8000

# or node
npx serve .
```

Then visit <http://localhost:8000>.

## Deploying

The site is fully static — drop the files on any host:

- **GitHub Pages**: push to `main`, then in repo Settings → Pages set source to `main / root`.
- **Netlify / Vercel / Cloudflare Pages**: connect the repo, no build command needed, publish directory is `/`.

## Updating content

| What | Where |
| --- | --- |
| Tour dates | `index.html` — `<ol class="tour__list">` |
| Songs (Spotify) | `index.html` — `.card-music` blocks, edit the Spotify URL on `<a class="btn--spotify">` and on the `data-spotify-cover` attribute |
| Videos (YouTube) | `index.html` — `.card-video` blocks, edit the YouTube URL on both `.card-video__art` and `.btn--youtube` |
| Brand logos | drop new file in `Assets/image/`, edit `src` on the matching `<a class="brand-icon">` (and its duplicate in the marquee track) |
| Next event card | `index.html` — `.next-event` block |
| Playlist | `index.html` — `.card-playlist`, swap the Spotify playlist URL |
| Booking contacts | `index.html` — `.booking__contacts` |

## Notes

- The folder is `Assets/` (capital A) and the HTML references it the same way — keep them consistent.
- Spotify and og:image covers are fetched at runtime; the dark gradient placeholder is what shows if the network call fails.
- Buttons on the tour list link to Instagram (`https://www.instagram.com/2nomads_/`) — update in `index.html` if you set up dedicated ticket pages.
