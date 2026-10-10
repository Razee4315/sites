// Every image on the site, as a prompt. One Codex session per entry (chains make several aligned images).

// ---------------------------------------------------------------- shared art direction
const PLACE =
  'Place: the Deosai plateau in Gilgit-Baltistan, northern Pakistan, at about 4,100 metres. A treeless high-altitude ' +
  'alpine steppe: short golden-green grass, low rounded rolling hills, scattered pale lichen-spotted granite boulders, ' +
  'and far-off brown mountains carrying streaks and patches of old snow.'

const PHOTO =
  'Style: a real documentary photograph made on a medium-format digital camera, natural light only. Thin, extremely ' +
  'clear mountain air, deep saturated high-altitude sky, crisp fine detail, true-to-life colour with gentle contrast, a ' +
  'quiet restrained editorial grade and very fine grain. Not illustrated, not painted, not 3D-rendered, not HDR, not ' +
  'oversaturated. Constraints: no trees, no bushes, no buildings, no fences, no power lines, no text, no signage, no ' +
  'watermark, no border, no frame.'

const CUT =
  'Background: genuinely transparent (real alpha channel). No backdrop, no ground, no surface, no cast shadow, no ' +
  'reflection, no glow. The subject sits entirely inside the frame with a clear empty margin on every side.'

const SPECIMEN =
  'Style: photorealistic natural-history specimen photograph, 100mm macro lens, crisp focus across the whole subject, ' +
  'soft bright overcast daylight from the upper left, true-to-life colour, fine natural detail (veins, hairs, pollen, ' +
  'tiny imperfections). Not illustrated, not painted, not 3D-rendered, not glossy. Constraints: no text, no label, no ' +
  'pin, no tape, no paper, no hands, no pot, no soil.'

const WILD =
  'Style: photorealistic wildlife photograph, 400mm telephoto lens, crisp focus on the whole animal, soft bright ' +
  'overcast high-altitude daylight from the upper left, true-to-life colour, every hair and feather resolved. A real wild ' +
  'animal, natural and slightly scruffy, not cute, not cartoon, not 3D-rendered. Constraints: no text, no collar, no tag, ' +
  'no other animals.'

// ---------------------------------------------------------------- builders
const photo = (id, aspect, scene, extra = '') => ({
  id,
  aspect,
  prompt: `Use case: photorealistic-natural\nAsset type: editorial landscape photograph for a travel website\nScene: ${scene}\n${PLACE}\n${PHOTO}${extra ? '\n' + extra : ''}`,
})

const flower = (id, subject) => ({
  id,
  aspect: 'vertical portrait 2:3',
  alpha: true,
  prompt:
    `Use case: photorealistic-natural\nAsset type: transparent botanical cut-out for a field-guide website\n` +
    `Subject: one single living alpine wildflower plant as found on the Deosai plateau: ${subject} The whole plant is shown ` +
    `upright from the base of its stem to the top of its flowers, with its leaves, standing slightly off vertical with a ` +
    `natural lean.\n${SPECIMEN}\n${CUT}`,
})

const animal = (id, aspect, subject) => ({
  id,
  aspect,
  alpha: true,
  prompt:
    `Use case: photorealistic-natural\nAsset type: transparent wildlife cut-out for a field-guide website\n` +
    `Subject: ${subject}\n${WILD}\n${CUT}`,
})

const cutout = (id, aspect, subject, style) => ({
  id,
  aspect,
  alpha: true,
  prompt: `Use case: photorealistic-natural\nAsset type: transparent cut-out for a layered web composition\nSubject: ${subject}\n${style}\n${CUT}`,
})

// ---------------------------------------------------------------- hero layers (aligned chains, four lights each)
const LAYER_RULE =
  'This is one depth layer for a parallax composition. Everything above the land silhouette is genuinely transparent ' +
  '(real alpha channel): there is NO sky, no clouds, no haze band, no backdrop in the image at all. The land runs the full ' +
  'width and continues off the left, right and bottom edges with no margin. ' +
  'Photorealistic, medium-format landscape photograph, crisp detail, true-to-life colour, fine grain. No trees, no ' +
  'bushes, no buildings, no people, no animals, no text.'

const EDIT_RULE =
  'Edit the STEP 1 image. Change ONLY the light and colour. Keep every ridge, rock, plant, outline and the transparent ' +
  'area in exactly the same pixel position. Do not add a sky. New light: '

