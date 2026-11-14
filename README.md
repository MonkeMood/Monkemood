# 猿 SARU

**One deadpan face. Every costume.** No KOL. No blue check. Just a monkey who doesn't care.

Static website for the $SARU meme coin. No build step, no framework, no dependencies. Plain HTML/CSS/JS, so it runs on GitHub Pages as is.

## What's on the site

- **Hero** with a costume swapper, the deadpan face and a CA box
- **The Face** (about)
- **Sticker Vault**: gallery of every sticker, with categories, search, lightbox, *download as PNG*, *copy image*
- **Meme Maker**: pick a sticker, add text, pick a background, export a PNG (made for replying on X)
- **Tokenomics**, **How to buy**, **Non-roadmap**, **FAQ**, disclaimer

## Deploy on GitHub Pages (2 minutes)

1. Create a repo (e.g. `saru`) and upload everything in this folder (keep the folder structure).
2. **Settings → Pages → Build and deployment → Source: Deploy from a branch → `main` / `(root)` → Save.**
3. Your site is live at `https://<username>.github.io/<repo>/`.

## Edit your info

Open [`assets/js/config.js`](assets/js/config.js):

| Field | What it does |
|---|---|
| `ca` | Paste the contract address at launch. The CA box fills in, **Copy** turns on, and every **Buy** button points to `pump.fun/coin/<ca>`. |
| `buyUrl` | Optional custom buy link. |
| `x`, `telegram` | Social links (Telegram hides itself if empty). |
| `github` | `"owner/repo"`. Enables the **Open the GitHub repo / Upload a sticker** buttons in the vault. |
| `supply`, `tax`, `chain` | Numbers shown in Tokenomics. **Make sure they match your actual launch.** |

## The Sticker Vault (images on GitHub)

All stickers live in the repo as plain image files:

```
stickers/
  moods/       happy.webp, too-cool.webp, ...
  costumes/    pirate.webp, banana-suit.webp, ...
  christmas/   ...
  couples/     ...
  manifest.js  (auto-generated list the page reads)
```

- **Folder name = category tab.** Create `stickers/memes/` and a new "Memes" tab appears.
- **File name = sticker title** (`banana-suit.webp` → "Banana Suit").
- Use transparent PNG/WebP, around 440 px square.

### Adding stickers

1. Drop the image in `stickers/<category>/` (GitHub web UI: **Add file → Upload files**).
2. Commit. The workflow in `.github/workflows/manifest.yml` rebuilds `stickers/manifest.js` automatically and the site updates.

No workflow? Run it yourself and commit the result:

```bash
node scripts/build-manifest.mjs
```

> Tip: if you leave `stickers/manifest.js` empty/missing but set `github` in the config, the page will try to list the folder live through the GitHub API instead (rate-limited, so the manifest is the better option).

## Run locally

```bash
python3 -m http.server 8000     # then open http://localhost:8000
```

(PNG export and clipboard copy need `http(s)`, so don't open `index.html` by double-click if you want those.)

## Fonts & credits

Google Fonts: Bowlby One, Caveat Brush, DM Sans, Dela Gothic One. Everything else is hand-made crayon monkeys.

---

*$SARU is a meme coin created for entertainment. It has no intrinsic value and no expectation of financial return. Nothing here is financial advice. Do your own research.*
