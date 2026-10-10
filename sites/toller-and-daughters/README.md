# Toller & Daughters — Bellfounders

An invented bell foundry: one page, from the casting pit up to the tower.
Bells are small physics simulations (pendulum + clapper), their sound is synthesised from the
partials of a tuned bell, and the change-ringing methods are generated from place notation.

## Run it

```bash
npm install
npm run dev        # http://127.0.0.1:5191
```

```bash
npm run build      # production build in dist/
npm run preview    # serves dist/ on http://127.0.0.1:5192
```

Add `?quiet` to the URL to skip the loading screen, `?quiet&still` to also force reduced motion.

## Images

Every picture was generated with OpenAI Codex (`codex exec`, built-in image tool).

```bash
node tools/generate.mjs              # generate whatever is missing from tools/manifest.mjs
node tools/generate.mjs --force lathe  # redo one
python tools/process.py              # assets-raw/*.png -> public/img/*.webp + src/img-meta.json
```

Edit chains (`bell-1..4`, `pit-1..3`) are pixel-registered; `process.py` gives every frame the
first frame's crop and alpha so they stack exactly.

## Where things are

- `index.html` — all markup and copy
- `src/styles.css` — everything visual
- `src/main.js` — loading screen, scroll choreography, form, inscription
- `src/js/pendulum.js` — the swinging bells
- `src/js/audio.js` — the bell synthesiser
- `src/js/ring.js` — the ring of six and the method player