const LIGHTS = [
  'blue hour, twenty minutes before sunrise. No direct sunlight anywhere. Everything in cool, deep, slightly desaturated ' +
    'blue-violet ambient light, dark but with all detail still readable, snow patches a pale luminous blue.',
  'first alpenglow at sunrise. The highest summits and upper snow are lit a glowing rose-pink and warm orange by the ' +
    'first sun, while everything lower down is still in cool blue-violet shadow.',
  'a clear moonless night lit only by starlight. Very dark deep navy-blue, low contrast, detail only just readable, snow ' +
    'patches a faint cold grey-blue. No lamps, no glow.',
]

const far = {
  id: 'hero-far',
  aspect: 'wide landscape 16:9',
  alpha: true,
  steps: [
    'Subject: the far side of the Deosai plateau, northern Pakistan, seen across a wide flat plain. A long unbroken range of ' +
      'bare brown and ochre mountains with streaks and patches of old snow runs from edge to edge, with three or four higher ' +
      'snow-covered summits; the highest point of the skyline is about one third of the way down from the top of the frame ' +
      'and the skyline dips and rises naturally. Below the mountains a broad flat golden-green grass plain with a thin ' +
      'silver river fills the lower half of the image down to the bottom edge. Slight blue atmospheric haze on the far ' +
      'mountains. Light: clear early-morning sun, low and warm, from the left. ' +
      LAYER_RULE,
    ...LIGHTS.map((l) => EDIT_RULE + l),
  ],
}

const near = {
  id: 'hero-near',
  aspect: 'wide landscape 16:9',
  alpha: true,
  steps: [
    'Subject: the immediate foreground of an alpine meadow on the Deosai plateau, northern Pakistan, seen from a low camera ' +
      'position. A low grassy rise runs across the full width, taller at the left and right and dipping in the middle, ' +
      'covering only the lower 40% of the frame. It is dense with short grass and alpine wildflowers in bloom (yellow ' +
      'cinquefoil, purple asters, pink knotweed spikes, small blue gentians) and has three rounded lichen-spotted granite ' +
      'boulders. The top edge is a natural irregular silhouette of grass blades, flower heads and boulders against ' +
      'transparency. Sharp focus front to back. Light: clear early-morning sun, low and warm, from the left. ' +
      LAYER_RULE,
    ...LIGHTS.map((l) => EDIT_RULE + l),
  ],
}

const tent = {
  id: 'tent',
  aspect: 'landscape 3:2',
  alpha: true,
  steps: [
    'Subject: one small expedition tent on its own: a low sand-coloured canvas ridge tent with a faded ochre flysheet, guy ' +
      'lines pegged out, door flap closed, seen from the front three-quarter angle at eye level. Slightly weathered and ' +
      'dusty, completely real. Soft clear daylight from the upper left. Photorealistic photograph, crisp detail. ' +
      'No people, no logo, no text, no flag. ' +
      CUT,
    'Edit the STEP 1 image. Keep the tent, guy lines, outline and the transparent background in exactly the same pixel ' +
      'position. Change ONLY the light: it is now night, the outside of the tent is dark cool blue, and a lantern inside ' +
      'makes the canvas glow warm amber from within, brightest low in the middle. No light spills outside the tent ' +
      'outline, no glow on the background.',
  ],
}

