// The image manifest: every generated asset on the site, by id.
// Shared style blocks keep each family looking like one commissioned set.
import { species } from './manifest-species.mjs'

export const PAPER =
  'MEDIUM AND STYLE: a hand-made cut-paper sculpture, built from many layers of hand-cut matte cotton paper that was ' +
  'painted with gouache before cutting. Each layer sits slightly proud of the one beneath, with a tight soft contact ' +
  'shadow between layers, so it reads as a real layered paper collage photographed straight-on from directly above ' +
  'under soft, even daylight. Visible paper fibre, faint dry-brush gouache texture, crisp scissor and scalpel edges ' +
  'with small human irregularities, fine details made from tiny separate slivers of paper. No drawn outlines, no ink ' +
  'lines, no digital gradients, no glossy plastic look, not a vector illustration, not a 3D render, not a painting. ' +
  'NEVER include text, letters, numbers, labels, logos, signatures, borders or frames.'

export const TRUE_COLOUR = ' COLOUR: true to life for the species, slightly simplified into flat paper tones.'

export const CUTOUT =
  ' BACKGROUND: a genuinely transparent background (real alpha channel), no backdrop, no surface, no ground, ' +
  'no cast shadow outside the object. The whole subject sits fully inside the frame with a clear empty margin on every side.'

// A stage flat for the paper theatre: one horizontal band whose top edge is a cut silhouette.
const FLAT =
  ' COMPOSITION: one single long horizontal band, like a stage flat in a paper toy theatre, spanning the full width ' +
  'of the image and running off the left edge, the right edge and the bottom edge. Only the TOP edge is a cut ' +
  'silhouette. The band is assembled from many overlapping horizontal strips of cut paper, each strip one flat ' +
  'gouache tone with a visible raised edge and contact shadow. Everything above the silhouette is empty. ' +
  'BACKGROUND: a genuinely transparent background (real alpha channel) above the silhouette, no sky, no backdrop.'

export const paper = (id, aspect, subject) => ({ id, aspect, alpha: true, prompt: `SUBJECT: ${subject}\n\n${PAPER}${TRUE_COLOUR}${CUTOUT}` })
const flat = (id, subject) => ({ id, aspect: 'panorama 3:1', alpha: true, prompt: `SUBJECT: ${subject}\n\n${PAPER}${FLAT}` })
const prop = (id, aspect, subject) => ({ id, aspect, alpha: true, prompt: `SUBJECT: ${subject}\n\n${PAPER}${CUTOUT}` })

const SKY_SCENE =
  'A wide cut-paper diorama of a high-altitude lake on a treeless alpine plateau: in the lower third a still oval lake ' +
  'with a gently curved near shore of grass tufts and a few boulders; behind the lake two overlapping rows of low ' +
  'rounded treeless hills; on the horizon at centre-left one distant, very large snow-covered mountain massif with a ' +
  'long white summit ridge; the upper half of the image is open sky made of a few big overlapping sheets of paper. '

