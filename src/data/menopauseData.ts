export type MenopauseStage = 'perimenopause' | 'menopause' | 'postmenopause';

export interface MenopauseFoodAlly {
  name: string;
  localNames: string;
  targetSymptom: string;
  nutrientPower: string;
  howToPrepare: string;
  affordability: 'Very Cheap' | 'Moderate';
}

export interface MenopauseTreatment {
  name: string;
  category: 'Hormonal Therapy (HRT)' | 'Local Vaginal Therapy' | 'Non-Hormonal Prescription' | 'Nutritional Supplement' | 'Natural Lifestyle';
  indications: string;
  mechanism: string;
  benefits: string;
  contraindicationsAndCautions: string;
}

export interface MenopauseStageGuide {
  stage: MenopauseStage;
  title: string;
  stageSubtitle: string;
  ageRange: string;
  biologicalReality: string;
  primarySymptoms: string[];
  physicalAndEmotionalEffects: string[];
  whatToEat: {
    category: string;
    foods: string;
    whyItWorks: string;
  }[];
  whatToAvoid: string[];
  dailyLifestyleHabits: string[];
  medicalTreatments: MenopauseTreatment[];
  criticalRedFlags: string[];
}

export const MENOPAUSE_STAGE_GUIDES: Record<MenopauseStage, MenopauseStageGuide> = {
  perimenopause: {
    stage: 'perimenopause',
    title: 'Perimenopause (Early Menopause Transition)',
    stageSubtitle: 'The Natural Hormonal Winding-Down & Transition Phase',
    ageRange: 'Typically ages 40 – 49 (can start in late 30s)',
    biologicalReality:
      'The ovaries gradually reduce follicle count and egg releases. Estrogen and progesterone do not drop smoothly; instead, they fluctuate wildly like waves on the sea—surging high one week and plunging the next. This causes cycle irregularity and unpredictable symptoms.',
    primarySymptoms: [
      'Irregular menstrual cycles (periods coming too close together, skipping months, or heavy flooding with clots)',
      'Sudden vasomotor hot flushes (sudden burning warmth in chest, neck, and face lasting 2–5 minutes)',
      'Night sweats (waking up drenched in sweat, requiring changing nightclothes or bedsheets)',
      'Unexplained mood volatility, sudden crying spells, short temper, and heightened irritability',
      'Brain fog, word-finding difficulty, and short-term memory lapses',
      'Sleep disruption and waking up at 3:00 AM with racing heart/palpitations',
      'Early vaginal dryness, itching, or pain during marital intimacy',
      'Breast swelling, tenderness, and fluid retention before delayed cycles',
    ],
    physicalAndEmotionalEffects: [
      'Emotional exhaustion from unpredictable hormonal swings and fear of "losing youth"',
      'Fatigue despite resting, due to fragmented sleep architecture from night sweats',
      'Social embarrassment when sudden intense hot flushes happen in meetings or church gatherings',
      'Confusion over whether one can still get pregnant (YES, pregnancy is still biologically possible until 12 full months without a period!)',
    ],
    whatToEat: [
      {
        category: 'Natural Phytoestrogens (Plant Estrogens)',
        foods: 'Boiled soybeans, fresh soy curd (Awara / Beske / Tofu), ground flaxseed/linseed, roasted sesame (Beni seeds), cowpeas.',
        whyItWorks:
          'Plant isoflavones weakly bind to human estrogen receptors (SERM-like action), smoothing out the dramatic drops in estrogen to reduce the frequency and intensity of hot flushes by up to 50%.',
      },
      {
        category: 'Nervous System & Mood Stabilizers',
        foods: 'Boiled sweet potatoes, plantain, whole millet/sorghum porridge, pumpkin seeds (rich in magnesium and zinc), ripe bananas.',
        whyItWorks:
          'Magnesium relaxes vascular smooth muscle, easing heart palpitations and tension, while vitamin B6 and complex carbohydrates boost brain serotonin to stabilize mood swings.',
      },
      {
        category: 'Clean Hydration & Electrolytes',
        foods: 'Clean boiled water (2.5 to 3 liters daily), fresh baobab fruit pulp juice, coconut water.',
        whyItWorks:
          'Counters fluid loss from heavy night sweats, lubricates mucosal tissues, and reduces the frequency of stress-induced hot flushes.',
      },
    ],
    whatToAvoid: [
      'Fiery hot scotch bonnet peppers / hot chillies (capsaicin directly stimulates hypothalamus heat-sensing neurons, triggering instant severe hot flushes)',
      'High-caffeine strong coffee or energy drinks (exacerbates palpitations, daytime anxiety, and night awakenings)',
      'Excess alcohol and tobacco smoke (accelerates ovarian failure and worsens vasomotor instability)',
      'Very salty processed food (worsens water retention, breast tenderness, and bloating)',
    ],
    dailyLifestyleHabits: [
      'The "Onion Layer" dressing technique: Wear lightweight, breathable 100% cotton clothing that can be peeled off immediately when a flush hits.',
      'Keep a hand-held bamboo/cloth fan or cooling hand towel and a bottle of cold water beside your bed at night.',
      'Fertility caution: Continue using safe family planning/contraception until you have had zero periods for 12 continuous months.',
      'Engage in 30 minutes of daily brisk walking or village gardening to regulate cortisol and stabilize adrenaline.',
    ],
    medicalTreatments: [
      {
        name: 'Low-Dose Combined Oral Contraceptive or Progestin IUD',
        category: 'Hormonal Therapy (HRT)',
        indications: 'For perimenopausal women suffering from erratic, flooding periods and heavy menstrual bleeding.',
        mechanism: 'Provides steady hormonal baseline, suppresses heavy irregular endometrial proliferation, and provides reliable contraception.',
        benefits: 'Transforms unpredictable bleeding into controlled, light bleeds; stops hormonal roller-coaster; prevents unwanted late-in-life pregnancy.',
        contraindicationsAndCautions: 'Contraindicated in women over 35 who smoke, or those with uncontrolled hypertension, migraine with aura, or history of deep vein thrombosis (DVT).',
      },
      {
        name: 'Sequential Combined Hormone Replacement Therapy (HRT)',
        category: 'Hormonal Therapy (HRT)',
        indications: 'Severe hot flushes, night sweats, and debilitating mood disruption when the woman still has menstrual periods.',
        mechanism: 'Provides daily estrogen (transdermal patch or oral) with sequential oral progesterone for 12–14 days per month to shed the uterine lining safely.',
        benefits: 'Rapid resolution of vasomotor symptoms; protects bone mineral density from early accelerated loss.',
        contraindicationsAndCautions: 'Requires mammogram screening, blood pressure monitoring, and pelvic evaluation before initiation.',
      },
      {
        name: 'Low-Dose SSRI/SNRI (e.g. Paroxetine 7.5mg, Escitalopram 10mg, or Venlafaxine 37.5mg)',
        category: 'Non-Hormonal Prescription',
        indications: 'Moderate-to-severe hot flushes and anxiety in women who cannot or choose not to take hormonal HRT.',
        mechanism: 'Modulates hypothalamic serotonin-norepinephrine pathways that control the core body temperature setpoint.',
        benefits: 'Reduces hot flush frequency by 40–60% without hormonal risks; relieves concurrent anxiety and irritability.',
        contraindicationsAndCautions: 'May cause mild transient nausea in the first week. Should not be discontinued abruptly.',
      },
    ],
    criticalRedFlags: [
      'Unusually heavy flooding soaking more than two large sanitary pads per hour for more than 2 consecutive hours.',
      'Passing blood clots larger than a chicken egg, or bleeding lasting continuously for more than 14 days.',
      'Severe dizziness, fainting, extreme paleness of inner eyelids (conjunctiva), or severe breathlessness (indicating acute severe anemia from uterine hemorrhage).',
    ],
  },

  menopause: {
    stage: 'menopause',
    title: 'Menopause (The Natural Milestone)',
    stageSubtitle: '12 Consecutive Months Without a Period',
    ageRange: 'Median age 51 (Normal range: 45 – 55 years)',
    biologicalReality:
      'Menopause is formally diagnosed retrospectively when a woman has completed exactly 12 continuous months without any menstrual bleeding. The ovaries have exhausted their active follicular reserve and cease releasing eggs. Circulating estradiol (estrogen) drops to low, stable baseline levels.',
    primarySymptoms: [
      'Complete cessation of menses (no period for 12 consecutive months)',
      'Vasomotor hot flushes and daytime sudden sweats (often peaking in frequency around this milestone)',
      'Genitourinary Syndrome of Menopause (GSM): thinning of vaginal wall epithelium, reduced natural lubrication, itching, and burning',
      'Dyspareunia (pain or discomfort during marital intercourse due to vaginal dryness and loss of elasticity)',
      'Urinary urgency, frequency, and occasional stress incontinence when coughing or laughing',
      'Metabolic deceleration: weight redistribution towards the abdomen (visceral fat accumulation)',
      'Generalized joint stiffness, morning finger aches, and muscle soreness',
      'Dryness of the skin, thinning of scalp hair, and emergence of coarse chin hairs due to shifting estrogen/androgen ratio',
    ],
    physicalAndEmotionalEffects: [
      'Sense of freedom from monthly period cramps, sanitary pad expenses, and pregnancy anxiety',
      'Emotional vulnerability regarding physical body changes and marital intimacy shifts',
      'Need for open, supportive communication with marital partners about physiological dryness and the need for lubricants',
      'Cultural elevation: in many African traditions, menopausal women become venerated elders, advisors, and village matriarchs',
    ],
    whatToEat: [
      {
        category: 'Bone Mineral Fortress (Calcium & Vitamin D)',
        foods: 'Whole small dried fish with soft edible bones (Dagaa / Omena / Crayfish / Kapenta), Baobab fruit pulp, Moringa leaves, sesame seeds, fortified curd.',
        whyItWorks:
          'Estrogen loss removes the natural brake on bone resorption. Small fish eaten with bones provide bioavailable calcium and phosphorus, while baobab delivers vitamin C necessary for the bone collagen matrix.',
      },
      {
        category: 'Plant Phytoestrogens & Heart Protectors',
        foods: 'Soybeans (Awara/Moi-moi with soy), roasted groundnuts, cowpeas, avocado, sweet potatoes, garlic.',
        whyItWorks:
          'Protects the vascular lining as estrogen declines, maintains healthy blood pressure, and relieves lingering hot flushes.',
      },
      {
        category: 'Digestive & Anti-Inflammatory Roots',
        foods: 'Fresh ginger root tea, scent leaf infusion, African nutmeg, whole oats, brown millet porridge.',
        whyItWorks:
          'Calms joint stiffness, reduces intestinal bloating, and provides slow-burning carbohydrates to prevent menopausal weight spikes.',
      },
    ],
    whatToAvoid: [
      'Very hot peppery broths and heavy fiery stews late at night',
      'Refined white sugar and sugary sodas (promotes visceral belly fat and rapid insulin spikes)',
      'Excess cooking salt (accelerates urinary calcium excretion, worsening bone loss)',
      'Commercial douching concoctions or harsh chemical soaps inside the vagina (destroys protective vaginal lactobacilli, causing severe bacterial vaginitis and burning)',
    ],
    dailyLifestyleHabits: [
      'Pelvic Floor (Kegel) Exercises: Squeeze the muscles used to stop urination for 5 seconds, release for 5 seconds, 15 times, 3 times daily. Stops bladder leakage and pelvic organ prolapse.',
      'Weight-bearing daily movement: Walking briskly for 30 minutes, carrying moderate household goods, or climbing stairs sends piezoelectric signals to bones to rebuild density.',
      'Natural intimate care: Use plain, unscented, pure water externally. Apply cold-pressed coconut oil or water-based lubricant before intimacy to prevent painful friction tears.',
      'Drink 8 to 10 glasses of clean water daily to keep bladder flushed and prevent urinary tract infections.',
    ],
    medicalTreatments: [
      {
        name: 'Continuous Combined Hormone Replacement Therapy (HRT)',
        category: 'Hormonal Therapy (HRT)',
        indications: 'Moderate-to-severe vasomotor flushes, mood changes, and bone protection in women who have reached menopause and have an intact uterus.',
        mechanism: 'Continuous daily low-dose estrogen (transdermal patch or oral) combined with continuous daily micronized progesterone (to prevent uterine endometrial cancer).',
        benefits: 'Complete elimination of hot flushes, stabilizes mood, prevents menopausal bone loss, improves sleep quality.',
        contraindicationsAndCautions: 'Contraindicated in personal history of breast cancer, active coronary heart disease, past stroke or DVT, or unexplained vaginal bleeding.',
      },
      {
        name: 'Local Vaginal Estrogen Cream / Pessary / Ring (e.g., Estradiol 10mcg or Estriol 0.1%)',
        category: 'Local Vaginal Therapy',
        indications: 'Vaginal dryness, burning, painful intercourse (dyspareunia), recurrent UTIs, and urinary urgency.',
        mechanism: 'Acts directly on estrogen receptors in the vaginal epithelium, restoring glycogen, lactobacilli, acidity, and blood flow with negligible systemic absorption.',
        benefits: 'Completely restores pain-free, comfortable marital intimacy; eliminates chronic vaginal itching; stops recurrent UTIs without systemic risks. Extremely safe!',
        contraindicationsAndCautions: 'Does not require adding oral progesterone because systemic absorption is minimal. Very safe even for many women who cannot take oral HRT.',
      },
      {
        name: 'Calcium Carbonate / Citrate (1,000–1,200 mg/day) + Vitamin D3 (800–1,000 IU/day)',
        category: 'Nutritional Supplement',
        indications: 'Universal preventative support for all menopausal women to arrest rapid skeletal bone density loss.',
        mechanism: 'Provides essential elemental building blocks for the osteoblast bone matrix.',
        benefits: 'Slows down osteoporosis, preserves spinal height, and reduces fracture risk.',
        contraindicationsAndCautions: 'Take calcium with food for optimal absorption. Avoid taking more than 500mg in a single dose.',
      },
    ],
    criticalRedFlags: [
      '🚨 ANY VAGINAL BLEEDING AFTER MENOPAUSE IS AN EMERGENCY: If you have had no period for 12 months, and then experience ANY bleeding—even a single drop of brown spotting or pink discharge—YOU MUST REPORT TO A HOSPITAL IMMEDIATELY. Postmenopausal bleeding must always be investigated with ultrasound and endometrial biopsy to rule out uterine/endometrial cancer!',
      'Sudden severe chest pressure, radiating arm pain, or breathlessness (women’s heart attacks present differently and increase sharply after menopause).',
      'Sudden severe back pain after minor movement (may indicate a silent osteoporotic vertebral compression fracture).',
    ],
  },

  postmenopause: {
    stage: 'postmenopause',
    title: 'Postmenopause (The Golden Years of Health & Protection)',
    stageSubtitle: 'Lifelong Wellness, Bone Fortress & Cardiovascular Longevity',
    ageRange: 'All years following menopause milestone (typically age 52+)',
    biologicalReality:
      'The woman remains in postmenopause for the remainder of her life. Estrogen and progesterone remain at steady low baseline levels. While hot flushes eventually subside in most women over 2–7 years, the long-term silent consequences of estrogen deficiency (cardiovascular changes, accelerated bone thinning, and urogenital atrophy) require proactive care.',
    primarySymptoms: [
      'Gradual subsiding of hot flushes over time, though night sweats can occasionally persist',
      'Persistent Genitourinary Syndrome of Menopause (GSM) if untreated: progressive vaginal atrophy and tissue fragility',
      'Loss of height, slight stooping posture (dowager’s hump), or back stiffness due to silent bone thinning',
      'Joint aches, especially in knees, hips, and hands (osteoarthritis progression)',
      'Mild changes in skin elasticity, slow wound healing, and dry eyes or dry mouth',
      'Higher resting blood pressure, elevation in LDL "bad" cholesterol, and increased insulin resistance',
      'Urinary frequency, urgency, or bladder leakage when lifting heavy loads',
    ],
    physicalAndEmotionalEffects: [
      'A deeply empowered life chapter: grandmotherhood, matriarchal mentorship, and religious/community leadership',
      'Freedom from reproductive burdens, allowing focus on personal projects, wisdom transmission, and health preservation',
      'Need to actively protect bones to avoid debilitating hip fractures that threaten independence in elder years',
    ],
    whatToEat: [
      {
        category: 'Cardiovascular Shields & Vessel Protectors',
        foods: 'Fluted pumpkin leaves (Ugu), bitter leaf soup (properly washed), garlic, raw onions, avocados, ginger, garden eggs (African eggplant).',
        whyItWorks:
          'Rich in polyphenols, potassium, and plant sterols that keep blood vessels flexible, lower blood pressure, and protect against heart disease and stroke.',
      },
      {
        category: 'High-Density Calcium & Collagen Builders',
        foods: 'Dagaa / Omena / Crayfish / Dried small fish, Baobab fruit pulp, Moringa leaf soup, sesame seeds, chicken bone broth.',
        whyItWorks:
          'Protects bones from osteopenia and osteoporosis; provides amino acids (glycine, proline) for joint cartilage and skin resilience.',
      },
      {
        category: 'Gut Health & Brain Sharpeners',
        foods: 'Fermented milks (Waza / Nunu / Yoghurt), cowpea moi-moi, tiger nuts (Ofio/Aya), walnuts, sweet potato.',
        whyItWorks:
          'Supplies beneficial probiotics to protect the aging gut microbiome, enhances nutrient absorption, and boosts cognitive clarity.',
      },
    ],
    whatToAvoid: [
      'High trans-fats and repeatedly reheated fried palm oil (greatly accelerates postmenopausal cardiovascular plaque buildup)',
      'High-sodium dried bouillon cubes (causes sharp blood pressure spikes in postmenopausal arterial walls)',
      'Sedentary lifestyle and prolonged bed rest (causes bone mass to leach out into urine rapidly)',
      'Ignoring any vaginal bleeding or discharge (mistaking postmenopausal bleeding for "periods returning")',
    ],
    dailyLifestyleHabits: [
      'Daily 30-minute weight-bearing movement: Daily walking, village market walks, carrying moderate loads, and balance practice (standing on one leg for 15 seconds) to prevent falls.',
      'Annual Health Checkup: Blood pressure check, fasting blood sugar, lipid panel, breast examination / mammogram, and cervical screening if recommended.',
      'Maintain continuous local vaginal estrogen therapy or natural moisturizing to prevent severe vaginal stenosis and recurrent painful UTIs.',
      'Hydration routine: Drink 2 glasses of water upon waking to prevent blood sludging and support morning kidney filtration.',
    ],
    medicalTreatments: [
      {
        name: 'Local Vaginal Estrogen (Lifelong Maintenance)',
        category: 'Local Vaginal Therapy',
        indications: 'Chronic vaginal dryness, pain with intimacy, recurrent bacterial infections, and urinary frequency.',
        mechanism: 'Maintains thick, healthy vaginal mucosa and acidic pH without systemic risks.',
        benefits: 'Can be used safely for years without increasing risk of breast cancer or heart disease. Restores dignity and comfort.',
        contraindicationsAndCautions: 'Requires only a tiny pea-sized amount applied 2 nights per week for maintenance.',
      },
      {
        name: 'Bisphosphonates (e.g. Alendronate 70mg weekly) or SERMs (Raloxifene)',
        category: 'Non-Hormonal Prescription',
        indications: 'Diagnosed osteoporosis (T-score < -2.5) or postmenopausal women with fragility fractures.',
        mechanism: 'Directly inhibits osteoclast bone resorption, allowing osteoblasts to rebuild and strengthen bone mineral density.',
        benefits: 'Reduces the catastrophic risk of hip fractures by up to 50% and vertebral fractures by up to 70%.',
        contraindicationsAndCautions: 'Must be swallowed with a full glass of plain water upon waking, remaining upright (sitting or standing) for at least 30 minutes to prevent esophageal irritation.',
      },
      {
        name: 'Systemic HRT for Women within 10 Years of Menopause (<60 years old)',
        category: 'Hormonal Therapy (HRT)',
        indications: 'For prevention of severe osteoporosis and relief of ongoing vasomotor symptoms in recent postmenopausal women.',
        mechanism: 'Restores physiological circulating hormone levels within the "Window of Opportunity".',
        benefits: 'Significantly reduces cardiovascular mortality and bone fractures when initiated early.',
        contraindicationsAndCautions: 'Not recommended to start systemic HRT for the first time in women older than 60 or more than 10 years past menopause due to elevated cardiovascular risks.',
      },
    ],
    criticalRedFlags: [
      '🚨 POSTMENOPAUSAL BLEEDING: ANY bleeding, spotting, or brownish discharge after 12 months without a period is an urgent clinical red flag. Do NOT ignore it. It requires urgent referral for endometrial evaluation.',
      'Sudden loss of height (>3 cm) or sudden acute severe mid-back pain following a minor cough or bend (indicates osteoporotic spinal fracture).',
      'A breast lump, skin dimpling, nipple inversion, or bloody nipple discharge (postmenopausal women have the highest incidence of breast cancer; perform monthly self-checks).',
      'Pelvic heaviness or feeling something bulging/falling out of the vagina (indicates uterine or bladder prolapse; requires pelvic floor evaluation).',
    ],
  },
};

