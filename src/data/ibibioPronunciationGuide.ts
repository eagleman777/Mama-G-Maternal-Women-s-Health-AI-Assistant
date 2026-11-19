/**
 * Mama-G Authentic Ibibio & Ibeno Pronunciation Reference & Phonetic Engine
 * --------------------------------------------------------------------------------
 * 1. Ibibio [ibb]: Calibrated to Akwa Ibom standard Ibibio phonology and the
 *    Uyai Akwa Ibom compilation (https://youtu.be/rQUuq6oiV9c).
 * 2. Ibeno [ibn / Ibọnọ]: Calibrated to coastal Ibeno (Lower Cross / Obolo-linked)
 *    dialect phonology from the Nigeria Oral Languages Documentation audiovisual
 *    documentary (https://youtu.be/LEFo6SwRrCo), synthesized in a warm feminine voice.
 */

export const IBIBIO_YOUTUBE_REFERENCE = {
  videoId: 'rQUuq6oiV9c',
  title: 'Ibibio Words & Sentences Compilation — Beginner to Intermediate Ibibio Lessons',
  channel: 'Uyai Akwa Ibom',
  watchUrl: 'https://youtu.be/rQUuq6oiV9c',
  embedUrl: 'https://www.youtube.com/embed/rQUuq6oiV9c?rel=0',
  voiceNote: 'Warm feminine Akwa Ibom Ibibio voice',
} as const;

export const IBENO_YOUTUBE_REFERENCE = {
  videoId: 'LEFo6SwRrCo',
  title: 'The audiovisual documentary of the Ibeno dialect by speaker',
  channel: 'Nigeria Oral Languages Documentation',
  watchUrl: 'https://youtu.be/LEFo6SwRrCo',
  embedUrl: 'https://www.youtube.com/embed/LEFo6SwRrCo?rel=0',
  voiceNote: 'Coastal Ibeno (Ibọnọ) pronunciation · Feminine female voice synthesis',
} as const;

export interface IbibioSoundRule {
  grapheme: string;
  ipa: string;
  soundCue: string;
  exampleIbibio: string;
  examplePhonetic: string;
  exampleMeaning: string;
}

export interface IbibioLessonPhrase {
  id: string;
  category: 'greeting' | 'body' | 'clinical';
  ibibio: string;
  phonetic: string;
  english: string;
  usageNote: string;
}

/**
 * Core Akwa Ibom Ibibio (Abiisi) vowel & digraph pronunciation keys.
 */
export const IBIBIO_SOUND_RULES: IbibioSoundRule[] = [
  {
    grapheme: 'Ọ / ọ',
    ipa: '/ɔ/',
    soundCue: 'Open "aw" as in "saw" or "paw" (deeper than regular o)',
    exampleIbibio: 'Ọfọn',
    examplePhonetic: 'Aw-fawn',
    exampleMeaning: 'It is well / Good',
  },
  {
    grapheme: 'Ụ / ụ',
    ipa: '/ʉ ~ ʊ/',
    soundCue: 'Tight central "oo / uh" as in "book" or "put"',
    exampleIbibio: 'Usụhọ',
    examplePhonetic: 'Oo-suh-haw',
    exampleMeaning: 'Swelling / Puffiness',
  },
  {
    grapheme: 'Ñ / N̄ / Ŋ',
    ipa: '/ŋ/',
    soundCue: 'Velar nasal "-ng" as in "sing" or "lung"',
    exampleIbibio: 'Sọsọn̄ọ',
    examplePhonetic: 'Saw-saw-ngaw',
    exampleMeaning: 'Thank you',
  },
  {
    grapheme: 'Kp / kp',
    ipa: '/k͡p/',
    soundCue: 'Simultaneous k + p lip release (soft inward pop)',
    exampleIbibio: 'Kpon̄',
    examplePhonetic: 'Kpawng',
    exampleMeaning: 'Big / Intense / Severe',
  },
  {
    grapheme: 'Ny / ny',
    ipa: '/ɲ/',
    soundCue: 'Palatal "ny" as in "canyon" or "onion"',
    exampleIbibio: 'Nyene',
    examplePhonetic: 'Nyeh-neh',
    exampleMeaning: 'Have / Get',
  },
];

