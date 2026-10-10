// Every image on the site, as a prompt. One art-directed shoot: three shared style blocks, appended to
// every prompt in the same family so the set reads as commissioned rather than collected.

const NOTEXT =
  'Absolutely no text, lettering, inscriptions, numbers, dates, logos, signatures or watermarks anywhere in the image.'

// --- family 1: reportage inside the foundry --------------------------------------------------------------
const SCENE = `
STYLE: documentary editorial photograph made inside a three-hundred-year-old working English bell foundry. Medium-format digital camera, 80mm lens, available light only. Low-key exposure: deep soot-black shadows that still hold detail, one directional light source, warm bell-bronze and ember-orange highlights against cool slate-grey ambient fill. Honest and unretouched; tactile surfaces of soot, sand, loam, scale, oak and iron. Fine natural film grain, restrained contrast. No HDR look, no glow filter, no lens flare, no vignette, no border. ${NOTEXT}`

// --- family 2: objects cut out on transparency, shot square-on ---------------------------------------------
const CUT = `
STYLE: museum-catalogue studio photograph of ONE object, isolated on a genuinely transparent background (real alpha channel): no backdrop, no surface, no floor, no cast shadow, no reflection, no glow. Long 150mm lens so the perspective is flat and almost orthographic. One large soft key light from the upper left and a faint cool rim light from the right, so the form reads clearly with rich but soft highlights and deep, detailed shadow side. The whole object sits inside the frame with a clear empty margin on every side; nothing is cropped. Photorealistic, true materials, crisp clean edges. ${NOTEXT}`

// --- family 3: tools, seen from directly above --------------------------------------------------------------
const FLAT = `
STYLE: museum-catalogue photograph of ONE object seen from directly above (true top-down, flat-lay), isolated on a genuinely transparent background (real alpha channel): no backdrop, no surface, no cast shadow, no reflection. Flat orthographic perspective. Soft large light from the upper left, gentle cool fill. Worn, used, honest: soot, scorch marks, oil, hand polish. The whole object sits inside the frame with a clear empty margin on every side; nothing is cropped. Photorealistic, crisp clean edges. ${NOTEXT}`

// --- family 4: the bells out in the world -------------------------------------------------------------------
const WORLD = `
STYLE: quiet large-format landscape and architecture photograph, overcast northern light at the blue edge of dawn or dusk. Muted palette of slate grey, bone white, wet stone and dark green, with bell-bronze and a single small warm light as the only accents. Calm, level, formally composed, deep focus, fine natural grain. No HDR look, no saturated sunset colours, no lens flare, no vignette, no border. ${NOTEXT}`

const BELL =
  'an English church tower bell cast in bell bronze, about one metre across the mouth: the classic change-ringing profile with a rounded shoulder, a long gently concave waist and a thick flaring sound-bow and lip; on its crown a traditional set of canons (a ring of stout cast loops around a central argent) by which it would be hung; three fine raised moulding wires (thin parallel ridges) around the shoulder and three more just above the sound-bow; the waist completely plain and smooth'

const sally = (colours) =>
  `A church bell rope hanging perfectly vertical and straight, seen square-on. In the middle third of the frame the rope carries its sally: the long, thick, fluffy tufted woollen hand-grip of an English change-ringing rope, about four times the thickness of the rope, tapered softly at both ends, ${colours}. Above and below the sally the plain three-strand natural hemp rope continues in a dead straight line and runs out of the top edge and the bottom edge of the frame. Tall narrow composition, the rope exactly centred, generous empty transparent space left and right.${CUT}`

