**English** · [Lietuvių](README.lt.md)

# NASA Page

A Mars-themed space explorer that shows NASA's Astronomy Picture of the Day, photos from the Mars rovers and images from NASA's library, all on a live "dust storm" background.

**[Live demo](https://brutall100.github.io/nasa-page/)** · **[Source code](https://github.com/brutall100/nasa-page)**

![NASA Page in light mode](docs/screenshot.webp)

| Dark mode | Phone (390px) |
|---|---|
| ![NASA Page in dark mode](docs/screenshot-dark.webp) | ![NASA Page on a phone](docs/screenshot-mobile.webp) |

## About

NASA shares a lot of its data for free through its public APIs. This page puts three of them in one place and gives them a design inspired by the surface of Mars: rusty browns, peach dust and grey rock. In dark mode it becomes night on Mars, and stars appear above the dust.

If NASA does not answer (you are offline, you hit the rate limit, or an API has been retired), the page switches to **demo mode** and shows saved images, so it never looks broken.

## Features

- **Astronomy Picture of the Day.** Pick any date since 16 June 1995, or jump to a random day. Videos are supported too.
- **Mars rover photos.** Choose Curiosity, Perseverance, Opportunity or Spirit and a sol (a Mars day), or leave the sol empty for a surprise. If the Mars Rover Photos API is offline, the page finds a photo of that rover in NASA's image library instead.
- **NASA image library search.** Type any word and get a random matching image, with a link to its source.
- **Live background.** Dust grains drift on the Martian wind, glows move slowly and stars twinkle in dark mode. It uses fewer particles on phones and turns off when you ask for reduced motion.
- **Mission numbers** count up as you scroll: days in the APOD archive and sols each rover has spent on Mars (calculated live).
- **Light and dark themes.** The page follows your system, has a toggle that remembers your choice and never flashes while loading.
- **Buttons with micro effects.** They lift, press, ripple, and each has its own icon animation: a spinning rover wheel, a rocket lift-off, a rolling die.
- **Accessibility.** "Skip to content" link, visible focus, labels on every field, alt texts and WCAG AA contrast.

## Built with

- HTML, CSS and vanilla JavaScript (no frameworks, no build step)
- [NASA Open APIs](https://api.nasa.gov/): APOD and Mars Rover Photos, plus the [NASA Image and Video Library](https://images.nasa.gov/)
- Google Fonts: **Orbitron** (headings), **Inter** (text), **Space Mono** (numbers and labels)

**Colour palette** (all colours live in `:root` at the top of `css/style.css`)

| Colour | Hex | Used for |
|---|---|---|
| Cocoa | `#3b2f2f` | Dark background, text in light mode |
| Cocoa 2 | `#3c2f2f` | Input fields in dark mode |
| Peach dust | `#ffdab9` | Light background, text and glow in dark mode |
| Rust | `#6b4226` | Buttons, accents, dust grains |
| Regolith grey | `#a9a9a9` | Secondary text in dark mode |

Extra shades made from the palette: `#fff1e4` (light cards), `#463837` (dark cards), `#5c5c5c` (secondary text in light mode, because `#a9a9a9` is too light to read on peach).

## What I learned

- Working with several REST APIs using `fetch`, `async/await`, timeouts and error handling
- Building a fallback chain: live API → second API → saved demo data
- Making text from an API safe by using `textContent` instead of `innerHTML`
- Designing with CSS custom properties, so the whole palette changes in one place
- Light and dark themes without a flash on page load
- Animating only `transform` and `opacity`, so the page stays smooth
- Checking colour contrast against WCAG and respecting `prefers-reduced-motion`

## Run it locally

No install needed. The page is plain HTML, CSS and JS.

```bash
git clone https://github.com/brutall100/nasa-page.git
cd nasa-page
python3 -m http.server 8000
# open http://localhost:8000
```

You can also just open `index.html` in a browser.

**API key:** the project uses NASA's public `DEMO_KEY` (about 30 requests per hour). For more, get your own free key at [api.nasa.gov](https://api.nasa.gov/) and paste it into `NASA_API_KEY` at the top of `js/app.js`. This is a front-end only site, so any key you put there is visible to visitors. Only use a free NASA key there, never a secret one.

## Project structure

```
nasa-page/
├── index.html          page markup
├── favicon.svg         icon in the project palette
├── css/
│   └── style.css       palette, layout, animations
├── js/
│   ├── theme-init.js   applies the saved theme before the page is drawn
│   ├── background.js   live "dust storm" background
│   ├── ui.js           theme toggle, ripple, scroll reveal, count-up
│   └── app.js          NASA APIs and demo mode
├── images/             fallback images (WebP)
├── docs/               screenshots for this README
├── LICENSE
└── README.md / README.lt.md
```

## Credits

- Data and images: [NASA Open APIs](https://api.nasa.gov/) and the [NASA Image and Video Library](https://images.nasa.gov/). NASA content is generally not copyrighted; APOD images may belong to the photographer named on each picture.
- Fallback images in `images/` are NASA space imagery.
- Fonts: [Orbitron](https://fonts.google.com/specimen/Orbitron), [Inter](https://fonts.google.com/specimen/Inter) and [Space Mono](https://fonts.google.com/specimen/Space+Mono) from Google Fonts (SIL Open Font License).
- This is a fan project and is not affiliated with or endorsed by NASA.

## License

[MIT](LICENSE) © 2026 brutall100
