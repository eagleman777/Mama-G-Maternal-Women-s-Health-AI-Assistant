// Complete Evidence-Based Women's Ailments, Gynecological Conditions, and Prevention Protocols
// Grounded in WHO, UNICEF, FIGO, and Nigerian Federal Ministry of Health / NPHCDA Clinical Guidelines

export type AilmentCategory =
  | 'cancers'
  | 'uterine_ovarian'
  | 'infections'
  | 'obstetric'
  | 'pelvic_midlife';

export interface PreventionProtocol {
  primary: string[]; // Steps to prevent occurrence
  screening: string[]; // Early detection, tests, and schedule
  lifestyleAndDiet: string[]; // Food, physical habits, local nutrition
  avoidRisks: string[]; // Harmful practices, concoctions, or exposures to avoid
}

export interface WomenAilment {
  id: string;
  name: string;
  localAliases: string; // Culturally recognizable terms (e.g. Pidgin, Hausa, Yoruba, common names)
  category: AilmentCategory;
  categoryLabel: string;
  prevalenceInsight: string;
  shortSummary: string;
  commonSymptoms: string[];
  redFlagEmergencySigns: string[];
  rootCausesAndRisks: string[];
  prevention: PreventionProtocol;
  chwActionPlan: string[];
  recommendedAgeOrGroup: string;
  specialistToConsult: string;
}

