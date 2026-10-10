// Every image on the site, as a prompt. One Codex session per entry; `steps` entries are edit chains.

// ── family 1: the bells, shot like a museum catalogue, cut out ─────────────────────────────────────────────
const CATALOGUE =
  'Style: photorealistic museum-catalogue photograph on a medium-format camera, 120mm lens, crisp focus across the ' +
  'whole object. Lighting: one large soft source from the upper left, a faint cool rim light on the right edge, deep ' +
  'natural shading on the far side; real metal with believable micro-texture and soft broad reflections. True-to-life ' +
  'colour, no colour cast. Not illustrated, not a 3D render, not glossy plastic.'

const CUTOUT =
  'Background: genuinely transparent (real alpha channel): no backdrop, no surface, no floor, no cast shadow, no ' +
  'reflection, no glow or haze around the object. Constraints: completely plain metal: no inscription, no lettering, no ' +
  'numerals, no coat of arms, no logo, no ornament except plain raised moulding wires. No hands, no people, no other props.'

const BELL =
  'a large English church tower bell cast in bell-metal bronze, classic English profile: a flat crown with a short ' +
  'plain cylindrical cast boss on top, a rounded shoulder, a long gently concave waist flaring out to a thick sound-bow ' +
  'and lip. Three fine raised moulding wires run around the shoulder and three more just above the sound-bow. No ' +
  'clapper visible, no headstock, no rope, no bolts, no fittings of any kind.'

const BELL_COMP =
  'Composition: perfectly straight-on front elevation with the camera level with the lip, so the mouth of the bell reads ' +
  'as one flat horizontal line and no interior is visible. The bell hangs mouth-down, perfectly upright, perfectly ' +
  'symmetrical and centred, filling about 84% of the frame height with a clear empty margin on every side.'

const KEEP =
  'Edit the image from STEP 1. Keep the outline of the bell, its size, position, framing, moulding wires, lighting ' +
  'direction and the transparent background exactly identical so the images register when stacked. Change ONLY the ' +
  'surface finish of the metal. New finish: '

const cut = (id, aspect, subject, comp) => ({
  id,
  aspect: `${aspect}, transparent background`,
  alpha: true,
  prompt: `Use case: product-mockup\nAsset type: transparent object cutout for a bell foundry website\nSubject: ${subject}\n${comp}\n${CATALOGUE}\n${CUTOUT}`,
})

// ── family 2: inside the foundry, documentary ──────────────────────────────────────────────────────────────
const FOUNDRY =
  'Style: a real documentary photograph inside a centuries-old working bell foundry, 35mm lens on a full-frame camera, ' +
  'available light only: the hot orange glow of molten metal against cool grey daylight from high sooty windows. Deep ' +
  'soft blacks, smoke and dust in the air, worn brick, iron and loam, fine film grain like pushed Kodak Portra 800. ' +
  'Restrained, unglamorous, true. Constraints: no faces (hands, forearms, leather aprons and backs only), no text, no ' +
  'signage, no numerals, no logos, no watermark.'

const doc = (id, aspect, scene) => ({
  id,
  aspect,
  prompt: `Use case: photorealistic-natural\nAsset type: editorial documentary photograph for a bell foundry website\nScene: ${scene}\n${FOUNDRY}`,
})

// ── family 3: light on black, for screen blending ──────────────────────────────────────────────────────────
const ONBLACK =
  'Style: real high-speed photograph against a pure, featureless black background (#000000), nothing else in frame. ' +
  'The black must be completely clean so the image can be composited with a screen blend. No text, no watermark, no ' +
  'objects, no ground, no horizon.'

const PIT_SCENE =
  'the casting pit of a bell foundry seen from a fixed tripod position: in the centre foreground the top of a large ' +
  'buried bell mould, a squat cylinder of dark dried loam bound with iron hoops, with a brick-lined pouring channel ' +
  '(a runner) leading into its top from the left; packed black sand floor around it; behind, a soot-black brick wall ' +
  'with a tall arched window letting in weak grey daylight on the right; chains and a crane hook hanging in the ' +
  'upper left darkness.'

