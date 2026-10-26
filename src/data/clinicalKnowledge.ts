export interface TriageRule {
  id: string;
  category: 'obstetric_emergency' | 'labor_delivery' | 'postpartum_danger' | 'general_urgent' | 'routine';
  name: string;
  symptoms: string[];
  severity: 'EMERGENCY' | 'URGENT' | 'ROUTINE';
  immediateGuidance: string;
  chwAction: string;
  localFoodOrCareTip?: string;
}

export const EMERGENCY_RED_FLAGS: TriageRule[] = [
  {
    id: 'severe_preeclampsia',
    category: 'obstetric_emergency',
    name: 'Severe Headache, Blurry Vision, Facial Swelling (Suspected Severe Pre-eclampsia / Eclampsia)',
    symptoms: [
      'Severe throbbing headache that does not stop',
      'Blurry vision, seeing spots or flashes',
      'Sudden swelling of face, hands, or eyelids',
      'Severe pain in upper right abdomen (under ribs)',
      'Difficulty breathing or chest tightness',
      'Seizures or convulsions'
    ],
    severity: 'EMERGENCY',
    immediateGuidance: 'Go to the nearest hospital or emergency health facility IMMEDIATELY. This can be pre-eclampsia or impending eclampsia, which can endanger both mother and baby. Do not wait. Lie quietly on your left side while transport is arranged. Avoid bright lights and noise.',
    chwAction: 'Check Blood Pressure immediately. If Systolic >= 160 or Diastolic >= 110 with proteinuria or neurological symptoms, initiate Magnesium Sulfate loading dose per national clinical protocol (e.g. 4g IV + 10g IM) if trained. Administer antihypertensive (oral Nifedipine or IV Hydralazine). Arrange emergency transport immediately with IV line secured.'
  },
  {
    id: 'antepartum_hemorrhage',
    category: 'obstetric_emergency',
    name: 'Vaginal Bleeding in Pregnancy (Placenta Previa or Abruption)',
    symptoms: [
      'Fresh bright red or dark vaginal bleeding',
      'Bleeding soaking through a pad or cloth',
      'Bleeding accompanied by severe constant belly pain (rigid uterus)',
      'Dizziness, fainting, or cold clammy skin'
    ],
    severity: 'EMERGENCY',
    immediateGuidance: 'URGENT EMERGENCY: Do not insert anything into the vagina. Do not do vaginal examination. Proceed immediately to a comprehensive emergency obstetric care (CEmONC) hospital. Prepare for possible emergency delivery or blood transfusion.',
    chwAction: 'DO NOT PERFORM DIGITAL VAGINAL EXAMINATION. Establish IV access with wide-bore cannula (16G/18G), begin normal saline or Ringer lactate infusion. Elevate legs slightly. Keep mother warm. Accompany mother to referral hospital.'
  },
  {
    id: 'absent_fetal_movement',
    category: 'obstetric_emergency',
    name: 'Absent or Drastically Reduced Fetal Kicks (Fetal Distress)',
    symptoms: [
      'No baby kicks or movements for over 12 hours (past 28 weeks)',
      'Fewer than 10 distinct kicks in 2 hours after cold drink/snack while resting on left side',
      'Sudden frenzied movements followed by complete stillness'
    ],
    severity: 'EMERGENCY',
    immediateGuidance: 'Drink a glass of clean cold water or eat a small snack, lie down flat on your left side for 1 hour, and place your hand on your belly. If your baby does NOT kick at least 4-5 times in that hour, go to the health centre immediately for a fetal heart rate check.',
    chwAction: 'Auscultate fetal heart rate using Pinard stethoscope or Doppler. Normal range: 110-160 bpm. If heart rate is <110 bpm, >160 bpm, or inaudible, refer immediately for ultrasound and non-stress test / emergency intervention.'
  },
  {
    id: 'postpartum_hemorrhage',
    category: 'postpartum_danger',
    name: 'Heavy Bleeding After Birth (Postpartum Hemorrhage - PPH)',
    symptoms: [
      'Soaking more than two large sanitary pads or wraps in an hour',
      'Passing large blood clots (bigger than a chicken egg)',
      'Feeling dizzy, lightheaded, fast racing heartbeat, or confusion',
      'Boggy, soft uterus that does not feel like a firm round ball'
    ],
    severity: 'EMERGENCY',
    immediateGuidance: 'CRITICAL EMERGENCY: Postpartum bleeding can become life-threatening in minutes. Rub and massage the top of your uterus (lower belly) firmly in a circular motion until it hardens like a fist. Have someone take you to the emergency health facility right away.',
    chwAction: 'CALL FOR HELP. Perform continuous vigorous uterine fundal massage. Ensure bladder is empty (catheterize if needed). Administer Oxytocin 10 IU IM (or Misoprostol 600-800 mcg sublingually if Oxytocin unavailable). Establish 2 large bore IV lines with fluids. Perform bimanual uterine compression if trained. Expedite referral.'
  },
  {
    id: 'puerperal_sepsis',
    category: 'postpartum_danger',
    name: 'High Fever, Foul Lochia, or Chills (Postpartum Infection / Sepsis)',
    symptoms: [
      'High body temperature (>38°C / 100.4°F) or severe shaking chills',
      'Foul-smelling, offensive vaginal discharge (lochia)',
      'Severe lower abdominal tenderness when pressed',
      'Fast breathing and heart rate'
    ],
    severity: 'EMERGENCY',
    immediateGuidance: 'High fever and bad-smelling discharge after delivery indicate a severe womb or pelvic infection (puerperal sepsis). This requires prescription IV antibiotics at a clinic immediately. Drink plenty of clean fluids and seek medical care today.',
    chwAction: 'Assess vitals (temperature, pulse, respiratory rate, BP). Check for uterine involution and tenderness. Initiate first dose of broad-spectrum antibiotics (e.g. Ampicillin + Gentamicin or Ceftriaxone) if authorized by local protocol, and refer urgently.'
  },
  {
    id: 'cord_prolapse',
    category: 'labor_delivery',
    name: 'Umbilical Cord Protruding or Ruptured Water with Meconium',
    symptoms: [
      'Loop of umbilical cord felt or seen in vagina after waters break',
      'Waters broke and fluid is thick dark green or brownish (meconium stained)',
      'Premature rupture of membranes before 37 weeks'
    ],
    severity: 'EMERGENCY',
    immediateGuidance: 'ABSOLUTE EMERGENCY: If the umbilical cord is slipping out, do NOT push it back. Get on your hands and knees with your chest on the floor and hips raised in the air (knee-chest position) to relieve pressure on the cord. Call an ambulance or rush to hospital immediately.',
    chwAction: 'Instruct knee-chest position or steep Trendelenburg. If trained, insert sterile gloved fingers to gently hold presenting fetal part off the cord without manipulating the cord. Cover cord with warm, sterile saline-soaked gauze. Rapid C-section transfer required.'
  },
  {
    id: 'malaria_pregnancy',
    category: 'general_urgent',
    name: 'Fever & Chills in Pregnancy (Suspected Malaria or Urinary Infection)',
    symptoms: [
      'High fever with chills and shivering',
      'Body aches, joint pain, nausea, loss of appetite',
      'Pain or burning sensation when passing urine'
    ],
    severity: 'URGENT',
    immediateGuidance: 'In pregnancy, malaria can cause severe maternal anemia, miscarriage, or low birth weight. Visit the primary health centre within 24 hours for a Rapid Diagnostic Test (RDT) and safe pregnancy-approved antimalarial treatment. Drink plenty of clean water, coconut water, or thin broth.',
    chwAction: 'Perform malaria RDT. Check urine dipstick for protein, nitrites, and leukocytes. If RDT is positive, administer approved Artemisinin-based combination therapy (ACT) or quinine per national guidelines for the specific trimester. Check hemoglobin.'
  },
  {
    id: 'hyperemesis_gravidarum',
    category: 'general_urgent',
    name: 'Severe Persistent Vomiting (Hyperemesis Gravidarum)',
    symptoms: [
      'Cannot keep any water or food down for 24 hours',
      'Dark amber urine, passing urine only once or twice a day',
      'Severe dizziness when standing up, dry cracked lips'
    ],
    severity: 'URGENT',
    immediateGuidance: 'Frequent vomiting leading to dehydration requires IV rehydration fluids at the health centre. Sip tiny teaspoons of ginger-infused clean water, oral rehydration salts (ORS), or coconut water. Visit the clinic today to receive safe anti-nausea medication.',
    chwAction: 'Assess skin turgor and pulse. Check urine ketones and specific gravity. Administer IV normal saline or Ringer lactate with Vitamin B6 / Metoclopramide if authorized. Monitor electrolyte balance.'
  }
];