export const WOMEN_AILMENTS_REGISTRY: WomenAilment[] = [
  {
    id: 'cervical-cancer',
    name: 'Cervical Cancer & Human Papillomavirus (HPV)',
    localAliases: 'Cervix Cancer, Ciwon Daji na Mahaifa, Àrùn Jẹjẹẹrẹ Ẹnu-Ilé Ọmọ, Womb mouth sickness',
    category: 'cancers',
    categoryLabel: 'Oncology & Cancer Prevention',
    prevalenceInsight: 'Second most common cancer among women in Sub-Saharan Africa and the leading cause of female cancer mortality in Nigeria. Almost 100% preventable with timely vaccination and screening.',
    shortSummary: 'Malignant disease arising from the cells of the cervix (the lower part of the uterus opening into the vagina), almost always triggered by persistent infection with high-risk oncogenic Human Papillomavirus (HPV types 16 and 18).',
    commonSymptoms: [
      'Abnormal vaginal bleeding between regular menstrual cycles',
      'Post-coital bleeding (bleeding immediately after sexual intercourse)',
      'Persistent, watery, foul-smelling or blood-tinged vaginal discharge',
      'Postmenopausal bleeding (any vaginal bleeding occurring after menopause has ceased)',
      'Deep, unremitting pelvic or lower back ache radiating down the thighs',
      'Pain or discomfort during sexual intimacy (dyspareunia)'
    ],
    redFlagEmergencySigns: [
      'Heavy, gushing vaginal hemorrhage causing dizziness, fainting, or severe pallor',
      'Anuria or severe flank pain due to ureteric obstruction by advanced tumor',
      'Profound weight loss, cachexia, and persistent foul pelvic discharge'
    ],
    rootCausesAndRisks: [
      'Persistent infection with high-risk Human Papillomavirus (HPV 16, 18, 31, 33, 45)',
      'Lack of HPV vaccination during adolescent window (ages 9–14)',
      'Early onset of sexual activity before cervical tissue maturity',
      'Multiple sexual partners or partner with multiple sexual contacts',
      'Immunosuppression (especially untreated or advanced HIV infection)',
      'High parity (giving birth to multiple children without adequate cervical rest)',
      'Tobacco smoking (accelerates viral integration into cervical DNA)'
    ],
    prevention: {
      primary: [
        'HPV Vaccination: Single-dose or two-dose HPV vaccine for all young girls aged 9–14 (routinely rolled out by NPHCDA across Nigerian Primary Health Centers free or subsidized).',
        'Consistent and correct barrier protection (condoms) during intimacy to reduce viral transmission.',
        'Delayed sexual debut until full physiological maturity.',
        'Total avoidance of tobacco smoking and exposure to secondhand smoke.'
      ],
      screening: [
        'Visual Inspection with Acetic Acid (VIA): Highly effective, low-resource screen available at Primary Health Centers. Dilute table vinegar reveals white precancerous lesions (acetowhite changes).',
        'Visual Inspection with Lugol Iodine (VILI) to complement VIA.',
        'Pap Smear (Cytology): Every 3 years for women aged 21–65.',
        'HPV DNA Testing: Gold-standard high-sensitivity test recommended every 5–10 years for women aged 30 and above (or from age 25 for women living with HIV).',
        'Immediate "Screen-and-Treat": Precancerous cervical intraepithelial neoplasia (CIN) can be eradicated instantly on-site via Cryotherapy or Thermal Ablation at secondary facilities before ever turning into cancer.'
      ],
      lifestyleAndDiet: [
        'Rich intake of antioxidant and folate-dense indigenous foods: Ugwu (fluted pumpkin leaves), bitter leaf soup, moringa oleifera, waterleaf, and fresh carrots.',
        'Adequate Vitamin C and Beta-Carotene intake from citrus, pawpaw (papaya), and mangoes to support mucosal immunity.',
        'Avoid insertion of chemical astringents, caustic herbs, or alum into the vagina for "tightening", which destroys protective cervical mucosa.'
      ],
      avoidRisks: [
        'Never ignore post-coital or postmenopausal vaginal bleeding as "just dirty blood".',
        'Never use herbal concoctions or corrosive herbal pastes inside the vagina.',
        'Do not skip routine cervical screening even if you feel completely healthy and have no pain.'
      ]
    },
    chwActionPlan: [
      'Mobilize girls aged 9–14 for the national NPHCDA HPV vaccination campaigns at schools and PHCs.',
      'Conduct community VIA screening drives or refer women aged 30–49 to nearest General Hospital for VIA.',
      'Immediately fast-track any woman reporting postmenopausal or post-coital bleeding for gynecological speculum exam and biopsy.'
    ],
    recommendedAgeOrGroup: 'Girls aged 9–14 for vaccination; all women aged 25–65 for periodic screening',
    specialistToConsult: 'Gynecological Oncologist, Consultant Obstetrician & Gynecologist, or Certified VIA Nurse-Midwife'
  },
  {
    id: 'breast-cancer',
    name: 'Breast Cancer & Breast Neoplasms',
    localAliases: 'Cancer of the breast, Ciwon Nono, Ẹjẹẹrẹ Ọmú, Lumps in breast',
    category: 'cancers',
    categoryLabel: 'Oncology & Cancer Prevention',
    prevalenceInsight: 'The single most common malignant tumor diagnosed in Nigerian and African women, often diagnosed at late stages (Stage III/IV) due to lack of symptom awareness and fear.',
    shortSummary: 'Uncontrolled proliferation of epithelial cells lining the breast ducts or lobules, forming a palpable tumor that can metastasize to axillary lymph nodes, bones, liver, and lungs.',
    commonSymptoms: [
      'Painless, firm, or hard lump in the breast or armpit that does not go away after menstruation',
      'Noticeable change in the size, shape, or contour of one breast compared to the other',
      'Dimpling, puckering, or tethering of breast skin ("orange-peel" or peau d\'orange texture)',
      'Nipple retraction, inversion, or sudden pulling inward of the nipple',
      'Spontaneous unilateral nipple discharge, especially if blood-stained, serosanguinous, or clear',
      'Persistent scaling, eczema-like rash, or redness on the nipple or areola (Paget disease of breast)'
    ],
    redFlagEmergencySigns: [
      'Ulcerating breast mass breaking through the skin with bleeding or foul odor (fungating tumor)',
      'Hard, fixed, matted lumps in the armpit (axilla) or above the collarbone (supraclavicular)',
      'Severe unremitting bone pain, persistent dry cough, or jaundice indicating distant metastasis'
    ],
    rootCausesAndRisks: [
      'Increasing age (most cases occur after age 35–40, though aggressive forms occur in younger women in Africa)',
      'Family history of breast or ovarian cancer in first-degree relatives (BRCA1/BRCA2 gene mutations)',
      'Early menarche (starting menstruation before age 12) and late menopause (after age 55)',
      'Nulliparity (never carrying a pregnancy to term) or first pregnancy after age 30',
      'Absence or short duration of breastfeeding',
      'Postmenopausal obesity and physical inactivity (excess adipose tissue converts androgens to estrogen)',
      'Excessive alcohol consumption and tobacco use',
      'Prolonged combined Hormone Replacement Therapy (HRT) without medical oversight'
    ],
    prevention: {
      primary: [
        'Prolonged breastfeeding: Exclusive breastfeeding for 6 months and continuing up to 2 years significantly lowers lifetime estrogen exposure and reduces breast cancer risk.',
        'Regular physical exercise: 150 minutes per week of moderate-intensity exercise (e.g., brisk walking, farm work, swimming, cycling).',
        'Maintain a healthy Body Mass Index (BMI 18.5–24.9), especially after menopause.',
        'Strictly minimize or eliminate alcohol consumption and avoid all forms of tobacco.'
      ],
      screening: [
        'Monthly Breast Self-Awareness (BSE): Perform once every month, ideally 3 to 5 days after the end of your menstrual period when breasts are least tender and lumpy.',
        'Annual Clinical Breast Examination (CBE): By a trained doctor, midwife, or CHW from age 25.',
        'Breast Ultrasound: Highly valuable in women under 40 who possess dense glandular breast tissue.',
        'Diagnostic Mammography: Recommended every 1–2 years for women aged 40 to 74, or starting 10 years earlier than the youngest diagnosed first-degree relative in high-risk families.'
      ],
      lifestyleAndDiet: [
        'High-fiber traditional diet: Plenty of legumes (brown beans, cowpeas), whole grains (millet, sorghum, brown rice), and cruciferous vegetables (cabbage, garden egg leaves).',
        'Healthy polyunsaturated fats: Moderate use of palm oil, olive oil, groundnuts, and oily fish (mackerel, sardine, titus) rich in Omega-3 fatty acids.',
        'Green tea and moringa infusions rich in polyphenols and protective bioflavonoids.'
      ],
      avoidRisks: [
        'Never apply burning herbal poultices, caustic black soaps, or razor-blade scarifications to breast lumps — this drives infection and accelerates fungal tumor ulceration.',
        'Do not dismiss a hard lump because "it does not hurt" — early breast cancer is typically completely painless.'
      ]
    },
    chwActionPlan: [
      'Teach women in women groups and antenatal clinics how to perform the 5-step monthly breast self-exam.',
      'Examine any patient reporting a lump using the 3-finger pad technique.',
      'Refer any woman with a firm, non-tender lump, nipple retraction, or bloody discharge directly to the General Hospital surgical clinic within 7 days.'
    ],
    recommendedAgeOrGroup: 'Monthly self-exam from age 20; annual clinical exam from 25; mammograms from age 40',
    specialistToConsult: 'General Surgeon, Surgical Oncologist, or Breast Specialist'
  },
  {
    id: 'uterine-fibroids',
    name: 'Uterine Fibroids (Leiomyomas)',
    localAliases: 'Fibroid, Awoka, Ọmọlú, Kuran Mahaifa, Pelvic growth',
    category: 'uterine_ovarian',
    categoryLabel: 'Uterus & Reproductive Health',
    prevalenceInsight: 'Disproportionately affects women of African descent; up to 70–80% of Black women develop uterine fibroids by age 50. Leading cause of severe anemia and gynecological hospitalizations in West Africa.',
    shortSummary: 'Non-cancerous (benign) monoclonal tumors originating from the smooth muscle layer of the uterus (myometrium), responsive to estrogen and progesterone.',
    commonSymptoms: [
      'Menorrhagia: Abnormally heavy menstrual bleeding, passing large blood clots, soaking through multiple sanitary pads hourly',
      'Prolonged menstrual bleeding lasting longer than 7 to 10 days',
      'Deep, constant pelvic heaviness, lower abdominal fullness, or visible lower belly enlargement resembling pregnancy',
      'Chronic severe fatigue, lightheadedness, pale palms/conjunctiva, and shortness of breath (Iron Deficiency Anemia)',
      'Frequent urination or nocturia caused by fibroid compression on the urinary bladder',
      'Chronic constipation or rectal fullness caused by posterior fibroids pressing against the bowel',
      'Dyspareunia: Pain during sexual intercourse'
    ],
    redFlagEmergencySigns: [
      'Acute severe agonizing lower abdominal pain with vomiting and low-grade fever (Red Degeneration of fibroid during pregnancy, or torsion of pedunculated fibroid)',
      'Severe hemorrhaging causing syncopal collapse, pulse over 110 bpm, or hemoglobin below 6 g/dL'
    ],
    rootCausesAndRisks: [
      'Genetic predisposition: Familial clustering and high prevalence among women of African heritage',
      'Hormonal sensitivity: Excessive or prolonged exposure to estrogen and progesterone stimulation',
      'Early menarche (starting periods before age 11)',
      'Nulliparity (fibroid growth accelerates during uninterrupted menstrual cycling without pregnancy/lactation pauses)',
      'Vitamin D deficiency (very prevalent even in sunny climates due to skin pigmentation and indoor work)',
      'Obesity and high-fat ultra-processed diets promoting hyperestrogenism'
    ],
    prevention: {
      primary: [
        'Maintain healthy weight: Adipose tissue produces extra circulating estrogens that fuel fibroid growth.',
        'Optimal Vitamin D status: Regular safe morning sunlight exposure and dietary repletion (studies show Vitamin D inhibits myometrial cell proliferation).',
        'Balanced reproductive intervals: Childbearing and breastfeeding provide physiological breaks from estrogen-dominant cycling.'
      ],
      screening: [
        'Pelvic Bimanual Examination: Done by a doctor or midwife during routine health visits.',
        'Pelvic Ultrasound (Transabdominal and Transvaginal): Gold standard, non-invasive imaging that accurately locates and sizes intramural, submucosal, and subserosal fibroids.',
        'Baseline Hemoglobin / Complete Blood Count (CBC): To detect silent iron-deficiency anemia before severe symptoms occur.'
      ],
      lifestyleAndDiet: [
        'High-iron indigenous foods: Ugwu juice (cooked pumpkin leaves), cow liver, chicken eggs, crayfish, beans, and moringa to replenish hemoglobin.',
        'Citrus fruits (oranges, lemons) taken alongside plant iron to double non-heme iron absorption.',
        'Cruciferous vegetables: Cabbage, broccoli, and garden egg leaves support the liver in metabolizing excess estrogens.',
        'Avoid excess red meat, fried meat, and ultra-processed canned foods which are correlated with higher fibroid incidence.'
      ],
      avoidRisks: [
        'Do not take unverified herbal "fibroid flusher" or "fibroid melting" concoctions sold by roadside vendors — these frequently cause acute kidney injury, liver failure, or catastrophic bleeding.',
        'Never ignore chronic tiredness or pale eyes; treat anemia promptly with prescribed iron-folic acid supplements.'
      ]
    },
    chwActionPlan: [
      'Screen all women with heavy bleeding for anemia (pale tongue, pale conjunctiva, nail bed pallor).',
      'Prescribe oral Ferrous Sulfate 200mg + Folic Acid 5mg daily for symptomatic bleeding while awaiting scan.',
      'Refer patients with palpable pelvic masses or severe menorrhagia to the nearest General Hospital Ob/Gyn clinic.'
    ],
    recommendedAgeOrGroup: 'Women of reproductive age (20–45 years old)',
    specialistToConsult: 'Consultant Obstetrician & Gynecologist'
  },
  {
    id: 'pelvic-inflammatory-disease',
    name: 'Pelvic Inflammatory Disease (PID) & STIs',
    localAliases: 'PID, Pelvic infection, Ọ̀rá Inú, Ciwon Sanyi na Mata, Dirty womb infection',
    category: 'infections',
    categoryLabel: 'Infections & Reproductive Safety',
    prevalenceInsight: 'One of the leading preventable causes of secondary tubal infertility, ectopic pregnancy, and chronic pelvic pain in developing nations. Often undertreated due to social stigma.',
    shortSummary: 'Infection of the upper female genital tract (endometrium, fallopian tubes, ovaries, and pelvic peritoneum) resulting from the ascending spread of microorganisms from the cervix and vagina.',
    commonSymptoms: [
      'Persistent dull, aching pain in both lower abdominal quadrants or suprapubic region',
      'Abnormal, heavy, yellowish or greenish, foul-smelling vaginal discharge',
      'Dyspareunia (pain felt deep inside during sexual intercourse)',
      'Intermenstrual bleeding (spotting between regular cycles) or bleeding after sex',
      'Fever, chills, shivering, or generalized bodily malaise',
      'Dysuria: Burning or painful sensation when passing urine'
    ],
    redFlagEmergencySigns: [
      'High spiking fever ({">"}38.5°C) with rigid, tender lower abdomen, guarding, and rebound tenderness (Tubo-ovarian Abscess rupture or generalized peritonitis)',
      'Sudden excruciating unilateral lower pelvic pain with dizziness and pallor (Ruptured Ectopic Pregnancy, a direct consequence of past tubal PID)'
    ],
    rootCausesAndRisks: [
      'Untreated Sexually Transmitted Infections: Chlamydia trachomatis and Neisseria gonorrhoeae account for over 50% of cases',
      'Ascending endogenous vaginal organisms: Mycoplasma genitalium, Gardnerella vaginalis, enteric bacteria',
      'Vaginal Douching: Flushing water, antiseptic soaps, vinegar, or alum washes into the vagina forces bacteria past the cervix into the fallopian tubes',
      'Unsterile intra-uterine procedures: Unsafe abortion, unsterile IUD insertion, or septic instrumentation',
      'Having multiple sexual partners or an untreated symptomatic partner'
    ],
    prevention: {
      primary: [
        'Strict Avoidance of Vaginal Douching: The vagina is a self-cleaning organ. Wash only the outside vulva with plain warm water. Never wash inside the vaginal canal.',
        'Consistent and correct condom use during all sexual encounters.',
        'Simultaneous Partner Treatment: Both partners MUST be treated with appropriate antibiotics concurrently to prevent "ping-pong" reinfection.',
        'Complete the full prescribed antibiotic course — never stop when symptoms temporarily improve after 2 days.'
      ],
      screening: [
        'Routine STI screening (Chlamydia/Gonorrhea NAAT or rapid swab) for sexually active women under 25 and women with new partners.',
        'Speculum examination with cervical discharge microscopy and wet mount.',
        'High Vaginal Swab (HVS) and Endocervical Swab culture and sensitivity.'
      ],
      lifestyleAndDiet: [
        'Hydration: Drink 2.5 to 3 liters of clean water daily to flush the urinary and genital tracts.',
        'Wear loose, breathable 100% cotton underwear; avoid nylon and damp synthetic undergarments.',
        'Wipe strictly from front to back after using the toilet to prevent fecal bacteria from contaminating the vaginal introitus.',
        'Nutrient-rich diet with garlic, onions, ginger, and fermented yogurt to support healthy microflora.'
      ],
      avoidRisks: [
        'Never insert herbal sticks, crushed camphor, alum, or battery acids into the vagina.',
        'Never self-medicate with single-dose over-the-counter antibiotics from informal chemist shops without a full syndromic PID regimen.'
      ]
    },
    chwActionPlan: [
      'Implement standard WHO/FMOH Syndromic Management of PID immediately: Ceftriaxone 500mg IM single dose + Doxycycline 100mg orally twice daily for 14 days + Metronidazole 400mg twice daily for 14 days.',
      'Provide partner notification and treatment package.',
      'Check for pregnancy in every woman with lower abdominal pain to exclude ectopic pregnancy.'
    ],
    recommendedAgeOrGroup: 'Sexually active women aged 15–40',
    specialistToConsult: 'Gynecologist, STI Clinic Doctor, or Reproductive Health Clinician'
  },
  {
    id: 'pcos',
    name: 'Polycystic Ovary Syndrome (PCOS)',
    localAliases: 'PCOS, Hormonal imbalance, Ovarian cysts, Irregular menses with weight gain',
    category: 'uterine_ovarian',
    categoryLabel: 'Endocrine & Metabolic Health',
    prevalenceInsight: 'Affects 8% to 13% of women of reproductive age worldwide. Up to 70% of affected women remain undiagnosed in Africa.',
    shortSummary: 'A complex endocrine and metabolic disorder characterized by anovulation or oligovulation, hyperandrogenism (excess male hormones), and characteristic polycystic ovarian morphology.',
    commonSymptoms: [
      'Oligomenorrhea or Amenorrhea: Infrequent, irregular, or completely absent menstrual periods',
      'Hirsutism: Excess dark, coarse hair growth on the chin, upper lip, chest, belly, or back',
      'Severe, persistent facial and cystic acne resistant to standard topical skincare',
      'Androgenetic Alopecia: Thinning of hair or hair loss at the scalp crown',
      'Difficulty achieving pregnancy (anovulatory subfertility)',
      'Unexplained weight gain or extreme difficulty losing weight, particularly around the abdomen',
      'Acanthosis Nigricans: Velvety, dark, thickened skin patches in body folds (neck creases, armpits, groin) signifying severe insulin resistance'
    ],
    redFlagEmergencySigns: [
      'Severe sudden pelvic pain following intercourse or exercise (Rupture or torsion of an enlarged follicular cyst)',
      'Prolonged continuous heavy bleeding lasting weeks after months of no periods (Risk of Endometrial Hyperplasia)'
    ],
    rootCausesAndRisks: [
      'Insulin Resistance: Elevated circulating insulin stimulates the ovarian theca cells to produce excessive androgens and suppresses SHBG',
      'Low-grade chronic systemic inflammation',
      'Genetic predisposition and epigenetic alterations',
      'High-glycemic modern refined diets (white flour, sugary drinks, instant noodles, ultra-refined seed oils)',
      'Sedentary lifestyle and chronic mental stress elevating cortisol'
    ],
    prevention: {
      primary: [
        'Dietary Glycemic Control: Replace refined carbohydrates with whole traditional fiber: unripe plantain, beans, guinea corn (sorghum), brown millet, and leafy greens.',
        'Daily Physical Activity: At least 30 to 45 minutes of brisk walking, resistance exercises, or dancing daily to restore muscle insulin sensitivity.',
        'Targeted Weight Management: Even a modest 5% to 10% reduction in body weight restores regular ovulatory menstrual cycles in over 60% of overweight women with PCOS.',
        'Stress Regulation and Sleep Hygiene: Aim for 7–8 hours of restorative sleep to balance cortisol and insulin levels.'
      ],
      screening: [
        'Rotterdam Criteria Clinical Assessment (Requires 2 out of 3: irregular ovulation, clinical/biochemical hyperandrogenism, polycystic ovaries on ultrasound).',
        'Fasting Blood Glucose and Fasting Insulin (or HbA1c) to screen for prediabetes/diabetes.',
        'Lipid Profile (cholesterol, triglycerides) and Thyroid Function Tests (TSH) to exclude hypothyroidism.',
        'Pelvic Ultrasound to assess ovarian volume and antral follicle count ("string of pearls" sign).'
      ],
      lifestyleAndDiet: [
        'African PCOS Superfoods: Unripe plantain flour (rich in resistant starch), Nigerian brown beans, groundnut soup in moderation, fresh bitter leaf, garlic, and cinnamon tea.',
        'Adequate Omega-3 fatty acids: Mackerel (titus), sardines, flaxseed, and walnuts to dampen systemic inflammation.',
        'Spearmint tea (proven in clinical trials to exert mild anti-androgenic effects reducing facial hair).'
      ],
      avoidRisks: [
        'Avoid sugary carbonated soft drinks, commercial malt drinks, refined pastries, and white sugar.',
        'Do not take random "fertility roots" soaked in gin or schnapps, which worsen liver insulin clearance.'
      ]
    },
    chwActionPlan: [
      'Screen young women with irregular periods for acanthosis nigricans on the back of the neck and facial hirsutism.',
      'Counsel on local low-GI nutrition and prescribe an exercise regimen.',
      'Refer to physician for metformin initiation where insulin resistance is marked, or for ovulation induction when pregnancy is desired.'
    ],
    recommendedAgeOrGroup: 'Adolescent girls and women of childbearing age (15–40)',
    specialistToConsult: 'Reproductive Endocrinologist, Gynecologist, or Metabolic Physician'
  },
  {
    id: 'endometriosis',
    name: 'Endometriosis & Adenomyosis',
    localAliases: 'Crippling period pain, Severe menstrual cramps, Menstrual sickness',
    category: 'uterine_ovarian',
    categoryLabel: 'Uterus & Reproductive Health',
    prevalenceInsight: 'Affects roughly 1 in 10 women globally. Diagnosis is delayed by an average of 7 to 10 years because excruciating menstrual pain is falsely dismissed as a woman\'s natural lot.',
    shortSummary: 'A chronic inflammatory disease in which tissue resembling the endometrium (lining of the womb) grows outside the uterus (ovaries, fallopian tubes, peritoneum, bowel, bladder), causing chronic inflammation, scarring, adhesions, and severe pain.',
    commonSymptoms: [
      'Severe, debilitating dysmenorrhea (period cramps) that stops school, work, or daily living, often unresponsive to regular painkillers',
      'Chronic non-cyclical pelvic pain lasting longer than 6 months',
      'Deep dyspareunia (sharp or deep pain during or after sexual intercourse)',
      'Dyschezia: Painful bowel movements or rectal spasms, particularly during menstruation',
      'Dysuria: Painful urination or cyclic hematuria (blood in urine during periods)',
      'Subfertility or recurrent difficulty conceiving due to pelvic adhesions and blocked tubes',
      'Chronic fatigue, nausea, bloating, and cyclic diarrhea during menstrual flow'
    ],
    redFlagEmergencySigns: [
      'Acute, sudden severe lower abdominal peritonism from a ruptured endometrioma (chocolate cyst of the ovary)',
      'Intestinal obstruction or severe rectal bleeding caused by deep infiltrating bowel endometriosis'
    ],
    rootCausesAndRisks: [
      'Retrograde menstruation (menstrual blood containing endometrial cells flowing backwards through fallopian tubes into pelvic cavity)',
      'Cellular metaplasia of peritoneal cells under hormonal or inflammatory stimuli',
      'Altered immune clearance failing to eliminate ectopic endometrial cells',
      'Genetic factors: 7-fold higher risk if mother or sister is affected'
    ],
    prevention: {
      primary: [
        'Early recognition: Excruciating period pain that causes vomiting, fainting, or missing school is NOT normal. Early clinical intervention prevents progression of severe pelvic adhesions.',
        'Hormonal suppression: Continuous oral contraceptive pills or progestins to reduce retrograde menstruation and suppress ectopic tissue growth.',
        'Anti-inflammatory lifestyle: Minimizing pro-inflammatory foods and environmental toxins.'
      ],
      screening: [
        'Specialized Transvaginal / Transrectal Ultrasound: To detect ovarian endometriomas ("ground glass" appearance) and deep infiltrating nodules in the pouch of Douglas.',
        'Pelvic MRI: High-resolution evaluation for adenomyosis and deep retrocervical endometriosis.',
        'Diagnostic Laparoscopy with Biopsy: Gold standard for definitive visual inspection and histologic confirmation.'
      ],
      lifestyleAndDiet: [
        'Anti-inflammatory indigenous foods: Fresh turmeric, ginger root, garlic, moringa leaf, and leafy vegetables.',
        'Abundant dietary magnesium: Pumpkin seeds, whole cowpeas, sesame seeds (magnesium relaxes uterine smooth muscle and eases spasmodic cramping).',
        'Omega-3 rich fish (mackerel, titus, cat fish) to suppress inflammatory prostaglandins (PGF2a).',
        'Apply a warm water bottle or hot compress over the suprapubic area during periods.'
      ],
      avoidRisks: [
        'Avoid dismissing young girls\' severe menstrual cramps as "laziness" or "spiritual manipulation".',
        'Avoid high-dairy and high-trans-fat diets that stimulate inflammatory prostaglandin cascades.'
      ]
    },
    chwActionPlan: [
      'Identify girls and women who miss work or school monthly due to period pain.',
      'Start scheduled NSAIDs (e.g., Ibuprofen 400mg with food or Mefenamic Acid 500mg) 1–2 days BEFORE menstrual flow begins, rather than waiting for pain to peak.',
      'Refer to Gynecologist for hormonal management (combined pills, progesterone, or Mirena IUD).'
    ],
    recommendedAgeOrGroup: 'Menstruating girls and women from menarche through menopause',
    specialistToConsult: 'Consultant Gynecologist, Laparoscopic Surgeon, or Endometriosis Specialist'
  },
  {
    id: 'preeclampsia',
    name: 'Preeclampsia & Gestational Hypertension',
    localAliases: 'Pregnancy high blood pressure, Fits in pregnancy, Ẹ̀jẹ̀ ríru nígbà oyún, Hawan jini mai ciki',
    category: 'obstetric',
    categoryLabel: 'Obstetrics & Pregnancy Complications',
    prevalenceInsight: 'One of the top three direct causes of maternal and perinatal mortality across Nigeria and West Africa. Can progress silently to fatal eclamptic convulsions if blood pressure is unmonitored.',
    shortSummary: 'A multi-system progressive pregnancy disorder characterized by new-onset hypertension (systolic BP ≥140 mmHg or diastolic BP ≥90 mmHg) occurring after 20 weeks of gestation, accompanied by proteinuria or maternal organ dysfunction.',
    commonSymptoms: [
      'Persistent, throbbing frontal headache that fails to respond to ordinary paracetamol',
      'Visual disturbances: Blurred vision, flashing lights, seeing floaters, or temporary blindness (scotomata)',
      'Epigastric or right upper quadrant abdominal pain (liver capsule distension/ischemia)',
      'Sudden, rapid swelling (edema) of the face, hands, and eyelids (distinguished from normal ankle edema of late pregnancy)',
      'Nausea, vomiting, and shortness of breath (pulmonary edema)'
    ],
    redFlagEmergencySigns: [
      'Eclampsia: Generalized tonic-clonic convulsions or sudden loss of consciousness in a pregnant or recently delivered woman',
      'Systolic BP ≥160 mmHg or Diastolic BP ≥110 mmHg (Hypertensive emergency carrying imminent stroke risk)',
      'Vaginal bleeding with a wooden-hard, painful uterus (Abruptio Placentae / placental detachment)'
    ],
    rootCausesAndRisks: [
      'Defective remodeling of maternal spiral arteries by extravillous trophoblasts during early placentation',
      'First pregnancy (nulliparity) or pregnancy with a new sexual partner',
      'Extremes of maternal age: Adolescents under 18 and women over 35',
      'Pre-existing medical conditions: Chronic hypertension, renal disease, pre-gestational diabetes, autoimmune lupus',
      'Multiple pregnancy (carrying twins, triplets)',
      'Obesity (BMI ≥30) and personal or family history of preeclampsia'
    ],
    prevention: {
      primary: [
        'Early Antenatal Care (ANC) Booking: Registering at a primary health clinic before 12 weeks of pregnancy.',
        'Low-Dose Aspirin Prophylaxis: 75 mg to 150 mg of soluble aspirin daily started between 12 and 16 weeks of gestation and continued until 36 weeks for women at moderate-to-high risk (reduces risk by over 50%).',
        'Calcium Supplementation: 1.5 g to 2.0 g elemental calcium daily throughout pregnancy in populations with low dietary calcium intake (routine WHO guideline for Nigeria).',
        'Routine BP Measurement at every single contact with health personnel using an appropriately sized arm cuff.'
      ],
      screening: [
        'Blood Pressure Monitoring: Both systolic and diastolic recorded at every ANC visit.',
        'Urine Dipstick for Proteinuria: Trace, 1+, 2+, 3+ protein assessed at every routine visit.',
        'Uterine Artery Doppler Ultrasound at 20–24 weeks to assess resistive index and bilateral notches where available.',
        'Full Blood Count (platelets), Serum Creatinine, and Liver Enzymes (ALT/AST) to detect HELLP syndrome.'
      ],
      lifestyleAndDiet: [
        'Adequate dietary calcium: Crayfish powder, bone broth, green leafy vegetables (ewedu, ugwu, waterleaf), fortified dairy, and small whole fish with bones.',
        'Optimal maternal hydration and avoiding severe dehydration in hot climates.',
        'Rest in the left lateral decubitus position during the third trimester to maximize uteroplacental blood flow.'
      ],
      avoidRisks: [
        'Never restrict salt drastically or take diuretic water pills in pregnancy without medical instruction — it reduces placental perfusion.',
        'Never use herbal concoctions (e.g. agbo) to "wash" pregnancy blood pressure — many are nephrotoxic.'
      ]
    },
    chwActionPlan: [
      'Check BP on every pregnant woman at every home visit or clinic consultation.',
      'If BP is ≥140/90 mmHg: test urine protein immediately with dipstick.',
      'If BP ≥160/110 or woman has headache/visual changes/epigastric pain: Administer loading dose of Magnesium Sulfate (4g IV + 10g IM as 5g in each buttock) according to national protocol, give oral Nifedipine 10mg, and refer immediately via emergency transport.'
    ],
    recommendedAgeOrGroup: 'All pregnant women from 20 weeks gestation through 6 weeks postpartum',
    specialistToConsult: 'Obstetrician, Maternal-Fetal Medicine Specialist, or Emergency Medical Officer'
  },
  {
    id: 'obstetric-fistula',
    name: 'Obstetric Fistula (VVF / RVF)',
    localAliases: 'Vesicovaginal Fistula, Rectovaginal Fistula, Yoyon Fitsari, Tsagewar fitsari, Urine leakage after birth',
    category: 'obstetric',
    categoryLabel: 'Obstetrics & Childbirth Complications',
    prevalenceInsight: 'Nigeria carries the highest burden of obstetric fistula in the world, with over 150,000 women living with the condition and 12,000 new cases annually. A tragic, 100% preventable marker of health inequality.',
    shortSummary: 'An abnormal opening or communication between a woman\'s vagina and bladder (Vesicovaginal Fistula - VVF) or rectum (Rectovaginal Fistula - RVF), resulting from prolonged, unrelieved obstructed labor causing pressure necrosis of pelvic soft tissues.',
    commonSymptoms: [
      'Continuous, involuntary, uncontrollable leakage of urine from the vagina, day and night',
      'Involuntary passage of stool or flatus through the vagina (in RVF)',
      'Severe, painful ammoniacal dermatitis: Excoriation, ulceration, and burning rashes on vulva, perineum, and inner thighs',
      'Strong, persistent urine odor leading to profound social stigma, marital abandonment, and depression',
      'Amenorrhea (loss of periods) and secondary infertility due to Sheehan syndrome or pelvic scarring',
      'Foot drop (peroneal nerve injury) caused by compression during prolonged labor in deep squatting or pelvic entrapment'
    ],
    redFlagEmergencySigns: [
      'Obstructed labor lasting {">"}12 hours: Active labor without progress, maternal exhaustion, dehydration, Bandl ring',
      'Severe ascending urinary tract infection with high fever, rigors, and renal tenderness'
    ],
    rootCausesAndRisks: [
      'Prolonged Obstructed Labor: Labor lasting 2 to 5 days without access to emergency Cesarean section; the fetal head becomes impacted against maternal pelvic bones, cutting off blood supply to the bladder neck and rectum',
      'Early Child Marriage and Adolescent Pregnancy: Undeveloped, small, immature gynecoid pelvis incapable of accommodating delivery',
      'Female Genital Mutilation / Cutting (FGM/C): Dense scar tissue causing inelastic pelvic outlet and labor dystocia',
      'Delay in seeking, reaching, and receiving emergency obstetric care (The Three Delays model)',
      'Delivery by unskilled traditional birth attendants (TBAs) in prayer houses or home settings'
    ],
    prevention: {
      primary: [
        'Zero Tolerance for Early Child Marriage: Delaying marriage and first pregnancy until at least age 18 to 20 when pelvic bony architecture has fully matured.',
        'Elimination of FGM/C: Protecting girls from all forms of genital cutting and scarification.',
        'Skilled Birth Attendance: Every woman must give birth under the care of a skilled midwife or doctor equipped with a WHO Partograph to track labor progress.',
        'Universal Access to CEmONC: Rapid referral and Cesarean delivery when labor is obstructed or fails to progress beyond partograph alert lines.'
      ],
      screening: [
        'Postpartum Speculum and Dye Test: Instillation of diluted methylene blue into the bladder with vaginal swabs to detect small fistulas immediately after traumatic birth.',
        'Continuous Catheter Drainage: If a prolonged obstructed labor occurs, keeping a Foley catheter on continuous free drainage for 14 to 21 days immediately postpartum can allow small necrotic tears to heal spontaneously without surgery.'
      ],
      lifestyleAndDiet: [
        'High-protein nutrition (eggs, beans, fish, milk) and hydration to support tissue healing and reduce urine concentration.',
        'Diligent perineal hygiene: Wash vulva with mild boiled water, pat dry, and apply zinc oxide or petroleum jelly barrier cream to soothe ammoniacal skin burns.'
      ],
      avoidRisks: [
        'Never allow labor to drag on at home or prayer houses beyond 12 hours without progress.',
        'Do not hide or lock up women leaking urine — fistula is curable through reconstructive surgery!'
      ]
    },
    chwActionPlan: [
      'Educate community elders, mothers-in-law, and religious leaders against prolonging labor outside health facilities.',
      'Identify women living in isolation with urine leakage and register them for free surgical repair campaigns at National Fistula Centers (e.g. Babbar Ruga Katsina, Ningi Bauchi, Abakaliki Ebonyi, Sokoto, Kwara).',
      'Provide psychosocial support and economic reintegration counseling.'
    ],
    recommendedAgeOrGroup: 'Women who have experienced prolonged obstructed labor or difficult deliveries',
    specialistToConsult: 'Fistula Surgeon, Urogynecologist, or Consultant Gynecologist'
  },
  {
    id: 'uterine-prolapse',
    name: 'Uterine Prolapse & Pelvic Organ Prolapse (POP)',
    localAliases: 'Womb falling out, Dropped womb, Isubu ile-omo, Fitowar mahaifa, Pelvic heaviness',
    category: 'pelvic_midlife',
    categoryLabel: 'Pelvic Floor & Midlife Health',
    prevalenceInsight: 'High prevalence among multiparous rural women in developing countries due to repeated home childbirth, lack of postnatal rest, heavy agrarian farm labor, and chronic malnutrition.',
    shortSummary: 'Herniation or downward descent of the uterus, bladder (cystocele), or rectum (rectocele) into or through the vaginal canal due to weakness and stretching of the pelvic floor muscles, cardinal ligaments, and uterosacral ligaments.',
    commonSymptoms: [
      'Sensation of a lump, ball, or bulging tissue protruding from the vaginal opening',
      'Chronic heaviness, dragging sensation, or dull ache in the lower abdomen, groin, and lower back, especially worse after standing all day',
      'Urinary stress incontinence: Involuntary leakage of urine when coughing, laughing, sneezing, or lifting heavy loads',
      'Difficulty emptying the bladder: Needing to manually push up the vaginal bulge with fingers to initiate or complete urination ("splinting")',
      'Difficulty having bowel movements or incomplete rectal emptying without manual support',
      'Friction, ulceration, bleeding, and discharge on the exposed protruding vaginal mass'
    ],
    redFlagEmergencySigns: [
      'Complete procidentia with strangulation, severe ulceration, infection, and bleeding of the exposed cervix',
      'Acute urinary retention (inability to pass urine at all) causing severe suprapubic distension'
    ],
    rootCausesAndRisks: [
      'Multiparity: Bearing multiple children (high birth count)',
      'Traumatic, prolonged vaginal deliveries with unrepaired third- or fourth-degree perineal tears',
      'Pushing before the cervix is fully dilated (common when unsupervised or coached incorrectly by unskilled attendants)',
      'Resuming heavy manual labor (carrying heavy firewood, water jerrycans on head, farm tilling) within days of childbirth',
      'Menopausal estrogen deficiency causing atrophy of supportive pelvic connective tissues',
      'Chronic intra-abdominal pressure: Chronic coughing (TB, biomass smoke), chronic constipation, or heavy lifting'
    ],
    prevention: {
      primary: [
        'Pelvic Floor Muscle Training (Kegel Exercises): Practice daily during pregnancy and throughout life to strengthen the levator ani muscle group.',
        'Strict Postpartum Rest (Puerperal Convalescence): Refrain from heavy lifting, carrying water basins, or intensive farm work for at least 6 weeks postpartum.',
        'Skilled Labor Management: Preventing premature maternal pushing before 10 cm cervical dilation and timely repair of perineal tears.',
        'Prompt treatment of chronic coughs and prevention of chronic constipation by eating high-fiber foods.'
      ],
      screening: [
        'Pelvic Examination (Sims speculum examination in left lateral position) using the Pelvic Organ Prolapse Quantification (POP-Q) staging system.',
        'Assessment of pelvic floor contraction strength during digital examination.'
      ],
      lifestyleAndDiet: [
        'Kegel Protocol: Contract pelvic floor as if stopping the stream of urine, hold for 5 seconds, release for 5 seconds; repeat 10 times, 3 sessions daily.',
        'High-fiber diet: Plenty of water, pawpaw, mangoes, beans, and vegetables to ensure soft, effortless bowel movements without straining.',
        'Maintain a healthy weight to reduce chronic downward load on the pelvic diaphragm.'
      ],
      avoidRisks: [
        'Do not push during labor until the skilled midwife confirms the womb mouth is completely open.',
        'Avoid carrying heavy loads on the head or bending for prolonged hours immediately after giving birth.'
      ]
    },
    chwActionPlan: [
      'Teach women how to correctly perform Kegel pelvic floor exercises in women\'s community circles.',
      'Fitted Ring Pessary: For older or frail women who cannot undergo surgery, a silicone ring pessary inserted by a trained clinician provides immediate, safe relief.',
      'Refer women with Stage III/IV prolapse to the Ob/Gyn unit for surgical repair (vaginal hysterectomy with pelvic floor repair or sacrocolpopexy).'
    ],
    recommendedAgeOrGroup: 'Multiparous women, postpartum mothers, and menopausal women',
    specialistToConsult: 'Urogynecologist or Consultant Gynecologist'
  },
  {
    id: 'osteoporosis',
    name: 'Osteoporosis & Postmenopausal Fragility',
    localAliases: 'Weak bones, Brittle bones, Ciwon kashi na tsofaffi, Eegun rirọ, Stooped back in elder women',
    category: 'pelvic_midlife',
    categoryLabel: 'Pelvic Floor & Midlife Health',
    prevalenceInsight: 'Often called the "silent thief" because bone loss occurs without any pain until a sudden fracture occurs. 1 in 3 women over age 50 will experience an osteoporotic fracture.',
    shortSummary: 'A systemic skeletal disease characterized by low bone mineral density (BMD) and microarchitectural deterioration of bone tissue, leading to enhanced bone fragility and a consequent increase in fracture risk (particularly hip, spine, and wrist).',
    commonSymptoms: [
      'Typically completely asymptomatic ("silent") until a fracture occurs from a minor fall or even a cough',
      'Loss of height over time (shrinking by 2 to 5 cm or more)',
      'Development of a stooped, hunched forward posture ("widow\'s hump" or dorsal kyphosis)',
      'Severe, sudden back pain caused by collapsed or fractured thoracic/lumbar vertebrae',
      'Difficulty standing up straight or getting up from low stools'
    ],
    redFlagEmergencySigns: [
      'Inability to bear weight on a leg after a minor stumble with groin pain and shortened, externally rotated leg (Hip Fracture — medical emergency requiring immediate surgical fixation to prevent fatal immobilization complications)'
    ],
    rootCausesAndRisks: [
      'Estrogen Deficiency: The sharp drop in circulating estrogens during perimenopause and menopause dramatically accelerates osteoclastic bone resorption',
      'Inadequate lifetime calcium and vitamin D intake',
      'Sedentary lifestyle: Lack of mechanical weight-bearing stress on bones',
      'Early surgical menopause (bilateral oophorectomy before age 45)',
      'Underweight (BMI <19) with low bone reserve',
      'Prolonged corticosteroid use, excessive caffeine, tobacco smoking, and heavy alcohol consumption'
    ],
    prevention: {
      primary: [
        'Regular Weight-Bearing and Resistance Exercise: Brisk walking, climbing stairs, dancing, carrying light hand weights, and gardening stimulate osteoblast bone formation.',
        'Lifelong Calcium Nutrition: Ensuring adequate calcium intake throughout youth and midlife (1,200 mg daily for postmenopausal women).',
        'Daily Sunlight Exposure: 15–20 minutes of mid-morning sunlight without sunscreen on face and arms generates natural Vitamin D3.',
        'Home Fall Prevention: Clearing loose rugs, ensuring good home lighting, removing clutter, and using supportive walking sticks if balance is unsteady.'
      ],
      screening: [
        'Dual-Energy X-ray Absorptiometry (DEXA Scan): Gold standard test measuring Bone Mineral Density at femoral neck and lumbar spine (T-score ≤ -2.5 defines osteoporosis).',
        'FRAX Tool (Fracture Risk Assessment Tool): Validated online clinical calculator predicting 10-year probability of major osteoporotic fracture.'
      ],
      lifestyleAndDiet: [
        'African Calcium Superfoods: Ground crayfish and dagaa/omena (eating whole small fish with soft bones), sesame seeds (benniseed), cowpeas, soybeans, baobab fruit pulp, and leafy dark greens (ewedu, moringa).',
        'Adequate Dietary Protein: Crucial for maintaining skeletal muscle mass (sarcopenia prevention) to stabilize balance and joints.',
        'Eliminate tobacco and limit carbonated cola drinks which leach bone calcium.'
      ],
      avoidRisks: [
        'Never walk in dark corridors or on wet, slippery floor tiles without handrails.',
        'Do not take high-dose unprescribed steroids or traditional pain mixtures that contain undisclosed dexamethasone.'
      ]
    },
    chwActionPlan: [
      'Conduct fall-hazard checks in homes of elderly community matriarchs.',
      'Advise all women over 45 to incorporate ground crayfish and moringa into daily cooking.',
      'Refer women with suspected fragility fractures or severe kyphosis to orthopedic and geriatric clinics for bisphosphonate therapy.'
    ],
    recommendedAgeOrGroup: 'Women aged 45 and above, particularly postmenopausal women',
    specialistToConsult: 'Orthopedic Surgeon, Rheumatologist, or Geriatrician'
  },
  {
    id: 'postpartum-sepsis',
    name: 'Postpartum Sepsis & Endometritis',
    localAliases: 'Childbed fever, Infection after birth, Zazzabin haihuwa, Ibà lẹ́yìn ibimọ, Puerperal sepsis',
    category: 'obstetric',
    categoryLabel: 'Obstetrics & Childbirth Complications',
    prevalenceInsight: 'Accounts for over 10% of all maternal deaths in Sub-Saharan Africa. The vast majority of cases arise from unhygienic birth conditions, unsterile cord care, or prolonged rupture of membranes.',
    shortSummary: 'Severe bacterial infection of the genital tract occurring at any time between the onset of rupture of membranes or labor, and the 42nd day postpartum, marked by fever and systemic inflammatory response.',
    commonSymptoms: [
      'Fever (temperature ≥38.0°C / 100.4°F) occurring after the first 24 hours of childbirth',
      'Lochia with a foul, offensive odor (smelly afterbirth discharge)',
      'Subinvolution of the uterus: The womb remains soft, large, and boggy rather than contracting firmly into the pelvis',
      'Persistent lower abdominal tenderness and pain on touching the womb',
      'Persistent tachycardia (fast pulse {">"}100 bpm), chills, shivering, and generalized weakness'
    ],
    redFlagEmergencySigns: [
      'Septic Shock: Systolic BP <90 mmHg, altered mental state/confusion, cold clammy extremities, rapid shallow breathing ({">"}22/min), and oliguria',
      'Generalized peritonitis: Rigid, board-like abdomen with severe rebound tenderness'
    ],
    rootCausesAndRisks: [
      'Prolonged rupture of amniotic membranes ({">"}18 hours before delivery)',
      'Multiple unsterile digital vaginal examinations during labor',
      'Retained placental fragments, cotyledons, or membranes',
      'Unsterile delivery instruments, unwashed hands, or birth on contaminated dirt floors',
      'Pre-existing maternal anemia and untreated lower genital tract infections (Chlamydia, GBS, BV)',
      'Unsafe instrumental delivery or cesarean wound contamination'
    ],
    prevention: {
      primary: [
        'Clean Birth Practices (The 6 Cleans of WHO): Clean hands, clean surface, clean cord blade, clean cord tie, clean cloth to wrap baby, clean perineum.',
        'Use of pre-packaged sterile Mama Delivery Kits containing soap, sterile gloves, plastic sheet, sterile scalpel, and cord clamps.',
        'Strict limitation of vaginal examinations in labor to once every 4 hours, performed with sterile gloves.',
        'Active prophylactic antibiotics in women with premature rupture of membranes {">"}18 hours or manual removal of placenta.'
      ],
      screening: [
        'Vital Signs Monitoring: Check temperature, blood pressure, and pulse at 6 hours, 24 hours, day 3, and day 7 postpartum.',
        'Abdominal palpation for uterine height, firmness, and tenderness.',
        'High Vaginal Swab and Blood Cultures before starting IV antibiotics.'
      ],
      lifestyleAndDiet: [
        'Perineal hygiene: Clean the vulva with clean boiled water after every urination and bowel movement; change sanitary pads frequently.',
        'Rest, hydration, and nutrient-dense broths (chicken pepper soup, fish pepper soup with uziza, uda seeds) to support white blood cell production.',
        'Early initiation of exclusive breastfeeding (promotes endogenous oxytocin release, contracting the uterus and expelling blood clots).'
      ],
      avoidRisks: [
        'Never insert cow dung, hot sand, herbal pastes, or ash into the birth canal or on tears after birth.',
        'Never ignore a fever in a newly delivered mother as "normal post-delivery warmth".'
      ]
    },
    chwActionPlan: [
      'Any woman within 42 days of delivery with fever ≥38°C and foul lochia must be treated as an obstetric emergency.',
      'Initiate first dose of broad-spectrum antibiotic (Ampicillin 2g IV/IM + Gentamicin 5mg/kg IM or Ceftriaxone 2g IV) where authorized by standing protocol.',
      'Refer immediately to the nearest Emergency Obstetric Care facility.'
    ],
    recommendedAgeOrGroup: 'Mothers in the puerperium (first 6 weeks following childbirth)',
    specialistToConsult: 'Obstetrician, General Medical Officer, or Midwife'
  },
  {
    id: 'urinary-tract-infections',
    name: 'Recurrent Urinary Tract Infections (UTIs) & Pyelonephritis',
    localAliases: 'Bladder infection, Toilet infection, Ciwon fitsari, Ẹ̀kọ́ tọ̀tọ̀, Painful peeing',
    category: 'infections',
    categoryLabel: 'Infections & Reproductive Safety',
    prevalenceInsight: 'Women are 30 times more likely to develop UTIs than men due to their short, straight urethra (4 cm) situated close to the anus. In pregnancy, untreated asymptomatic bacteriuria leads to kidney infection and preterm labor in up to 30% of women.',
    shortSummary: 'Infection of any part of the urinary tract (urethra, bladder, or kidneys), most commonly caused by uropathogenic Escherichia coli (E. coli) originating from the gastrointestinal tract.',
    commonSymptoms: [
      'Dysuria: Sharp burning, stinging, or painful sensation during urination',
      'Urinary Urgency: Sudden, intense, uncontrollable urge to urinate',
      'Urinary Frequency: Needing to pee frequently throughout the day and night, often passing only a few drops',
      'Turbid, cloudy, dark, or foul-smelling urine',
      'Hematuria: Pink, red, or cola-colored blood in the urine',
      'Suprapubic ache, pelvic pressure, or fullness over the bladder'
    ],
    redFlagEmergencySigns: [
      'Acute Pyelonephritis: High fever with shaking chills (rigors), severe flank or loin pain on one or both sides (costovertebral angle tenderness), nausea, and vomiting — this threatens pregnancy and maternal kidneys!'
    ],
    rootCausesAndRisks: [
      'Anatomical proximity of the female urethral meatus to the anus and vagina',
      'Wiping from back to front after defecation, dragging fecal E. coli into the urethra',
      'Inadequate fluid intake leading to concentrated urine and reduced bacterial flushing',
      'Delayed voiding (holding urine for hours due to dirty public toilets)',
      'Sexual intercourse (mechanical displacement of bacteria into the urethra)',
      'Pregnancy: Progesterone relaxes ureteral smooth muscle, causing physiologic hydronephrosis and urinary stasis',
      'Postmenopausal estrogen decline causing thinning of urethral mucosa and loss of protective acidic vaginal flora'
    ],
    prevention: {
      primary: [
        'Optimal Hydration: Drink 2.5 to 3 liters of clean safe water daily to continuously flush bacteria from the bladder.',
        'Wipe Front to Back: Always wipe from front (vulva) towards back (anus) after using the toilet — never reverse!',
        'Post-Coital Voiding: Always urinate within 15 minutes after sexual intimacy to wash away any displaced bacteria.',
        'Do not hold urine: Empty the bladder completely whenever you feel the urge, without rushing.'
      ],
      screening: [
        'Routine Urine Dipstick and Microscopic Urinalysis during every antenatal booking to detect Asymptomatic Bacteriuria.',
        'Urine Culture and Sensitivity (Midstream clean-catch urine specimen) to ensure targeted antibiotic selection and combat antibiotic resistance.'
      ],
      lifestyleAndDiet: [
        'Hibiscus Tea (Zobo without artificial sugar): Contains proanthocyanidins and natural organic acids that inhibit bacterial adherence to the urothelium.',
        'Vitamin C rich fruits (oranges, lemons, baobab, pawpaw) to acidify the urine and inhibit bacterial proliferation.',
        'Avoid scented feminine washes, bubble baths, and chemically perfumed sanitary pads that irritate the urethral opening.'
      ],
      avoidRisks: [
        'Do not buy casual single ampicillin or tetracycline capsules from street hawkers — this breeds resistant strains.',
        'Avoid douching and perfumed vaginal sprays.'
      ]
    },
    chwActionPlan: [
      'Perform urine dipstick (leukocyte esterase + nitrites) on any woman complaining of dysuria or flank pain.',
      'In pregnancy, treat even asymptomatic bacteriuria with pregnancy-safe antibiotics (e.g. Nitrofurantoin or Amoxicillin-Clavulanate) under medical guidance.',
      'Refer any patient with high fever, vomiting, and flank pain immediately to hospital for IV antibiotics to prevent septic shock.'
    ],
    recommendedAgeOrGroup: 'All women, especially pregnant mothers and sexually active women',
    specialistToConsult: 'Primary Care Physician, Urologist, or Nephrologist'
  },
  {
    id: 'postmenopausal-bleeding',
    name: 'Postmenopausal Bleeding & Endometrial Pathology',
    localAliases: 'Bleeding after menopause, Blood in older women, Jẹjẹẹrẹ inú ilé ọmọ, Zubar jini bayan daina haila',
    category: 'cancers',
    categoryLabel: 'Oncology & Cancer Prevention',
    prevalenceInsight: 'Any vaginal bleeding occurring 12 months or more after a woman\'s final menstrual period is ABNORMAL. In 10% to 15% of cases, it represents Endometrial Cancer (uterine lining cancer).',
    shortSummary: 'Any spontaneous vaginal bleeding, spotting, or brownish discharge occurring after menopause. Must be treated as a malignant gynecological emergency until proven otherwise.',
    commonSymptoms: [
      'Unexpected spotting or bloodstains on underwear in a woman whose periods stopped over a year ago',
      'Pink, red, or brown watery vaginal discharge',
      'Passing blood clots from the vagina after menopause',
      'Pelvic cramping or lower abdominal heaviness accompanying the spotting'
    ],
    redFlagEmergencySigns: [
      'Heavy, gushing vaginal hemorrhage causing syncopal collapse',
      'Palpable lower abdominal mass or significant unexplained weight loss'
    ],
    rootCausesAndRisks: [
      'Endometrial Carcinoma (Cancer of the womb lining)',
      'Endometrial Hyperplasia (precancerous overgrowth of the uterine lining due to unopposed estrogen)',
      'Endometrial or Cervical Polyps (benign growths on the lining)',
      'Atrophic Vaginitis and Endometrial Atrophy (thin, fragile tissues weeping blood)',
      'Obesity: In postmenopausal women, adipose tissue contains aromatase, which converts adrenal androgens into estrone (unopposed estrogen driving endometrial growth)',
      'Tamoxifen therapy, late menopause after age 55, or diabetes'
    ],
    prevention: {
      primary: [
        'Maintain a healthy weight after menopause: Losing excess body fat lowers unopposed estrogen production.',
        'Never take estrogen-only Hormone Replacement Therapy (HRT) if you still have your uterus; progestin must always be combined to protect the uterine lining.',
        'Control blood sugar and blood pressure through an active lifestyle and high-fiber traditional nutrition.'
      ],
      screening: [
        'Transvaginal Ultrasound (TVS): Measures endometrial thickness. In postmenopausal women, an endometrial stripe {">"}4 mm warrants an immediate biopsy.',
        'Endometrial Pipelle Biopsy: Quick, office-based procedure obtaining tissue for histopathological examination.',
        'Diagnostic Hysteroscopy with targeted curettage.'
      ],
      lifestyleAndDiet: [
        'Whole-food plant-based nutrition: Millet, sorghum, beans, garden eggs, and leafy vegetables to support metabolic health.',
        'Daily brisk walking to enhance insulin sensitivity and lower peripheral estrogen synthesis.'
      ],
      avoidRisks: [
        'NEVER assume postmenopausal bleeding is "a blessing" or "youth returning" — this fatal misconception delays cancer treatment until it is too late.',
        'Do not take herbal remedies to "stop the bleeding" without a definitive tissue biopsy.'
      ]
    },
    chwActionPlan: [
      'Teach community women: "Any single drop of blood after menopause requires an immediate hospital check within 72 hours."',
      'Directly refer the patient to the General Hospital Gynecology clinic for an endometrial biopsy.'
    ],
    recommendedAgeOrGroup: 'All women who have reached menopause (12 months without menses)',
    specialistToConsult: 'Gynecological Oncologist or Consultant Gynecologist'
  }
];

