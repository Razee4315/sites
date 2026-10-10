// Every image on the site, as a prompt. One Codex session per entry.

const STUDIO =
  'Style: photorealistic high-end fragrance-campaign still life, 100mm macro lens, crisp focus across the whole subject, ' +
  'soft diffused daylight from the upper left with a gentle fill, true-to-life natural colour, fine surface detail ' +
  '(pores, veins, fibres, droplets). Not illustrated, not 3D-rendered, not glossy plastic.'

const FLOAT =
  'Composition: the subject alone, levitating in mid-air at a slight dynamic tilt, entirely inside the frame with a clear ' +
  'empty margin on all sides. Background: genuinely transparent (real alpha channel): no backdrop, no surface, no cast ' +
  'shadow, no reflection. Constraints: no text, no logo, no watermark, no hands, no other props.'

const note = (id, subject, aspect = 'square 1:1') => ({
  id,
  aspect,
  alpha: true,
  prompt: `Use case: product-mockup\nAsset type: transparent ingredient cutout for a fragrance website\nSubject: ${subject}\n${STUDIO}\n${FLOAT}`,
})

const FILM =
  'Style: a real photograph on medium-format film, 80mm lens, natural light only, restrained editorial colour grade with ' +
  'soft contrast and fine grain, quiet and still, generous negative space. Constraints: no people, no animals, no text, ' +
  'no signage, no watermark.'

const light = (id, scene) => ({
  id,
  aspect: 'vertical portrait 2:3',
  prompt: `Use case: photorealistic-natural\nAsset type: editorial photograph for a fragrance website\nScene: ${scene}\n${FILM}`,
})

const photo = (id, aspect, scene) => ({
  id,
  aspect,
  prompt: `Use case: photorealistic-natural\nAsset type: editorial photograph for a fragrance website\nScene: ${scene}\n${FILM}`,
})

const BOTTLE_KEEP =
  'Edit the previous image. Change ONLY the colour of the perfume liquid inside the bottle. Keep the bottle shape, size, ' +
  'position, glass, highlights, brass collar, travertine cap, framing and the transparent background exactly identical, ' +
  'so the images line up perfectly when stacked. New liquid colour: '

