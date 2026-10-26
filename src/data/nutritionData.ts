import {
  TrimesterNutritionGuide,
  LocalFoodItem,
  CulturalNutritionMyth,
} from '../types';

export const TRIMESTER_NUTRITION_GUIDES: Record<string, TrimesterNutritionGuide> = {
  trimester1: {
    stage: 'trimester1',
    title: 'Trimester 1 (Weeks 1 - 12): Foundation & Neurogenesis',
    weeksRange: 'Weeks 1 – 12',
    fetalDevelopmentHighlight:
      'The neural tube closes by week 6 to form baby\'s brain and spinal cord. Heart starts beating, tiny limb buds form, and major organ foundations are laid.',
    maternalBodyNeed:
      'Hormonal surge (hCG & progesterone) can cause morning sickness, food aversions, fatigue, and metallic taste. Priority is gentle hydration, natural folate, vitamin B6 for nausea, and light, frequent nutrient-dense meals.',
    coreNutrients: [
      {
        name: 'Natural Folate (Vitamin B9)',
        dailyGoal: '600 mcg daily',
        localSources: 'Fluted pumpkin leaves (Ugu), boiled black-eyed cowpeas, moringa leaves, boiled eggs, sweet oranges.',
        physiologicalImpact: 'Prevents neural tube defects (spina bifida and anencephaly) in the first 28 days of conception.',
      },
      {
        name: 'Vitamin B6 & Gentle Digestives',
        dailyGoal: '1.9 mg daily',
        localSources: 'Ripe bananas, roasted plantain, crushed fresh ginger infusion, small handful of roasted groundnuts.',
        physiologicalImpact: 'Regulates neurotransmitters in the stomach lining to reduce nausea, retching, and morning sickness.',
      },
      {
        name: 'Clean Hydration & Electrolytes',
        dailyGoal: '2.5 – 3 Liters daily',
        localSources: 'Boiled filtered water, coconut water, light baobab water (rich in vitamin C and potassium).',
        physiologicalImpact: 'Expands plasma fluid volume, prevents urinary tract infections (UTIs), and prevents dehydration from vomiting.',
      },
      {
        name: 'Gentle Iron & Zinc',
        dailyGoal: '27 mg iron / 11 mg zinc daily',
        localSources: 'Steamed bean cake (Moi-moi), boiled eggs, well-cooked chicken/fish, whole millet porridge (Ogi/Uji).',
        physiologicalImpact: 'Builds cellular DNA and enzymes; supports early maternal blood cell production.',
      },
    ],
    sampleMealPlan: {
      breakfast: 'Warm whole millet/sorghum porridge (Ogi / Uji) enriched with 1 boiled egg and a spoon of ground crayfish.',
      midMorningSnack: '1 small banana or slice of roasted plantain (Boli) with a handful of clean roasted groundnuts.',
      lunch: 'Steamed bean pudding (Moi-moi / Okpa) with fresh tomato-pepper stew and lightly cooked fluted pumpkin (Ugu) or spinach.',
      afternoonSnack: 'Cold glass of baobab fruit pulp juice or coconut water with dry water biscuits.',
      dinner: 'Light clear fish pepper soup (gently spiced with African nutmeg and scent leaf) with boiled soft yam or sweet potato.',
      bedtimeDrink: 'Warm ginger-infused clean water or warm milk to calm stomach acid overnight.',
    },
    commonSymptomRemedies: [
      {
        symptom: 'Morning Sickness & Nausea',
        culinarySolution:
          'Keep dry crackers, roasted plantain chips, or dry toast beside your bed. Chew a bite before getting up. Sip lukewarm ginger water with a squeeze of fresh lime.',
        foodsToAvoid: 'Heavy greasy fried palm oil, strong raw onion aromas, very hot spicy stews on an empty stomach.',
      },
      {
        symptom: 'Metallic Taste & Low Appetite',
        culinarySolution:
          'Sip cold water with fresh citrus (orange or lemon slice). Snack on sour fruits like oranges, tangerines, or tamarind/tsamiya water.',
        foodsToAvoid: 'Dry unseasoned meat that triggers gag reflexes; eat cold protein like boiled egg or chilled yogurt.',
      },
      {
        symptom: 'Extreme Fatigue & Sleepiness',
        culinarySolution:
          'Eat small portions every 2.5 to 3 hours containing complex carbohydrates (sweet potato, boiled maize, oats) to keep blood sugar stable.',
        foodsToAvoid: 'Sugary sodas, energy drinks, and packaged sweetened pastries which cause rapid blood sugar crashes.',
      },
    ],
    criticalSafetyCautions: [
      'DO NOT consume clay, chalk, or soil (Nzu, Eko, Kaolin). This causes lead poisoning, intestinal worm blockage, and severe anemia.',
      'DO NOT drink bitter herbal concoctions, raw root potions, or local cleansing tonics. Many trigger uterine contractions and miscarriages.',
      'Ensure all eggs, poultry, and meat are cooked until steaming hot with no pink juice (prevents Salmonella & Listeria).',
      'Wash all fresh vegetables and garden herbs in clean, salted or chlorinated water before cooking.',
    ],
  },

  trimester2: {
    stage: 'trimester2',
    title: 'Trimester 2 (Weeks 13 - 27): Bone Formation & Blood Expansion',
    weeksRange: 'Weeks 13 – 27',
    fetalDevelopmentHighlight:
      'Baby grows from 7 cm to over 35 cm! Skeleton hardens from cartilage into strong bone, tooth buds develop, hearing activates, and baby starts kicking vigorously.',
    maternalBodyNeed:
      'Maternal blood volume expands by 40-50% to nourish placenta and baby. Huge demand for elemental iron to prevent maternal anemia, plus calcium and vitamin D for baby\'s skeleton. Energy returns and appetite surges.',
    coreNutrients: [
      {
        name: 'Elemental Iron (with Vitamin C)',
        dailyGoal: '30 – 60 mg elemental iron',
        localSources:
          'Fluted pumpkin leaves (Ugu), green amaranth (Tete/Mchicha), small dried fish (crayfish/dagaa), cowpeas, beans, with fresh citrus or tomatoes.',
        physiologicalImpact:
          'Produces hemoglobin to deliver oxygen across the placenta. Pair with vitamin C (oranges, tomatoes) to multiply plant iron absorption by 400%.',
      },
      {
        name: 'Calcium & Phosphorus',
        dailyGoal: '1,000 – 1,200 mg daily',
        localSources:
          'Small fish eaten whole with bones (Omena, Dagaa, Crayfish, Sardines), fermented fresh milk (Nono/Yogurt), sesame seeds (Beni seed), dark leafy greens.',
        physiologicalImpact:
          'Builds fetal skeleton and tooth enamel. If intake is low, baby draws calcium directly from mother\'s bones, causing tooth decay and maternal osteopenia.',
      },
      {
        name: 'Protein for Tissue Growth',
        dailyGoal: '75 – 85 grams daily',
        localSources:
          'Boiled eggs, dried fish, beans and lentils, Bambara groundnut (Okpa), chicken, soybean cake (Awara/Beske), peanut paste.',
        physiologicalImpact:
          'Constructs fetal muscle fibers, brain tissue, and supports continuous placenta growth and amniotic fluid renewal.',
      },
      {
        name: 'Dietary Fiber & Complex Carbs',
        dailyGoal: '28 – 32 grams fiber daily',
        localSources:
          'Okra (Ila/Gombo), garden eggs, oats, whole guinea corn/dawa, brown rice, boiled beans with skin.',
        physiologicalImpact:
          'Prevents progesterone-induced bowel sluggishness, chronic constipation, and painful pregnancy hemorrhoids (piles).',
      },
    ],
    sampleMealPlan: {
      breakfast: 'Boiled sweet potatoes or yam with scrambled eggs, diced tomatoes, fluted pumpkin (Ugu), and a fresh orange.',
      midMorningSnack: 'Roasted corn with roasted pear (Ube) or a cup of fresh tiger nut milk (Kunun Aya).',
      lunch: 'Rich vegetable soup (Edikang Ikong or Sukuma Wiki with fish) cooked with ground crayfish and smoked fish, served with whole wheat or oatmeal swallow.',
      afternoonSnack: 'Steamed bean cake (Akara/Moi-moi) or boiled groundnuts with a fresh apple or garden egg.',
      dinner: 'Beans and sweet plantain pottage prepared with unbleached red palm oil, leafy greens, and grilled local mackerel/tilapia.',
      bedtimeDrink: '1 cup of clean warm milk or fresh unsweetened yogurt with a handful of pumpkin/sesame seeds.',
    },
    commonSymptomRemedies: [
      {
        symptom: 'Heartburn & Acid Indigestion',
        culinarySolution:
          'Eat small meals every 3 hours instead of heavy lunches. Do not lie down within 2 hours of eating. Sip fresh coconut water or cold milk.',
        foodsToAvoid: 'Deep-fried greasy snacks, burnt palm oil, excess black/chili pepper, coffee, and carbonated sodas.',
      },
      {
        symptom: 'Constipation & Hard Stools',
        culinarySolution:
          'Eat okra soup (mucilage fiber lubricates intestines), garden eggs, boiled beans with peels, and drink 8-10 large cups of safe water.',
        foodsToAvoid: 'Refined white flour bread, raw cassava starch without vegetables, very dry gari without water/fruits.',
      },
      {
        symptom: 'Leg Cramps at Night',
        culinarySolution:
          'Boost calcium and magnesium: Eat small dried fish (crayfish/dagaa) with bones, ripe bananas, pumpkin seeds, and leafy greens.',
        foodsToAvoid: 'Excessive table salt (sodium) which worsens fluid retention in calves.',
      },
    ],
    criticalSafetyCautions: [
      'Take your daily iron-folic acid supplement 1-2 hours AWAY from tea, coffee, or milk (calcium and tannins block iron absorption). Take with water or orange juice.',
      'Red palm oil is an excellent source of pro-vitamin A (beta-carotene), but do NOT bleach it till it smokes—bleaching destroys all maternal vitamins.',
      'Check blood pressure regularly; if you have sudden rapid swelling of your face or ankles, report to clinic immediately.',
    ],
  },

  trimester3: {
    stage: 'trimester3',
    title: 'Trimester 3 (Weeks 28 - 40+): Brain Maturation & Labor Stamina',
    weeksRange: 'Weeks 28 – 40+',
    fetalDevelopmentHighlight:
      'Baby\'s brain undergoes massive synaptic development and fat deposition. Lungs mature with surfactant, eyes open, and baby accumulates iron and calcium reserves for the first 6 months of life.',
    maternalBodyNeed:
      'Large belly presses on stomach, lungs, and bladder. Need compact, nutrient-dense foods rich in Omega-3 DHA, Vitamin K for blood clotting at delivery, energy stamina for labor, and frequent hydration.',
    coreNutrients: [
      {
        name: 'Omega-3 DHA (Healthy Fatty Acids)',
        dailyGoal: '300 mg DHA daily',
        localSources:
          'Local oily fish (mackerel, sardines, bonga fish, catfish, crayfish), whole eggs, chia/flax or crushed sesame seeds.',
        physiologicalImpact:
          'Forms 70% of baby\'s brain cerebral cortex and retinal photoreceptors. Also reduces maternal risk of postpartum depression.',
      },
      {
        name: 'Vitamin K & Blood Clotting Factors',
        dailyGoal: '90 mcg daily',
        localSources:
          'Dark leafy greens (Ugu, waterleaf, amaranth, kale/sukuma, moringa, sweet potato leaves), green beans.',
        physiologicalImpact:
          'Essential for prothrombin synthesis, protecting mother against dangerous Postpartum Hemorrhage (PPH) during delivery.',
      },
      {
        name: 'Sustained Slow-Burn Carbohydrates',
        dailyGoal: '350 – 450 extra calories/day',
        localSources:
          'Whole guinea corn (Tuwo Dawa), brown rice, boiled plantain, roasted sweet potato, oats, Bambara groundnuts.',
        physiologicalImpact:
          'Stores glycogen in the uterine myometrium to power strong, sustained labor contractions during delivery.',
      },
      {
        name: 'Natural Cervical Ripeners (Weeks 36+)',
        dailyGoal: '6 dates (Dabino) daily from week 36',
        localSources:
          'Dried dates (Dabino), ripe fresh pineapple in moderation, warm herbal teas like ginger-mint.',
        physiologicalImpact:
          'Clinical trials show eating dates in late pregnancy promotes cervical ripening, reduces need for labor induction, and shortens labor duration.',
      },
    ],
    sampleMealPlan: {
      breakfast: 'Whole grain oats or millet pap with dried ground crayfish, 1 boiled egg, and 3 dried dates (Dabino).',
      midMorningSnack: '1 fresh orange or bowl of diced ripe watermelon with a handful of clean pumpkin or cashew seeds.',
      lunch: 'Okra and fresh fish soup (prepared with mackerel, leafy greens, crayfish) served with boiled ripe plantain or small portion of swallow.',
      afternoonSnack: 'Tiger nut drink (Kunun Aya) or fermented milk (Nono) with roasted groundnuts.',
      dinner: 'Steamed brown rice or jollof with shredded chicken/fish, steamed green amaranth (Tete/Mchicha), and fresh vegetable salad.',
      bedtimeDrink: 'Warm chamomile or ginger infusion with 2-3 dates to support restful sleep and uterine tone.',
    },
    commonSymptomRemedies: [
      {
        symptom: 'Breathlessness & Full Stomach Sensation',
        culinarySolution:
          'Baby pushes against your diaphragm. Eat 5-6 mini-meals throughout the day instead of 2 large sittings. Chew food slowly into liquid.',
        foodsToAvoid: 'Heavy swallow doughs right before sleeping; avoid eating within 90 minutes of bedtime.',
      },
      {
        symptom: 'Ankle & Foot Swelling (Mild Edema)',
        culinarySolution:
          'Drink plenty of clean water (restricting water paradoxically worsens water retention!). Elevate feet when sitting. Eat potassium-rich foods (bananas, coconut water).',
        foodsToAvoid: 'Monosodium glutamate (MSG) bouillon cubes, excess salt, salty smoked meats, salted chips.',
      },
      {
        symptom: 'Sleep Disruption & Restless Legs',
        culinarySolution:
          'Warm unsweetened milk with crushed sesame seeds or pumpkin seeds (rich in magnesium and L-tryptophan).',
        foodsToAvoid: 'Colas, caffeinated energy drinks, coffee, or heavy sugary late-night snacks.',
      },
    ],
    criticalSafetyCautions: [
      'If swelling spreads suddenly to your face, eyelids, or hands with a severe headache or blurry vision, this is PRE-ECLAMPSIA—rush to the emergency ward immediately!',
      'DO NOT take local labor-inducing concoctions or bitter root herbs without medical supervision; they can cause uterine rupture and fetal distress.',
      'Ensure you have packed dry provisions and clean water in your delivery hospital bag.',
    ],
  },

  postpartum: {
    stage: 'postpartum',
    title: 'Fourth Trimester (Postpartum & Breastfeeding Healing)',
    weeksRange: 'Birth – 6 Months',
    fetalDevelopmentHighlight:
      'Baby is growing rapidly, relying 100% on mother\'s breast milk for complete nutrition, antibodies, gut biome, and brain myelination.',
    maternalBodyNeed:
      'Mother\'s body is healing internal uterine wound (placenta bed), replenishing lost blood (lochia), and producing 750-1000ml of breast milk daily. Needs extra 500 kcal, high fluids, zinc, iron, and galactagogues.',
    coreNutrients: [
      {
        name: 'Fluids & Galactagogues (Milk Promoters)',
        dailyGoal: '3.5 – 4 Liters daily',
        localSources:
          'Warm clear pepper soups (with African nutmeg/Ehuru and scent leaf), warm millet/oats porridge, coconut water, clean water.',
        physiologicalImpact:
          'Hydration is the number one driver of abundant breast milk supply. Warm spiced broths promote uterine involution and blood cleansing.',
      },
      {
        name: 'Tissue Repair & Collagen (Zinc & Vitamin C)',
        dailyGoal: '12 mg zinc / 120 mg vitamin C daily',
        localSources:
          'Boiled eggs, local catfish/tilapia, moringa leaves, oranges, baobab, pumpkin seeds, lean meats.',
        physiologicalImpact:
          'Speeds healing of perineal tears, episiotomies, or C-section abdominal incisions; reinforces maternal immune defense.',
      },
      {
        name: 'Blood Replenishment (Heme & Non-Heme Iron)',
        dailyGoal: '30 mg daily + Vitamin C',
        localSources:
          'Fluted pumpkin (Ugu) soup with beef/fish, cowpeas, liver in moderate amounts, dark green leafy stews.',
        physiologicalImpact:
          'Reverses blood loss sustained during childbirth; combats postpartum fatigue, brain fog, and postpartum mood instability.',
      },
      {
        name: 'Calcium for Breast Milk Enrichment',
        dailyGoal: '1,300 mg daily',
        localSources:
          'Small dried fish (Crayfish, Dagaa/Omena) eaten with bones, yogurt, fresh milk, sesame paste.',
        physiologicalImpact:
          'Protects maternal bones while transferring 250-300mg of calcium daily directly into infant breast milk for baby\'s rapid bone growth.',
      },
    ],
    sampleMealPlan: {
      breakfast: 'Warm whole grain pap (Akamu/Uji) enriched with ground crayfish, milk, and 2 boiled eggs.',
      midMorningSnack: 'Warm fresh moringa tea or light baobab water with boiled sweet potatoes.',
      lunch: 'Traditional catfish pepper soup (spiced with scent leaf, ginger, garlic, and Ehuru) served with boiled ripe plantain or yam.',
      afternoonSnack: 'Steamed bean cake (Moi-moi) or boiled groundnuts with a fresh citrus fruit.',
      dinner: 'Vegetable soup (Waterleaf & Ugu) packed with dried fish and beef, eaten with oatmeal or wheat swallow.',
      bedtimeDrink: 'Large mug of warm milk or warm spiced oatmeal drink to fuel nighttime lactation.',
    },
    commonSymptomRemedies: [
      {
        symptom: 'Low Breast Milk Supply',
        culinarySolution:
          'Drink 1 large glass of warm water before and after every breastfeeding session. Eat warm oats or whole millet porridge enriched with ground nuts and crayfish.',
        foodsToAvoid: 'Cold drinks that reduce mother\'s comfort; excess caffeine that passes into milk and makes baby fussy.',
      },
      {
        symptom: 'Perineal Soreness / C-Section Pain',
        culinarySolution:
          'Eat high-zinc and vitamin C foods: boiled eggs, moringa, sweet oranges. Eat high-fiber okra and beans to prevent straining during bowel movements.',
        foodsToAvoid: 'Constipating foods like white bread without fluids, and dry fried meats.',
      },
      {
        symptom: 'Baby Colic & Gas',
        culinarySolution:
          'Sip warm fennel or ginger-scent leaf infusion. Observe which mother\'s foods trigger gas in baby and rotate them gently.',
        foodsToAvoid: 'Excessive raw onions, carbonated drinks, very hot pepper stews.',
      },
    ],
    criticalSafetyCautions: [
      'If postpartum bleeding suddenly increases to soaking more than 2 large pads in an hour or you pass blood clots bigger than an egg, seek EMERGENCY medical care immediately (PPH).',
      'Continue taking your prescribed iron and folic acid supplements for at least 3 months postpartum.',
      'Exclusive breastfeeding for the first 6 months provides 100% of baby\'s nutritional and immunological needs—no water or formula needed.',
    ],
  },
};