export interface TrimesterMilestone {
  stage: string;
  rangeWeeks: string;
  babyDevelopment: string;
  motherChanges: string;
  localNutrition: string[];
  keyActions: string[];
  dangerSignsToWatch: string[];
}

export const PREGNANCY_JOURNEY: TrimesterMilestone[] = [
  {
    stage: 'First Trimester',
    rangeWeeks: 'Weeks 1 – 12',
    babyDevelopment: 'Heart starts beating around week 5. Brain, spinal cord, and tiny limb buds form. By week 12, all major organs, fingers, and toes are present.',
    motherChanges: 'Morning sickness, breast tenderness, fatigue, frequent urination. Emotions may fluctuate due to surging progesterone and hCG.',
    localNutrition: [
      'Folic acid & iron rich greens: Bitterleaf, Ugu (fluted pumpkin), Moringa, Sukuma Wiki, Spinach',
      'Plant proteins: Cowpeas, Black-eyed beans, Groundnuts, Bambara nuts',
      'Safe carbohydrates: Boiled yams, sweet potatoes, brown rice, whole millet porridge'
    ],
    keyActions: [
      'Start daily Folic Acid (400 mcg) + Iron supplement immediately',
      'Register for Antenatal Care (ANC Visit 1) at nearest health facility',
      'Screen for HIV, Syphilis, Hepatitis B, and baseline blood group/Rh factor',
      'Sleep under an insecticide-treated mosquito net (ITN)'
    ],
    dangerSignsToWatch: [
      'Vaginal spotting or bleeding',
      'Sharp one-sided pelvic pain (possible ectopic pregnancy)',
      'Severe vomiting unable to hold fluids for 24 hours',
      'High fever with chills'
    ]
  },
  {
    stage: 'Second Trimester',
    rangeWeeks: 'Weeks 13 – 26',
    babyDevelopment: 'Golden trimester: Baby starts hearing mother’s voice, swallowing amniotic fluid, and kicking ("quickening" felt around week 18-20). Baby grows fine lanugo hair.',
    motherChanges: 'Energy returns, nausea subsides, belly begins to show. May notice round ligament aches, skin glow, or darkening line on belly (linea nigra).',
    localNutrition: [
      'Iron & Vitamin C pairing: Cooked liver or eggs, fresh oranges, baobab fruit pulp, guava',
      'Calcium rich foods: Small dried fish with bones (dagaa/omena/crayfish), sesame seeds, fermented sour milk/yogurt',
      'Fiber to prevent constipation: Boiled cassava, roasted plantain, oats, baobab porridge'
    ],
    keyActions: [
      'Attend ANC Visit 2 (around week 20) and ANC Visit 3 (week 26)',
      'Receive Intermittent Preventive Treatment for malaria (IPTp-SP) if in malaria zone',
      'Receive Tetanus Toxoid vaccination (TT / Td)',
      'Have an ultrasound anatomy scan if available'
    ],
    dangerSignsToWatch: [
      'Any sudden gush of clear fluid from the vagina',
      'Persistent severe headache or upper abdominal pain',
      'Burning pain during urination',
      'Swelling of face and fingers'
    ]
  },
  {
    stage: 'Third Trimester',
    rangeWeeks: 'Weeks 27 – 40+',
    babyDevelopment: 'Rapid brain growth and lung maturation. Baby gains weight, practices breathing motions, and turns head-down into maternal pelvis.',
    motherChanges: 'Heavy belly, shortness of breath, backache, Braxton Hicks practice contractions, frequent urination as baby presses on bladder.',
    localNutrition: [
      'Energy-dense, iron-rich meals: Groundnut soup with fish, boiled eggs, beans with red palm oil in moderation',
      'Hydration: At least 2.5–3 liters of clean boiled or filtered water daily',
      'Micronutrients: Moringa leaf powder in porridge for zinc and vitamin A'
    ],
    keyActions: [
      'Count baby kicks daily: Should feel at least 10 movements in a 2-hour relaxed resting period',
      'Attend ANC Visits 4, 5, 6, 7, and 8 per WHO recommendations',
      'Pack your Emergency Delivery Bag ("Mama Kit"): Sterile razor/clamps, clean cotton wraps, soap, sanitary pads, baby clothes, torch/flashlight',
      'Confirm birth companion, emergency transport savings, and designated blood donor'
    ],
    dangerSignsToWatch: [
      'Baby stops kicking or kicks much less than usual',
      'Severe headache, blurry vision, or sudden facial edema',
      'Vaginal bleeding of any amount',
      'Water breaking before contractions start'
    ]
  },
  {
    stage: 'Postpartum & Fourth Trimester',
    rangeWeeks: 'Birth – 6 Weeks Postpartum',
    babyDevelopment: 'Newborn adjusts to outside world: feeding every 2-3 hours, establishing eye contact, skin-to-skin bonding, rapid weight recovery after initial 10% drop.',
    motherChanges: 'Lochia discharge transitions from red (rubra) to pink-brown (serosa) to creamy white (alba). Uterus contracts back to normal size. Breast milk comes in around day 2-4.',
    localNutrition: [
      'Warm nourishing lactation foods: Pap/ogi with crushed groundnuts, moringa soup, chicken pepper soup, millet gruel',
      'Continue daily Iron and Folic Acid for at least 3 months after delivery',
      'Abundant clean liquids for breast milk synthesis'
    ],
    keyActions: [
      'Essential Postnatal Care (PNC) checks at 24 hours, Day 3, Day 7-14, and 6 weeks',
      'Practice Exclusive Breastfeeding (no water, formula, or herbal teas for the first 6 months)',
      'Apply 7.1% Chlorhexidine gel to newborn umbilical cord stump daily if in high neonatal mortality settings',
      'Ensure newborn receives BCG, Polio (OPV 0), and Hepatitis B birth doses',
      'Discuss postpartum family planning (PFP) options before 6 weeks'
    ],
    dangerSignsToWatch: [
      'Heavy vaginal bleeding soaking >2 pads per hour or passing large clots',
      'Fever >38°C or foul-smelling vaginal discharge',
      'Severe calf pain or chest tightness',
      'Feelings of sadness, inability to care for baby, or thoughts of self-harm'
    ]
  }
];