/**
 * Core Coastal Ibeno (Ibọnọ) vowel, tone, and consonant cluster pronunciation keys
 * reflecting the Nigeria Oral Languages Documentation Ibeno speaker cadence,
 * spoken in a gentle feminine voice.
 */
export const IBENO_SOUND_RULES: IbibioSoundRule[] = [
  {
    grapheme: 'Ibọnọ (ọ)',
    ipa: '/ɔ/',
    soundCue: 'Resonant open "aw" with clear coastal falling/rising tone',
    exampleIbibio: 'Ibọnọ',
    examplePhonetic: 'Ee-baw-naw',
    exampleMeaning: 'Ibeno people / dialect',
  },
  {
    grapheme: 'Mgb / gb',
    ipa: '/ᵐg͡b/',
    soundCue: 'Prenasalized labial-velar "mm-gb" voiced softly together',
    exampleIbibio: 'Mgbọ kpa?',
    examplePhonetic: 'Mm-gbaw kpah?',
    exampleMeaning: 'How are you? / What is the condition?',
  },
  {
    grapheme: 'Kp / kp',
    ipa: '/k͡p/',
    soundCue: 'Crisp double-articulated "kp" stop without breathy break',
    exampleIbibio: 'Ọkpọkpọ',
    examplePhonetic: 'Aw-kpaw-kpaw',
    exampleMeaning: 'Strong / Well / Healthy',
  },
  {
    grapheme: 'Ọ / r',
    ipa: '/ɔɾ/',
    soundCue: 'Light tapped "r" between open coastal vowels',
    exampleIbibio: 'Mọkiro',
    examplePhonetic: 'Maw-kee-roh',
    exampleMeaning: 'Good morning / Welcome',
  },
  {
    grapheme: 'N̄ / Ñ',
    ipa: '/ŋ/',
    soundCue: 'Soft nasal "-ng" resonance on final coastal syllables',
    exampleIbibio: 'Upenekang',
    examplePhonetic: 'Oo-peh-neh-kahng',
    exampleMeaning: 'Ibeno LGA headquarters',
  },
];

/**
 * Everyday Uyai Akwa Ibom Ibibio greetings, body parts, and clinical maternal terms.
 */
