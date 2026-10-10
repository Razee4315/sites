# Site Studies

A collection of websites in one repository, with a gallery page that links to each of them. Personal projects by [Saqlain](https://github.com/Razee4315) · saqlainrazee@gmail.com

**Live:** https://razee4315.github.io/site-studies/

| | Site | What it is |
|---|---|---|
| 01 | [Deosai](sites/deosai) | The high plateau near Skardu, told as a blank page cut open for one summer |
| 02 | [Pronk](sites/pronk) | A supper club in Haarlem that lays a 1648 still life, then eats it |
| 03 | [Tern Kite Works](sites/tern-kite-works) | Paper-and-bamboo kites, one for every wind |
| 04 | [Vesper & Thorne](sites/vesper-and-thorne) | Bellfounders since 1702 |
| 05 | [Quire](sites/quire) | An opera house in Leipzig, cut from paper |
| 06 | [Byarsa](sites/byarsa) | Guides who walk small groups across Deosai |
| 07 | [Cadran](sites/cadran) | Five fragrances, one for each hour of light |
| 08 | [Toller & Daughters](sites/toller-and-daughters) | Bellfounders since 1687 |

Every business here is invented; Deosai is a real place. Each site is a separate Vite project using GSAP and Lenis.

## Layout

```
gallery/    the landing page: index.html, thumbnails, fonts
shared/     the designer credit strip added to the end of every site at build time
sites/      one folder per site, each with its own package.json
scripts/    build, preview and thumbnail scripts
```

## Run it

Needs Node 22 or newer.

```
npm run build      # builds every site and the gallery into dist/
npm run preview    # serves dist/ at http://localhost:4000
```

`npm run build -- pronk quire` rebuilds only the sites you name.

To work on one site with live reload:

```
cd sites/pronk
npm install
npm run dev
```

## Add a site

1. Put the Vite project in `sites/<name>/`. The folder name becomes its URL.
2. Load runtime images through `import.meta.env.BASE_URL` rather than a leading `/`, so they resolve when the site is served from a subfolder.
3. Add a card for it in `gallery/index.html`. The designer credit is added for you at build time.
4. With `npm run preview` running, `npm run thumbs -- <name>` takes its thumbnail.

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds everything and publishes `dist/` to GitHub Pages.

## Not in the repository

The raw generated images (`assets-raw/`), screenshots and tool logs are ignored to keep the repository small. The processed images each site actually uses are in its `public/` folder.
