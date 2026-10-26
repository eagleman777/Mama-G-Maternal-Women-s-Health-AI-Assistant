import { NutritionalRepletionItem } from '../types';

export const NUTRITIONAL_REPLETION_PROTOCOLS: NutritionalRepletionItem[] = [
  {
    id: 'omega3_epa_dha',
    nutrient: 'Omega-3 Fatty Acids (Targeted EPA & DHA)',
    targetMechanism: 'Neuroinflammation resolution, microglial stabilization, and neuronal cell membrane fluidity restoration.',
    clinicalDosing: '1,500 mg – 2,000 mg total daily (minimum 1,000 mg pure EPA + 500 mg DHA in triglyceride form).',
    biochemicalPathway: 'During 3rd trimester and lactation, maternal brain DHA stores are systematically depleted to supply fetal neural development. Hypo-DHA states trigger microglial activation and cytokine storm (IL-6, TNF-alpha), degrading hippocampal synaptic plasticity and serotonin receptor sensitivity.',
    localFoodSources: [
      'Small oily wild fish eaten whole with bones (Omena / Dagaa / Sardines / Mackerel / Herrings)',
      'Ground flaxseeds / Linseeds and Chia seeds soaked in porridge',
      'Pastured indigenous free-range eggs (rich in choline and DHA phospholipids)',
      'Walnuts and African pumpkin seeds (Egusi)'
    ],
    lactationSafety: 'Highly recommended during lactation. Significantly improves breast milk fatty acid composition, infant visual acuity, and maternal emotional resilience.',
    contraindications: 'Caution in bleeding disorders or immediate postpartum if active clotting issues exist; stop high-dose fish oil prior to planned surgery.'
  },
  {
    id: 'ferritin_iron_repletion',
    nutrient: 'Elemental Iron & Serum Ferritin Restoration',
    targetMechanism: 'Tyrosine hydroxylase cofactor repletion, dopamine and norepinephrine synthesis restoration, combatting anemic fatigue.',
    clinicalDosing: '60 mg – 100 mg elemental iron every other day (alternate-day dosing maximizes hepcidin regulation and absorption), co-prescribed with 500 mg Vitamin C.',
    biochemicalPathway: 'Peripartum blood loss sharply drops serum ferritin. Ferritin < 30 ng/mL is an independent biomarker for postpartum depression, even before frank microcytic anemia develops. Iron is an essential cofactor for tyrosine hydroxylase and tryptophan hydroxylase—the rate-limiting enzymes for dopamine and serotonin.',
    localFoodSources: [
      'Organ meats: Liver, spleen, and kidney (consumed 1-2 times weekly)',
      'Dark green leafy vegetables: Fluted pumpkin leaves (Ugu), Moringa leaves, Amaranth (Dodo/Terere), Bitterleaf',
      'Plant proteins: Black-eyed cowpeas, brown lentils, and groundnuts paired with lemon or orange juice (Vitamin C enhances non-heme absorption 3-fold)'
    ],
    lactationSafety: 'Safe and standard protocol for nursing mothers. Does not alter breast milk iron levels (which are regulated by mammary transferrin).',
    contraindications: 'Do not take with tea, coffee, or calcium-rich milk simultaneously (polyphenols and phytates block iron uptake). Space by 2 hours.'
  },
  {
    id: 'magnesium_vitamind3',
    nutrient: 'Magnesium Glycinate / Citrate & Vitamin D3 (Cholecalciferol)',
    targetMechanism: 'Blunting HPA-axis hyper-reactivity, NMDA receptor downregulation, melatonin synthesis, and sleep architecture stabilization.',
    clinicalDosing: 'Magnesium: 300 mg – 400 mg elemental at bedtime. Vitamin D3: 4,000 IU – 5,000 IU daily (paired with 100 mcg Vitamin K2 MK-7).',
    biochemicalPathway: 'Magnesium blocks the excessive influx of calcium through NMDA glutamate channels, attenuating excitotoxicity and somatic anxiety. Vitamin D3 functions as a neurosteroid hormone, activating tryptophan hydroxylase 2 (TPH2) in the brain to produce central serotonin while dampening peripheral systemic inflammation.',
    localFoodSources: [
      'Magnesium: Whole sesame seeds (Beni seeds), pumpkin seeds, dark cocoa/cacao, baobab fruit pulp, boiled cassava leaves',
      'Vitamin D3: Regular morning sunlight exposure (15-20 mins non-peak), sun-dried wild mushrooms, egg yolks, oily river fish'
    ],
    lactationSafety: 'Safe. Maternal Vitamin D3 intake of 4,000–6,400 IU/day provides sufficient vitamin D into breast milk to satisfy infant nutritional requirements without direct infant drops.',
    contraindications: 'Severe renal impairment. Magnesium citrate can loosen stools; switch to glycinate or malate if loose bowels occur.'
  },
  {
    id: 'gaba_neurosteroid_modulators',
    nutrient: 'GABA Modulators & Neurosteroid Buffers',
    targetMechanism: 'Compensating for the precipitous postpartum drop in allopregnanolone and enhancing central inhibitory GABAergic tone.',
    clinicalDosing: 'L-Theanine 200 mg 1-2x daily; Apigenin (Chamomile extract) 50 mg; Vitamin B6 (P-5-P) 25 mg daily.',
    biochemicalPathway: 'Within 48 hours of placental delivery, circulating progesterone and its primary metabolite allopregnanolone drop by over 95%. In susceptible mothers, GABA-A receptor subunit sensitivity fails to adjust, precipitating acute dysphoria, catastrophic thoughts, and nighttime panic.',
    localFoodSources: [
      'Naturally fermented probiotic drinks: Fermented millet/sorghum gruel (Kunu, Ogi), traditional milk kefir / sour milk (Nunu, Mursik)',
      'Herbal infusions: Pure dried Chamomile flowers (Matricaria chamomilla, rich in apigenin)',
      'Green tea (in moderation for L-theanine, avoiding evening caffeine)'
    ],
    lactationSafety: 'Chamomile and moderate L-theanine are compatible with breastfeeding. Avoid synthetic benzodiazepines without direct psychiatric supervision.',
    contraindications: 'Do not combine sedating botanicals with alcohol or prescription sedatives without clinical oversight.'
  }
];

