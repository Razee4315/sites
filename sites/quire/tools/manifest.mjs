// Every image on the site, as one art-directed shoot.
// shape: square | portrait (2:3) | landscape (3:2) | wide (16:9) | pano (~3:1)
// alpha: true → real transparent background, used as a cut-out layer.

// ───────────────────────── shared style blocks ─────────────────────────

const PAPER = `
STYLE (follow exactly): toy-theatre scenery hand-made from cut paper. It is built from a few overlapping layers of matte coloured paper and thin card — sugar paper, mulberry paper, gouache-painted cartridge paper — cut with a scalpel so every edge is crisp, with tiny soft contact shadows where one layer sits on top of another. Visible paper fibre, faint dry-brush gouache texture, slight handmade irregularity. Shapes are bold, simplified and graphic, like a mid-century stage designer's maquette: elegant and a little austere, never childish, never cute, never cartoonish. Photographed perfectly straight-on and flat (orthographic view, no perspective, no tilt, no depth of field) in soft, even, neutral studio light. Fully matte: no gloss, no glitter, no digital gradients, no 3D-render look, no drawn outlines. Absolutely no text, letters, numbers, logos, signatures, borders or frames.`

const CUTOUT = `
ISOLATION: the paper piece is isolated on a genuinely transparent background (real alpha channel). No backdrop, no table, no ground plane, no cast shadow outside the paper, no glow, no halo. Every part of the image that is not paper is fully transparent.`

const PAL = {
  zf: 'PALETTE: deep ultramarine, midnight indigo and ink blue, with accents of dull gold-foil paper and a little ivory. No other colours.',
  fh: 'PALETTE: storm slate grey, cold sea-green grey, charcoal and bone white, with oxblood red as the single accent. No other colours.',
  ru: 'PALETTE: bottle green, moss green, deep teal, silver-grey and pale moon white, with a very small accent of water-lily pink. No other colours.',
  or: 'PALETTE: charcoal black, soot grey and ash, with ember orange and furnace red as accents and a single touch of pale gold. No other colours.',
  vx: 'PALETTE: autumn ochre, rust, burnt sienna, warm cream and soft olive, with a little pale sky blue. No other colours.',
}

const BACK = (pal, body) => ({
  shape: 'landscape',
  prompt: `A painted-and-cut paper BACKCLOTH for a toy theatre, filling the whole image edge to edge (no margins, no visible edges of the sheet). ${body}\n${PAL[pal]}\n${PAPER}`,
})

const ROW = (pal, body) => ({
  shape: 'pano',
  alpha: true,
  prompt: `A toy-theatre GROUND-ROW: one long horizontal band of cut-paper scenery. ${body}\nCOMPOSITION: the band spans the full width of the image and runs off both the left and right edges; its base is a straight line flush with the bottom edge of the image; its cut silhouette along the top is varied — it reaches nearly to the top of the image at its highest points and dips to about a third of the height between them — and it is solid paper all the way from that silhouette down to the bottom edge, with no holes or gaps. Everything above the silhouette is transparent.\n${PAL[pal]}\n${PAPER}\n${CUTOUT}`,
})

const WING = (pal, side, body) => ({
  shape: 'portrait',
  alpha: true,
  prompt: `A toy-theatre WING FLAT for the ${side.toUpperCase()} side of the stage: one tall piece of cut-paper scenery. ${body}\nCOMPOSITION: the piece runs the full height of the image, its base flush with the bottom edge and its top running off the top edge. Its ${side} side is a straight vertical cut flush with the ${side} border of the image (that side stands off-stage). Its ${side === 'left' ? 'right' : 'left'} side is an irregular cut silhouette that reaches inward towards the stage; the ${side === 'left' ? 'right' : 'left'}-hand third of the image is mostly transparent.\n${PAL[pal]}\n${PAPER}\n${CUTOUT}`,
})

const FLOWN = (pal, body) => ({
  shape: 'landscape',
  alpha: true,
  prompt: `A toy-theatre FLOWN PIECE: cut-paper elements that hang above the stage. ${body}\nCOMPOSITION: every element hangs from its own fine pale linen thread, and every thread runs straight up and off the top edge of the image. The elements are spread across the width at different heights, with generous transparent space between them.\n${PAL[pal]}\n${PAPER}\n${CUTOUT}`,
})

