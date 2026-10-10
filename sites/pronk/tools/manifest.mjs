// Every generated image on the site. Three families, one shared style block each,
// so the set reads as a single commissioned group of paintings.

const PAINTING = `
STYLE (applies to the whole image): a Dutch Golden Age still-life oil painting made in Haarlem around 1650, in the manner of Willem Claesz. Heda, Pieter Claesz and Willem Kalf. Oil on oak panel, reproduced as a flat, evenly lit museum photograph of the painted surface that fills the frame edge to edge: no picture frame, no wall, no border, no added vignette. Deep warm umber-black background dissolving into shadow. One soft window light falling from the upper left; strong chiaroscuro; cool, precise highlights on glass, pewter and silver. Restrained palette: pewter grey, bone-white linen, olive brown, dark bottle green, with small saturated accents of lemon yellow and lobster red. Meticulous realist brushwork with thin glazes, crisp highlights, faint fine craquelure in the varnish. Absolutely no text, lettering, numbers, signature, monogram, watermark, and no people.`

const OBJECT = `
STYLE: one single object painted in oils exactly as it would appear in a Dutch Golden Age still life from Haarlem around 1650 (manner of Willem Claesz. Heda and Willem Kalf): meticulous realist brushwork, thin glazes, luminous cool highlights, light falling from the upper left, the shadow side sinking toward deep warm umber but still clearly readable. Restrained, natural palette. The object is isolated as a clean cut-out on a genuinely transparent background (real alpha channel): no backdrop, no table, no surface, no cast shadow, no reflection underneath, no glow, no border, no frame. The whole object sits inside the canvas with a clear margin of empty transparent space on every side; nothing is cropped. Crisp, clean silhouette. No text, lettering, signature or watermark.`

const TOPDOWN = `
STYLE: painted in oils in the manner of a Dutch Golden Age still life from Haarlem around 1650 (Willem Claesz. Heda), but seen from directly overhead, a perfect top-down plan view with no perspective. Meticulous realist brushwork, thin glazes, soft light from the upper left, cool highlights on the metal. No text, lettering, signature or watermark.`

const obj = (id, shape, subject) => ({ id, family: 'obj', shape, alpha: true, prompt: `${subject}\n${OBJECT}` })