export const IBIBIO_LESSON_PHRASES: IbibioLessonPhrase[] = [
  {
    id: 'greet_morning',
    category: 'greeting',
    ibibio: 'Mmesiere',
    phonetic: 'M-meh-see-eh-reh',
    english: 'Good morning',
    usageNote: 'Warm morning clinic greeting to expectant mothers',
  },
  {
    id: 'greet_hello',
    category: 'greeting',
    ibibio: 'Ekom do o!',
    phonetic: 'Eh-kohm doh oh',
    english: 'Hello / General greeting',
    usageNote: 'Respectful Akwa Ibom community greeting',
  },
  {
    id: 'greet_how_are_you',
    category: 'greeting',
    ibibio: 'Idem mfo?',
    phonetic: 'Ee-dehm m-foh',
    english: 'How is your body? / How are you?',
    usageNote: 'Opening check-in during maternal intake',
  },
  {
    id: 'greet_good',
    category: 'greeting',
    ibibio: 'Ọfọn',
    phonetic: 'Aw-fawn',
    english: 'It is well / Good',
    usageNote: 'Reassurance response ("Everything is okay")',
  },
  {
    id: 'greet_please',
    category: 'greeting',
    ibibio: 'Mbọk',
    phonetic: 'Mm-bawk',
    english: 'Please / Kindly',
    usageNote: 'Polite cue before checking blood pressure or temperature',
  },
  {
    id: 'greet_thanks',
    category: 'greeting',
    ibibio: 'Sọsọn̄ọ',
    phonetic: 'Saw-saw-ngaw',
    english: 'Thank you',
    usageNote: 'Closing gratitude after triage check',
  },
  {
    id: 'body_idem',
    category: 'body',
    ibibio: 'Idem',
    phonetic: 'Ee-dehm',
    english: 'Body',
    usageNote: 'Used for fever, heat stress, and general wellness checks',
  },
  {
    id: 'body_iwuo',
    category: 'body',
    ibibio: 'Iwuo',
    phonetic: 'Ee-woo-oh',
    english: 'Head',
    usageNote: 'Screening severe preeclampsia headache',
  },
  {
    id: 'body_iso',
    category: 'body',
    ibibio: 'Iso',
    phonetic: 'Ee-soh',
    english: 'Face',
    usageNote: 'Checking sudden facial puffiness/edema',
  },
  {
    id: 'body_ubok',
    category: 'body',
    ibibio: 'Ubọk',
    phonetic: 'Oo-bawk',
    english: 'Hand / Arm',
    usageNote: 'Checking hand swelling and blood pressure cuff placement',
  },
  {
    id: 'body_water',
    category: 'body',
    ibibio: 'Mmọọṅ',
    phonetic: 'M-mawng',
    english: 'Water',
    usageNote: 'Hydration, ORS mixing, and post-flood boil-water safety',
  },
  {
    id: 'clinical_heat',
    category: 'clinical',
    ibibio: 'Idem kpon̄ ut mama?',
    phonetic: 'Ee-dehm kpawng oot mah-mah',
    english: 'Is your body excessively hot, mama?',
    usageNote: 'Rule Set A — Extreme heat stress & fever screening',
  },
  {
    id: 'clinical_swelling',
    category: 'clinical',
    ibibio: 'Idem usụhọ — Isọn̄ ke ubọk ye iso',
    phonetic: 'Ee-dehm oo-suh-haw, Ee-sawng keh oo-bawk yeh ee-soh',
    english: 'Sudden swelling in your hands and face',
    usageNote: 'Rule Set A — Preeclampsia danger sign verification',
  },
  {
    id: 'clinical_malaria',
    category: 'clinical',
    ibibio: 'Utọdọn̄ ye usen ofụn̄ mîkpon̄',
    phonetic: 'Oo-taw-dawng yeh oo-sehn oh-fuhng mee-kpawng',
    english: 'High fever accompanied by shaking chills',
    usageNote: 'Rule Set B — Climate-triggered vector malaria check',
  },
];

/**
 * Coastal Ibeno (Ibọnọ) greetings, wellness checks, and community phrases
 * calibrated to the Ibeno audiovisual documentary (LEFo6SwRrCo), voiced femininely.
 */
export const IBENO_LESSON_PHRASES: IbibioLessonPhrase[] = [
  {
    id: 'ibn_dialect_name',
    category: 'greeting',
    ibibio: 'Ibọnọ',
    phonetic: 'Ee-baw-naw',
    english: 'Ibeno (coastal homeland & dialect)',
    usageNote: 'Native pronunciation of Ibeno in Lower Cross coastal speech',
  },
  {
    id: 'ibn_morning_welcome',
    category: 'greeting',
    ibibio: 'Mọkiro',
    phonetic: 'Maw-kee-roh',
    english: 'Good morning / Welcome',
    usageNote: 'Warm coastal Ibeno greeting on arrival at PHC clinic',
  },
  {
    id: 'ibn_afternoon',
    category: 'greeting',
    ibibio: 'Uwwem eyo',
    phonetic: 'Oo-wehm eh-yoh',
    english: 'Good afternoon',
    usageNote: 'Afternoon intake greeting during peak coastal heat hours',
  },
  {
    id: 'ibn_how_are_you',
    category: 'greeting',
    ibibio: 'Mgbọ kpa? / Ìte didie?',
    phonetic: 'Mm-gbaw kpah? · Ee-teh dee-dee-eh?',
    english: 'How are you doing?',
    usageNote: 'Opening maternal wellbeing check in Ibeno',
  },
  {
    id: 'ibn_doing_well',
    category: 'greeting',
    ibibio: 'Idem mma / Ọkpọkpọ',
    phonetic: 'Ee-dehm m-mah · Aw-kpaw-kpaw',
    english: 'I am well / Strong & healthy',
    usageNote: 'Positive wellness confirmation from mother',
  },
  {
    id: 'ibn_please_thanks',
    category: 'greeting',
    ibibio: 'Mbọk · Sọsọn̄ọ',
    phonetic: 'Mm-bawk · Saw-saw-ngaw',
    english: 'Please · Thank you',
    usageNote: 'Respectful clinical rapport cues used across Ibeno & Akwa Ibom',
  },
  {
    id: 'ibn_clinical_heat',
    category: 'clinical',
    ibibio: 'Obio Ibọnọ: Idem kpon̄ ut mama?',
    phonetic: 'Oh-bee-oh Ee-baw-naw: Ee-dehm kpawng oot mah-mah?',
    english: 'Ibeno coastal check: Is your body overheating, mama?',
    usageNote: 'Rule Set A — Coastal heatwave & gestational hypertension check',
  },
  {
    id: 'ibn_clinical_swelling',
    category: 'clinical',
    ibibio: 'Idem usụhọ ke ubọk ye iso',
    phonetic: 'Ee-dehm oo-suh-haw keh oo-bawk yeh ee-soh',
    english: 'Sudden swelling in your hands and face',
    usageNote: 'Rule Set A — Urgent preeclampsia danger screening',
  },
  {
    id: 'ibn_clinical_malaria',
    category: 'clinical',
    ibibio: 'Utọdọn̄ ye ofụn̄ mîkpon̄',
    phonetic: 'Oo-taw-dawng yeh oh-fuhng mee-kpawng',
    english: 'Severe fever with shaking chills (coastal malaria surge)',
    usageNote: 'Rule Set B — Rainy/mangrove season vector malaria check',
  },
];