export const scenes = [
  // ---- hero diorama: the plateau in summer, back to front
  flat(
    'hero-peaks',
    'a distant range of high Himalayan mountains: jagged snow-covered summits and glaciers in white, pale ice-blue and ' +
      'soft lilac paper, with slate-violet rock ribs showing through the snow. The skyline is varied: several sharp ' +
      'peaks of different heights and one broad dominant massif left of centre. The range occupies the lower 60% of the image.',
  ),
  flat(
    'hero-hills',
    'rolling, completely treeless alpine hills: a gently undulating skyline of big rounded hills in tawny ochre, olive ' +
      'and dusty moss-green paper, with a few small leftover snow patches in the hollows near the tops and scattered ' +
      'grey boulders. No trees, no bushes, no buildings. The hills occupy the lower 60% of the image.',
  ),
  flat(
    'hero-plain',
    'a wide flat alpine meadow plain seen slightly from above, with a clear shallow stream meandering across it in ' +
      'broad lazy S-bends from the far left to the right, pale turquoise water with white paper highlights, gravel ' +
      'bars of small grey paper pebbles, the turf in fresh green and yellow-green paper with tiny dots of wildflower ' +
      'colour. The top edge is an almost level, softly wavy horizon. No trees. The plain occupies the lower 55% of the image.',
  ),
  flat(
    'hero-meadow',
    'a dense foreground bank of alpine wildflowers and grass tufts seen from the side at ground level: clumps of ' +
      'purple primroses, yellow buttercups and cinquefoil, pink bistort spikes, white edelweiss, small blue gentians ' +
      'and violet asters, mixed with blades of sedge and grass in several greens. The flowers form an irregular, ' +
      'lively top silhouette of stems and blooms of different heights. The bank occupies the lower 65% of the image.',
  ),
  // ---- torn white paper (the snow sheet)
  {
    id: 'torn-a',
    aspect: 'panorama 3:1',
    alpha: true,
    prompt:
      'A photograph, straight-on from above, of one sheet of thick, soft, pure white handmade cotton rag paper that has ' +
      'been torn by hand right across its width. The white paper fills the image from the top edge down and runs off ' +
      'the top, left and right edges; its lower edge is the rough hand-torn deckle edge with fluffy fibres, wandering ' +
      'gently up and down across the full width at about two thirds of the way down the image. Below the torn edge ' +
      'there is nothing. Very subtle paper fibre texture, neutral white, soft even light, no creases, no shadows on ' +
      'the sheet. BACKGROUND: genuinely transparent (real alpha channel) below the torn edge, no backdrop, no cast ' +
      'shadow. No text, no marks.',
  },
  {
    id: 'torn-b',
    aspect: 'panorama 3:1',
    alpha: true,
    prompt:
      'A photograph, straight-on from above, of one sheet of thick, soft, pure white handmade cotton rag paper that has ' +
      'been torn by hand right across its width. The white paper fills the image from the bottom edge up and runs off ' +
      'the bottom, left and right edges; its upper edge is the rough hand-torn deckle edge with fluffy fibres, ' +
      'wandering in bigger irregular bites across the full width at about one third of the way down the image. Above ' +
      'the torn edge there is nothing. Very subtle paper fibre texture, neutral white, soft even light, no creases, ' +
      'no shadows on the sheet. BACKGROUND: genuinely transparent (real alpha channel) above the torn edge, no ' +
      'backdrop, no cast shadow. No text, no marks.',
  },
  // ---- props
  prop('cloud-1', 'landscape 3:2', 'one fat cumulus cloud made of five or six overlapping scalloped layers of white and warm cream paper, flat base, billowing top.'),
  prop('cloud-2', 'landscape 3:2', 'one long, low, stretched cloud made of four overlapping scalloped layers of white, cream and very pale pink paper, wider than tall.'),
  prop('cloud-3', 'landscape 3:2', 'a small puffy cloud made of three overlapping scalloped layers of white and pale lilac paper.'),
  prop(
    'sun',
    'square',
    'a paper sun: a perfect disc of saffron-yellow paper layered on a slightly larger disc of orange paper, surrounded by ' +
      'a ring of about twenty hand-cut triangular paper rays alternating long and short in marigold and coral. Centred.',
  ),
  prop(
    'burrow',
    'landscape 3:2',
    'the entrance of a marmot burrow seen from the front: a low rounded mound of earth-brown and ochre paper with a ' +
      'dark oval hole in the middle, a fringe of green paper grass tufts and two tiny yellow flowers around it, a few ' +
      'grey paper pebbles. Colours: earth browns, ochre, greens.',
  ),
  flat(
    'bed',
    'a stream bed seen in cross-section from under water: a band of rounded river pebbles and cobbles of many sizes in ' +
      'slate grey, warm grey, rust, ochre and pale quartz-white paper, packed closely, with a few bigger stones ' +
      'standing up to make an uneven top silhouette. The pebbles occupy the lower 50% of the image.',
  ),
  flat(
    'waves',
    'the surface of water as a stage flat: five overlapping rows of scalloped paper waves with pointed curling crests, ' +
      'in milky glacial mint, pale turquoise, white and one row of deep teal. The wave rows occupy the lower 55% of the image.',
  ),
  // ---- the rim at dusk
  flat(
    'rim-far',
    'a very distant range of enormous snow mountains at sunset in alpenglow: the snow in peach, rose-pink and pale ' +
      'apricot paper, the shadowed faces in lilac and dusty violet paper. One colossal broad massif with a long summit ' +
      'ridge dominates the centre, flanked by lower sharp peaks. The range occupies the lower 65% of the image.',
  ),
  flat(
    'rim-mid',
    'a long line of bare rocky mountain ridges at dusk, without snow: overlapping ridges in rust red, burnt sienna, ' +
      'plum and deep oxblood paper with a few streaks of old snow in pale pink in the gullies. Jagged but lower than ' +
      'high peaks. The ridges occupy the lower 55% of the image.',
  ),
  flat(
    'rim-near',
    'the dark near edge of a treeless plateau at dusk: low rounded hills and boulders in deep aubergine, indigo and ' +
      'plum paper, with a fringe of grass tufts along the skyline catching a thin rim of orange light. The band ' +
      'occupies the lower 45% of the image.',
  ),
  // ---- one view, four lights (pixel-aligned edit chain)
  {
    id: 'sky',
    aspect: 'wide 16:9',
    steps: [
      SKY_SCENE +
        'TIME: bright midday in midsummer. Sky sheets in strong cobalt and cerulean blue with three white paper cumulus ' +
        'clouds; the lake deep blue with white paper glints; the hills in fresh green and ochre; the massif brilliant white. ' +
        PAPER +
        ' The image is filled edge to edge, opaque, no border.',
      'Edit the previous image. Keep every paper shape, every edge, the composition and the framing exactly the same ' +
        '(pixel-aligned); change only the paper colours and light to SUNSET: sky sheets in hot coral, saffron and rose ' +
        'pink, the clouds lit orange and magenta from below, the snow massif glowing peach-pink, the hills in rust, plum ' +
        'and deep olive, the lake mirroring the pink and gold sky. Same cut-paper medium. No text.',
      'Edit the previous image. Keep every paper shape, every edge, the composition and the framing exactly the same ' +
        '(pixel-aligned); change only the paper colours and light to BLUE HOUR just after sunset: sky sheets in deep ' +
        'ultramarine and violet with a thin band of fading magenta on the horizon, the clouds dark violet, the massif ' +
        'pale lilac-blue, the hills in indigo and deep plum, the lake dark blue with a pale streak; three or four first ' +
        'stars as tiny pin-pricks. Same cut-paper medium. No text.',
      'Edit the previous image. Keep every paper shape, every edge, the composition and the framing exactly the same ' +
        '(pixel-aligned); change only the paper colours and light to a MOONLESS NIGHT: sky sheets in near-black indigo ' +
        'densely scattered with thousands of tiny pin-prick stars and fine white paint spatter, with the bright band of ' +
        'the Milky Way rising diagonally from the horizon as a speckled cloud of pale blue, white and faint rose dots; ' +
        'no clouds lit; the massif a faint cold grey-blue, the hills almost black indigo, the lake black and reflecting ' +
        'some stars. Same cut-paper medium. No text.',
    ],
  },
]

export const assets = [...scenes, ...species]