export interface ContraceptiveOption {
  name: string;
  category: 'LARC' | 'Hormonal Short-Acting' | 'Barrier' | 'Natural';
  effectiveness: string;
  duration: string;
  breastfeedingSafe: boolean;
  breastfeedingNote: string;
  howItWorks: string;
  commonMyths: string;
  clinicalReality: string;
}

export const CONTRACEPTIVE_METHODS: ContraceptiveOption[] = [
  {
    name: 'Subdermal Implants (Jadelle / Implanon / Nexplanon)',
    category: 'LARC',
    effectiveness: 'Over 99% effective',
    duration: '3 to 5 years (reversible anytime)',
    breastfeedingSafe: true,
    breastfeedingNote: 'Safe to insert immediately postpartum or during breastfeeding without affecting breast milk volume.',
    howItWorks: 'One or two tiny flexible rods placed just under the skin of the upper arm by a trained health worker. Releases progestin slowly.',
    commonMyths: 'Myth: "The rod travels into the heart or causes permanent infertility."',
    clinicalReality: 'Fact: The implant stays securely in the arm and cannot travel. Fertility returns immediately within weeks of removal.'
  },
  {
    name: 'Copper Intrauterine Device (Copper T 380A IUD)',
    category: 'LARC',
    effectiveness: 'Over 99% effective',
    duration: 'Up to 10–12 years',
    breastfeedingSafe: true,
    breastfeedingNote: '100% hormone-free. Ideal for breastfeeding mothers; zero impact on milk composition.',
    howItWorks: 'A small flexible T-shaped device inserted into the womb by a doctor or midwife. Copper prevents sperm from reaching the egg.',
    commonMyths: 'Myth: "The IUD will rust inside the body or enter the stomach."',
    clinicalReality: 'Fact: Medical copper does not rust. The uterus is a closed organ; the IUD cannot travel into other organs.'
  },
  {
    name: 'Injectable Contraceptive (DMPA / Depo-Provera / Sayana Press)',
    category: 'Hormonal Short-Acting',
    effectiveness: '96% – 99% effective',
    duration: 'Every 3 months (13 weeks)',
    breastfeedingSafe: true,
    breastfeedingNote: 'Progestin-only; can be started 6 weeks postpartum (or immediately if no other methods accessible).',
    howItWorks: 'An injection given in the muscle or under skin every 3 months that prevents the ovaries from releasing eggs.',
    commonMyths: 'Myth: "If you stop having a monthly period, bad blood is trapped inside your body."',
    clinicalReality: 'Fact: The uterine lining simply stays thin and dormant so there is no extra blood buildup. When injections stop, periods return.'
  },
  {
    name: 'Progestin-Only Pills (POP / "Minipill")',
    category: 'Hormonal Short-Acting',
    effectiveness: '93% – 99% effective with consistent use',
    duration: 'Daily pill (must take at exact same hour)',
    breastfeedingSafe: true,
    breastfeedingNote: 'First-line choice for nursing mothers; does not suppress breast milk production unlike combined estrogen pills.',
    howItWorks: 'Thickens cervical mucus to block sperm entry.',
    commonMyths: 'Myth: "Skipping one pill does not matter."',
    clinicalReality: 'Fact: POPs must be taken within a strict 3-hour window daily to remain effective. If late, use back-up condoms for 48 hours.'
  },
  {
    name: 'Lactational Amenorrhea Method (LAM)',
    category: 'Natural',
    effectiveness: 'Up to 98% effective if all 3 criteria met',
    duration: 'First 6 months after delivery',
    breastfeedingSafe: true,
    breastfeedingNote: 'Relies completely on full, exclusive on-demand breastfeeding.',
    howItWorks: 'Frequent nipple stimulation suppresses hormones that trigger ovulation.',
    commonMyths: 'Myth: "Any breastfeeding will prevent pregnancy automatically."',
    clinicalReality: 'Fact: Only works IF: 1) Mother has not had any menstrual bleeding since 56 days postpartum, 2) Baby is exclusively breastfed day and night without other foods/water, 3) Baby is under 6 months old. If ANY condition breaks, pregnancy can happen.'
  },
  {
    name: 'Male & Female Condoms',
    category: 'Barrier',
    effectiveness: '85% – 98% effective',
    duration: 'Single use per sex act',
    breastfeedingSafe: true,
    breastfeedingNote: 'Zero hormone effects. Completely safe during lactation.',
    howItWorks: 'Physical barrier trapping sperm.',
    commonMyths: 'Myth: "Condoms reduce sexual health or have tiny holes intentionally."',
    clinicalReality: 'Fact: Quality-tested latex/polyurethane condoms are the ONLY contraceptive method that also protects against STIs including HIV.'
  }
];