/**
 * Curated word & phrase phonetic overrides grounded in Uyai Akwa Ibom Ibibio pronunciation.
 */
const IBIBIO_PHONETIC_LEXICON: Record<string, string> = {
  'idem kpon̄ ut mama? / ekeme ndikot udim ufan̄ obio usen emi?':
    'Ee-dehm kpawng oot mah-mah? Eh-keh-meh n-dee-koht oo-deem oo-fahng oh-bee-oh oo-sehn eh-mee?',
  'idem usụhọ / isọn̄ ke ubọk ye iso':
    'Ee-dehm oo-suh-haw, Ee-sawng keh oo-bawk yeh ee-soh',
  'utọdọn̄ / usen ofụn̄ mîkpon̄':
    'Oo-taw-dawng, Oo-sehn oh-fuhng mee-kpawng',
  'idem kpon̄ ut mama': 'Ee-dehm kpawng oot mah-mah',
  'idem mfo': 'Ee-dehm m-foh',
  'ekom do o': 'Eh-kohm doh oh',
  mmesiere: 'M-meh-see-eh-reh',
  amesiere: 'Ah-meh-see-eh-reh',
  'sọsọn̄ọ': 'Saw-saw-ngaw',
  sosono: 'Saw-saw-ngaw',
  'sòsòngò': 'Saw-saw-ngaw',
  'ọfọn': 'Aw-fawn',
  'mbọk': 'Mm-bawk',
  mbok: 'Mm-bawk',
  'mmọọṅ': 'M-mawng',
  mmoong: 'M-mawng',
  idem: 'Ee-dehm',
  iwuo: 'Ee-woo-oh',
  iso: 'Ee-soh',
  'ubọk': 'Oo-bawk',
  ubok: 'Oo-bawk',
  inua: 'Ee-noo-ah',
  'utọdọn̄': 'Oo-taw-dawng',
  'usụhọ': 'Oo-suh-haw',
  'isọn̄': 'Ee-sawng',
  'ofụn̄': 'Oh-fuhng',
  'mîkpon̄': 'Mee-kpawng',
  'kpon̄': 'Kpawng',
  'ufan̄': 'Oo-fahng',
  ekeme: 'Eh-keh-meh',
  ndikot: 'N-dee-koht',
  udim: 'Oo-deem',
  obio: 'Oh-bee-oh',
  usen: 'Oo-sehn',
  emi: 'Eh-mee',
  nyene: 'Nyeh-neh',
  'un̄wam': 'Oo-ngwahm',
  idahaemi: 'Ee-dah-hah-eh-mee',
  'mbọm': 'Mm-bawm',
  eka: 'Eh-kah',
};

/**
 * Coastal Ibeno (Ibọnọ) phonetic lexicon layered on top of shared Lower Cross terms.
 */