const FIGURE = (pal, body, shape = 'portrait') => ({
  shape,
  alpha: true,
  prompt: `A toy-theatre CHARACTER FIGURE made of cut and layered paper. ${body}\nCOMPOSITION: the whole figure is visible, centred, with a clear transparent margin all round. It stands on a short, narrow, flat strip of plain grey card (the slide that pushes it on stage), seen straight-on at the very bottom. The face is simplified to a few cut shapes with minimal features — dignified, not cute.\n${PAL[pal]}\n${PAPER}\n${CUTOUT}`,
})

const OBJECT = (body, shape = 'square') => ({
  shape,
  alpha: true,
  prompt: `${body}\nSTYLE: photorealistic overhead product photograph (camera looking straight down, orthographic, no perspective), soft diffuse north daylight from the upper left, true-to-life materials with gentle signs of long use, sharp focus throughout, natural muted colour. The object is centred with a clear margin all round. Absolutely no text, letters, numbers, logos or brand marks anywhere.\nISOLATION: isolated on a genuinely transparent background (real alpha channel). No backdrop, no table surface, no cast shadow, no glow.`,
})

const SILHOUETTE = (body) => ({
  shape: 'square',
  alpha: true,
  prompt: `A traditional hand-cut profile SILHOUETTE PORTRAIT, the kind cut freehand with scissors by an eighteenth-century silhouettist: the head and shoulders of ${body}, facing left in strict profile, cut from one single piece of matte black paper. Finely observed, individual and unflattering in an affectionate way; delicate scissor-cut detail in the hair, eyelashes and collar; the bust ends at the bottom in the classic sweeping concave curve. Completely flat solid black, faint paper fibre visible, no interior drawing, no white lines, no grey.\nCOMPOSITION: centred, with a clear margin all round. Photographed perfectly straight-on. Absolutely no text, letters, numbers, signature, border, oval frame or mount.\nISOLATION: isolated on a genuinely transparent background (real alpha channel). No backing paper, no cast shadow, no glow.`,
})

const DOC = `
STYLE: documentary photograph, available light only, 35mm lens, natural film grain, deep blacks, muted true-to-life colour, slightly imperfect framing as if taken by someone who works there. Not staged, not glossy, not a render. Absolutely no text, letters, numbers, signage, logos or watermarks anywhere in the picture.`

// ───────────────────────── the manifest ─────────────────────────

