import { VvfCenter } from '../types';

export const NIGERIA_VVF_CENTERS: VvfCenter[] = [
  {
    id: 'nofic-katsina',
    name: 'National Obstetric Fistula Centre (NOFIC), Babbar Ruga',
    state: 'Katsina',
    zone: 'North West',
    city: 'Katsina',
    address: 'Babbar Ruga Hospital Road, Katsina, Katsina State',
    phone: '+234 803 618 9921',
    altPhone: '+234 802 334 1189',
    partner: 'Federal Ministry of Health (FMOH), UNFPA, USAID Fistula Care Plus',
    isFree: true,
    transportSupport: 'Community mobilization partner transport subsidies available via LGA social welfare offices.',
    specialistHead: 'Medical Director & Chief Fistula Surgeon',
    services: [
      '100% Free surgical repairs (simple, complex, and recurrent fistulas)',
      'Free post-operative hospital stay & specialized nursing catheter care',
      'Free daily patient nutrition & dignity kit (wrapper, slippers, soap, petroleum jelly, pads)',
      'Psychosocial counseling & community reintegration workshops',
      'Vocational skills acquisition (soap making, knitting, sewing, petty trade startup)'
    ],
    description: 'Premier specialized federal institution in Northern Nigeria dedicated exclusively to the treatment, rehabilitation, research, and eradication of obstetric fistula. Serves patients from across Nigeria and neighboring Niger Republic with zero out-of-pocket costs.'
  },
  {
    id: 'nofic-ningi',
    name: 'National Obstetric Fistula Centre (NOFIC), Ningi',
    state: 'Bauchi',
    zone: 'North East',
    city: 'Ningi',
    address: 'Along Kano-Bauchi Road, Ningi, Bauchi State',
    phone: '+234 802 384 6612',
    altPhone: '+234 806 552 4110',
    partner: 'Federal Ministry of Health (FMOH), UNFPA, Bauchi State Government',
    isFree: true,
    transportSupport: 'Subsidized travel through local CHEW/CHW referral vouchers in North East rural LGAs.',
    specialistHead: 'Consultant Urogynecologist & Clinical Services Director',
    services: [
      '100% Free repair surgery for VVF (urinary) & RVF (fecal) fistula',
      'Pre-operative physiotherapy and nutritional rehabilitation',
      'Free medication, laboratory workups, and high-protein recovery meals',
      'Spousal and family reconciliation counseling sessions',
      'Economic empowerment grants and sewing machine distribution for discharged survivors'
    ],
    description: 'Federal tertiary fistula center serving the entire North East and North Central zones. Recognized for advanced complex fistula reconstruction and clinical training for resident doctors and nurse-midwives.'
  },
  {
    id: 'nofic-abakaliki',
    name: 'National Obstetric Fistula Centre (NOFIC), Abakaliki',
    state: 'Ebonyi',
    zone: 'South East',
    city: 'Abakaliki',
    address: '86 New Hospital Road, Abakaliki, Ebonyi State',
    phone: '+234 803 742 8841',
    altPhone: '+234 805 220 1934',
    partner: 'Federal Ministry of Health (FMOH), EngenderHealth, UNFPA',
    isFree: true,
    transportSupport: 'Free pick-up points coordinated during quarterly surgical outreach pools across South East / South South states.',
    specialistHead: 'Medical Director & Consultant Obstetrician/Gynecologist',
    services: [
      '100% Free surgical fistula repairs and pelvic floor reconstruction',
      'Urodynamic studies and urinary incontinence management',
      'Free inpatient care, sterile catheters, antibiotics, and dressings',
      'Dignity kits and trauma-informed psychosocial counseling',
      'Comprehensive family planning counseling & elective caesarean section tracking for future pregnancies'
    ],
    description: 'Federal center of excellence serving South East, South South, and North Central Nigeria. Offers free surgeries round the year, regular outreach pools, and survivor empowerment cooperatives.'
  },
  {
    id: 'laure-kano',
    name: 'Laure Fistula Centre, Murtala Muhammad Specialist Hospital (MMSH)',
    state: 'Kano',
    zone: 'North West',
    city: 'Kano',
    address: 'Kofar Kudu, Old City, Kano Municipal, Kano State',
    phone: '+234 803 590 1243',
    altPhone: '+234 802 890 3311',
    partner: 'Kano State Ministry of Health, UNFPA, Fistula Foundation',
    isFree: true,
    transportSupport: 'Free community ambulance transfers coordinated through Kano State Primary Healthcare Management Board.',
    specialistHead: 'Consultant Fistula Surgeon',
    services: [
      'High-volume free obstetric fistula surgical repair unit',
      'Catheter drainage protocol for early acute fistula healing',
      'Perineal hygiene counseling and dermatitis treatment packs',
      'Psychological therapy and survivor peer-support groups',
      'Livelihood skills training in confectionery, soap making, and textile dye'
    ],
    description: 'One of the longest operating dedicated fistula units in West Africa with thousands of successful surgeries performed. Provides continuous walk-in screening and free treatment for women.'
  },
  {
    id: 'maryam-abacha-sokoto',
    name: 'Maryam Abacha Women & Children Hospital VVF Centre',
    state: 'Sokoto',
    zone: 'North West',
    city: 'Sokoto',
    address: 'Off Western Bypass, Sokoto, Sokoto State',
    phone: '+234 803 218 7755',
    altPhone: '+234 806 720 9180',
    partner: 'Sokoto State Government, USAID, UNFPA',
    isFree: true,
    transportSupport: 'Community outreach transport provided by local women development groups.',
    specialistHead: 'Lead Fistula Specialist Surgeon',
    services: [
      'Free surgical repair of vesicovaginal and rectovaginal fistulas',
      'Free post-operative bladder re-training and pelvic floor exercise therapy',
      'Free hospital meals, clean gowns, and antiseptic hygiene packs',
      'Family and community anti-stigma mediation',
      'Post-discharge follow-up and livelihood rehabilitation'
    ],
    description: 'Pioneer center in Sokoto State providing world-class surgical repair and restorative dignity programs for fistula survivors from Sokoto, Kebbi, Zamfara, and Niger.'
  },
  {
    id: 'jahun-msf-jigawa',
    name: 'Jahun General Hospital Fistula Project (MSF / Jigawa Govt)',
    state: 'Jigawa',
    zone: 'North West',
    city: 'Jahun',
    address: 'Jahun General Hospital, Jahun, Jigawa State',
    phone: '+234 813 440 2290',
    altPhone: '+234 803 119 5500',
    partner: 'Médecins Sans Frontières (MSF - Doctors Without Borders), Jigawa State MoH',
    isFree: true,
    transportSupport: 'Free round-trip transportation arranged for patients and caregiver from rural communities.',
    specialistHead: 'MSF International Fistula Surgical Team',
    services: [
      'Free specialized obstetric fistula surgeries performed by international & national experts',
      '24/7 Comprehensive Emergency Obstetric Care (CEmONC) to prevent new fistula cases',
      'Full accommodation, complete nutrition, medicines, and surgical supplies at zero charge',
      'Comprehensive physical therapy, foot-drop rehabilitation, and mental health counseling',
      'Graduation ceremony with dignity kits and sewing machines/startup packs'
    ],
    description: 'A global benchmark partnership between Médecins Sans Frontières (MSF) and the Jigawa State Government. Delivers comprehensive emergency obstetric care and top-tier restorative fistula surgery 100% free of charge.'
  },
  {
    id: 'sobi-ilorin',
    name: 'Sobi Specialist Hospital VVF Centre',
    state: 'Kwara',
    zone: 'North Central',
    city: 'Ilorin',
    address: 'Alagbado Area, Sobi, Ilorin, Kwara State',
    phone: '+234 803 358 1920',
    altPhone: '+234 805 601 2344',
    partner: 'Kwara State Ministry of Health, UNFPA, Fistula Foundation',
    isFree: true,
    transportSupport: 'Assistance coordinated via Kwara Primary Healthcare Development Agency.',
    specialistHead: 'Chief Consultant Obstetrician & Fistula Surgeon',
    services: [
      'Free surgical repair campaigns and routine elective repairs',
      'Foley catheter drainage therapy for recent post-delivery leaks',
      'Nutritional repletion, high-protein supplements, and barrier creams',
      'Community sensitization and safe motherhood education',
      'Survivors advocacy club and peer counseling'
    ],
    description: 'Major referral facility for North Central and South West Nigeria. Has restored thousands of women back to health and social dignity with dedicated surgical repair teams.'
  },
  {
    id: 'bingham-jos',
    name: 'Bingham University Teaching Hospital Fistula Centre',
    state: 'Plateau',
    zone: 'North Central',
    city: 'Jos',
    address: 'Zaria Road, Jos, Plateau State',
    phone: '+234 803 700 8912',
    altPhone: '+234 802 910 4455',
    partner: 'ECWA, International Fistula Partners, Plateau State MoH',
    isFree: true,
    transportSupport: 'Faith-based and partner travel subsidy programs for vulnerable women.',
    specialistHead: 'Consultant Fistula Surgeon & Fellowship Trainer',
    services: [
      'Subsidized and free donor-sponsored surgical repairs of complex fistulas',
      'Training center for African fistula surgeons and nurse-midwives',
      'Holistic physical, spiritual, and emotional healing support',
      'Ureteral re-implantation and neo-bladder reconstruction',
      'Safe motherhood education and future C-section birth plan counseling'
    ],
    description: 'Internationally recognized training and surgical center in Jos. Highly renowned for treating the most complex and repeat fistula cases with deep compassion and clinical excellence.'
  },
  {
    id: 'oauthc-ilesa',
    name: 'Wesley Guild Hospital / OAUTHC Fistula Unit, Ilesa',
    state: 'Osun',
    zone: 'South West',
    city: 'Ilesa',
    address: 'Wesley Guild Hospital Unit, OAUTHC, Ilesa, Osun State',
    phone: '+234 803 409 6321',
    altPhone: '+234 806 880 2311',
    partner: 'Obafemi Awolowo University Teaching Hospitals Complex, FMOH, UNFPA',
    isFree: true,
    transportSupport: 'Community healthcare outreach pickup points during surgical camps.',
    specialistHead: 'Professor of Obstetrics & Gynaecology / Urogynecology Lead',
    services: [
      'Free surgical repair pools and advanced pelvic reconstructive surgery',
      'Management of obstetric and iatrogenic (post-surgical) vesicovaginal fistulas',
      'Pre-op workup, diagnostic dye testing, and ultrasound evaluation',
      'Pelvic floor physiotherapy and recovery monitoring',
      'Psychosocial counseling and community reintegration'
    ],
    description: 'Leading tertiary academic center in South West Nigeria managing both obstetric and surgical fistulas with state-of-the-art facilities and experienced surgical teams.'
  },
  {
    id: 'uuth-uyo',
    name: 'University of Uyo Teaching Hospital (UUTH) Fistula Unit',
    state: 'Akwa Ibom',
    zone: 'South South',
    city: 'Uyo',
    address: 'Abak Road, Uyo, Akwa Ibom State',
    phone: '+234 802 311 9084',
    altPhone: '+234 803 667 4310',
    partner: 'Federal Ministry of Health, Akwa Ibom State Govt, UNFPA',
    isFree: true,
    transportSupport: 'LGA health authority coordination for rural referral transportation.',
    specialistHead: 'Consultant Gynecologist & Fistula Team Lead',
    services: [
      'Free surgical fistula repair camps and continuous clinical triage',
      'Catheter care and post-delivery conservative management',
      'Dermatitis barrier ointments and hygiene rehabilitation kits',
      'Community health extension worker (CHEW) case-finding network',
      'Future pregnancy elective caesarean registry'
    ],
    description: 'Key referral hub for the Niger Delta and South South region, providing surgical repairs and dignified social rehabilitation for women afflicted by prolonged obstructed labor.'
  },
  {
    id: 'fmc-birnin-kebbi',
    name: 'Federal Medical Centre (FMC) VVF Centre, Birnin Kebbi',
    state: 'Kebbi',
    zone: 'North West',
    city: 'Birnin Kebbi',
    address: 'FMC Road, Kalgo / Birnin Kebbi, Kebbi State',
    phone: '+234 803 450 7820',
    altPhone: '+234 806 910 8844',
    partner: 'Federal Government, Kebbi State Ministry of Women Affairs, UNFPA',
    isFree: true,
    transportSupport: 'State government subsidized logistics for rural women mobilization.',
    specialistHead: 'Head of Clinical Services & Senior Fistula Specialist',
    services: [
      '100% Free repair surgeries and inpatient recuperation',
      'Continuous Foley catheter management for early cases',
      'Free medications, nutritional repletion, and dignity supplies',
      'Survivors skill training and micro-enterprise startup equipment',
      'Counseling for husbands and community heads on delayed labor prevention'
    ],
    description: 'Active North West center providing surgical treatment, prevention outreach, and survivor economic empowerment programs in Kebbi, Niger, and border towns.'
  },
  {
    id: 'ogoja-cross-river',
    name: 'General Hospital Ogoja Fistula Unit',
    state: 'Cross River',
    zone: 'South South',
    city: 'Ogoja',
    address: 'Hospital Road, Ogoja, Cross River State',
    phone: '+234 803 789 4432',
    altPhone: '+234 805 112 7790',
    partner: 'Cross River State Ministry of Health, UNFPA, Fistula Care',
    isFree: true,
    transportSupport: 'Outreach mobilization in Northern Cross River and neighboring Benue State.',
    specialistHead: 'Consultant Obstetric Surgeon',
    services: [
      'Free surgical repair pools and clinical assessment',
      'Fistula prevention education via community radio and town announcers',
      'Hygiene packs and post-operative skin soothing care',
      'Rehabilitation and reintegration support',
      'Collaboration with TBAs to eliminate prolonged home labor'
    ],
    description: 'Strategic center serving Cross River, Benue, and surrounding border communities with free surgical repairs, clinical training, and community awareness.'
  }
];

export const NATIONAL_FISTULA_HOTLINES = [
  {
    title: 'National Obstetric Fistula Helpline (FMOH / UNFPA)',
    phone: '0800-FISTULA (0800 347 8852)',
    description: 'Toll-Free 24/7 hotline for confidential assistance, center directions, and registration for upcoming free surgical pools.',
    cost: '100% Toll-Free (Zero airtime charge from MTN, Airtel, Glo, 9mobile)'
  },
  {
    title: 'Emergency Medical & Ambulance Service (Nigeria)',
    phone: '112',
    description: 'National emergency number for urgent obstructed labor transfer or medical crisis.',
    cost: 'Toll-Free'
  }
];