// ---------------------------------------------------------------- the set
export const assets = [
  far,
  near,
  tent,

  // --- flora
  flower('fl-gentian', 'a trumpet gentian with three deep ultramarine-blue upturned trumpet flowers and a rosette of small glossy leaves at the base.'),
  flower('fl-edelweiss', 'a Himalayan edelweiss (Leontopodium) with a cluster of three woolly white star-shaped flower heads on slender grey-green felted stems.'),
  flower('fl-primula', 'a Himalayan primrose (Primula macrophylla) with one round head of rich violet-purple flowers with dark eyes on a single mealy stem above long narrow leaves.'),
  flower('fl-bistort', 'a Himalayan fleeceflower (Bistorta affinis) with four dense upright spikes of tiny rose-pink flowers above a mat of narrow dark-green leaves.'),
  flower('fl-potentilla', 'a golden cinquefoil (Potentilla) with five bright butter-yellow five-petalled flowers on thin wiry reddish stems and small toothed leaves.'),
  flower('fl-aconite', 'a Himalayan monkshood (Aconitum) with a tall spike of hooded deep violet-blue flowers and finely divided leaves.'),
  flower('fl-pedicularis', 'a lousewort (Pedicularis) with a stout spike of beaked magenta-pink flowers and ferny dark leaves tinged purple.'),
  flower('fl-aster', 'an alpine aster with two large lilac-mauve daisy flowers with golden-yellow centres on short downy stems.'),
  flower('fl-poppy', 'a Himalayan blue poppy (Meconopsis aculeata) with two crinkled sky-blue papery flowers with golden stamens and a bristly stem with lobed leaves.'),
  flower('fl-rhodiola', 'a roseroot (Rhodiola) with a clump of fleshy blue-green leafy stems each topped with a dense head of rusty-red and yellow flowers.'),
  flower('fl-geranium', 'a meadow cranesbill (Geranium pratense) with three open violet-blue veined flowers, a few buds and deeply cut leaves on branching stems.'),

  // --- fauna
  animal('an-bear-walk', 'landscape 3:2', 'an adult Himalayan brown bear (Ursus arctos isabellinus) with a shaggy pale sandy-brown and reddish coat, walking steadily from left to right in exact side profile, all four legs visible mid-stride, head held slightly low. The whole animal fills most of the frame.'),
  animal('an-bear-stand', 'vertical portrait 2:3', 'an adult Himalayan brown bear (Ursus arctos isabellinus) with a shaggy pale sandy-brown and reddish coat, standing fully upright on its hind legs, front paws hanging relaxed, head turned slightly to one side scenting the air, seen from the front three-quarter. Whole animal from the top of the head to the hind feet.'),
  animal('an-marmot', 'vertical portrait 2:3', 'a golden marmot (long-tailed marmot, Marmota caudata) with thick golden-orange fur and a darker brown back and tail tip, standing bolt upright on its hind legs as a sentinel, front paws held against its chest, looking to the right. Whole animal from ears to feet and tail.'),
  animal('an-fox', 'landscape 3:2', 'a Tibetan red fox with a thick pale rust and grey summer coat, long black-stockinged legs and a full white-tipped brush, trotting from right to left in side profile, head turned toward the camera. Whole animal.'),
  animal('an-ibex', 'vertical portrait 2:3', 'a mature male Himalayan ibex with a grey-brown coat, pale saddle patch, dark beard and very long back-swept ridged horns, standing in side profile facing left with its head raised. Whole animal from horn tips to hooves.'),
  animal('an-lammergeier', 'wide landscape 16:9', 'a bearded vulture (lammergeier) gliding in flight, seen from slightly below and in front, long narrow dark slate wings held fully spread and flat from tip to tip, rust-orange head, breast and belly, black bristle beard, long diamond-shaped tail. The whole bird with both complete wingtips inside the frame.'),

  // --- landscape photographs
  photo('ph-sheosar', 'landscape 3:2', 'Sheosar Lake on a windless morning: a large high-altitude lake of deep sapphire-blue water lying perfectly still, mirror-reflecting low green hills and, far beyond them, the white snow massif of Nanga Parbat. The far shoreline sits exactly halfway up the frame so that the still water fills the whole lower half. A few small white clouds. No shore, plants or rocks in the foreground: only water in the lower half.'),
  photo('ph-barapani', 'wide landscape 16:9', 'Bara Pani: a broad, clear, shallow river sliding over rounded stones in several braided channels across a huge flat green plain, photographed from a low rise, with low hills and distant snow-streaked mountains behind. Midday light, small cumulus clouds throwing soft shadows on the plain.'),
  photo('ph-storm', 'very wide panorama 3:1', 'an afternoon storm crossing the plateau, as one continuous panorama. On the left the plain is still in clear warm sun with white cumulus; moving right, the sky builds into an enormous dark slate-blue shelf cloud trailing grey curtains of rain and hail, with two shafts of sunlight breaking through to light bright patches of golden grass; at the far right it is darkest. The flat plain and low hills run along the bottom third of the frame the whole way across.'),
  photo('ph-meadow', 'vertical portrait 2:3', 'a low close view through a dense carpet of alpine wildflowers in full July bloom, yellow, violet, pink and blue, with dew on them, shallow depth of field; behind, out of focus, the green plain and a snow-streaked ridge under a clear morning sky.'),
  photo('ph-sadpara', 'vertical portrait 2:3', 'Sadpara Lake below the plateau, seen from high on the jeep road above it: an opaque turquoise glacial lake held between steep bare rocky brown mountain walls, a thin dusty track cut into the slope in the foreground, clear morning light.', 'For this image only, the landscape is a steep arid rocky valley at 2,600 metres rather than the open plateau.'),
  photo('ph-track', 'landscape 3:2', 'a rough two-rut dirt jeep track running dead straight away from the camera across the vast flat plain to a vanishing point on the horizon, low hills far off, late-afternoon side light, long grass shadows, a few cumulus clouds.'),
  photo('ph-camp', 'landscape 3:2', 'a small expedition camp at golden hour beside a clear stream: four low sand-coloured canvas ridge tents with ochre flysheets pitched in a loose row on the grass, a blackened kettle on a small stone hearth with a thread of smoke, long warm shadows, the plain and snow-streaked hills behind glowing in the last sun. No people.'),
  photo('ph-herders', 'landscape 3:2', 'far away across the plain, a large flock of sheep and goats moved by two tiny distant herders on foot and a pack horse, backlit by low evening sun so that the dust they raise glows gold. The figures are very small in a vast landscape.'),
  photo('ph-kettle', 'vertical portrait 2:3', 'a close still life at camp at dusk: a soot-blackened aluminium kettle steaming on a small ring of stones with glowing embers, three chipped white enamel cups of milky tea on a flat rock beside it, short grass and tiny flowers around, soft blue dusk light with warm ember glow. No people, no hands.'),
  photo('ph-bearland', 'landscape 3:2', 'a single Himalayan brown bear seen from very far away, a small pale-brown shape walking alone across an immense green valley floor beside a winding silver stream, dwarfed by the landscape, soft overcast light. The bear occupies only a tiny part of the frame, left of centre.'),
  photo('ph-scope', 'vertical portrait 2:3', 'a spotting scope on a slim tripod standing alone on a frosty grass ridge at dawn, aimed out across a wide empty green valley with a silver stream far below, a folded wool blanket and a dented steel flask on the grass beside it, first warm light on the far slopes while the foreground is still in cool shadow. No people.'),
  photo('ph-aerial', 'vertical portrait 2:3', 'looking straight down from high above: braided silver streams and oxbows wandering across green and gold tundra grass, dark peat pools, pale gravel bars, patterned like marbling. A purely top-down aerial view with no horizon and no sky.'),
  photo('ph-dusk', 'wide landscape 16:9', 'the last minutes of sunset over the plateau: a band of burning orange and rose along the horizon under a darkening indigo sky with the first few stars, low hills in dark silhouette, and a still tarn in the plain reflecting the colour.'),
  {
    id: 'ph-milkyway',
    aspect: 'square 1:1',
    prompt:
      'Use case: photorealistic-natural\nAsset type: night-sky photograph used as a rotating background\nScene: the night sky only, photographed ' +
      'straight up from 4,100 metres on a moonless night: thousands of sharp pin-point stars of varied brightness and subtle ' +
      'colour, with the dense bright core of the Milky Way crossing the frame diagonally, dust lanes, faint airglow. Deep ' +
      'blue-black sky evenly to every edge. Style: a real long-exposure astrophotograph, tracked, sharp round stars, no star ' +
      'trails, natural colour, not oversaturated, not purple. Constraints: no land, no horizon, no mountains, no trees, no ' +
      'people, no meteors, no aircraft, no text, no watermark, no border, no vignette.',
  },

  // --- other cut-outs
  cutout(
    'cut-jeep',
    'landscape 3:2',
    'a 1980s short-wheelbase four-wheel-drive mountain jeep of the kind used on the Skardu to Deosai track: boxy, faded sky-blue paint with a white hard roof, dusty and dented, a spare wheel on the back, bundles and a jerry can roped to a roof rack, knobbly tyres. Exact side profile facing right, wheels level, both visible wheels complete.',
    'Style: photorealistic photograph, 85mm lens, soft clear daylight from the upper left, true-to-life colour, real dust and wear. Constraints: no badge, no logo, no lettering, no number plate, no people.',
  ),
  cutout(
    'cut-cloud-a',
    'wide landscape 16:9',
    'one single isolated fair-weather cumulus cloud, wide and low with a flat grey base and bright billowing white top, lit by sun from the upper left, soft feathered edges that fade naturally into transparency.',
    'Style: photorealistic photograph of a real cloud. Constraints: no sky colour, no blue, no other clouds, no land, no text.',
  ),
  cutout(
    'cut-cloud-b',
    'wide landscape 16:9',
    'one single isolated long ragged stratocumulus cloud bank, stretched horizontally, pale grey-white with a soft warm lit upper edge, wispy torn edges that fade naturally into transparency.',
    'Style: photorealistic photograph of a real cloud. Constraints: no sky colour, no blue, no other clouds, no land, no text.',
  ),
]