export const MENOPAUSE_LOCAL_FOOD_ALLIES: MenopauseFoodAlly[] = [
  {
    name: 'Soybeans & Soy Curd (Awara / Beske / Tofu)',
    localNames: 'Awara (Hausa), Beske (Yoruba), Soya beans (Pidgin/English)',
    targetSymptom: 'Hot Flushes, Night Sweats & Estrogen Decline',
    nutrientPower: 'Rich in natural isoflavones (genistein & daidzein) and complete plant protein.',
    howToPrepare: 'Boil beans for soup, or eat steamed soy cake (Awara/Beske) with light vegetable stew. Avoid frying in burnt oil.',
    affordability: 'Very Cheap',
  },
  {
    name: 'Small Whole Fish with Bones (Dagaa / Omena / Crayfish)',
    localNames: 'Dagaa / Omena (Swahili/East Africa), Crayfish (Pidgin/Nigeria), Kapenta (Zambia/Zimbabwe)',
    targetSymptom: 'Bone Thinning, Osteoporosis & Joint Aches',
    nutrientPower: 'Tremendous source of bioavailable calcium, phosphorus, vitamin D, and Omega-3 fatty acids because soft bones are eaten whole.',
    howToPrepare: 'Grind dried crayfish into vegetable soups, or simmer whole washed Dagaa/Omena in fresh tomato-garlic stew.',
    affordability: 'Very Cheap',
  },
  {
    name: 'Baobab Fruit Pulp (Monkey Bread / Kuka Fruit)',
    localNames: 'Kuka fruit / Baobab (Hausa/West Africa), Mabuyu (Swahili), Pain de singe (French)',
    targetSymptom: 'Calcium Absorption, Collagen Loss & Fatigue',
    nutrientPower: 'Contains 3 times more calcium than cow milk and 6 times more vitamin C than oranges.',
    howToPrepare: 'Dissolve 2 tablespoons of white baobab dry pulp powder in clean drinking water or porridge for a tangy, refreshing morning drink.',
    affordability: 'Very Cheap',
  },
  {
    name: 'Moringa Leaves & Seeds (Zogale)',
    localNames: 'Zogale (Hausa), Ewe Igbale (Yoruba), Moringa (English/French/Swahili)',
    targetSymptom: 'Joint Inflammation, High Blood Pressure & Fatigue',
    nutrientPower: 'Packed with 46 antioxidants, plant calcium, potassium, iron, and anti-inflammatory quercetin.',
    howToPrepare: 'Steam fresh leaves into soups or peanut paste, or sprinkle 1 teaspoon of dried leaf powder into daily tea or soup.',
    affordability: 'Very Cheap',
  },
  {
    name: 'Flaxseed & Sesame (Beni Seeds)',
    localNames: 'Ridi (Hausa), Beni seed (Pidgin/Tiv), Sesame / Til (English/Swahili)',
    targetSymptom: 'Hormonal Balance, Dry Skin & Constipation',
    nutrientPower: 'Highest source of plant lignans (potent phytoestrogens), soluble fiber, and bone-building magnesium.',
    howToPrepare: 'Roast lightly and crush into porridges, or chew a small spoon daily with roasted groundnuts.',
    affordability: 'Very Cheap',
  },
  {
    name: 'Fluted Pumpkin Leaves (Ugu)',
    localNames: 'Ugu (Igbo/Pidgin), Sokoyokoto (Yoruba), African Spinach',
    targetSymptom: 'Heart Vessel Health, Blood Pressure & Iron',
    nutrientPower: 'Rich in dietary potassium, folic acid, chlorophyll, and vitamins A & C.',
    howToPrepare: 'Chop and lightly simmer in palm oil stew with fish and onions. Do not overcook to preserve fragile vitamins.',
    affordability: 'Very Cheap',
  },
  {
    name: 'Sweet Potatoes (Orange-Fleshed)',
    localNames: 'Dankali (Hausa), Odunkun (Yoruba), Viazi Vitamu (Swahili), Sweet Potato (Pidgin)',
    targetSymptom: 'Mood Swings, Brain Fog & Sustained Energy',
    nutrientPower: 'High in beta-carotene (Vitamin A precursor), complex low-glycemic carbohydrates, and vitamin B6.',
    howToPrepare: 'Boil or steam with the skin intact. Eat with a boiled egg or bean stew for breakfast.',
    affordability: 'Very Cheap',
  },
];