export const assets = [
  // ------------------------------------------------------------------ the bell, four ages, pixel-registered
  {
    id: 'bell',
    aspect: 'square 1:1',
    alpha: true,
    steps: [
      `Studio photograph of ${BELL}. FRESHLY TUNED AND FINISHED: bright warm golden bell bronze with a fine satin lathe-turned sheen, clean and new. Seen exactly square-on in pure front elevation at the height of the waist, perfectly symmetrical and upright, hanging in empty space with nothing attached. The bell fills about 80% of the frame height, centred.${CUT}`,
      `Same bell, same framing, same silhouette, same light. Change ONLY the surface: this is the bell AS CAST, an hour out of the mould and not yet cleaned. Dull dark grey-black casting skin, matte and rough, crusted with burnt loam, sand and scale, a few scuffed patches where raw salmon-gold bronze shows through. Keep the background genuinely transparent.`,
      `Same bell, same framing, same silhouette, same light. Change ONLY the surface: the bell after ONE HUNDRED YEARS in a tower. Deep chocolate-brown oxidised bronze patina, semi-matte, slightly darker in the hollows of the moulding wires, with a soft worn polish on the sound-bow. Keep the background genuinely transparent.`,
      `Same bell, same framing, same silhouette, same light. Change ONLY the surface: the bell after THREE HUNDRED YEARS in a tower. Dark brown-black bronze heavily streaked with pale turquoise and sea-green verdigris running down from the shoulder in vertical rain tracks, chalky mineral bloom in the hollows, the sound-bow worn bright bronze in one small patch where the clapper strikes. Keep the background genuinely transparent.`,
    ],
  },

  // ------------------------------------------------------------------ the pour, three moments, locked-off camera
  {
    id: 'pour',
    aspect: 'wide 16:9 landscape',
    steps: [
      `The casting floor of the foundry at night, five minutes BEFORE the pour. Locked-off wide view. In the earth floor of the casting pit, centre frame, the flat top of a buried bell mould shows as a round iron-banded case with a pouring basin of pale sand on top. Above it, hanging from an overhead crane chain, a large iron crucible ladle, full, its mouth glowing a fierce orange-white and lighting the chain. Two founders in long leather aprons, gauntlets and visors stand either side as near-silhouettes, hands on the ladle's long tilting bars, waiting. Far back right, a furnace door glows dull red. Brick walls black with three centuries of soot, roof trusses lost in darkness, a faint haze of smoke.${SCENE}`,
      `Same camera, same framing, same room, same two founders in the same places. Change ONLY the moment: THE POUR. The ladle is now tilted and a thin, steady, white-gold stream of molten bronze falls from its lip into the pouring basin on the mould; a small burst of sparks at the basin, the founders' aprons and visors lit hard from below in orange, pale smoke rising and catching the light, the floor around the mould glowing.`,
      `Same camera, same framing, same room. Change ONLY the moment: TEN MINUTES AFTER the pour. The ladle hangs level, empty and dark, only its rim still dull red. The pouring basin on the mould top is full, a disc of cooling metal glowing deep cherry-red with a darkening crust. Thick smoke hangs in layers through the room. The two founders have stepped back and stand at ease, visors up, lit only faintly by the red of the mould. Much darker overall than before.`,
    ],
  },

  // ------------------------------------------------------------------ ropes
  { id: 'sally-a', aspect: 'tall portrait 1:3', alpha: true, prompt: sally('in broad spiralling candy stripes of ember orange, bone white and soot black wool') },
  { id: 'sally-b', aspect: 'tall portrait 1:3', alpha: true, prompt: sally('in broad spiralling candy stripes of verdigris sea-green and bone white wool') },
  { id: 'sally-c', aspect: 'tall portrait 1:3', alpha: true, prompt: sally('in broad spiralling candy stripes of ochre yellow, oxblood red and bone white wool') },

  // ------------------------------------------------------------------ parts of a bell
  {
    id: 'clapper',
    aspect: 'tall portrait 1:3',
    alpha: true,
    prompt: `A wrought-iron church bell clapper hanging vertically, seen square-on: a forged eye (a closed loop) at the very top, a long slightly tapering round shaft, a heavy spherical ball near the bottom, and below the ball a short tapered tail called the flight. Dark forged iron with visible hammer marks and a little rust bloom; a bright worn polished patch on each side of the ball where it strikes. Exactly centred and symmetrical.${CUT}`,
  },
  {
    id: 'mouth',
    aspect: 'square 1:1',
    alpha: true,
    prompt: `Looking straight up into the mouth of a large bronze church bell from directly underneath, perfectly centred and symmetrical, so the bell reads as a set of concentric circles: the thick bright-worn lip as the outer ring, then the dark hollow interior with fine concentric lathe-turned tuning rings catching the light on the inner wall, and at the dead centre the iron ball of the clapper seen end-on. Warm bronze, deep shadow inside. The bell is a perfect circle filling about 88% of the frame; everything outside the circle of the lip is genuinely transparent.${CUT}`,
  },
  {
    id: 'wheel',
    aspect: 'square 1:1',
    alpha: true,
    prompt: `An English full-circle church bell wheel, seen exactly square-on so it is a perfect circle: a large traditional wooden wheel about two metres across, built of oak and ash, with a deep grooved rim (the shrouding and sole) that carries the rope, slender wooden spokes in the traditional pattern of two heavy parallel main spokes crossed by lighter ones, iron straps and old bolts at the joints, a square opening at the hub. Old, dry, silver-brown timber with rope wear in the groove. The gaps between the spokes are genuinely transparent. The wheel fills about 88% of the frame, centred.${CUT}`,
  },

  // ------------------------------------------------------------------ what we cast (catalogue cut-outs)
  {
    id: 'cast-hand',
    aspect: 'portrait 2:3',
    alpha: true,
    prompt: `A large English musical handbell standing upright, seen square-on: a polished bell-bronze bell with a flared mouth, a brass ferrule, and a stiff looped handle of thick tan saddle leather with visible stitching. Mouth down, handle up, perfectly upright and centred.${CUT}`,
  },
  {
    id: 'cast-ship',
    aspect: 'portrait 2:3',
    alpha: true,
    prompt: `A ship's bell seen square-on: a squat, wide-mouthed polished bronze ship's bell with a simple turned crown, hanging from a short curved bronze gallows bracket, with a short plaited white cotton bell-rope (lanyard) ending in a decorative knot hanging from the clapper below the mouth. Sea-worn: bright where hands have polished it, dulled elsewhere. The waist is plain. Centred.${CUT}`,
  },
  {
    id: 'cast-carillon',
    aspect: 'portrait 2:3',
    alpha: true,
    prompt: `A small carillon bell seen square-on: a compact, thick-walled bell-bronze bell about thirty centimetres across with a flat drilled crown (no loops), bolted up to a short section of galvanised steel beam by a single central bolt, with a slim external steel hammer on a pivot resting just off the sound-bow. Satin bronze with fine lathe-turned lines. Plain waist. Centred.${CUT}`,
  },
  {
    id: 'cast-hour',
    aspect: 'portrait 2:3',
    alpha: true,
    prompt: `A large turret-clock hour bell seen square-on: a broad, heavy, low-waisted bronze bell with a deep brown patina, hung dead (fixed) from a short black iron beam by a heavy iron strap and bolts, with a big external iron clock hammer on a pivoted arm poised beside the sound-bow. Plain waist, three moulding wires at the shoulder. Centred.${CUT}`,
  },

  // ------------------------------------------------------------------ tools, flat-lay
  { id: 'tool-calipers', aspect: 'portrait 2:3', alpha: true, prompt: `A pair of very large founder's outside calipers: two long bowed, curved legs of dark forged iron joined at a riveted pivot at the top, the tips nearly touching at the bottom, hand-forged, old, the pivot polished by use. Laid flat, upright in the frame.${FLAT}` },
  { id: 'tool-fork', aspect: 'tall portrait 1:3', alpha: true, prompt: `A single large antique steel tuning fork, about thirty centimetres long, with two long parallel square-section tines and a plain round stem, blued steel worn bright at the edges, a little fine pitting. Laid flat, tines pointing up, exactly vertical.${FLAT}` },
  { id: 'tool-ladle', aspect: 'landscape 3:2', alpha: true, prompt: `A founder's hand ladle (a skimmer for molten bronze): a small deep iron bowl crusted inside with pale slag and a rind of cooled bronze, on a long straight iron rod handle ending in a forged ring. Scorched and scaled. Laid flat, lying diagonally across the frame.${FLAT}` },
  { id: 'tool-ingot', aspect: 'landscape 3:2', alpha: true, prompt: `A single rough-cast ingot of bell metal (bronze): a trapezoidal bar with a pitted, rippled open-mould top surface, sharp shrinkage dip along the middle, salmon-gold bronze with patches of dark oxide and a bright saw-cut face at one end. Laid flat, lying at a slight angle.${FLAT}` },
  { id: 'tool-mallet', aspect: 'landscape 3:2', alpha: true, prompt: `A bell tuner's striking mallet: a turned ash handle darkened by hands and a cylindrical head of tightly rolled rawhide bound with two iron rings, the striking faces mushroomed and frayed from use. Laid flat, lying diagonally.${FLAT}` },
  { id: 'tool-glove', aspect: 'portrait 2:3', alpha: true, prompt: `A single founder's heavy leather gauntlet, long-cuffed, laid flat palm-down with the fingers slightly curled: thick tan hide scorched black on the fingers and back of the hand, stiff, cracked, spattered with tiny beads of bronze.${FLAT}` },
  { id: 'swarf-1', aspect: 'square 1:1', alpha: true, prompt: `A single long curl of bronze swarf: a bright golden ribbon of lathe turnings coiled in a loose open spiral of five or six turns, razor-thin, with a fine serrated edge and a mirror face on one side and a matte face on the other. Floating, lying across the frame diagonally.${FLAT}` },
  { id: 'swarf-2', aspect: 'square 1:1', alpha: true, prompt: `A single short tight curl of bronze swarf: a bright golden chip of lathe turnings coiled like a watch spring in two and a half tight turns, razor-thin, mirror-bright on the outside. Floating in the centre of the frame.${FLAT}` },
  { id: 'swarf-3', aspect: 'landscape 3:2', alpha: true, prompt: `A single long, lazy, stretched-out helix of bronze swarf: a bright golden ribbon of lathe turnings pulled into a long open corkscrew of eight turns, razor-thin, glinting. Floating, lying horizontally across the frame.${FLAT}` },

  // ------------------------------------------------------------------ foundry reportage
  { id: 'molten', aspect: 'landscape 3:2', prompt: `Extreme close-up looking straight down onto the surface of molten bell bronze in a crucible, filling the entire frame edge to edge as an abstract texture: blinding white-gold liquid metal crossed by drifting, cracked continental plates of darker orange and near-black dross, fine bright veins between the plates, a shimmer of heat. No crucible rim visible, no tools, nothing but the metal surface.${SCENE}` },
  { id: 'loam', aspect: 'portrait 4:5', prompt: `Close view of a founder's two bare forearms and hands, grey with dried clay, sweeping a tall wooden strickle board (a profile template cut to the curve of a bell) around a wet loam mould core, which stands like a smooth, dark, clay-coloured bell shape on a brick base. Wet loam sheen on the freshly swept surface, curls of excess loam gathering on the board's edge. A single work lamp from the left, darkness behind.${SCENE}` },
  { id: 'lathe', aspect: 'landscape 3:2', prompt: `The tuning shop: a large bronze bell sitting mouth-up (upside down) on the wide rotating table of an old cast-iron vertical boring lathe, a heavy steel cutting arm reaching down inside the bell, bright golden ribbons of bronze swarf spilling over the lip and piled on the table. The inside of the bell shows bright concentric cut rings; the outside is still dark from casting. Cold daylight from a tall north window on the left, the rest of the workshop in deep shadow, belts and wheels dimly visible overhead.${SCENE}` },
  { id: 'tuner', aspect: 'portrait 2:3', prompt: `Portrait of the foundry's bell tuner at work: a woman in her late fifties with cropped grey hair and a brown cotton shop coat, eyes closed in concentration, head tilted, holding the stem of a large steel tuning fork against the lip of a bright bronze bell that fills the lower right of the frame, listening. Three-quarter view, waist up. Cold window light on her face from the left, dark workshop behind. Real skin, unglamorous, dignified.${SCENE}` },
  { id: 'founder', aspect: 'portrait 2:3', prompt: `Portrait of the master founder: a broad man in his sixties with a short white beard and soot in the lines of his face, wearing a scorched leather apron over a collarless wool shirt, heavy gauntlets tucked under one arm, standing in front of the dark open door of a furnace that throws a faint orange edge-light on one cheek. He looks just past the camera, unsmiling but warm. Waist up, vertical. Real skin, unglamorous, dignified.${SCENE}` },
  { id: 'patterns', aspect: 'landscape 3:2', prompt: `The pattern loft of the foundry: a long attic wall hung floor to rafters with hundreds of old wooden strickle boards (thin plank templates, each cut along one edge to the curved profile of a different bell), overlapping like the feathers of a wing, grey and brown with age, lit by one small dusty skylight. Raking light, deep shadow between the boards, dust in the air. No labels or writing on the boards.${SCENE}` },
  { id: 'frieze', aspect: 'wide 16:9 landscape', prompt: `Macro detail across the shoulder of a newly cast bronze bell: a cast-in ornamental band of oak leaves and acorns in low relief running horizontally across the frame between fine raised moulding wires, the bronze bright and golden, hard raking light from the left throwing each leaf vein into relief, the bell curving away into shadow at the right. Shallow depth, the band sharp in the centre. Only the leaf ornament, no lettering of any kind.${SCENE}` },
  { id: 'pit', aspect: 'portrait 4:5', prompt: `Looking steeply down into the casting pit the morning after a pour: a founder's gloved hands on a long iron bar levering away the broken, burnt loam mould from a newly cast bell that is still half buried in black sand, the bell's shoulder showing rough, dark and scaled, faint heat haze, shards of baked mould around it. Grey dawn light from a roof light above.${SCENE}` },

  // ------------------------------------------------------------------ towers and ringing
  { id: 'belfry', aspect: 'landscape 3:2', prompt: `Inside the belfry of an English church tower: a ring of bronze bells hung for full-circle ringing in a massive old oak frame, each bell fixed to a wooden headstock with a large spoked wooden wheel beside it, ropes dropping through holes in the floor. Blades of pale daylight fall through the slatted stone louvres on the left and cut across the dusty air and the shoulders of the bells. Jackdaw feathers and dust on the beams. Wide view from one corner.${SCENE}` },
  { id: 'ringing-room', aspect: 'landscape 3:2', prompt: `The ringing chamber of an English church tower, empty of people: six bell ropes hang in a circle from holes in a timber ceiling, each with a fluffy striped woollen sally at shoulder height and its tail end looped up, over worn coir matting. Bare limewashed stone walls, a single deep-set arched window on the left throwing soft light across the ropes, an old wooden bench. Still, expectant. The walls are completely bare: no boards, plaques, notices or writing.${SCENE}` },

  // ------------------------------------------------------------------ parallax landscape, three registered layers
  { id: 'land-sky', aspect: 'wide panorama 2:1', prompt: `A wide, empty dawn sky over flat English fenland: the lower fifth of the frame is a far, low, level horizon of misted fields and a pale band of ground fog; above it a huge calm sky grading from bone white at the horizon through pale slate to deeper blue-grey at the top, with a few long thin streaks of high cloud faintly edged in warm light. Nothing in the foreground, no buildings, no trees, no birds.${WORLD}` },
  { id: 'land-tower', aspect: 'wide panorama 2:1', alpha: true, prompt: `A long horizontal silhouette band for layering, spanning the full width of the frame and touching the left, right and bottom edges: a distant English village treeline in mist (bare winter elms, hedgerows, a few low roofs) and, standing above it a little left of centre, a tall square medieval stone church tower with pinnacles and louvred belfry windows. Dark slate-green and grey, softened by mist, slightly lighter towards its base where the fog sits. EVERYTHING above the skyline is genuinely transparent (real alpha channel): there is no sky at all. The band occupies only the lower 55% of the frame, the tower rising to about 70%.${WORLD}` },
  { id: 'land-reeds', aspect: 'wide panorama 2:1', alpha: true, prompt: `A foreground strip for layering, spanning the full width of the frame and touching the left, right and bottom edges: near-black winter reeds, dry cow parsley seed-heads, teasels and long grasses seen close and low, with one old five-bar wooden field gate at the right. Dark, crisp, almost a silhouette, with a little cold rim light on the seed-heads. EVERYTHING above the plants is genuinely transparent (real alpha channel): there is no sky and no background at all. The plants occupy only the lower 40% of the frame.${WORLD}` },
  { id: 'birds', aspect: 'wide 16:9 landscape', alpha: true, prompt: `A loose scattered flock of about twenty-five jackdaws in flight, startled, wheeling in different directions at different distances and sizes, wings in many different positions, as dark slate-black birds with a little grey at the nape, crisp, isolated on a genuinely transparent background (real alpha channel): no sky, no clouds, nothing but the birds. Spread across the whole frame with clear space between birds.${WORLD}` },

  // ------------------------------------------------------------------ commissions
  { id: 'work-carillon', aspect: 'landscape 3:2', prompt: `A slender modern campanile of board-marked pale concrete on a university campus, its open top storey holding a carillon: rows of bronze bells of graded sizes hung in a steel frame, clearly visible against the sky. Seen from below at an angle, formally composed, at dusk, one warm light on inside the playing cabin beneath the bells.${WORLD}` },
  { id: 'work-ship', aspect: 'landscape 3:2', prompt: `A bronze ship's bell hanging in its bracket on the wet steel foredeck of a polar research vessel in thick sea fog, a red-orange hull rail and a coiled mooring line in the foreground, beads of water on the bell, grey sea dissolving into fog behind. The bell sharp, everything beyond it soft. The bell's waist is plain.${WORLD}` },
  { id: 'work-valley', aspect: 'landscape 3:2', prompt: `A single very large bronze bell hung in a simple open timber pavilion (four heavy oak posts and a shingled roof) on a grassy knoll above a deep, misted upland valley of dry-stone walls and dark conifers, a narrow path leading up to it. Seen from a little distance, the pavilion small in a big quiet landscape, low cloud on the hills.${WORLD}` },
  { id: 'work-lift', aspect: 'landscape 3:2', prompt: `A new bronze church bell, bright and golden, hanging in slings from a crane hook high against the weathered stone wall of a medieval church tower as it is lifted towards the open belfry louvres; far below, small, a handful of villagers and two riggers in hard hats look up from the churchyard among old gravestones and a yew tree. Overcast, still.${WORLD}` },
  { id: 'exterior', aspect: 'wide 16:9 landscape', prompt: `The street front of an old English bell foundry at blue hour: a long, low, soot-darkened red-brick workshop range on a narrow cobbled lane in a northern market town, with a tall square brick chimney, big double timber doors standing half open and spilling warm orange light and a little smoke onto the wet cobbles, small-paned iron windows glowing dimly, one old bronze bell standing on the pavement beside the door. No signs or lettering on the building.${WORLD}` },
]