export const images = [
  // ───────────────────────────────── the table: one painting, eaten in five edits
  {
    id: 'table',
    family: 'table',
    shape: 'wide landscape, 16:9',
    chain: [
      `A sumptuous banquet still life (a pronkstilleven), wide landscape 16:9, seen straight on from a seated eye level. One long table runs the full width of the picture, its front edge parallel to the picture plane, covered in a dark bottle-green velvet cloth with a rumpled white damask linen cloth thrown over the middle and hanging down over the front edge. Everything is untouched, the moment before the meal begins. The table and everything on it occupy the lower 55% of the picture; the upper 45% is empty dark background (only the candle rises into it). Six groups are arranged from left to right with clear dark gaps between them so each reads separately:
(1) far left: a tall green roemer glass filled with pale white wine next to a lidded pewter flagon; in front of them a pewter plate with six open oysters on the half shell and a half-peeled lemon whose long spiral of peel hangs down over the table edge.
(2) left of centre: a whole round crusty loaf of bread lying on the linen, a small pewter dish of pale butter, and a pewter plate with two silvery salted herrings side by side and a few onion rings; a silver knife lies with its handle overhanging the front edge of the table.
(3) exact centre: a tall brass candlestick holding one tall cream beeswax candle, lit, with a small steady flame.
(4) right of centre: a large whole boiled lobster, brilliant red, lying across an oval pewter platter.
(5) further right: a large raised game pie with a golden decorated pastry crust, whole and uncut, on a silver dish.
(6) far right: a blue-and-white Chinese porcelain bowl piled high with green and purple grapes, peaches, figs and cherries; beside it a split pomegranate, a wedge of yellow aged cheese, and whole walnuts and hazelnuts scattered on the cloth.
${PAINTING}`,
      `The oysters have been eaten. The six oyster shells on the pewter plate at far left are now empty, pearly white inside, two of them tipped off the plate onto the cloth. The lemon is now completely peeled and cut in two, one half squeezed flat, the peel lying loose. The roemer glass is now only one-third full. Nothing else in the picture changes.`,
      `The bread and herring have been eaten. The loaf is now only a torn heel of crust with crumbs scattered over the linen. The herring plate now holds two bare fish skeletons with heads and tails still attached, and no onion. The butter dish is scraped nearly clean. The knife now lies across the herring plate. Nothing else in the picture changes.`,
      `The lobster has been eaten. The oval pewter platter now holds only empty cracked red lobster shell: the hollow carapace, broken open claws and a scatter of thin legs, one claw fallen onto the cloth. The candle has burned down to about two-thirds of its original height, with a drip of wax down its side. Nothing else in the picture changes.`,
      `The pie has been eaten. The pastry crust is broken open and most of the pie is gone: only a ragged curved piece of the pie wall remains on the silver dish among flakes of pastry and crumbs, with a silver spoon left lying in it. Nothing else in the picture changes.`,
      `The fruit and cheese have been eaten and the night is over. The porcelain bowl now holds only bare grape stalks; the cloth around it is littered with peach stones, cherry stems, fig skins, the emptied pomegranate husk and cracked walnut shells; the cheese is reduced to a thin curl of rind. The roemer glass at far left is now empty and lies tipped over on its side. The candle has burned down to a short stub, its flame out, with a thin grey thread of smoke rising straight up from the wick. Nothing else in the picture changes.`,
    ],
  },

  // ───────────────────────────────── the room, by day and by candle
  {
    id: 'room',
    family: 'room',
    shape: 'portrait, 4:5',
    chain: [
      `A quiet Dutch interior painted around 1660 in the manner of Pieter de Hooch and Johannes Vermeer, portrait format 4:5: the dining room of a narrow Haarlem canal house, completely empty of people. A long oak table dressed with a white linen cloth stands lengthwise, receding from the viewer, with tall-backed leather chairs along both sides. Black and white marble floor tiles in strict perspective. On the left wall a tall leaded window with its lower shutters open lets in pale afternoon daylight that falls in a soft trapezoid across the table and floor. A brass chandelier with unlit candles hangs above the table. Bare plaster walls, a dark wooden beam ceiling, one small dark gilt-framed painting on the far wall, a half-open door at the back showing a glimpse of a second sunlit room. On the table: nothing yet but one unlit candle in a brass candlestick. Calm, silvery, luminous daylight; cool greys, warm ochre, soft blacks. Oil on canvas, fine brushwork, faint craquelure, reproduced flat to the edges with no frame. No text, no signature, no people.`,
      `It is now night in the same room. The window is dark deep blue. The candles of the brass chandelier and the candle on the table are lit, casting a warm golden pool of light on the white linen and the nearest chairs, while the corners of the room fall into deep brown shadow. The doorway at the back is dark. Nothing else changes: same room, same furniture, same perspective.`,
    ],
  },

  // ───────────────────────────────── past suppers: before, and the morning after
  {
    id: 'past-breakfast',
    family: 'past',
    shape: 'landscape, 3:2',
    chain: [
      `A sober monochrome "breakfast piece" (ontbijtje), landscape 3:2, close view of the corner of a table with a plain grey-green cloth and a small crumpled white napkin: a pewter plate with one whole silvery salted herring cut into neat sections, a crusty bread roll, a tall cylindrical pass-glass of amber beer with a foamy head, a few whole hazelnuts and walnuts, a knife in its sheath, a small pewter salt cellar piled with white salt. Almost colourless palette of greys, olive browns and pewter with warm ochre in the bread and beer. Low horizon, empty warm grey-brown wall behind. ${PAINTING}`,
      `The breakfast has been eaten. The plate now holds only the herring's bare backbone, head and tail. The bread roll is reduced to a small torn end and crumbs. The beer glass is empty with a ring of foam drying inside. The nuts are cracked open, their shells scattered. The salt has a thumb-sized dent in it. Nothing else in the picture changes.`,
    ],
  },
  {
    id: 'past-cheese',
    family: 'past',
    shape: 'landscape, 3:2',
    chain: [
      `A still life of cheeses in the manner of Clara Peeters, landscape 3:2, close view: on a dark table a stack of three great cheeses on a pewter plate (a half wheel of deep yellow aged Gouda with a cut face, a dark green sage cheese, a pale crumbly sheep's cheese on top), a dish of curled butter shavings balanced on the stack, a Wanli porcelain plate of almonds, dried figs and raisins, two twisted pretzels, a round loaf, a stoneware jug with a pewter lid, and a bone-handled knife overhanging the table edge. Everything whole and untouched. ${PAINTING}`,
      `The cheese supper has been eaten. Each of the three cheeses is now cut down to a low hollowed rind; the butter dish is empty and smeared; the porcelain plate holds only a few almond skins and fig stalks; one pretzel is gone and the other is broken in half; the loaf is a torn crust with crumbs; the knife now lies on the pewter plate, its blade smeared. Nothing else in the picture changes.`,
    ],
  },
  {
    id: 'past-fish',
    family: 'past',
    shape: 'landscape, 3:2',
    chain: [
      `A fish still life in the manner of Abraham van Beijeren, landscape 3:2, close view: on a stone table with a wet slate-grey surface, a wicker basket tipped on its side spilling a whole plaice and two red gurnards; thick salmon steaks, coral pink, on a pewter dish; a large brown crab on its back; a heap of grey North Sea shrimps on a cabbage leaf; a cut lemon; a copper pan. Silvery wet highlights, cool grey palette with coral and copper accents. Everything raw, whole and untouched. ${PAINTING}`,
      `The fish supper has been cooked and eaten. The basket is empty. Where the plaice and gurnards lay there are now only clean white fish skeletons with heads and tails. The pewter dish holds only salmon skin and bones. The crab is now an empty cracked shell with broken claws. The cabbage leaf holds only a small pile of translucent shrimp shells. The lemon is squeezed flat. The copper pan is scorched black inside. Nothing else in the picture changes.`,
    ],
  },
  {
    id: 'past-sugar',
    family: 'past',
    shape: 'landscape, 3:2',
    chain: [
      `A banquet of sweets in the manner of Clara Peeters and Georg Flegel, landscape 3:2, close view: on a dark table a tall silver tazza piled with sugared almonds, candied orange peel, white comfits and plain twisted sugar sticks; a Wanli porcelain dish of quince paste cut in diamonds; a stack of thin rolled wafers; a marzipan tart decorated with a sprig of rosemary; a slender Venetian wine glass of red wine; a few dried apricots and a single pink rose with dew on its petals lying on the table. Everything whole and untouched. ${PAINTING}`,
      `The sweets have been eaten. The silver tazza is almost bare, holding two last sugared almonds and a dusting of sugar. The porcelain dish holds one remaining diamond of quince paste and sticky traces. The wafers are reduced to broken shards. The marzipan tart is three-quarters gone, the rosemary sprig lying beside it. The wine glass is empty with a red stain at the bottom. The rose has dropped most of its petals onto the table. Nothing else in the picture changes.`,
    ],
  },

  // ───────────────────────────────── place settings, from above (seat picker)
  {
    id: 'plate',
    family: 'plate',
    shape: 'square, 1:1',
    chain: [
      `A single round pewter dinner plate seen from directly overhead, perfectly circular, centred, filling about 80% of the square canvas. Worn 17th-century pewter with a broad flat rim, soft grey sheen, faint knife scratches, a cool highlight on the upper left of the rim. The plate is completely empty and clean. Isolated on a genuinely transparent background (real alpha channel): no table, no cloth, no cast shadow, no glow. ${TOPDOWN}`,
      `A crisp white damask linen napkin, folded into a neat rectangle, now lies in the middle of the plate, entirely inside the rim. The plate itself and the transparent background are unchanged.`,
      `Remove the napkin. Instead, one half of a cut lemon now lies cut-face-up in the middle of the plate, bright yellow, juicy, with two pips, entirely inside the rim. The plate itself and the transparent background are unchanged.`,
    ],
  },

  // ───────────────────────────────── cut-out objects
  obj('lemon', 'portrait, 2:3', `A lemon, half peeled in the Dutch manner: the upper half still in its bright yellow pitted rind, the lower half showing wet, translucent pale flesh, and the peel coming off in one long continuous spiral ribbon that hangs down below the fruit and curls at its end, white pith on its inside face. The lemon sits in the upper third of the tall canvas, the spiral of peel hangs through the middle third.`),
  obj('oyster', 'square, 1:1', `One open oyster on the half shell, seen from slightly above: a rough, layered grey-brown outer shell edge, a pearly white interior, and the plump glistening grey oyster lying in its liquor with wet highlights.`),
  obj('roemer', 'portrait, 2:3', `A tall green forest-glass roemer wine glass, two-thirds full of pale golden white wine: a wide rounded bowl, a thick hollow stem studded with raspberry prunts, a coiled glass foot. Transparent green glass with a bright reflection of a mullioned window on the bowl and soft refracted light in the wine. Standing upright.`),
  obj('flagon', 'portrait, 2:3', `A tall lidded pewter flagon (a Jan Steen jug) with a hinged domed lid, a thumb-piece, a long curved spout and an S-shaped handle. Soft grey worn pewter with broad cool highlights and dark reflections. Standing upright.`),
  obj('lobster', 'landscape, 3:2', `A whole boiled lobster, brilliant vermilion red, seen from above and slightly to the side, lying diagonally: both large claws extended forward, long antennae sweeping back in curves, segmented tail slightly curled, every joint glossy with small white highlights.`),
  obj('pie', 'square, 1:1', `A large raised game pie, whole, with a golden-brown hot-water pastry crust: tall straight crimped sides, a domed lid decorated with pastry leaves and a rosette, glazed and shining, sitting on a small silver dish only slightly wider than the pie.`),
  obj('bread', 'landscape, 3:2', `A crusty round loaf of white bread torn open in two pieces: a dark blistered floury crust and a pale open crumb, with a few crumbs still attached to the torn edges. The two pieces lie close together, almost touching.`),
  obj('grapes', 'portrait, 2:3', `A heavy hanging bunch of grapes, half pale green and half dusky blue-purple, each grape with a soft bloom and one pin-point highlight, hanging from a short woody stalk with one large vine leaf turning yellow at its edges and a curling tendril.`),
  obj('pomegranate', 'square, 1:1', `A pomegranate split open by hand: leathery red-ochre skin, a jagged torn opening showing tightly packed glistening ruby seeds and pale membranes, the crown of the fruit at the top, three loose seeds clinging to the torn edge.`),
  obj('peach', 'square, 1:1', `A single ripe peach with soft velvety skin, yellow blushing to deep rose, still attached to a short twig with two long green leaves, one leaf curling. One tiny housefly sits on the upper curve of the peach.`),
  obj('walnut', 'landscape, 3:2', `A walnut cracked in two: one half of the wrinkled tan shell lying open with the pale kernel still inside, the other empty half shell tipped beside it and touching it, and one whole hazelnut touching them.`),
  obj('tulip', 'portrait, 2:3', `A single cut "broken" tulip of the Semper Augustus kind: a full open flower with white petals flamed and feathered in deep crimson, on a long pale green stem that bends in a soft S-curve, with one long blue-green leaf. One petal has come loose and hangs, about to fall. The flower is at the top of the tall canvas, the stem runs down to the bottom.`),
  obj('watch', 'square, 1:1', `An open silver pocket watch of the 1650s lying on its back: a round engraved silver case with its lid open on a hinge, a white enamel dial with thin dark hour marks only (no numerals, no letters) and a single blued-steel hand, a small winding key tied to it by a long pale blue silk ribbon that trails away in loose loops.`),
  obj('candle', 'portrait, 2:3', `A brass candlestick with a broad drip-pan and a turned stem, holding a cream beeswax candle burned down to a third of its length, runnels of wax frozen down its side, the wick alight with a small upright flame, yellow with a blue base.`),
  obj('knife', 'wide landscape, 16:9', `A 17th-century table knife lying horizontally: a long slender steel blade with a soft grey sheen and a bright edge highlight, a silver bolster, and a handle of banded brown agate with a small silver cap.`),
  obj('moth', 'square, 1:1', `One large moth seen from directly above with all four wings fully spread flat and symmetrical, like a pinned specimen but alive: soft furry body, feathered antennae, forewings in dusty ochre and umber with fine dark wavy bands and a pale eye-spot on each wing, hindwings a warmer rust. Perfect top-down plan view, body vertical, head at the top.`),
  obj('fly', 'square, 1:1', `One common housefly seen from directly above, a perfect top-down view, body vertical with the head at the top: blue-black bristled body, large red-brown eyes, two transparent veined wings folded back in a V, six thin legs spread out. Painted large so it fills about 60% of the canvas, with precise trompe-l'oeil realism.`),
  obj('snail', 'landscape, 3:2', `A garden snail in profile, creeping to the left: a glossy banded spiral shell in ochre and dark brown, a moist grey-brown body stretched out, two long eye-stalks raised.`),
  obj('nautilus', 'portrait, 2:3', `A nautilus cup: a polished mother-of-pearl nautilus shell with an iridescent pearly surface, mounted in chased silver-gilt, on a tall slender gilt stem shaped like a twisting sea creature, with a round embossed gilt foot. Opulent goldsmith's work with bright precise highlights. Standing upright.`),
  obj('tazza', 'landscape, 3:2', `A silver tazza (a shallow wine cup on a tall baluster stem) lying toppled over on its side, pointing to the left: the wide shallow bowl facing the viewer at an angle, the engraved stem and round foot behind it. Bright polished silver with dark reflections and crisp white highlights.`),
  obj('bowl', 'landscape, 3:2', `A blue-and-white Chinese Wanli kraak porcelain bowl with painted panels of flowers and a thin brown rim, filled to the brim and heaped with dark red cherries on their stems, two cherries hanging over the rim.`),
  obj('cheese', 'square, 1:1', `A large wedge of aged Gouda cheese cut from a wheel: a deep yellow cut face with small holes, tiny salt crystals and knife marks, and a waxy ochre-brown rind along its curved back.`),
  obj('fig', 'square, 1:1', `Two figs touching each other: one whole, dusky purple-green with a short stalk, and one cut in half lying open to show its pink, seed-filled, glistening flesh.`),
  obj('shell', 'square, 1:1', `One exotic collector's seashell, a marbled cone shell (Conus marmoreus) lying on its side: glossy black surface covered in a net of white triangular markings, with a pale pink mouth.`),
  obj('cherries', 'square, 1:1', `Two glossy dark red cherries joined at the top by their long thin green stalks, with one small leaf, each cherry with a single bright window-shaped highlight.`),
  obj('herring', 'landscape, 3:2', `A round pewter plate seen from a low three-quarter angle holding one whole salted herring cut crosswise into five neat sections, silver-blue skin glinting, with three thin rings of raw white onion.`),
  obj('napkin', 'landscape, 3:2', `A crumpled white damask linen napkin, loosely thrown down: deep soft folds, crisp pressed creases from having been folded, a faint woven damask pattern catching the light, cool grey shadows in the folds.`),

  // ───────────────────────────────── surfaces
  {
    id: 'linen',
    family: 'surface',
    shape: 'wide landscape, 16:9',
    prompt: `A white damask linen tablecloth seen from directly overhead, a perfectly flat top-down view filling the whole frame edge to edge with nothing on it. Heavy bone-white linen with a faint tone-on-tone woven damask pattern of flowers, and a regular grid of soft pressed fold creases (three vertical creases and one horizontal crease) left by ironing and folding. Very even, soft daylight from the upper left giving the creases gentle cool-grey shading. Painted in oils with the meticulous realism of a Dutch Golden Age still life (Willem Claesz. Heda). Low contrast, calm, pale. No objects, no stains, no text, no border, no vignette.`,
  },
  {
    id: 'craquelure',
    family: 'surface',
    shape: 'square, 1:1',
    prompt: `A flat macro photograph of the surface of a very old oil painting showing only craquelure: a fine irregular network of thin dark hairline cracks across an evenly lit, perfectly uniform mid-grey varnished paint surface. The crack pattern covers the whole frame evenly from edge to edge, cells roughly the same size throughout, like dried mud in miniature. No image content, no brush strokes, no colour, no gradient, no vignette, no text. Neutral 50% grey with dark cracks only.`,
  },
]