// Quick Action Guides for Primary Prevention
export interface PreventionPillarGuide {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  steps: { stepNumber: number; title: string; detail: string }[];
  clinicalCitation: string;
}

export const PREVENTION_PILLAR_GUIDES: PreventionPillarGuide[] = [
  {
    id: 'hpv-cervical-defense',
    title: 'Cervical Cancer 3-Tier Elimination Plan',
    subtitle: 'The WHO & National NPHCDA Blueprint to eradicate cervical cancer forever',
    badge: '100% Preventable',
    steps: [
      {
        stepNumber: 1,
        title: 'Vaccinate Girls Aged 9–14',
        detail: 'The single-dose or two-dose HPV vaccine administered before sexual debut builds lifelong immunity against oncogenic HPV types 16 and 18. Available at Primary Health Centers across Nigeria.'
      },
      {
        stepNumber: 2,
        title: 'Screen Every 3–5 Years (Age 30+)',
        detail: 'Every woman aged 30 to 49 (or from age 25 if living with HIV) should undergo Visual Inspection with Acetic Acid (VIA) or HPV DNA testing. Vinegar highlights precancerous cells in 60 seconds.'
      },
      {
        stepNumber: 3,
        title: 'Immediate On-Site Precancer Treatment',
        detail: 'If VIA shows abnormal white changes, cryotherapy (freezing) or thermal ablation at the clinic removes precancerous cells immediately before they can ever become malignant.'
      }
    ],
    clinicalCitation: 'WHO Global Strategy to Accelerate the Elimination of Cervical Cancer as a Public Health Problem (90-70-90 targets).'
  },
  {
    id: 'breast-self-exam',
    title: '5-Step Monthly Breast Self-Awareness',
    subtitle: 'Perform 3 to 5 days after your menstrual period ends when breasts are softest',
    badge: 'Early Detection Saves Lives',
    steps: [
      {
        stepNumber: 1,
        title: 'Look in the Mirror (Hands on Hips)',
        detail: 'Look for changes in size, shape, color, skin dimpling, puckering (orange-peel texture), or nipple turning inwards.'
      },
      {
        stepNumber: 2,
        title: 'Raise Arms High Overhead',
        detail: 'Check if both breasts move up symmetrically and inspect the underside of both breasts for any visible bulges or retraction.'
      },
      {
        stepNumber: 3,
        title: 'Feel While Lying Down (Pad of 3 Fingers)',
        detail: 'Lie on your back with a pillow under your right shoulder. Use the pads of your 3 middle left fingers to feel the right breast in small overlapping dime-sized circles. Cover the entire breast from collarbone to bra line.'
      },
      {
        stepNumber: 4,
        title: 'Vary Your Pressure Depth',
        detail: 'Use light pressure for tissue close to skin, medium pressure for deeper tissue, and firm pressure to feel tissue near the ribs.'
      },
      {
        stepNumber: 5,
        title: 'Examine Armpits & Check Nipple',
        detail: 'Feel the armpit (axilla) for any firm swollen lymph nodes. Gently squeeze each nipple to check for bloody or clear spontaneous discharge.'
      }
    ],
    clinicalCitation: 'American Cancer Society & Nigerian National Cancer Control Plan Guidelines on Breast Self-Awareness.'
  },
  {
    id: 'kegel-pelvic-floor',
    title: 'Daily Kegel Routine: Pelvic Floor Mastery',
    subtitle: 'Prevent uterine prolapse, urinary leakage, and restore postpartum tone',
    badge: 'Daily Core Exercise',
    steps: [
      {
        stepNumber: 1,
        title: 'Find the Right Muscles',
        detail: 'Next time you pass urine, stop the flow midway. The muscles you tightened to stop the urine are your pelvic floor muscles (levator ani). Do not do this frequently while peeing to avoid urinary retention.'
      },
      {
        stepNumber: 2,
        title: 'Contract and Lift Upward',
        detail: 'Tighten these muscles, pulling upwards and inwards. Ensure your belly, thighs, and buttocks stay completely relaxed. Breathe normally — never hold your breath.'
      },
      {
        stepNumber: 3,
        title: 'Hold for 5 Seconds, Relax for 5',
        detail: 'Hold the upward squeeze for 5 full seconds. Then relax completely for 5 seconds. Relaxation between squeezes is just as vital as contraction.'
      },
      {
        stepNumber: 4,
        title: 'Repeat 10 Times, 3 Sets Daily',
        detail: 'Do a set of 10 contractions morning, afternoon, and night. You can do them discreetly anywhere: sitting, standing, or nursing your baby.'
      }
    ],
    clinicalCitation: 'International Urogynecological Association (IUGA) Pelvic Floor Rehabilitation Protocol.'
  }
];