const list = {
  // I — Die Zauberflöte
  'zf-back': BACK('zf', 'A deep ultramarine night sky. Across it, orderly arcing rows of small cut gold-foil stars form a great dome of stars that rises from the bottom and converges towards the top centre — a homage to a neoclassical star-dome stage design. The blue is slightly lighter and warmer near the bottom horizon. Nothing else: no moon, no figures, no buildings, no clouds.'),
  'zf-far': ROW('zf', 'The low skyline of an imagined Egyptian temple precinct at night: pylons, two obelisks, a stepped pyramid, a colonnade and clusters of date palms, in dusky indigo and blue-violet paper with a few thin gold-foil details.'),
  'zf-wing-l': WING('zf', 'left', 'A cluster of towering temple columns with lotus capitals, partly overgrown by a big fan palm whose fronds reach inward, in midnight indigo and ink blue with thin gold-foil edges on the capitals.'),
  'zf-wing-r': WING('zf', 'right', 'A tall rocky outcrop carrying a seated sphinx statue on a high plinth, with a leaning date palm above it whose fronds reach inward, in midnight indigo and ink blue with a few thin gold-foil edges.'),
  'zf-front': ROW('zf', 'A dark bank of stylised rolling clouds and low rocks in near-black navy and ink blue, with a thin gold-foil rim along a few of the cloud tops.'),
  'zf-flown': FLOWN('zf', 'One large, slender crescent moon of ivory and dull gold-foil paper hanging left of centre, and seven gold-foil stars of different sizes hanging around it.'),
  'zf-hero': FIGURE('zf', 'The Queen of the Night: a tall, imperious woman in a sweeping midnight-blue gown scattered with small gold stars, a tall radiating crown of gold star-points, and a great cloak that opens behind her like a wing of night sky. Arms slightly raised, body turned three-quarters to the right.'),

  // II — Der fliegende Holländer
  'fh-back': BACK('fh', 'A storm sky: heavy layered clouds of torn and cut paper in slate grey, charcoal and cold green-grey, with a pale bone-white rift of light breaking through low down, right of centre. A few thin slanting slivers of paper suggest rain. Nothing else: no sea, no ship, no land, no birds.'),
  'fh-far': ROW('fh', 'A rough open-sea horizon: rows of cut-paper waves receding into the distance, with a line of dark fjord cliffs rising at the far left and far right, and a small lighthouse on the right-hand cliff.'),
  'fh-wing-l': WING('fh', 'left', 'A jagged Norwegian sea cliff built from layered strata of charcoal and slate paper, with three wind-bent pines clinging to its ledges and leaning inward.'),
  'fh-wing-r': WING('fh', 'right', 'A jagged sea cliff of layered charcoal and slate paper with a tiny fisherman\'s hut perched on a ledge — the hut has an oxblood-red door — and fishing nets hung out on poles, leaning inward.'),
  'fh-front': ROW('fh', 'Large curling storm waves, cut from layered sea-green-grey and charcoal paper, with bone-white foam crests of torn paper. The waves heave unevenly, three big crests and several small ones.'),
  'fh-flown': FLOWN('fh', 'Three heavy storm clouds of layered slate and charcoal paper, and five small white paper seagulls in flight between them.'),
  'fh-hero': FIGURE('fh', 'NOT a person — a ship. The Flying Dutchman\'s ghost ship: a three-masted sailing ship seen exactly side-on, sailing towards the left, with a black hull, tattered sails of oxblood red, rigging of fine black thread, and one tiny pale lantern at the stern. It rides on a short strip of cut-paper wave instead of a card strip.', 'square'),

  // III — Rusalka
  'ru-back': BACK('ru', 'A moonlit night sky over a forest lake: deep teal-green, built from overlapping horizontal bands of translucent mulberry paper so that it grows paler towards the bottom, with drifting bands of pale mist low down and a sparse scattering of tiny silver stars high up. Nothing else: no moon (it is a separate piece), no trees, no water.'),
  'ru-far': ROW('ru', 'The far shore of a forest lake at night: a dark treeline of firs and rounded alders in bottle green, and beneath it a band of still silver-grey water carrying the broken reflections of the trees, cut as thin horizontal slivers.'),
  'ru-wing-l': WING('ru', 'left', 'An old weeping willow: a thick leaning trunk in deep teal and long hanging curtains of fine cut leaf strands in moss and bottle green that trail inward, with a few silver-grey highlights.'),
  'ru-wing-r': WING('ru', 'right', 'A stand of three slender birches with silver-grey bark and dark marks, fine drooping foliage in moss green, and one dark fir behind them; branches reach inward.'),
  'ru-front': ROW('ru', 'The reedy edge of a lake: bulrushes, tall reeds and sedges in deep teal and bottle green, with broad water-lily pads and three pale pink water lilies lying low between them.'),
  'ru-flown': FLOWN('ru', 'One large full moon — a disc of pale silver-white paper with subtle torn-paper craters in pale grey — hanging right of centre, and two long thin wisps of cloud in pale grey mulberry paper hanging lower and to the left.'),
  'ru-hero': FIGURE('ru', 'Rusalka, the water nymph: a slender young woman with very long pale silver-green hair, in a dress like flowing water in pale teal, seated on a low mossy rock, her face lifted up and to the right towards the moon, one hand raised.'),

  // IV — Orfeo ed Euridice
  'or-back': BACK('or', 'The mouth of the underworld, seen head-on like looking down a tunnel: concentric receding cave openings, each one a layer of charcoal or soot-black paper with a jagged cut edge, growing smaller towards a core of ember-orange and furnace-red paper slightly below centre, so that fire-light seems to glow from the depths. Nothing else: no figures, no flames in the foreground.'),
  'or-far': ROW('or', 'A narrow natural rock bridge and a broken stair crossing an abyss, in ash grey and charcoal, with a procession of nine tiny pale shades — the dead, simple ash-white cut figures — walking across it from left to right. Below the bridge the rock falls away in dark charcoal crags to the bottom edge.'),
  'or-wing-l': WING('or', 'left', 'A cave wall of black and soot-grey paper with fang-like stalagmites rising from its foot and a long overhang at the top, its inward-facing edges caught by thin slivers of ember-orange paper as if lit from the fire.'),
  'or-wing-r': WING('or', 'right', 'A cave wall of black and soot-grey paper pierced by a few small arched openings, with a dead, leafless tree twisting out of the rock and reaching inward, its inward-facing edges caught by thin slivers of ember-orange paper.'),
  'or-front': ROW('or', 'Jagged black rocks with tongues of flame flickering up between them, the flames cut from layered ember-orange and furnace-red tissue-thin paper, a few pale gold at the tips.'),
  'or-flown': FLOWN('or', 'Seven long black stalactites of different lengths, and three curling wisps of smoke cut from ash-grey translucent paper between them. (Here the stalactites hang on short threads so that they sit high in the image.)'),
  'or-hero': FIGURE('or', 'Orfeo: a young man in a pale ash-white classical tunic and a short cloak, a wreath of laurel in his hair, holding a small pale-gold lyre against his chest, one hand stretched forward as if feeling his way in the dark, his head turned away to the left — he must not look back.'),

  // V — Příhody lišky Bystroušky (The Cunning Little Vixen)
  'vx-back': BACK('vx', 'An early autumn morning sky: warm cream low down turning to pale sky blue at the top, built from overlapping bands of paper, with a low, soft, pale-gold sun disc left of centre and two ranges of distant rounded hills in pale olive and soft ochre along the bottom third. Nothing else: no trees, no animals, no buildings.'),
  'vx-far': ROW('vx', 'Rolling Moravian hills in ochre, rust and olive with the ragged edge of a forest along their crest, three small haystacks, and one tiny gamekeeper\'s cottage with a rust-red roof and a thread of smoke from its chimney.'),
  'vx-wing-l': WING('vx', 'left', 'A great beech tree in autumn: a smooth grey-olive trunk and big boughs carrying hundreds of small individually cut leaves in ochre, rust and burnt sienna, the canopy arching inward at the top.'),
  'vx-wing-r': WING('vx', 'right', 'An old oak with a knotted olive-brown trunk, a dark hollow among its roots (the fox\'s earth), a hazel bush at its foot, and a canopy of cut leaves in rust and ochre arching inward at the top.'),
  'vx-front': ROW('vx', 'A forest floor in autumn: tall ferns, grasses, a mossy tree stump, a scatter of fallen leaves and four small toadstools, in rust, ochre, burnt sienna and olive.'),
  'vx-flown': FLOWN('vx', 'A dozen falling autumn leaves in ochre and rust, one dragonfly with a pale sky-blue body and translucent cream wings, and two small birds in flight.'),
  'vx-hero': FIGURE('vx', 'NOT a person — an animal. The vixen: a lithe fox in bright rust-red paper with a cream chest, dark legs and a bushy tail with a cream tip, caught mid-stride towards the right with her head turned to look back over her shoulder. Alert, intelligent, wild.', 'landscape'),

  // The rest of the company, in paper
  'fig-papageno': FIGURE('zf', 'Papageno the bird-catcher: a stocky, cheerful man in a costume entirely covered with layered cut-paper feathers in ultramarine and ivory with gold-foil tips, a feathered cap, a tall wicker birdcage on his back and a set of small panpipes held to his mouth. Turned three-quarters to the left.'),
  'fig-dutchman': FIGURE('fh', 'The Dutchman: a gaunt, tall sea captain in a long black coat with a high collar, a wide-brimmed black hat, a pale bone-white face, long grey hair and an oxblood-red sash, standing very still with one hand on his chest. Turned three-quarters to the right.'),
  'fig-senta': FIGURE('fh', 'Senta: a young Norwegian woman in a long slate-grey skirt and an oxblood-red bodice with a bone-white blouse and apron, her hair in a long braid, holding a small oval portrait in both hands and gazing at it. Turned three-quarters to the left.'),
  'fig-jezibaba': FIGURE('ru', 'Ježibaba the witch: an old, bent woman wrapped in ragged layers of moss-green and deep teal shawls, with wild silver-grey hair, a crooked staff, a bundle of herbs at her belt and a small black cat at her feet. Turned three-quarters to the right.'),
  'fig-euridice': FIGURE('or', 'Euridice: a young woman in a long ash-white classical dress, a thin translucent ash-grey veil over her head and shoulders, one hand reaching forward to the left as if towards someone walking ahead of her. Turned to the left.'),
  'fig-forester': FIGURE('vx', 'The Forester: a heavy-set, kindly old gamekeeper with a large moustache, an olive jacket, rust-brown breeches and boots, a soft hat with a feather, a walking staff in one hand and a pipe in his mouth. Turned three-quarters to the left.'),

  'audience': {
    shape: 'pano',
    alpha: true,
    prompt: `A row of theatre-goers seen from directly behind, cut from one long strip of matte black paper: the backs of the heads and shoulders of eleven people of different heights, ages and hairstyles (a bun, curls, a bald head, a bob, a ponytail, a hat taken off and held), sitting close together.\nCOMPOSITION: the strip spans the full width of the image and runs off both the left and right edges; the bottom is a straight line flush with the bottom edge; the heads rise to about two thirds of the image height; everything above is transparent. Completely flat solid black with faint paper fibre, crisp scissor-cut edges, photographed straight-on.\nAbsolutely no text, letters or numbers.\n${CUTOUT}`,
  },

  // The humans — cut silhouettes
  'sil-1': SILHOUETTE('a woman of about fifty-five with her hair pinned up in a loose bun, round spectacles pushed up on her forehead, a strong nose and a pencil tucked behind her ear'),
  'sil-2': SILHOUETTE('a man of about sixty with a short full beard, receding curly hair, a high forehead and a scarf knotted at his neck'),
  'sil-3': SILHOUETTE('a woman of about thirty with a great cloud of tight curly hair, a small upturned nose, a long neck and a single drop earring'),
  'sil-4': SILHOUETTE('a broad-shouldered, completely bald man of about forty-five with a heavy brow, a strong jaw and a roll-neck jumper'),
  'sil-5': SILHOUETTE('a young woman of about twenty-five with a high ponytail, a blunt fringe, a fine sharp profile and a shirt collar'),
  'sil-6': SILHOUETTE('a thin old man of about seventy-five with a flat cap, a long hooked nose, a moustache and a buttoned collar'),
  'sil-7': SILHOUETTE('a young man of about twenty-eight with a short textured crop of hair, a soft chin, a small ring in his ear and headphones resting around his neck'),
  'sil-8': SILHOUETTE('a woman of about forty with a long thick braid over her shoulder, a wide mouth, a snub nose and the collar of a work apron'),

  // The workshop bench
  'obj-scalpel': OBJECT('A well-used surgical scalpel with a slim flat stainless-steel handle and a fresh small pointed blade, lying diagonally from lower left to upper right. The handle is dulled by years of fingers.', 'landscape'),
  'obj-folder': OBJECT('A bookbinder\'s bone folder: a long flat tool of polished cream-coloured bone with one rounded end and one pointed end, worn glossy along its edges, lying diagonally.', 'landscape'),
  'obj-scissors': OBJECT('A small pair of antique steel embroidery scissors with long fine blades and round finger loops, slightly open, darkened with age.'),
  'obj-thread': OBJECT('A wooden spool wound with pale natural linen thread, lying on its side with a short loose tail of thread and a needle pushed through the winding.'),
  'obj-gouache': OBJECT('A small round white ceramic dish holding thick ultramarine-blue gouache paint, with a fine sable brush with a black handle resting across the rim, its tip loaded with the same blue.'),
  'obj-quire': OBJECT('A quire of paper: twenty-four sheets of matte handmade paper in a fanned stack, each sheet a different colour — ultramarine, indigo, slate, sea-green, oxblood, bottle green, moss, charcoal, ember orange, ochre, rust, cream — fanned out like a hand of cards so that an edge of every sheet is visible, with soft deckled edges.'),
  'obj-offcuts': OBJECT('A loose scatter of small paper offcuts left over from cutting scenery: tiny cut stars in gold foil paper, slivers and curls of ultramarine and oxblood-red paper, small leaf shapes in ochre and rust, a few wave-shaped scraps in sea-green grey. About thirty separate small pieces spread loosely, none overlapping much.', 'landscape'),
  'obj-tree': OBJECT('A single tiny piece of toy-theatre scenery lying flat: a cut-paper autumn tree about the length of a finger, made of layered ochre, rust and olive paper, glued to a thin wooden stick that extends below it as a handle. Matte, handmade, crisp cut edges.', 'portrait'),

  // Documentary photographs
  'doc-house': {
    shape: 'wide',
    prompt: `Interior of a former bookbindery at night, almost dark: bare brick walls, two cast-iron columns, a worn wooden floor. At the far end, on a plain wooden table, stands a tiny paper toy theatre about seventy-five centimetres wide, glowing from within with warm light and showing a deep-blue paper night scene with gold stars. In front of it, seen from behind, four short rows of mismatched old wooden chairs — twenty-four chairs — about half of them occupied by people in dark silhouette leaning slightly forward. The little stage is the only light source; its glow rakes across the floor and catches the edges of the chairs and the audience's shoulders. The scale is clear: the theatre is small, the people are full-size.\n${DOC}`,
  },
  'doc-hands': {
    shape: 'landscape',
    prompt: `Close view from above a workbench: a pair of hands, a woman in her fifties, cutting a small tree out of ochre paper with a scalpel on a dark green cutting mat. Around her hands lie curls of cut paper in ultramarine, oxblood red and ochre, a steel ruler without markings, a bone folder and a small dish of blue gouache. A single warm lamp from the upper left; the rest falls into shadow. Shallow depth of field, focus on the blade.\n${DOC}`,
  },
  'doc-backstage': {
    shape: 'portrait',
    prompt: `Backstage at a tiny paper toy theatre, seen from behind and slightly to the side: six parallel layers of cut-paper scenery flats in deep blue and gold standing one behind the other in wooden grooves, lit from the front so that their backs are in shadow and their edges are rimmed with warm light. Fine threads run upward from hanging paper stars to a wooden batten with small wooden pegs. In the foreground a hand slides a small paper figure along a groove on a thin wooden stick. Dark room behind, dust in the light.\n${DOC}`,
  },

  // From sheet to scene — one object, four states, one edit chain (pixel-aligned)
  'make': {
    shape: 'landscape',
    steps: [
      { prompt: `An overhead, perfectly straight-on photograph of a sheet of cream cartridge paper lying on a dark green cutting mat, the sheet filling almost the whole frame with a narrow border of mat visible all round. On the sheet, a careful, confident pencil drawing for a piece of toy-theatre scenery: a three-masted sailing ship seen side-on, sailing left, with ragged sails, riding three large curling waves, and a big full moon behind the mainmast. Clean graphite lines with a few light construction lines. Soft even daylight. No text, letters, numbers or signature anywhere.` },
      { prompt: `Same photograph, same framing, same sheet and same drawing in exactly the same position. Change only this: the shapes have now been cut out with a scalpel. The ship's hull, each sail, each wave and the moon are separate pieces of the same bare cream paper, lifted very slightly and laid back exactly where they were drawn, so every piece throws a thin, real shadow along its lower-right edge. No colour at all yet — everything is cream paper. The pencil lines are still faintly visible. No text.` },
      { prompt: `Same photograph, same framing, every piece in exactly the same position. Change only this: the pieces are now cut from coloured matte papers. The background sheet is storm slate grey; the hull is black; the sails are oxblood red; the waves are cold sea-green grey with torn bone-white foam crests; the moon is bone white. Matte handmade paper with visible fibre, thin real shadows under each piece. Soft even daylight. No text.` },
      { prompt: `Same photograph, same framing, every piece in exactly the same position and the same colours. Change only the light: the room is now dark, and a single small warm footlight low down at the bottom left rakes across the paper, so every layer throws a long soft shadow up and to the right, the oxblood sails glow, the moon catches the light and the corners of the frame fall away into darkness. No text.` },
    ],
  },
}

export const assets = Object.entries(list).map(([id, a]) => ({ id, ...a }))