export const LOCAL_FOOD_ITEMS: LocalFoodItem[] = [
  {
    id: 'ugu_leaves',
    name: 'Fluted Pumpkin Leaves (Ugu)',
    localNames: {
      english: 'Fluted Pumpkin Leaves',
      pidgin: 'Ugu leaf',
      hausa: 'Ganyen kabewa',
      yoruba: 'Ewe Ugu / Elegede',
      french: 'Feuilles de citrouille cannelée',
      swahili: 'Majani ya maboga',
    },
    region: 'west',
    category: 'leafy_greens',
    trimestersRecommended: [1, 2, 3, 4],
    keyNutrients: ['Folate', 'Elemental Iron', 'Calcium', 'Vitamin A', 'Vitamin C'],
    whyItMatters:
      'The number one blood-building green vegetable in West Africa. Packed with bioavailable folate to prevent neural tube defects and iron to combat maternal anemia.',
    howToPrepareSafely:
      'Wash thoroughly in clean running water with a pinch of salt to remove sand and parasites. Steam or cook gently for 3-5 minutes—do not overboil to preserve water-soluble vitamins.',
    budgetTier: 'low_cost',
    culturalNote: 'Traditionally squeezed as fresh vegetable extract or cooked in soups like Edikang Ikong.',
  },
  {
    id: 'moringa_oleifera',
    name: 'Moringa Leaves & Powder (Zogale)',
    localNames: {
      english: 'Moringa Leaf',
      pidgin: 'Moringa leaf',
      hausa: 'Zogale',
      yoruba: 'Ewe Igbale',
      french: 'Moringa / Brède mouroungue',
      swahili: 'Mlonge',
    },
    region: 'all',
    category: 'leafy_greens',
    trimestersRecommended: [1, 2, 3, 4],
    keyNutrients: ['Iron', 'Calcium', 'Protein', 'Vitamin A', 'Vitamin C'],
    whyItMatters:
      'Known as the "Tree of Life". 1 cup of fresh leaves contains 3x the iron of spinach and 4x the calcium of milk. Excellent for both pregnancy and postpartum milk supply.',
    howToPrepareSafely:
      'Use the leaves or dried green leaf powder added to soups, sauces, or tea. Avoid consuming root or bark parts during pregnancy as they contain uterine stimulants.',
    budgetTier: 'low_cost',
    caution: 'Consume leaves only; avoid moringa roots and bark during pregnancy.',
  },
  {
    id: 'small_dried_fish_crayfish',
    name: 'Small Dried Fish & Crayfish (Dagaa / Omena / Bonga)',
    localNames: {
      english: 'Crayfish & Small Dried Fish',
      pidgin: 'Crayfish & Dry Fish',
      hausa: 'Kifin gwangwani / Kifi busasshe',
      yoruba: 'Ede (Crayfish) & Eja gbigbe',
      swahili: 'Dagaa / Omena',
      french: 'Petits poissons séchés / Crevettes séchées',
    },
    region: 'all',
    category: 'fish_meat_dairy',
    trimestersRecommended: [1, 2, 3, 4],
    keyNutrients: ['Calcium', 'Protein', 'Omega-3 DHA', 'Zinc', 'Vitamin D'],
    whyItMatters:
      'Because they are eaten whole with their soft bones, small dried fish are the highest density, lowest-cost calcium source available in African markets, perfect for baby\'s skeleton.',
    howToPrepareSafely:
      'Sort carefully to remove grit, wash cleanly, and grind into a fine powder or cook thoroughly in soups, sauces, and porridges.',
    budgetTier: 'low_cost',
    culturalNote: 'Adding 2 tablespoons of ground crayfish powder to any soup or pap doubles its protein and calcium content.',
  },
  {
    id: 'cowpeas_beans',
    name: 'Black-Eyed Cowpeas & Beans (Ewa / Wake)',
    localNames: {
      english: 'Cowpeas & Black-eyed Beans',
      pidgin: 'Beans / Cowpeas',
      hausa: 'Wake',
      yoruba: 'Ewa',
      swahili: 'Kunde / Maharage',
      french: 'Niébé / Haricots',
    },
    region: 'all',
    category: 'legumes_proteins',
    trimestersRecommended: [1, 2, 3, 4],
    keyNutrients: ['Plant Protein', 'Soluble Fiber', 'Folate', 'Iron', 'Magnesium'],
    whyItMatters:
      'Affordable staple providing sustained energy, vegetable protein for placental tissue, and prebiotic fiber to prevent constipation.',
    howToPrepareSafely:
      'Soak for 1-2 hours and boil thoroughly until soft. Discard soaking water to reduce gas/flatulence. Prepare as pottage, steamed Moi-moi, or Akara.',
    budgetTier: 'low_cost',
  },
  {
    id: 'boiled_eggs',
    name: 'Whole Boiled Eggs',
    localNames: {
      english: 'Boiled Eggs',
      pidgin: 'Boil egg',
      hausa: 'Kwai dafaffe',
      yoruba: 'Eyin bibo',
      swahili: 'Mayai ya kuchemsha',
      french: 'Œufs durs',
    },
    region: 'all',
    category: 'fish_meat_dairy',
    trimestersRecommended: [1, 2, 3, 4],
    keyNutrients: ['Choline', 'Complete Protein', 'Vitamin B12', 'Vitamin A', 'Lutein'],
    whyItMatters:
      'Eggs contain high amounts of Choline, the critical nutrient that works alongside Folate to build baby\'s brain memory center (hippocampus).',
    howToPrepareSafely:
      'Boil until both the white and the yolk are completely firm and hard (at least 8-10 minutes). Never eat raw or runny eggs.',
    budgetTier: 'low_cost',
    culturalNote: 'Dispel the myth: Eggs do NOT make babies steal or mute. Eggs are brain food.',
  },
  {
    id: 'sweet_potatoes',
    name: 'Orange-Fleshed Sweet Potatoes',
    localNames: {
      english: 'Orange Sweet Potato',
      pidgin: 'Sweet potato',
      hausa: 'Dankalin hausa',
      yoruba: 'Anamo / Kuduku',
      swahili: 'Viazi vitamu vya njano',
      french: 'Patate douce à chair orange',
    },
    region: 'all',
    category: 'roots_tubers_grains',
    trimestersRecommended: [1, 2, 3, 4],
    keyNutrients: ['Beta-Carotene (Vitamin A)', 'Vitamin C', 'Potassium', 'Dietary Fiber'],
    whyItMatters:
      'Contains safe, plant-based beta-carotene that baby uses for lung maturation, skin integrity, and eye development without risk of vitamin A toxicity.',
    howToPrepareSafely: 'Boil or steam with skin on after scrubbing cleanly. Eat with a drop of oil or egg to boost vitamin A absorption.',
    budgetTier: 'low_cost',
  },
  {
    id: 'baobab_fruit_powder',
    name: 'Baobab Fruit Pulp & Juice (Magonde / Kuka)',
    localNames: {
      english: 'Baobab Fruit Pulp',
      pidgin: 'Baobab fruit / Kuka',
      hausa: 'Kuka / Kurna',
      yoruba: 'Ewe Ose',
      swahili: 'Ubuyu / Mabuyu',
      french: 'Pain de singe (Baobab)',
    },
    region: 'all',
    category: 'fruits_seeds',
    trimestersRecommended: [1, 2, 3, 4],
    keyNutrients: ['Vitamin C (7x of oranges)', 'Prebiotic Soluble Fiber', 'Potassium', 'Calcium'],
    whyItMatters:
      'Phenomenal natural source of vitamin C. When taken with plant-based iron meals (beans, greens), it drastically boosts iron absorption into the bloodstream.',
    howToPrepareSafely:
      'Dissolve 1-2 tablespoons of white pulp powder into safe drinking water, porridge, or fresh yogurt.',
    budgetTier: 'low_cost',
  },
  {
    id: 'bambara_groundnut_okpa',
    name: 'Bambara Groundnut / Okpa',
    localNames: {
      english: 'Bambara Nut (Okpa flour)',
      pidgin: 'Okpa / Bambara nut',
      hausa: 'Gurjiya',
      yoruba: 'Epa Roro',
      swahili: 'Njugu mawe',
      french: 'Pois bambara / Voandzou',
    },
    region: 'west',
    category: 'legumes_proteins',
    trimestersRecommended: [1, 2, 3, 4],
    keyNutrients: ['Protein', 'Iron', 'Potassium', 'Folate', 'Complex Carbs'],
    whyItMatters:
      'Known as a complete food in indigenous agronomy. Extremely filling, highly digestible, and provides prolonged satiety for working mothers.',
    howToPrepareSafely:
      'Steam wrapped in clean banana leaves or food-grade pouches with red palm oil and warm water. Avoid boiling in plastic bags.',
    budgetTier: 'low_cost',
  },
  {
    id: 'dates_dabino',
    name: 'Dried Dates (Dabino)',
    localNames: {
      english: 'Dates',
      pidgin: 'Dabino / Dates',
      hausa: 'Dabino',
      yoruba: 'Dabino',
      swahili: 'Tende',
      french: 'Dattes',
    },
    region: 'northern',
    category: 'fruits_seeds',
    trimestersRecommended: [3, 4],
    keyNutrients: ['Natural Fructose', 'Potassium', 'Magnesium', 'Oxytocin-like Polyphenols'],
    whyItMatters:
      'Clinical studies show that consuming 6 dates per day from week 36 onwards increases cervical dilatation on admission, reduces artificial induction, and strengthens uterine contractions.',
    howToPrepareSafely: 'Wash dried dates in clean water, remove pit, and chew as a healthy snack or blend into smoothies/porridge.',
    budgetTier: 'moderate',
    culturalNote: 'Highly celebrated across Northern Nigeria and Sahelian cultures for maternal vitality.',
  },
  {
    id: 'okra_ila',
    name: 'Fresh Okra (Ila / Gombo)',
    localNames: {
      english: 'Okra / Lady\'s Finger',
      pidgin: 'Okra',
      hausa: 'Kubewa',
      yoruba: 'Ila',
      swahili: 'Bamia',
      french: 'Gombo',
    },
    region: 'all',
    category: 'leafy_greens',
    trimestersRecommended: [1, 2, 3, 4],
    keyNutrients: ['Folate', 'Soluble Mucilage Fiber', 'Vitamin C', 'Vitamin K', 'Magnesium'],
    whyItMatters:
      'The viscous mucilage in okra acts as a natural gentle stool softener, preventing hemorrhoids and chronic straining during late pregnancy.',
    howToPrepareSafely: 'Chop finely and cook lightly with fish, crayfish, and spinach. Avoid overcooking until grey.',
    budgetTier: 'low_cost',
  },
  {
    id: 'tiger_nuts_aya',
    name: 'Tiger Nuts (Aya / Ofio)',
    localNames: {
      english: 'Tiger Nuts / Chufa',
      pidgin: 'Aya / Tiger nut',
      hausa: 'Aya',
      yoruba: 'Ofio',
      swahili: 'Njugu mawe ndogo',
      french: 'Souchet',
    },
    region: 'all',
    category: 'roots_tubers_grains',
    trimestersRecommended: [1, 2, 3, 4],
    keyNutrients: ['Resistant Starch Prebiotics', 'Magnesium', 'Vitamin E', 'Healthy Fats'],
    whyItMatters:
      'Naturally dairy-free, soothing for stomach acid, and rich in prebiotic resistant starch that feeds healthy maternal gut bacteria.',
    howToPrepareSafely:
      'Soak dried tiger nuts in clean water, wash thoroughly, and chew directly or blend with dates and coconut to make fresh Kunun Aya milk.',
    budgetTier: 'low_cost',
  },
  {
    id: 'sukuma_wiki_kale',
    name: 'Collard Greens / Sukuma Wiki',
    localNames: {
      english: 'Collard Greens / Sukuma Wiki',
      swahili: 'Sukuma Wiki',
      pidgin: 'Green leaf',
      french: 'Chou cavalier / Feuilles vertes',
      hausa: 'Ganyen kabeji',
      yoruba: 'Efo Sukuma',
    },
    region: 'east',
    category: 'leafy_greens',
    trimestersRecommended: [1, 2, 3, 4],
    keyNutrients: ['Calcium', 'Iron', 'Vitamin K', 'Folate', 'Lutein'],
    whyItMatters:
      'The quintessential East African leafy green, meaning "push the week". Extremely high in calcium and vitamin K to prepare maternal blood clotting for delivery.',
    howToPrepareSafely: 'Sauté briefly with onions, ripe tomatoes, and oil. Cook just until tender to preserve vitamin content.',
    budgetTier: 'low_cost',
  },
];