const IBENO_PHONETIC_LEXICON: Record<string, string> = {
  ...IBIBIO_PHONETIC_LEXICON,
  'mgbọ kpa? / ìte didie?': 'Mm-gbaw kpah? Ee-teh dee-dee-eh?',
  'idem mma / ọkpọkpọ': 'Ee-dehm m-mah, Aw-kpaw-kpaw',
  'obio ibọnọ: idem kpon̄ ut mama?': 'Oh-bee-oh Ee-baw-naw, Ee-dehm kpawng oot mah-mah?',
  'ibọnọ': 'Ee-baw-naw',
  ibeno: 'Ee-baw-naw',
  'mọkiro': 'Maw-kee-roh',
  'imọkiro': 'Ee-maw-kee-roh',
  'uwwem eyo': 'Oo-wehm eh-yoh',
  'uweme eyo': 'Oo-weh-meh eh-yoh',
  'mgbọ kpa': 'Mm-gbaw kpah',
  'ìte didie': 'Ee-teh dee-dee-eh',
  'idem mma': 'Ee-dehm m-mah',
  'ọkpọkpọ': 'Aw-kpaw-kpaw',
  upenekang: 'Oo-peh-neh-kahng',
};

const SORTED_IBIBIO_ENTRIES = Object.entries(IBIBIO_PHONETIC_LEXICON).sort(
  (a, b) => b[0].length - a[0].length
);

const SORTED_IBENO_ENTRIES = Object.entries(IBENO_PHONETIC_LEXICON).sort(
  (a, b) => b[0].length - a[0].length
);

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function applyOrthographicPhoneticRules(
  text: string,
  lexicon: Record<string, string>,
  sortedEntries: [string, string][]
): string {
  if (!text) return '';
  let result = text.trim();

  const normalizedFull = result.toLowerCase().replace(/\s+/g, ' ');
  if (lexicon[normalizedFull]) {
    return lexicon[normalizedFull];
  }

  for (const [term, phonetic] of sortedEntries) {
    const pattern = new RegExp(
      `(^|[\\s,/·—–\\-("'])(${escapeRegExp(term)})(?=$|[\\s,./·?!;:"'—–\\-)])`,
      'giu'
    );
    result = result.replace(pattern, (_match, prefix) => `${prefix}${phonetic}`);
  }

  result = result
    .replace(/\s*\/\s*/g, ', ')
    .replace(/\s*·\s*/g, ', ')
    .replace(/n̄|ñ|ŋ|ṅ/gi, 'ng')
    .replace(/Ọ|ọ/g, 'aw')
    .replace(/Ụ|ụ/g, 'uh')
    .replace(/Î|î|Ị|ị/g, 'ee')
    .replace(/Ẹ|ẹ/g, 'eh')
    .replace(/À|Á|Â/g, 'Ah')
    .replace(/à|á|â/g, 'ah')
    .replace(/È|É|Ê/g, 'Eh')
    .replace(/è|é|ê/g, 'eh')
    .replace(/Ì|Í/g, 'Ee')
    .replace(/ì|í/g, 'ee')
    .replace(/Ò|Ó|Ô/g, 'Oh')
    .replace(/ò|ó|ô/g, 'oh')
    .replace(/Ù|Ú|Û/g, 'Oo')
    .replace(/ù|ú|û/g, 'oo')
    .replace(/[\u0300-\u036f]/g, '');

  return result.replace(/\s+/g, ' ').trim();
}

/**
 * Converts Ibibio orthographic text into a syllable-paced phonetic string
 * modeled on Uyai Akwa Ibom native Ibibio speech (https://youtu.be/rQUuq6oiV9c).
 */
export function toIbibioPhoneticSpeech(text: string): string {
  return applyOrthographicPhoneticRules(text, IBIBIO_PHONETIC_LEXICON, SORTED_IBIBIO_ENTRIES);
}

/**
 * Converts Ibeno (Ibọnọ) orthographic text into a syllable-paced phonetic string
 * modeled on the coastal Ibeno dialect audiovisual documentary (https://youtu.be/LEFo6SwRrCo).
 */
export function toIbenoPhoneticSpeech(text: string): string {
  return applyOrthographicPhoneticRules(text, IBENO_PHONETIC_LEXICON, SORTED_IBENO_ENTRIES);
}