export const MENOPAUSE_SELF_ASSESSMENT_QUESTIONS = [
  {
    id: 'q1_hot_flushes',
    category: 'Vasomotor',
    question: 'How frequently do you experience sudden waves of heat, sweating, or hot flushes?',
    options: [
      { label: 'Never or rarely', score: 0 },
      { label: 'Mild (1–2 times a day, easily tolerated)', score: 1 },
      { label: 'Moderate (3–6 times a day, disrupting daily tasks)', score: 2 },
      { label: 'Severe (Frequent, soaking clothes, disrupting sleep)', score: 3 },
    ],
  },
  {
    id: 'q2_cycle_pattern',
    category: 'Menstrual History',
    question: 'What is the current status of your monthly menstrual period?',
    options: [
      { label: 'Completely normal and regular cycles', score: 0 },
      { label: 'Irregular (skipping 1–2 months, or heavier flooding with clots)', score: 2 },
      { label: 'No period for 6 to 11 months', score: 3 },
      { label: 'No period for 12 or more continuous months (Full Menopause)', score: 3 },
      { label: 'Had bleeding AFTER 12 months with no period (RED FLAG!)', score: 10 },
    ],
  },
  {
    id: 'q3_sleep_night_sweats',
    category: 'Vasomotor & Circadian',
    question: 'How often do night sweats disrupt your sleep, causing you to wake up wet or cold?',
    options: [
      { label: 'Never', score: 0 },
      { label: 'Occasionally (1–2 nights a week)', score: 1 },
      { label: 'Frequently (3–5 nights a week, waking tired)', score: 2 },
      { label: 'Every night, needing to change clothes or beddings', score: 3 },
    ],
  },
  {
    id: 'q4_vaginal_comfort',
    category: 'Urogenital (GSM)',
    question: 'Do you experience vaginal dryness, itching, burning, or pain during intimacy?',
    options: [
      { label: 'No discomfort at all', score: 0 },
      { label: 'Mild dryness occasionally', score: 1 },
      { label: 'Moderate dryness and painful marital intimacy', score: 2 },
      { label: 'Severe burning, soreness, or avoiding intimacy completely', score: 3 },
    ],
  },
  {
    id: 'q5_mood_anxiety',
    category: 'Psychological',
    question: 'How often do you feel sudden irritability, crying spells, or unusual anxiety?',
    options: [
      { label: 'Feeling emotionally calm and balanced', score: 0 },
      { label: 'Mild irritability around period dates', score: 1 },
      { label: 'Moderate mood swings, short temper, and feeling overwhelmed', score: 2 },
      { label: 'Severe emotional exhaustion, panic, or feeling disconnected', score: 3 },
    ],
  },
  {
    id: 'q6_joints_muscles',
    category: 'Somatic',
    question: 'Do you feel morning joint stiffness, knee/finger aches, or general muscle soreness?',
    options: [
      { label: 'No joint pain', score: 0 },
      { label: 'Mild morning stiffness that loosens up', score: 1 },
      { label: 'Moderate stiffness in knees or fingers daily', score: 2 },
      { label: 'Severe persistent joint aches limiting mobility', score: 3 },
    ],
  },
  {
    id: 'q7_bladder_control',
    category: 'Urogenital (GSM)',
    question: 'Do you experience urinary leakage when coughing/sneezing, or urgent bathroom trips?',
    options: [
      { label: 'Strong bladder control', score: 0 },
      { label: 'Occasional mild drop when coughing hard', score: 1 },
      { label: 'Frequent urgency and needing to rush to the toilet', score: 2 },
      { label: 'Noticeable leakage requiring wearing pads daily', score: 3 },
    ],
  },
];
