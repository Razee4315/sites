// Every image on the site, as one art-directed shoot.
// Each family shares a style block so the set reads as commissioned, not collected.

const NO_TEXT = 'No text, no letters, no numbers, no logos, no stamps, no seals, no signatures, no watermarks anywhere.'

const ALPHA =
  'Genuinely transparent background (real alpha channel): no backdrop, no surface, no floor, no cast shadow, no glow, no vignette.'

const KITE = `
STYLE: museum-grade studio product photograph of one real, handmade kite. Shot perfectly straight-on to its decorated face (orthographic, no perspective tilt) with a 100mm lens. Soft, even, diffused daylight from the upper left with just enough modelling that the paper shows its fibres, its slight translucency and its hand-pasted seams. Crisp focus edge to edge, true colour.
MATERIALS: skin of handmade kozo washi paper with visible long fibres, hand-dyed so the colour is very slightly uneven; pasted over a frame of thin split bamboo that shows faintly through the paper as soft darker lines; paper edges folded over a perimeter thread and pasted down.
PALETTE: only natural unbleached washi white, deep indigo blue, vermilion red, a little sumi black and ochre yellow. Flat, bold, modern graphic shapes; nothing pictorial, no faces, no characters.
EXCLUDE: no tail, no flying line, no string hanging off it, no hands, no stand, no hanger. ${NO_TEXT}
BACKGROUND: ${ALPHA}
FRAMING: the kite is centred and entirely inside the frame, with a clear empty margin of about 6% on every side.`

const PAPER = `
STYLE: a real paper-craft object photographed from directly above (flat lay, orthographic) under soft, even, diffused daylight. Made of thick handmade kozo washi paper with visible long fibres and soft feathery hand-torn deckled edges (always torn by hand, never cut with scissors). Where paper layers overlap there is a small soft natural contact shadow between the layers only. Matte and tactile, no gloss, no glitter.
EXCLUDE: ${NO_TEXT}
BACKGROUND: ${ALPHA}`

const PAPER_CENTRED = PAPER + '\nFRAMING: the object is centred and entirely inside the frame with a clear transparent margin of about 6% on every side.'

const OBJECT = `
STYLE: studio still-life photograph of one well-used craftsman's object, shot from directly above (flat lay, orthographic), soft even diffused daylight from the upper left, crisp focus, honest true colour, visible wear and patina.
EXCLUDE: no hands, no other objects. No engraved or printed lettering. ${NO_TEXT}
BACKGROUND: ${ALPHA}
FRAMING: the object is centred and entirely inside the frame with a clear transparent margin of about 6% on every side.`

const PHOTO = `
STYLE: quiet editorial documentary photograph, medium-format film look (Kodak Portra 400), soft cool north-window daylight from the left with gentle falloff into shadow, shallow depth of field, fine natural grain, muted true-to-life colour, slightly lifted blacks. Unstaged, calm, tactile, a little melancholy.
PALETTE: unbleached paper white, raw pale bamboo, worn pale wood, deep indigo blue, and exactly one small vermilion red accent.
EXCLUDE: no faces in frame. ${NO_TEXT}
FRAMING: full-bleed photograph filling the whole frame, no border.`

const ostro = (colour, band) =>
  `A classic diamond kite (Eddy type) about one metre tall, clearly taller than wide, very slightly bowed. The upper two thirds of the paper are dyed ${colour}; the lower third is natural unbleached white; the two areas are separated by one narrow ${band} band running straight across. A thin bamboo spine and one cross spar show faintly through the paper.`