export const CULTURAL_NUTRITION_MYTHS: CulturalNutritionMyth[] = [
  {
    id: 'myth_eggs_thief',
    myth: 'Eating eggs during pregnancy makes the baby become a thief or born mute.',
    verdict: 'DANGEROUS TABOO',
    scientificTruth:
      'Eggs are one of the world\'s richest sources of Choline, Vitamin B12, and complete protein. Denying pregnant women eggs starves the baby\'s developing brain and memory center, increasing the risk of neural tube defects.',
    mamaGAdvice:
      'My dear sister, please eat well-boiled eggs without fear! 1-2 boiled eggs daily helps your baby develop a sharp brain and strong body. A baby\'s moral character comes from parental love and upbringing, not from nutritious eggs.',
  },
  {
    id: 'myth_okra_miscarriage',
    myth: 'Eating slimy okra or slippery vegetable soup makes the baby slip out of the womb too early.',
    verdict: 'FALSE',
    scientificTruth:
      'Okra is digested in the stomach and intestines—it never enters the uterus or amniotic sac. Its mucilage is purely healthy plant fiber that relieves constipation and piles. It cannot cause premature labor.',
    mamaGAdvice:
      'Okra soup is safe, delicious, and healthy for you and your baby. It provides natural folate and prevents painful hard stools.',
  },
  {
    id: 'myth_snail_saliva',
    myth: 'If a pregnant woman eats snails, her baby will drool saliva continuously or be sluggish.',
    verdict: 'FALSE',
    scientificTruth:
      'Snails are an exceptionally lean, high-iron, low-fat source of protein and calcium. Infant drooling is a normal physiological teething phase and has zero connection to mother\'s diet.',
    mamaGAdvice:
      'Snail meat is clean, rich in iron, and helps prevent maternal anemia. Ensure snails are thoroughly cleaned and cooked well before eating.',
  },
  {
    id: 'myth_chalk_nzu_cure',
    myth: 'Eating white chalk or clay (Nzu, Eko, Kaolin) cures morning sickness and makes baby\'s skin lighter.',
    verdict: 'DANGEROUS TABOO',
    scientificTruth:
      'Eating clay, chalk, or soil is a disorder called Pica, triggered by severe iron or zinc deficiency. Clay binds to essential minerals in the gut, making anemia worse, and is frequently contaminated with lead, silica, and parasitic worm eggs.',
    mamaGAdvice:
      'If you crave chalk or dirt, do not feel ashamed—it is your body\'s SOS cry for IRON and ZINC! Stop eating the chalk immediately, and report to your antenatal clinic for a routine blood check and iron supplements.',
  },
  {
    id: 'myth_bitter_herbs_cleanse',
    myth: 'Drinking bitter herbal root concoctions cleanses the baby and prevents yellow jaundice.',
    verdict: 'DANGEROUS TABOO',
    scientificTruth:
      'Many untested bitter roots and commercial herbal teas contain toxic compounds that damage maternal kidneys and trigger strong uterine spasms that cause premature rupture of membranes and stillbirth.',
    mamaGAdvice:
      'Keep your baby safe: Avoid all unprescribed root mixtures and bitter concoctions. Clean boiled water, fresh fruit, and healthy local vegetables are all your body needs to cleanse naturally.',
  },
  {
    id: 'myth_eat_for_two_double',
    myth: 'Because you are pregnant, you must double your food portions and eat twice as much.',
    verdict: 'PARTIALLY TRUE',
    scientificTruth:
      'You are eating for two in nutrient quality, NOT quantity! In Trimester 1, you need almost no extra calories. In Trimesters 2 and 3, you only need approximately 300 to 450 extra calories per day (equivalent to 1 extra boiled egg, a banana, and a small cup of groundnuts).',
    mamaGAdvice:
      'Focus on rainbow nutrient quality rather than huge mounds of white starch. Doubling portions can cause gestational diabetes, high blood pressure, and difficult delivery.',
  },
];