export const assets = [
  // the bell, four times in its life: one edit chain so every frame registers with the first
  {
    id: 'bell',
    aspect: 'square 1:1, transparent background',
    steps: [
      `Use case: product-mockup\nAsset type: transparent object cutout for a bell foundry website\nSubject: ${BELL} The bell is newly tuned and finished: warm satin gold-bronze, with faint fine horizontal lathe lines and a soft broad highlight down its left side.\n${BELL_COMP}\n${CATALOGUE}\n${CUTOUT}`,
      `${KEEP}the bell exactly as it leaves the mould, before any cleaning: a rough matte as-cast skin, dark grey-brown and black with patches of pale baked loam and sand still clinging to it, dull, no shine at all, slightly granular.`,
      `${KEEP}the bell after eighty years hanging in a tower: an even, deep chocolate-brown oxidised patina, almost matte, slightly lighter and more golden on the sound-bow.`,
      `${KEEP}the bell after four hundred years in a tower by the sea: a thick weathered verdigris patina, pale blue-green and turquoise with darker brown-black streaks running vertically down the waist, chalky and matte.`,
    ],
  },

  cut(
    'clapper',
    'vertical portrait 2:3',
    'a hand-forged wrought-iron bell clapper hanging perfectly vertical: an eye loop at the very top, a long slender ' +
      'gently tapering round shaft, a heavy spherical ball near the bottom and a short tapered flight below the ball. ' +
      'Dark forged iron with soft hammer marks; the ball is worn bright and smooth on both sides where it strikes.',
    'Composition: straight-on front elevation, the clapper exactly on the vertical centre line of the frame, filling about 90% of the frame height, clear empty margin on every side.',
  ),
  cut(
    'headstock',
    'wide landscape 3:1',
    'an English bell headstock: one short, thick horizontal beam of weathered oak with visible grain and adze marks, ' +
      'bound by four black wrought-iron straps with square nuts, and a turned bright steel gudgeon pin protruding from ' +
      'the centre of each end. Nothing hanging from it.',
    'Composition: perfectly straight-on front elevation, the beam exactly horizontal and centred, filling about 88% of the frame width, clear empty margin on every side.',
  ),
  cut(
    'handbell',
    'vertical portrait 2:3',
    'an English musical handbell standing upright with its mouth down: a small polished bright bell-metal bronze bell ' +
      'with a flared lip, a brass ferrule and a stiff looped handle of thick tan saddle leather with neat stitching.',
    'Composition: straight-on front elevation, camera level with the lip so the mouth is a flat horizontal line; centred and symmetrical, filling about 86% of the frame height, clear empty margin on every side.',
  ),
  cut(
    'shipbell',
    'square 1:1',
    'a traditional ship\'s bell in mirror-polished yellow brass: a compact, wide-mouthed bell with a pronounced flared ' +
      'lip and a rounded crown with a solid cast suspension lug on top. Two plain turned grooves around the waist. No ' +
      'bracket, no rope, no clapper visible.',
    'Composition: straight-on front elevation, camera level with the lip so the mouth is a flat horizontal line; mouth-down, centred and symmetrical, filling about 84% of the frame height, clear empty margin on every side.',
  ),
  cut(
    'bourdon',
    'square 1:1',
    'an enormous continental cathedral bourdon bell in dark aged bronze: a broad, heavy, squat profile much wider at ' +
      'the lip than an English bell, a domed shoulder, a very thick rounded sound-bow, and a crown of six plain cast ' +
      'loops (canons) on top. One plain raised band around the waist. Dark brown-bronze with a little green in the recesses.',
    'Composition: straight-on front elevation, camera level with the lip so the mouth is a flat horizontal line; mouth-down, centred and symmetrical, filling about 84% of the frame height, clear empty margin on every side.',
  ),
  cut(
    'clockbell',
    'square 1:1',
    'a hemispherical turret-clock bell: a plain shallow bowl-shaped bell of polished bell-metal bronze, like half a ' +
      'sphere with a slightly thickened rim, with a single plain steel bolt and washer through its top centre. Faint ' +
      'concentric lathe lines.',
    'Composition: straight-on front elevation, camera level with the rim so the mouth is a flat horizontal line; mouth-down, centred and symmetrical, filling about 80% of the frame width, clear empty margin on every side.',
  ),

  cut(
    'sally',
    'tall narrow vertical portrait 1:3',
    'the sally of an English church bell rope: a long thick fluffy tufted woollen grip woven into the rope, in ' +
      'spiralling barber-pole bands of deep red, cream white and navy blue, tapering at both ends into plain natural ' +
      'hemp rope that continues straight up to the top edge of the frame and straight down to the bottom edge.',
    'Composition: straight-on, the rope perfectly vertical on the centre line of the frame and running off the top and bottom edges; the sally occupies the middle 60% of the height; clear empty margin left and right.',
  ),
  cut(
    'copper',
    'landscape 3:2',
    'a single cast ingot of pure copper: a chunky trapezoidal bar with slightly rounded edges, salmon-pink to ' +
      'red-orange metal with a satin sheen, faint casting ripples on top and a few darker oxidised patches.',
    'Composition: three-quarter view from slightly above, the ingot floating level, entirely inside the frame, filling about 80% of the frame width, clear empty margin on every side.',
  ),
  cut(
    'tin',
    'landscape 3:2',
    'a single cast ingot of pure tin: a chunky trapezoidal bar with slightly rounded edges, bright silvery-white metal ' +
      'with a soft frosted crystalline sheen and faint casting ripples on top.',
    'Composition: three-quarter view from slightly above, the ingot floating level, entirely inside the frame, filling about 80% of the frame width, clear empty margin on every side.',
  ),
  cut(
    'swarf-a',
    'square 1:1',
    'one long curled ribbon of freshly machined bronze swarf from a lathe: a springy golden helical spiral of thin metal, ' +
      'bright and mirror-clean on one face, finely ridged on the other, with slightly blued edges.',
    'Composition: the single curl floating at a diagonal, entirely inside the frame, filling about 80% of it, clear empty margin on every side.',
  ),
  cut(
    'swarf-b',
    'square 1:1',
    'two short tight curls of freshly machined golden bronze swarf from a lathe, like small metal springs, one larger ' +
      'and one smaller, bright and clean with fine ridges.',
    'Composition: the two curls floating apart at different angles, entirely inside the frame, clear empty margin on every side.',
  ),

  // the pour: three registered frames of the same pit
  {
    id: 'pit',
    aspect: 'wide landscape 16:9',
    steps: [
      `Use case: photorealistic-natural\nAsset type: editorial documentary photograph for a bell foundry website\nScene: ${PIT_SCENE} It is the quiet minute before the pour: nothing glows, the pit is cold, dim and still, lit only by the grey window light. No people.\n${FOUNDRY}`,
      'Edit the image from STEP 1. Keep the camera position, framing, the mould, the wall, the window, the chains and every object exactly where they are. Change ONLY this: the pour is now happening. A thick stream of blinding white-orange molten bronze runs along the brick channel from the left and down into the top of the mould; small flames and bright sparks jump from the pouring hole; the molten metal throws a strong warm orange light across the top of the mould, the nearby sand and the wall, and thin smoke rises. No people.',
      'Edit the image from STEP 1. Keep the camera position, framing, the mould, the wall, the window, the chains and every object exactly where they are. Change ONLY this: the pour has just finished. The channel is empty but its bricks still glow dull red, the pouring hole in the top of the mould glows deep orange with a few small blue-yellow flames burning off gas, and white steam and smoke drift up through the grey window light. The warm light on the surroundings is weak and fading. No people.',
    ],
  },

  doc(
    'loam',
    'vertical portrait 4:5',
    'close view of a founder\'s two bare forearms and loam-caked hands smoothing wet brown loam (a mix of clay, sand, ' +
      'horse manure and goat hair) onto the curved surface of a bell mould taller than they are, using a long wooden ' +
      'strickle board; cool side light from a window on the left, the wet loam glistening.',
  ),
  doc(
    'furnace',
    'vertical portrait 4:5',
    'the open mouth of a reverberatory furnace in the dark: a pool of molten bronze glowing white-orange inside the ' +
      'brick arch, a long iron skimming rod reaching in from the lower right held by a thickly gloved hand, sparks ' +
      'lifting off the surface, the brickwork around the opening lit orange and everything else falling to black.',
  ),
  doc(
    'breakout',
    'wide landscape 3:2',
    'a newly cast bell just dug out of its mould, standing mouth-down on the black sand floor of the pit: its skin is ' +
      'rough, dull grey-brown and crusted with baked loam; broken slabs of mould lie around it; a figure in a leather ' +
      'apron seen from behind and from the shoulders down knocks loam off the shoulder of the bell with a wooden mallet; ' +
      'dust hangs in a shaft of grey window light.',
  ),
  doc(
    'lathe',
    'wide landscape 3:2',
    'the tuning shop of a bell foundry: one large bronze church bell standing upside-down on the round turntable of a ' +
      'huge old vertical boring lathe, so the narrow closed crown of the bell is at the bottom, clamped in iron jaws, and ' +
      'the wide open mouth faces straight up like a deep bronze cup or funnel that is clearly widest at its top rim. A ' +
      'steel cutting tool on a heavy vertical arm reaches down into the open mouth; the inner wall shows bright ' +
      'freshly-cut golden rings; long curled ribbons of bronze swarf spill over the rim and pile on the floor. The outside ' +
      'of the bell is dull brown as-cast metal. Cool even daylight from tall windows, oily black cast iron, no people. ' +
      '(This scene has no molten metal: daylight only.)',
  ),
  doc(
    'fork',
    'vertical portrait 4:5',
    'extreme close-up: a weathered hand holds the stem of a large old steel tuning fork so its prongs almost touch the ' +
      'thick bright lip of a newly tuned bronze bell; shallow depth of field, the lip sharp, the dark tuning shop behind ' +
      'dissolving into soft blur; cool daylight from the left.',
  ),
  doc(
    'belfry',
    'wide landscape 16:9',
    'inside a stone church belfry, looking slightly upward: a ring of large dark bronze bells hung in a massive old oak ' +
      'bell frame, each on a big wooden wheel with a rope running down; shafts of pale morning light cut through wooden ' +
      'louvres on the right and catch the dust; cool stone, warm timber, the bells deep brown. No people. (This scene has ' +
      'no molten metal: daylight only.)',
  ),
  doc(
    'ropes',
    'vertical portrait 4:5',
    'a church ringing chamber: six bell ropes hanging in a loose circle from holes in a timber ceiling, each with a ' +
      'fluffy striped red, white and blue woollen sally, their tail ends looped up; whitewashed stone walls, worn wooden ' +
      'floorboards, a single narrow lancet window throwing soft daylight across the ropes. Still and empty. No people. ' +
      '(This scene has no molten metal: cool daylight only.)',
  ),
  doc(
    'sky',
    'wide landscape 16:9',
    'looking out from high in a church tower through an open stone belfry arch at first light: far below, the slate ' +
      'roofs and chimneys of a small English market town under mist, a pale clear sky fading from soft apricot at the ' +
      'horizon to pale blue above, a few rooks in flight; the dark stone edge of the arch frames the left side. No ' +
      'people. (This scene has no molten metal: cool dawn daylight only.)',
  ),

  // light on black
  {
    id: 'sparks-a',
    aspect: 'vertical portrait 2:3',
    prompt: `Use case: compositing element\nSubject: a loose shower of molten bronze sparks flying upward and outward from below the bottom edge of the frame: hundreds of tiny white-hot and orange points with short curved streaks of motion, densest at the bottom centre and thinning to a few stray sparks near the top; a couple of sparks bursting into tiny forks.\n${ONBLACK}`,
  },
  {
    id: 'sparks-b',
    aspect: 'wide landscape 16:9',
    prompt: `Use case: compositing element\nSubject: a sparse drift of small glowing orange embers floating up through darkness, scattered unevenly across the whole frame, each a soft out-of-focus point of different size and brightness with a few sharper ones, as if seen through a long lens; very sparse, mostly black.\n${ONBLACK}`,
  },
  {
    id: 'smoke',
    aspect: 'wide landscape 16:9',
    prompt: `Use case: compositing element\nSubject: thin pale grey foundry smoke and steam drifting slowly from the lower left to the upper right, soft wisps and translucent veils with plenty of clean black between them, lit softly from the side; no flames, no sparks.\n${ONBLACK}`,
  },

  // the inscription band: real lettering is set over this in HTML
  {
    id: 'band',
    aspect: 'ultra-wide panorama 3:1',
    prompt:
      'Use case: texture\nSubject: an extreme close-up, perfectly flat and straight-on, of the waist of a newly cast and ' +
      'polished bronze bell filling the entire frame edge to edge: a smooth blank horizontal band of warm satin ' +
      'gold-bronze with very fine horizontal lathe lines, bordered by two thin raised moulding wires running straight ' +
      'across near the top edge and two more near the bottom edge. The band between the wires is completely empty and ' +
      'evenly lit, slightly brighter along the horizontal centre as if gently curved toward the camera.\n' +
      'Style: photorealistic macro photograph, soft even studio light, true-to-life bronze colour. Constraints: no text, ' +
      'no letters, no inscription, no numerals, no ornament, no logo, no vignette, no background visible.',
  },
]