export const assets = [
  // ── the bottle, five times: same glass, five liquids (edit chain keeps them registered) ──
  {
    id: 'bottle',
    steps: [
      {
        aspect: 'vertical portrait 2:3, transparent background',
        prompt:
          'Use case: product-mockup\nAsset type: transparent product cutout for a fragrance website\n' +
          'Subject: a niche perfume bottle shaped like the gnomon of a sundial: a tall, perfectly cylindrical bottle of ' +
          'thick flawless clear glass with a heavy solid glass base and straight vertical sides, three-quarters filled ' +
          'with a very pale rose-champagne perfume liquid. On top sits a thin brushed-brass collar and a tall cylindrical ' +
          'cap carved from honed pale travertine stone, the same diameter as the bottle. No label, no text, no engraving, ' +
          'no logo anywhere.\n' +
          'Composition: straight-on front elevation, camera exactly level with the middle of the bottle so the base and ' +
          'the liquid line are perfectly horizontal; bottle perfectly upright and centred, filling about 80% of the frame ' +
          'height with a clear margin on all sides.\n' +
          'Lighting: soft studio daylight from the upper left, one long clean highlight down the left edge of the glass, ' +
          'soft refraction in the liquid.\n' +
          'Background: genuinely transparent (real alpha channel): no backdrop, no surface, no cast shadow, no reflection.\n' +
          'Style: photorealistic luxury fragrance campaign photograph.',
      },
      { aspect: 'identical', prompt: BOTTLE_KEEP + 'a fresh, pale green-gold, like young olive oil diluted with light.' },
      { aspect: 'identical', prompt: BOTTLE_KEEP + 'almost water-clear with the faintest pale straw-lemon tint.' },
      { aspect: 'identical', prompt: BOTTLE_KEEP + 'a deep glowing amber-orange, like late sun through honey.' },
      { aspect: 'identical', prompt: BOTTLE_KEEP + 'a very dark, smoky ink-plum, almost black, with a faint deep violet glow where light passes through the edges.' },
    ],
  },

  // ── LAUDS · 05:40 ──
  note('lauds-bergamot', 'one bergamot fruit cut in half, showing the pale green-yellow flesh and thick dimpled rind, a few tiny juice droplets.'),
  note('lauds-figleaf', 'a single fresh green fig leaf with deep lobes and pale veins, beaded with morning dew.'),
  note('lauds-tea', 'a small sprig of white tea: three tender camellia leaves and one downy silver bud.'),
  note('lauds-stone', 'a smooth, cool grey river pebble, wet, covered in fine water droplets.'),

  // ── TERCE · 09:10 ──
  note('terce-blossom', 'a sprig of orange blossom: waxy white five-petalled flowers with yellow stamens, two closed buds and glossy dark leaves.'),
  note('terce-mandarin', 'one small unripe green mandarin with a short stem and a single leaf, the skin mottled green and yellow.'),
  note('terce-mint', 'a fresh sprig of spearmint with crisp serrated leaves.'),
  note('terce-peel', 'one long spiralling curl of green mandarin peel, zest side out, with fine oil pores.'),

  // ── SEXT · 12:00 ──
  note('sext-lemon', 'a thick wedge of Amalfi lemon with coarse bright rind, glistening pulp and one seed.'),
  note('sext-salt', 'a loose cluster of large hollow pyramid sea-salt flakes, translucent white, sparkling.'),
  note('sext-immortelle', 'a small sprig of immortelle (helichrysum) with tight clusters of dry mustard-yellow flowers and silvery stems.'),
  note('sext-driftwood', 'a small piece of sun-bleached driftwood, silver-grey, smooth and salt-worn with fine grain.'),

  // ── VESPERS · 18:50 ──
  note('vespers-apricot', 'half a ripe apricot with its stone still in place, velvety blushed orange skin, moist flesh.'),
  note('vespers-saffron', 'a small loose pinch of deep red saffron threads with orange tips, a few threads drifting apart.'),
  note('vespers-honeycomb', 'a broken chunk of golden honeycomb, cells filled with honey, one slow drip forming at the lower edge.'),
  note('vespers-tobacco', 'a single cured golden-brown tobacco leaf, supple and slightly curled, with a strong central rib.', 'vertical portrait 2:3'),

  // ── COMPLINE · 23:40 ──
  note('compline-iris', 'one bearded iris flower in deep violet-black with velvety falls and a thin gold beard, on a short green stem.', 'vertical portrait 2:3'),
  note('compline-incense', 'three tears of frankincense resin, translucent pale amber-white and frosted, of different sizes, close together.'),
  note('compline-vanilla', 'two cured vanilla pods crossed over each other, glossy dark brown, wrinkled and oily, one slightly split.'),
  note('compline-oud', 'a chip of agarwood (oud): dark, dense, resin-streaked wood with black and deep-brown veining and rough edges.'),

  // ── the light of each hour ──
  light(
    'light-lauds',
    'first light, a few minutes before sunrise, over a terraced stone orchard of fig trees on a hillside, low mist ' +
      'lying in the terraces, dew on dry-stone walls, sky a cold pale blue with one band of blush pink at the horizon. ' +
      'Palette: cold grey-blue, blush, wet stone.',
  ),
  light(
    'light-terce',
    'mid-morning sun filtering through the leaves of an orange grove in blossom, dappled light on a whitewashed ' +
      'garden wall, white flowers and glossy leaves in the foreground slightly out of focus. Palette: fresh leaf green, ' +
      'cream white, pale yellow light.',
  ),
  light(
    'light-sext',
    'high noon on a Mediterranean island: a blinding white lime-washed wall and worn stone steps, one hard black ' +
      'shadow of a fig branch falling almost straight down the wall, a sliver of flat pale sea beyond. Palette: bleached ' +
      'white, bone, hard black shadow, a trace of lemon.',
  ),
  light(
    'light-vespers',
    'golden hour over a field of cut hay with round bales, the sun very low and directly behind tall dry grasses in ' +
      'the foreground, long amber shadows, warm haze and floating seeds lit like sparks. Palette: amber, apricot, ' +
      'terracotta, deep brown shadow.',
  ),
  light(
    'light-compline',
    'deep night in an old stone cloister: a vaulted arcade receding into darkness, one beeswax candle burning on a ' +
      'stone ledge in the foreground, cold blue moonlight falling through the arches onto worn flagstones. Palette: ink ' +
      'blue-black, cold moonlight, one small warm flame.',
  ),

  // ── atelier + discovery set ──
  photo(
    'atelier-organ',
    'landscape 3:2',
    "a perfumer's organ in a quiet workshop: curved tiers of small unlabelled amber and clear glass bottles on pale " +
      'oak shelves, a brass balance scale and glass pipettes on a stone worktop, a shaft of afternoon sun raking across ' +
      'the bottles and throwing long shadows. No readable labels anywhere.',
  ),
  photo(
    'atelier-blotters',
    'landscape 3:2',
    'a fan of blank white paper scent blotters held in a small brass clip, standing on a pale travertine desk next to ' +
      'a tiny glass beaker of amber liquid, hard low sunlight throwing the long crisp shadows of the blotters across the ' +
      'stone like the lines of a sundial. Blotters completely blank, no writing.',
  ),
  photo(
    'discovery-set',
    'wide landscape 16:9',
    'five small identical cylindrical clear glass vials with travertine stoppers standing in a straight evenly spaced ' +
      'row on a pale smooth plaster surface, against a plain pale plaster wall. From left to right their liquids are: ' +
      'very pale rose, pale green-gold, almost clear straw, deep amber, dark ink-plum. Low sun from the right throws five ' +
      'long, perfectly parallel shadows to the left, each shadow carrying a soft pool of its liquid colour. Front-on ' +
      'view, lots of empty wall above the vials. No labels, no text.',
  ),
]