export const assets = [
  // ── kites ────────────────────────────────────────────────────────────────
  {
    id: 'ostro',
    steps: [
      { aspect: 'portrait 2:3', prompt: ostro('vermilion red', 'deep indigo') + KITE },
      {
        aspect: 'portrait 2:3',
        prompt:
          'Edit the previous image. Keep the kite, its outline, framing, size, position, lighting and transparent background EXACTLY the same, pixel for pixel. Change only this: the vermilion red dyed area becomes deep indigo blue, and the narrow band becomes vermilion red. Lower third stays natural white.',
      },
      {
        aspect: 'portrait 2:3',
        prompt:
          'Edit the previous image. Keep the kite, its outline, framing, size, position, lighting and transparent background EXACTLY the same, pixel for pixel. Change only this: the indigo dyed area becomes warm ochre yellow, and the narrow band becomes deep indigo blue. Lower third stays natural white.',
      },
      {
        aspect: 'portrait 2:3',
        prompt:
          'Edit the previous image. Keep the kite, its outline, framing, size, position, lighting and transparent background EXACTLY the same, pixel for pixel. Change only this: the ochre dyed area becomes matte sumi black (soft charcoal black ink on paper, fibres still visible), and the narrow band becomes vermilion red. Lower third stays natural white.',
      },
    ],
  },
  {
    id: 'light',
    steps: [
      { aspect: 'portrait 2:3', prompt: ostro('vermilion red', 'deep indigo') + KITE },
      {
        aspect: 'portrait 2:3',
        prompt:
          'Edit the previous image. Keep the kite outline, framing, size, position and transparent background EXACTLY the same, pixel for pixel. Change only the lighting: the kite is now strongly backlit, held up against a bright light, so the paper glows luminous and translucent like a lantern, and the bamboo spine, the bowed cross spar, the perimeter thread, the lashing at the crossing and the overlapping pasted paper seams all show as crisp dark silhouettes through the glowing paper. Still no backdrop: transparent background.',
      },
    ],
  },
  {
    id: 'zephyr',
    alpha: true,
    aspect: 'landscape 3:2',
    prompt:
      'A light-wind delta kite: one wide, swept-back triangular wing about 1.6 metres across, nose pointing up, with a straight trailing edge. Made of very thin, almost translucent natural white washi; a fine deep-indigo border runs along the whole trailing edge, and one small vermilion triangle marks the nose. Slender bamboo leading-edge spars and a centre spine show clearly through the thin paper.' +
      KITE,
  },
  {
    id: 'mistral',
    alpha: true,
    aspect: 'portrait 2:3',
    prompt:
      'A rokkaku: a six-sided Japanese fighting kite, a hexagon stretched vertically so it is clearly taller than wide, with flat top and bottom edges. Deep indigo paper with one large, pale, natural-white disc placed slightly above centre like a moon. A bamboo spine and two horizontal spars show faintly through the paper.' +
      KITE,
  },
  {
    id: 'levanter',
    alpha: true,
    aspect: 'portrait 2:3',
    prompt:
      'A tall rectangular Edo-style kite, a plain upright rectangle clearly taller than wide. Natural white paper crossed by three bold, wide diagonal deep-indigo stripes and one single narrow vermilion diagonal stripe parallel to them. A lattice of thin bamboo shows faintly through the paper.' +
      KITE,
  },
  {
    id: 'sirocco',
    alpha: true,
    aspect: 'portrait 2:3',
    prompt:
      'A classic Hargrave box kite standing upright: four long slender bamboo longerons joined by two square open-ended paper cells, one at the top and one at the bottom, with open air between them. The upper cell is ochre-yellow paper, the lower cell natural white paper with a thin indigo edge. Thin diagonal bamboo cross-braces are visible inside the cells. EXCEPTION to the straight-on rule: view it in a gentle three-quarter angle so two faces of each cell are visible and its depth reads clearly.' +
      KITE,
  },
  {
    id: 'williwaw',
    alpha: true,
    aspect: 'square 1:1',
    prompt:
      'A small Indian-style fighter kite: a square set on its point so it reads as an equal-sided diamond, with a single thin curved bamboo bow arching across the upper half and a straight spine, and a small triangular paper fin at the bottom tip. Matte sumi-black paper with one vermilion red disc in the centre.' +
      KITE,
  },

  // ── paper sky ────────────────────────────────────────────────────────────
  {
    id: 'cloud-a',
    alpha: true,
    aspect: 'landscape 3:2',
    prompt:
      'A plump cumulus cloud built from three stacked layers of hand-torn washi: bright white on top, then very pale warm grey, then palest blue-grey at the back. Rounded billowing top, flatter base.' +
      PAPER_CENTRED,
  },
  {
    id: 'cloud-b',
    alpha: true,
    aspect: 'wide 16:9',
    prompt:
      'A long, low, stretched stratus cloud built from two stacked layers of hand-torn white and very pale grey washi; a thin horizontal shape with gently lumpy top and tapering wispy ends.' +
      PAPER_CENTRED,
  },
  {
    id: 'cloud-c',
    alpha: true,
    aspect: 'square 1:1',
    prompt: 'A small, simple, puffy fair-weather cloud torn from a single piece of bright white washi with one smaller pale-grey piece layered behind it.' + PAPER_CENTRED,
  },
  {
    id: 'cloud-d',
    alpha: true,
    aspect: 'landscape 3:2',
    prompt:
      'A big towering cumulus cloud built from four stacked layers of hand-torn washi, from bright white at the front through pale warm grey to pale blue-grey at the back; tall bubbling top that leans to the right as if blown by wind, flat base.' +
      PAPER_CENTRED,
  },
  {
    id: 'cloud-e',
    alpha: true,
    aspect: 'panorama 3:1',
    prompt:
      'A very long, thin, wind-combed cirrus cloud made from several narrow overlapping strips of hand-torn translucent white washi, streaming horizontally, with frayed fibrous ends.' +
      PAPER_CENTRED,
  },
  {
    id: 'cloud-f',
    alpha: true,
    aspect: 'landscape 3:2',
    prompt: 'A medium two-lobed cumulus cloud, lopsided, built from two stacked layers of hand-torn washi: bright white in front and pale warm grey behind.' + PAPER_CENTRED,
  },
  {
    id: 'cloud-dusk-a',
    alpha: true,
    aspect: 'wide 16:9',
    prompt:
      'A long low evening cloud built from three stacked layers of hand-torn dyed washi: dusty rose pink in front, then muted lilac, then deep slate indigo at the back. Thin horizontal shape with lumpy top.' +
      PAPER_CENTRED,
  },
  {
    id: 'cloud-dusk-b',
    alpha: true,
    aspect: 'landscape 3:2',
    prompt:
      'A medium evening cumulus cloud built from three stacked layers of hand-torn dyed washi: warm peach-pink in front, muted lilac-grey behind, deep slate indigo at the very back.' +
      PAPER_CENTRED,
  },
  {
    id: 'land-far',
    alpha: true,
    aspect: 'panorama 3:1',
    prompt:
      'A long horizontal strip of hand-torn washi dyed pale hazy blue-grey, forming the silhouette of a distant low headland: a gently rolling, softly torn top edge that slopes down toward the right. The strip spans the FULL width of the image, touching the left, right and bottom edges; the paper fills the lower 40% of the image and everything above the torn edge is transparent.' +
      PAPER,
  },
  {
    id: 'land-mid',
    alpha: true,
    aspect: 'panorama 3:1',
    prompt:
      'A long horizontal strip of hand-torn washi dyed medium indigo blue, forming the silhouette of a rolling coastal headland with one higher rounded hill left of centre and a cliff stepping down at the far right. The strip spans the FULL width of the image, touching the left, right and bottom edges; the paper fills the lower 45% of the image and everything above the torn edge is transparent.' +
      PAPER,
  },
  {
    id: 'land-near',
    alpha: true,
    aspect: 'panorama 3:1',
    prompt:
      'A long horizontal strip of hand-torn washi dyed very dark indigo, almost navy black, forming a close grassy hilltop: a broad gentle rise higher on the left, with a roughly torn fibrous top edge that suggests wind-blown grass. The strip spans the FULL width of the image, touching the left, right and bottom edges; the paper fills the lower 40% of the image and everything above the torn edge is transparent.' +
      PAPER,
  },
  {
    id: 'edge',
    alpha: true,
    aspect: 'panorama 3:1',
    prompt:
      'The hand-torn top edge of one very large sheet of thick unbleached off-white washi paper (warm cream white). The torn edge runs roughly horizontally across the FULL width of the image with soft feathery fibres and small irregular bites, about one third of the way down. Below the edge the frame is completely filled with flat, evenly lit paper touching the left, right and bottom edges; above the edge everything is transparent.' +
      PAPER,
  },
  {
    id: 'sun',
    alpha: true,
    aspect: 'square 1:1',
    prompt: 'One perfect circular disc of thick paper covered in gently crinkled warm gold leaf, softly reflective with fine creases and tiny breaks in the leaf. Cleanly circular edge.' + PAPER_CENTRED,
  },
  {
    id: 'moon',
    alpha: true,
    aspect: 'square 1:1',
    prompt: 'One perfect circular disc of thick pale cream washi paper with faint cloudy mottling and long fibres, like a paper moon; softly torn, almost circular edge.' + PAPER_CENTRED,
  },
  // three wing positions of the same paper bird (asked for separately: edited frames came back with a hazy backdrop)
  { id: 'tern-1', alpha: true, aspect: 'landscape 3:2', prompt: `A small paper sculpture of a tern (a slender seabird) in flight, seen exactly from the side, flying toward the left. Cut and folded from crisp white washi: long narrow pointed wings, deeply forked tail, a small sumi-black cap on the head, a thin vermilion beak. Both wings are raised high above the body in a V.` + PAPER_CENTRED },
  { id: 'tern-2', alpha: true, aspect: 'landscape 3:2', prompt: `A small paper sculpture of a tern (a slender seabird) in flight, seen exactly from the side, flying toward the left. Cut and folded from crisp white washi: long narrow pointed wings, deeply forked tail, a small sumi-black cap on the head, a thin vermilion beak. Both wings are stretched out level and almost horizontal, gliding.` + PAPER_CENTRED },
  { id: 'tern-3', alpha: true, aspect: 'landscape 3:2', prompt: `A small paper sculpture of a tern (a slender seabird) in flight, seen exactly from the side, flying toward the left. Cut and folded from crisp white washi: long narrow pointed wings, deeply forked tail, a small sumi-black cap on the head, a thin vermilion beak. Both wings are swept down below the body, at the bottom of a wingbeat.` + PAPER_CENTRED },
  {
    id: 'scraps',
    alpha: true,
    aspect: 'square 1:1',
    prompt:
      'Twelve small hand-torn scraps of dyed washi paper laid well apart in a loose 4 by 3 grid with wide gaps, none touching or overlapping: four vermilion red, three deep indigo, three natural white, two ochre yellow. Irregular torn shapes, roughly equal in size, some slightly curled.' +
      PAPER,
  },

  // ── tools, as cut-outs ───────────────────────────────────────────────────
  {
    id: 'obj-reel',
    alpha: true,
    aspect: 'landscape 3:2',
    prompt: 'A hand-turned wooden kite reel: a wide spool-type winder with a turned handle at each end, wound thick with pale waxed linen line; worn honey-coloured wood polished by hands.' + OBJECT,
  },
  {
    id: 'obj-bamboo',
    alpha: true,
    aspect: 'wide 16:9',
    prompt: 'A neat bundle of about fifteen thin split bamboo strips, pale straw-gold with darker nodes, lying horizontally, tied in two places with vermilion red thread.' + OBJECT,
  },
  {
    id: 'obj-brush',
    alpha: true,
    aspect: 'portrait 2:3',
    prompt: 'A wide flat Japanese paste brush (hake): pale goat hair bristles, a plain flat split-wood handle bound with black thread stitching; bristles slightly clumped from use.' + OBJECT,
  },
  {
    id: 'obj-knife',
    alpha: true,
    aspect: 'wide 16:9',
    prompt: 'A small Japanese bamboo-splitting knife lying horizontally: short dark hand-forged steel blade with a bright honed edge, plain pale wooden handle, well used.' + OBJECT,
  },
  {
    id: 'obj-snips',
    alpha: true,
    aspect: 'portrait 2:3',
    prompt: 'A pair of Japanese thread snips (nigiri-basami): one piece of dark hand-forged steel bent into a U-shaped spring with two short sharp blades, bright at the edges.' + OBJECT,
  },
  {
    id: 'obj-thread',
    alpha: true,
    aspect: 'square 1:1',
    prompt: 'A small turned wooden spool wound with vermilion red linen thread, lying on its side, with a short loose end of thread curling away from it.' + OBJECT,
  },
  {
    id: 'obj-bowl',
    alpha: true,
    aspect: 'square 1:1',
    prompt: 'A shallow hand-thrown white stoneware bowl half full of deep indigo dye with a paler blue froth at the rim, seen from directly above; dye-stained rim.' + OBJECT,
  },

  // ── the workshop, on film ────────────────────────────────────────────────
  {
    id: 'ph-split',
    aspect: 'portrait 2:3',
    prompt:
      'Close view of a kite-maker\'s weathered hands splitting a length of pale gold bamboo with a small knife on a worn wooden bench, thin strips of bamboo springing apart; a spool of vermilion thread sits out of focus at the edge of the bench.' +
      PHOTO,
  },
  {
    id: 'ph-dye',
    aspect: 'portrait 2:3',
    prompt:
      'Two hands lifting a sheet of handmade paper out of a shallow wooden vat of deep indigo dye: the lower half of the sheet is dark blue and dripping, the upper half still white. A single vermilion red sheet hangs drying far in the blurred background.' +
      PHOTO,
  },
  {
    id: 'ph-paste',
    aspect: 'landscape 3:2',
    prompt:
      'Top-down view of a worn wooden workbench: a bamboo diamond kite frame lying on a sheet of vermilion red washi paper, one hand with a wide flat paste brush smoothing the folded paper edge down over the frame; a bowl of white rice paste, torn scraps of white and indigo paper, thin bamboo offcuts.' +
      PHOTO,
  },
  {
    id: 'ph-balance',
    aspect: 'portrait 2:3',
    prompt:
      'A finished white paper diamond kite with a deep indigo lower half hanging perfectly level from a single thread pinched between a finger and thumb at the top of the frame, being checked for balance, against a softly blurred pale whitewashed workshop wall; a tiny vermilion thread tied at its nose.' +
      PHOTO,
  },
  {
    id: 'ph-fly',
    aspect: 'wide 16:9',
    prompt:
      'A lone figure seen from behind, small in the frame at lower left, standing on a windswept grassy headland above a pale silver sea, holding a line that rises to a small vermilion red diamond kite high in the upper right of a huge pale sky with long soft clouds. The dark indigo coat and the long grass are blown sideways by the wind. Natural overcast daylight outdoors.' +
      PHOTO,
  },
  {
    id: 'ph-rafters',
    aspect: 'landscape 3:2',
    prompt:
      'Interior of a small whitewashed stone kite workshop: a dozen paper kites, diamonds, hexagons and rectangles in indigo and white, hanging from the roof beams to dry, with a single vermilion red one among them; window light raking across them from the left, a long worn wooden bench beneath.' +
      PHOTO,
  },
  {
    id: 'ph-knot',
    aspect: 'square 1:1',
    prompt:
      'Extreme macro close-up of the crossing point of two thin bamboo spars lashed tightly together with waxed pale linen thread in a neat square lashing, a bridle line knotted on; indigo paper softly out of focus behind, one strand of vermilion thread in the lashing.' +
      PHOTO,
  },
  {
    id: 'ph-reel',
    aspect: 'portrait 2:3',
    prompt:
      'Seen from the flyer\'s own point of view: two weathered hands holding a wooden kite reel, pale linen line running out taut and upward toward a bright pale sky, where a tiny vermilion kite is a speck far above; the cuffs of a dark indigo work jacket; grass blurred below. Natural daylight outdoors.' +
      PHOTO,
  },
  {
    id: 'ph-drying',
    aspect: 'landscape 3:2',
    prompt:
      'Large sheets of freshly dyed washi paper pegged along a line to dry outdoors, most deep indigo and white, one vermilion red, lifting and curling in the wind; pale sea haze and a low grassy headland blurred behind. Natural overcast daylight outdoors.' +
      PHOTO,
  },

  // ── texture ──────────────────────────────────────────────────────────────
  {
    id: 'tex-washi',
    aspect: 'square 1:1',
    prompt:
      'A flat, evenly lit scan of one sheet of handmade unbleached kozo washi paper filling the entire frame edge to edge: warm off-white, with fine long pale fibres, a few tiny darker flecks of bark and a subtle cloudy unevenness. Perfectly uniform brightness across the whole frame: no folds, no creases, no shadows, no vignette, no gradient, no edges of the sheet visible. ' +
      NO_TEXT,
  },
]
