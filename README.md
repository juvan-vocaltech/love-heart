# art.py

A static, phone-first page that plays an original ASCII rose.

Black terminal, a green stem that draws downward, leaves, a tight red bud, then a deep-red bloom with white diamond sparkles. A decorative code panel scrolls underneath. Nothing here is the reel’s source: the drawing and the editor text are an original reimplementation.

Inspired by [@jin_22ee’s Instagram reel](https://www.instagram.com/reel/DfWTtzwpmL4/).

## Run locally

Open `index.html` in a browser, or serve this folder:

```bash
python3 -m http.server 8743
```

Then visit http://127.0.0.1:8743

- **Space** — pause / play
- **R** — replay
- **Left / right** — step half a second
- The same controls sit in the upper left of the frame, next to **download** and **video**

## Download

**download** (upper left) saves [`rose.zip`](rose.zip): this page, `css/`, `js/`, `fonts/`, and this readme. Unzip it and open `rose/index.html` offline. On GitHub Pages the file is served from the site root as `/rose.zip` — for this repo, [https://juvan-vocaltech.github.io/love-heart/rose.zip](https://juvan-vocaltech.github.io/love-heart/rose.zip).

**video** (upper left, beside download) saves [`rose.mp4`](rose.mp4): one full bloom cycle of this page, 21 seconds at 1080×1920. The file is H.264 (High, yuv420p) with a silent AAC track and the index at the front, so it plays in iPhone WhatsApp. On GitHub Pages the file is served from the site root as `/rose.mp4` — for this repo, [https://juvan-vocaltech.github.io/love-heart/rose.mp4](https://juvan-vocaltech.github.io/love-heart/rose.mp4).

`?t=8.5` opens paused at that second. Add `&play=1` to start from there.

## Publish on GitHub Pages

There is no build step. `index.html` at the root of `main` is the site.

1. Push this project to the `main` branch.
2. On GitHub, open **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Set **Branch** to `main` and the folder to **`/ (root)`**. Save.
5. Wait until the Pages deploy finishes. The site is served at `https://<user>.github.io/<repo>/`.

To publish from `/docs` instead, move `index.html`, `css/`, `js/`, and `fonts/` into a `docs/` folder (keep `.nojekyll` next to `index.html`) and choose **`/docs`** in the Pages folder menu.

`.nojekyll` is included so GitHub Pages does not run Jekyll against `css/` or `js/`.

## Notes

- No backend and no dependencies. Paths are relative, so the page works at a project-site subpath.
- The typeface is [JetBrains Mono](https://www.jetbrains.com/lp/mono/) (Apache-2.0). See `fonts/LICENSE-JetBrainsMono.txt`. If the file does not load, the browser’s monospace font is used.
- `prefers-reduced-motion` shows the open rose paused until you press play.