export const MAMA_G_SYSTEM_PROMPT_TEMPLATE = `You are "Mama-G", an empathetic, highly knowledgeable, and culturally sensitive AI digital health assistant.
Your primary mission is to provide accurate, evidence-based, and plain-language support for maternal health, prenatal/postnatal care, sexual and reproductive health and rights (SRHR), and female wellness in low-resource and offline-first settings.

SPECIALIZED POSTPARTUM & PERINATAL PHENOTYPING DIRECTIVE:
When evaluating postpartum mothers, you must continuously monitor for Perinatal Mood & Anxiety Disorders (PMAD) and Postpartum Depression (PPD) through 3 core behavioral pillars:
1. LINGUISTIC PHENOTYPE: Watch for absolute negative framing ("never", "ruined", "can't ever", "bad mother"), self-absorption pronoun shifts ("I/me" vs "we/baby"), and anhedonic apathy.
2. CIRCADIAN RECOVERY: Inquire about sleep fragmentation, nocturnal hyper-vigilance (inability to sleep when baby sleeps), and ensure the mother achieves at least one consolidated 4-hour sleep block.
3. CAREGIVING EXTREMES: Distinguish between Anxious Hyper-fixation (refusing all help, obsessive fear of contamination) and Detachment (numbness, feeling baby is a stranger).

CLINICAL TRIAGE MATRIX:
- EMERGENCY (Red Flag): Active suicidal ideation, postpartum psychosis, hallucinations, severe self-harm urges, or neonatal neglect. Immediately display bold red emergency banner and transfer to tertiary emergency clinic.
- URGENT: Edinburgh Postnatal Depression Scale (EPDS) >= 13, persistent insomnia, severe panic. Coordinate with community midwife or primary clinic within 24 hours.
- ROUTINE: Baby blues in days 1-10, mild emotional fluctuations; support with sleep shift scheduling, partner burden sharing, and biochemical repletion (Omega-3, Ferritin, Magnesium, Vitamin D3).

OUTPUT FORMAT:
1. 🚨 **Immediate Safety Check / Triage Level** (Emergency / Urgent / Routine)
2. 💬 **Direct Answer & Guidance** (Warm, motherly, culturally sensitive)
3. 📋 **Practical Steps / Behavioral Checklist**
4. 🥗 **Targeted Biochemical & Nutritional Repletion** (Accessible local food recommendations)
5. 🏥 **When to See a Healthcare Provider**`;

export const ABSOLUTE_NEGATIVE_LEXICON = [
  'never', 'always', 'nothing', 'ruined', 'failure', 'worst', 'worthless',
  'hopeless', 'useless', 'bad mother', 'hate myself', 'broken', 'impossible',
  'unbearable', 'pointless', 'disaster', 'burden', 'everyone would be better',
  'can not do this', 'no way out', 'trapped', 'empty', 'numb'
];

export const FIRST_PERSON_PRONOUNS = [
  'i', 'me', 'my', 'myself', 'mine'
];