export interface ChwProtocol {
  id: string;
  title: string;
  audience: string;
  summary: string;
  steps: { step: number; action: string; note: string; caution?: string }[];
}

export const CHW_PROTOCOLS: ChwProtocol[] = [
  {
    id: 'who_anc_checklist',
    title: 'WHO 8-Contact Antenatal Care (ANC) Protocol',
    audience: 'Community Health Extension Workers (CHEWs), Midwives, Primary Care Nurses',
    summary: 'Standardized checklist for routine Antenatal Care encounters to identify risk early and ensure healthy pregnancy.',
    steps: [
      {
        step: 1,
        action: 'Measure Blood Pressure & Weight',
        note: 'Systolic >= 140 or Diastolic >= 90 requires re-test in 4 hours. Check for facial or hand edema.'
      },
      {
        step: 2,
        action: 'Assess Hemoglobin & Anemia Status',
        note: 'Normal Hb >= 11 g/dL. If Hb 7-10.9 g/dL, treat moderate anemia with therapeutic iron (120mg daily). If Hb < 7 g/dL, urgent referral for severe anemia.'
      },
      {
        step: 3,
        action: 'Urine Dipstick Screening',
        note: 'Test for Protein (preeclampsia marker) and Glucose/Nitrites (asymptomatic bacteriuria).'
      },
      {
        step: 4,
        action: 'Fetal Assessment & Symphysis-Fundal Height (SFH)',
        note: 'Measure fundal height in centimeters from pubic bone to top of uterus. Auscultate fetal heart tones (110-160 bpm).'
      },
      {
        step: 5,
        action: 'Preventive Interventions Dispensing',
        note: 'Administer IPTp-SP (Fansidar) starting from 13 weeks (at least 3 doses spaced 1 month apart). Give Iron/Folic acid tablets, tetanus vaccination, and deworming (Albendazole) after 1st trimester.'
      },
      {
        step: 6,
        action: 'Counsel on Birth Preparedness & Complication Readiness (BPCR)',
        note: 'Identify delivery facility, emergency transport funds, birth companion, and sterile delivery pack ("Mama Kit").'
      }
    ]
  },
  {
    id: 'pph_firstline_protocol',
    title: 'Postpartum Hemorrhage (PPH) First-Line Management',
    audience: 'Primary Clinic Nurses, Rural Midwives, First Responders',
    summary: 'Rapid response algorithm for excessive bleeding (>500ml vaginal / >1000ml C-section) within first 24 hours of childbirth.',
    steps: [
      {
        step: 1,
        action: 'SHOUT FOR HELP & Mobilize the Emergency Team',
        note: 'Do not leave the woman alone. Note the exact time. Record vital signs.',
        caution: 'Speed is critical; delay of 15 minutes significantly raises maternal mortality.'
      },
      {
        step: 2,
        action: 'Massage the Uterus Continuously (Uterine Atony is 80% of causes)',
        note: 'Place one hand on lower abdomen and rub the fundus vigorously in circular motion until it contracts firm as a cricket ball.'
      },
      {
        step: 3,
        action: 'Administer First-Line Uterotonic Drugs',
        note: 'Oxytocin 10 IU intramuscularly (or 20 IU in 1L Normal Saline at 60 drops/min). If no cold chain/Oxytocin: Give Misoprostol 800 mcg sublingually.'
      },
      {
        step: 4,
        action: 'Insert Urinary Catheter & Check for Retained Placenta / Tears',
        note: 'A full bladder prevents the uterus from contracting. Inspect perineum and cervix with good light for active lacerations.'
      },
      {
        step: 5,
        action: 'Establish Two Large-Bore IV Lines (16G or 18G)',
        note: 'Infuse warm Normal Saline or Ringer Lactate rapidly (1 liter in 15-20 minutes). Keep mother warm with clean dry blankets.'
      },
      {
        step: 6,
        action: 'Apply External Bimanual Uterine Compression or Non-pneumatic Anti-Shock Garment (NASG)',
        note: 'If bleeding persists, apply bimanual compression. Put on NASG if available. Expedite immediate emergency referral.'
      }
    ]
  },
  {
    id: 'newborn_danger_signs',
    title: 'Integrated Management of Newborn Illness (IMNCI Danger Signs)',
    audience: 'Community Health Workers, Maternity Ward Nurses',
    summary: 'Immediate identification of sick neonate (0-28 days) requiring urgent hospital admission.',
    steps: [
      {
        step: 1,
        action: 'Check Breathing Rate & Chest Indrawing',
        note: 'Count breaths for 1 full minute when calm. Normal is 30-60 breaths/min. Fast breathing is >60 breaths/min. Look for deep severe lower chest wall sucking inward.'
      },
      {
        step: 2,
        action: 'Check Body Temperature',
        note: 'Fever (>37.5°C) or severe hypothermia (<35.5°C). Cold feet with lethargy is a red flag.'
      },
      {
        step: 3,
        action: 'Inspect Umbilical Cord & Skin',
        note: 'Look for red swelling extending onto abdominal skin, pus oozing, foul smell, or numerous skin pustules.'
      },
      {
        step: 4,
        action: 'Assess Feeding Ability & Movement',
        note: 'Inability to suck breast milk or vomiting everything. Baby moves only when stimulated or does not move at all (lethargic/floppy).'
      },
      {
        step: 5,
        action: 'Assess Jaundice & Cyanosis',
        note: 'Yellow palms and soles within 24 hours of birth. Bluish lips/tongue (central cyanosis).'
      }
    ]
  }
];

export const MAMA_KIT_ESSENTIALS = [
  { item: 'Clean Plastic Sheet (Mackintosh / Clean Tarpaulin)', purpose: 'Provides a clean, dry surface for delivery in clinic or home' },
  { item: 'Sterile Surgical Gloves (2 pairs)', purpose: 'Prevents transmission of bacterial pathogens during examination' },
  { item: 'Sterile Surgical Razor Blade / Scalpel', purpose: 'To cut the umbilical cord cleanly without rust or contamination' },
  { item: 'Sterile Cord Clamps or Cotton Cord Ties (2)', purpose: 'Secures cord firmly to prevent fatal newborn hemorrhage' },
  { item: 'Chlorhexidine 7.1% Digluconate Gel / Solution', purpose: 'Antiseptic cord application that reduces newborn sepsis by up to 40%' },
  { item: 'Clean Cotton Wool & Gauze Swabs', purpose: 'Wiping baby’s eyes and cleaning perineum' },
  { item: 'Medicated / Antiseptic Hand Soap', purpose: 'Thorough handwashing before and after assisting delivery' },
  { item: 'Clean Dry Cotton Baby Cloths / Wraps (Khanga / Chitenge)', purpose: 'Immediate drying and skin-to-skin kangaroo mother care to prevent hypothermia' },
  { item: 'Maternity Sanitary Pads (Heavy Flow)', purpose: 'Managing initial postpartum lochia cleanly' }
];

export const EMERGENCY_HOTLINES = [
  { country: 'Nigeria', label: 'National Emergency Toll-Free', number: '112 / 199' },
  { country: 'Kenya', label: 'Emergency Hotline / Red Cross', number: '999 / 112 / 0700 395 395' },
  { country: 'Ghana', label: 'National Ambulance Service', number: '193 / 112' },
  { country: 'Uganda', label: 'Police & Ambulance Emergency', number: '999 / 112' },
  { country: 'Tanzania', label: 'Medical Emergency & Police', number: '112 / 114' },
  { country: 'South Africa', label: 'National Ambulance / Emergency', number: '10177 / 112' },
  { country: 'General / Universal', label: 'Global GSM Emergency', number: '112' }
];
