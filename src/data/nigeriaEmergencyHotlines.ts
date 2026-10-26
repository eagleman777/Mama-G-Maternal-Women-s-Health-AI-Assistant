export interface NigeriaStateEmergency {
  state: string;
  zone: 'South West' | 'South South' | 'South East' | 'North Central' | 'North West' | 'North East';
  capital: string;
  tollFree: string[];
  maternalAmbulanceHelpline: string;
  stateEmergencyOpsCenter: string;
  referralHospitals: string[];
  emergencyNotes?: string;
}

export interface MentalHealthCrisisContact {
  name: string;
  category: 'Suicide Prevention & Crisis' | 'Federal Neuropsychiatric Hospital' | 'Postpartum Mental Health';
  phone: string;
  hours: string;
  tollFree: boolean;
  location: string;
  description: string;
}

export interface DomesticViolenceGbvContact {
  name: string;
  category: 'National Hotline' | 'State DSVA / SARC' | 'Sexual Assault Support' | 'Legal & Shelter Support';
  phone: string;
  hours: string;
  tollFree: boolean;
  location: string;
  description: string;
}

export const MENTAL_HEALTH_CRISIS_DATA = {
  overview:
    'If you or a mother you know is experiencing acute suicidal thoughts, overwhelming panic, or postpartum psychosis (hearing voices, seeing things, or sudden urges to harm self or baby), this is a medical emergency. Compassionate, non-judgmental psychiatric help is available 24/7.',
  emergencyActions: [
    'Ensure 24/7 continuous supervision: Never leave the mother alone with the infant during an acute crisis.',
    'Remove all sharp objects, ropes, and prescription/over-the-counter medications from reach.',
    'Speak calmly in a low, reassuring voice without arguing with hallucinations or delusions.',
    'Accompany the mother immediately to the nearest Emergency Psychiatric or Tertiary Teaching Hospital.',
  ],
  contacts: [
    {
      name: 'She Writes Woman Mental Health Lifeline',
      category: 'Postpartum Mental Health',
      phone: '0800 800 2000',
      hours: '24/7 Toll-Free',
      tollFree: true,
      location: 'National / All States',
      description: 'Specialized 24/7 maternal and women mental health crisis support, suicide prevention, and tele-counseling.',
    },
    {
      name: 'Mentally Aware Nigeria Initiative (MANI Crisis Line)',
      category: 'Suicide Prevention & Crisis',
      phone: '0809 111 6264',
      hours: '24/7 Immediate Response',
      tollFree: false,
      location: 'National / All States',
      description: 'First-line rapid suicide intervention, acute anxiety, panic attacks, and severe postpartum depression counseling.',
    },
    {
      name: 'Asido Foundation Suicide Prevention Lifeline',
      category: 'Suicide Prevention & Crisis',
      phone: '0908 080 5444',
      hours: '24/7 Dedicated Line',
      tollFree: false,
      location: 'National / All States',
      description: 'Trained psychological emergency counselors providing immediate suicide risk assessment and de-escalation.',
    },
    {
      name: 'Federal Neuropsychiatric Hospital Yaba (FNPHY)',
      category: 'Federal Neuropsychiatric Hospital',
      phone: '0803 303 8989',
      hours: '24/7 Emergency Ward',
      tollFree: false,
      location: 'Yaba, Lagos State',
      description: 'Full 24/7 emergency psychiatric intake, acute postpartum psychosis stabilization, and maternal ward.',
    },
    {
      name: 'Neuropsychiatric Hospital Aro',
      category: 'Federal Neuropsychiatric Hospital',
      phone: '0803 714 8822',
      hours: '24/7 Emergency Ward',
      tollFree: false,
      location: 'Abeokuta, Ogun State',
      description: 'WHO-collaborating center for mental health and acute peripartum psychiatric emergencies.',
    },
    {
      name: 'Federal Neuropsychiatric Hospital Uselu',
      category: 'Federal Neuropsychiatric Hospital',
      phone: '0803 615 4422',
      hours: '24/7 Emergency Ward',
      tollFree: false,
      location: 'Benin City, Edo State',
      description: 'Tertiary psychiatric emergency unit serving South-South Nigeria with dedicated maternal mental health clinic.',
    },
    {
      name: 'Federal Neuropsychiatric Hospital Barnawa',
      category: 'Federal Neuropsychiatric Hospital',
      phone: '0803 712 3344',
      hours: '24/7 Emergency Ward',
      tollFree: false,
      location: 'Kaduna, Kaduna State',
      description: 'Emergency psychiatric stabilization, maternal mood disorder inpatient care for North-West Nigeria.',
    },
    {
      name: 'Federal Neuropsychiatric Hospital Kware',
      category: 'Federal Neuropsychiatric Hospital',
      phone: '0803 618 9900',
      hours: '24/7 Emergency Ward',
      tollFree: false,
      location: 'Sokoto State',
      description: '24-hour acute psychiatric admission and counseling serving Sokoto, Kebbi, and Zamfara.',
    },
    {
      name: 'Federal Neuropsychiatric Hospital Calabar',
      category: 'Federal Neuropsychiatric Hospital',
      phone: '0803 711 6633',
      hours: '24/7 Emergency Ward',
      tollFree: false,
      location: 'Calabar, Cross River State',
      description: 'Emergency psychiatric and maternal psychosocial rehabilitation clinic.',
    },
    {
      name: 'Federal Neuropsychiatric Hospital Enugu',
      category: 'Federal Neuropsychiatric Hospital',
      phone: '0803 714 2200',
      hours: '24/7 Emergency Ward',
      tollFree: false,
      location: 'New Haven, Enugu State',
      description: 'Specialized emergency neuropsychiatric hospital for South-East Nigeria.',
    },
  ] as MentalHealthCrisisContact[],
};

export const DOMESTIC_VIOLENCE_GBV_DATA = {
  overview:
    'Pregnancy and postpartum are periods of heightened vulnerability for intimate partner violence (IPV) and physical/sexual abuse. You have the right to safety, dignity, and immediate confidential protection. Free medical care, safe shelter referrals, and emergency rescue are available.',
  emergencyActions: [
    'If in immediate physical danger: Flee to a public place, neighbor, or health clinic, or lock yourself in a room with access to a phone.',
    'Emergency Sexual Assault Care (First 72 Hours): Visit a Sexual Assault Referral Centre (SARC) within 72 hours for free HIV Post-Exposure Prophylaxis (PEP) and within 120 hours for emergency contraception. Do not bathe or change clothes if forensic evidence collection is needed; place worn clothes in a clean paper bag.',
    'Pack an Emergency Escape Kit ("Go-Bag"): Keep national ID, child health cards, birth certificates, cash, and essential medicines with a trusted friend or hidden spot.',
    'Establish a Safe Code Word: Agree on a discreet code word with trusted friends or neighbors to alert them to call the police or come help without alerting the abuser.',
  ],
  contacts: [
    {
      name: 'National GBV Toll-Free Helpline (Federal Ministry of Women Affairs)',
      category: 'National Hotline',
      phone: '0800 111 2222',
      hours: '24/7 Toll-Free',
      tollFree: true,
      location: 'National / All States',
      description: 'Federal rapid response hotline for reporting domestic violence, physical assault, and emergency shelter coordination.',
    },
    {
      name: 'Lagos State Domestic and Sexual Violence Agency (DSVA)',
      category: 'State DSVA / SARC',
      phone: '08000 333 333',
      hours: '24/7 Toll-Free Desk',
      tollFree: true,
      location: 'Lagos State',
      description: 'State agency providing rapid police rescue, emergency medical referral, free legal aid, and temporary safe shelter.',
    },
    {
      name: 'Mirabel Centre (Sexual Assault Referral Centre - SARC)',
      category: 'Sexual Assault Support',
      phone: '0818 789 2222',
      hours: '24/7 Free Care',
      tollFree: false,
      location: 'LASUTH Ikeja, Lagos (National Referrals)',
      description: 'Nigeria’s first SARC: 100% free medical care, forensic examination, emergency contraception, PEP, and trauma counseling.',
    },
    {
      name: 'Women at Risk International Foundation (WARIF Helpline)',
      category: 'Sexual Assault Support',
      phone: '0809 210 0009',
      hours: '24/7 Crisis Hotline',
      tollFree: false,
      location: 'National / All States',
      description: 'Confidential 24/7 crisis response, psychological first aid, and immediate medical referral for survivors.',
    },
    {
      name: 'National Agency for Prohibition of Trafficking in Persons (NAPTIP)',
      category: 'National Hotline',
      phone: '0800 225 5627',
      hours: '24/7 Toll-Free',
      tollFree: true,
      location: 'National / All States',
      description: 'Federal rapid intervention for severe abuse, human trafficking, forced isolation, and child exploitation.',
    },
    {
      name: 'Project Alert on Violence Against Women',
      category: 'Legal & Shelter Support',
      phone: '0818 009 1072',
      hours: 'Mon – Sun 8am – 8pm',
      tollFree: false,
      location: 'Lagos / National',
      description: 'Runs "Sophia’s Place" emergency shelter for battered women and provides legal advocacy and counseling.',
    },
    {
      name: 'Stand To End Rape (STER Initiative Crisis Line)',
      category: 'Sexual Assault Support',
      phone: '0809 596 7000',
      hours: '24/7 Support',
      tollFree: false,
      location: 'National / All States',
      description: 'Direct psycho-social support, justice coordination, and emergency medical navigation.',
    },
    {
      name: 'National Human Rights Commission (NHRC GBV Desk)',
      category: 'Legal & Shelter Support',
      phone: '0800 647 2435',
      hours: '24/7 Toll-Free',
      tollFree: true,
      location: 'National / All States',
      description: 'Federal human rights protection desk for victims of domestic battering and unlawful detention.',
    },
  ] as DomesticViolenceGbvContact[],
};

export const NIGERIA_EMERGENCY_OVERVIEW = {
  nationalTollFree: '112',
  frscEmergency: '122',
  redCrossEmergency: '0803 123 0456 / 0800 733 27677',
  policeEmergency: '199 / 0803 123 0631',
  ncdcHotline: '6232 (Toll Free)',
  gbvNationalTollFree: '0800 111 2222',
  mentalHealthTollFree: '0800 800 2000',
};


export const NIGERIA_STATES_EMERGENCY_DATA: NigeriaStateEmergency[] = [
  // --- SOUTH WEST ---
  {
    state: 'Lagos',
    zone: 'South West',
    capital: 'Ikeja',
    tollFree: ['112', '767'],
    maternalAmbulanceHelpline: '0817 847 4333 (LASAMBUS Emergency)',
    stateEmergencyOpsCenter: '0803 356 5529 / 0802 316 9485',
    referralHospitals: [
      'Lagos University Teaching Hospital (LUTH, Idi-Araba)',
      'Lagos State University Teaching Hospital (LASUTH, Ikeja)',
      'Island Maternity Hospital (Lagos Island)',
      'Gbagada General Hospital Maternal Center',
      'Ikorodu General Hospital Maternal & Child Center'
    ],
    emergencyNotes: 'LASAMBUS operates 24/7 obstetric emergency ambulances across all local government areas in Lagos.'
  },
  {
    state: 'Oyo',
    zone: 'South West',
    capital: 'Ibadan',
    tollFree: ['112', '615'],
    maternalAmbulanceHelpline: '0803 821 0122 (OYSMOH Emergency Desk)',
    stateEmergencyOpsCenter: '0800 696 43258 / 0803 353 2838',
    referralHospitals: [
      'University College Hospital (UCH Ibadan, CEmONC Center)',
      'Adeoyo Maternity Teaching Hospital (Yemetu, Ibadan)',
      'State Hospital Ring Road (Ibadan)',
      'Bowen University Teaching Hospital (Ogbomoso)'
    ]
  },
  {
    state: 'Ogun',
    zone: 'South West',
    capital: 'Abeokuta',
    tollFree: ['112'],
    maternalAmbulanceHelpline: '0808 138 6617 (Ogun State Ambulance Service)',
    stateEmergencyOpsCenter: '0803 359 1033 / 0809 993 6126',
    referralHospitals: [
      'Olabisi Onabanjo University Teaching Hospital (OOUTH, Sagamu)',
      'Federal Medical Centre (FMC Abeokuta)',
      'State Hospital Ijaiye (Abeokuta)',
      'General Hospital Ota'
    ]
  },
  {
    state: 'Ondo',
    zone: 'South West',
    capital: 'Akure',
    tollFree: ['112'],
    maternalAmbulanceHelpline: '0800 000 6636 (Ondo Mother & Child Initiative)',
    stateEmergencyOpsCenter: '0803 568 2387 / 0817 010 1499',
    referralHospitals: [
      'University of Medical Sciences Teaching Hospital (UNIMEDTH, Ondo/Akure)',
      'Mother and Child Hospital (Akure)',
      'Federal Medical Centre (FMC Owo)',
      'State Specialist Hospital (Ikare-Akoko)'
    ],
    emergencyNotes: 'Abiye Maternal Program provides dedicated triage and ambulance transport in Ondo State.'
  },
  {
    state: 'Osun',
    zone: 'South West',
    capital: 'Osogbo',
    tollFree: ['112'],
    maternalAmbulanceHelpline: '0803 390 5250 (Osun Ambulance Service - O-AMBULANCE)',
    stateEmergencyOpsCenter: '0803 703 8550 / 0813 508 1156',
    referralHospitals: [
      'Obafemi Awolowo University Teaching Hospitals Complex (OAUTHC, Ile-Ife)',
      'Osun State University Teaching Hospital (UNIOSUNTH, Osogbo)',
      'State Specialist Hospital Asubiaro (Osogbo)',
      'Wesley Guild Hospital (Ilesa)'
    ]
  },
  {
    state: 'Ekiti',
    zone: 'South West',
    capital: 'Ado-Ekiti',
    tollFree: ['112'],
    maternalAmbulanceHelpline: '0803 400 3305 (Ekiti Health Emergency Helpline)',
    stateEmergencyOpsCenter: '0802 922 4567 / 0806 828 7076',
    referralHospitals: [
      'Ekiti State University Teaching Hospital (EKSUTH, Ado-Ekiti)',
      'Federal Teaching Hospital (FTH Ido-Ekiti)',
      'State Specialist Hospital (Ikole-Ekiti)'
    ]
  },

  // --- SOUTH SOUTH ---
  {
    state: 'Akwa Ibom',
    zone: 'South South',
    capital: 'Uyo',
    tollFree: ['112'],
    maternalAmbulanceHelpline: '0818 894 1111 (Akwa Ibom Emergency Medical Services)',
    stateEmergencyOpsCenter: '0803 643 9459 / 0802 844 2194',
    referralHospitals: [
      'University of Uyo Teaching Hospital (UUTH, Uyo)',
      'Ibom Specialist Hospital (Uyo)',
      'General Hospital Ikot Ekpene',
      'General Hospital Oron',
      'Immanuel General Hospital (Eket)'
    ]
  },
  {
    state: 'Rivers',
    zone: 'South South',
    capital: 'Port Harcourt',
    tollFree: ['112'],
    maternalAmbulanceHelpline: '0803 312 4774 (Rivers State Emergency Medical Service)',
    stateEmergencyOpsCenter: '0805 673 8765 / 0803 339 6516',
    referralHospitals: [
      'University of Port Harcourt Teaching Hospital (UPTH, Choba)',
      'Rivers State University Teaching Hospital (RSUTH, Old GRA)',
      'Rivers State Mother & Child Hospital (Aba Road, PH)',
      'General Hospital Bori'
    ]
  },
  {
    state: 'Delta',
    zone: 'South South',
    capital: 'Asaba',
    tollFree: ['112'],
    maternalAmbulanceHelpline: '0803 123 0345 (Delta Emergency Medical Response)',
    stateEmergencyOpsCenter: '0803 123 0567 / 0803 723 3559',
    referralHospitals: [
      'Delta State University Teaching Hospital (DELSUTH, Oghara)',
      'Federal Medical Centre (FMC Asaba)',
      'Central Hospital Warri',
      'Central Hospital Agbor',
      'Central Hospital Ughelli'
    ]
  },
  {
    state: 'Edo',
    zone: 'South South',
    capital: 'Benin City',
    tollFree: ['112'],
    maternalAmbulanceHelpline: '0808 409 6723 (Edo State Emergency Desk)',
    stateEmergencyOpsCenter: '0806 493 2531 / 0803 583 5529',
    referralHospitals: [
      'University of Benin Teaching Hospital (UBTH, Benin City)',
      'Edo State Specialist Hospital (Sapele Road, Benin City)',
      'Irrua Specialist Teaching Hospital (ISTH, Irrua)',
      'Central Hospital Benin City'
    ]
  },
  {
    state: 'Cross River',
    zone: 'South South',
    capital: 'Calabar',
    tollFree: ['112'],
    maternalAmbulanceHelpline: '0803 864 6302 (Cross River Health Emergency)',
    stateEmergencyOpsCenter: '0803 714 5543 / 0802 841 1233',
    referralHospitals: [
      'University of Calabar Teaching Hospital (UCTH, Calabar)',
      'General Hospital Calabar (Mary Slessor Avenue)',
      'General Hospital Ogoja',
      'General Hospital Ikom'
    ]
  },
  {
    state: 'Bayelsa',
    zone: 'South South',
    capital: 'Yenagoa',
    tollFree: ['112'],
    maternalAmbulanceHelpline: '0803 723 8899 (Bayelsa Health Emergency Response)',
    stateEmergencyOpsCenter: '0803 667 9253 / 0802 783 1456',
    referralHospitals: [
      'Niger Delta University Teaching Hospital (NDUTH, Okolobiri)',
      'Federal Medical Centre (FMC Yenagoa)',
      'Diete Koki Memorial Hospital (Opolo, Yenagoa)'
    ]
  },

  // --- SOUTH EAST ---
  {
    state: 'Enugu',
    zone: 'South East',
    capital: 'Enugu',
    tollFree: ['112', '117'],
    maternalAmbulanceHelpline: '0803 337 4707 (Enugu State Emergency Medical Service - ENSEMS)',
    stateEmergencyOpsCenter: '0803 711 4151 / 0802 360 0638',
    referralHospitals: [
      'University of Nigeria Teaching Hospital (UNTH, Ituku-Ozalla)',
      'Enugu State University of Science and Technology Teaching Hospital (ESUT-TH, Parklane)',
      'National Orthopaedic Hospital Enugu',
      'Bishop Shanahan Hospital (Nsukka)'
    ]
  },
  {
    state: 'Anambra',
    zone: 'South East',
    capital: 'Awka',
    tollFree: ['112'],
    maternalAmbulanceHelpline: '0803 099 9947 (Anambra State Health Emergency)',
    stateEmergencyOpsCenter: '0803 658 5449 / 0802 324 1145',
    referralHospitals: [
      'Nnamdi Azikiwe University Teaching Hospital (NAUTH, Nnewi)',
      'Chukwuemeka Odumegwu Ojukwu University Teaching Hospital (COOUTH, Amaku-Awka)',
      'General Hospital Onitsha'
    ]
  },
  {
    state: 'Abia',
    zone: 'South East',
    capital: 'Umuahia',
    tollFree: ['112'],
    maternalAmbulanceHelpline: '0807 600 0096 (Abia State Health Emergency Desk)',
    stateEmergencyOpsCenter: '0803 711 7447 / 0806 322 8841',
    referralHospitals: [
      'Federal Medical Centre (FMC Umuahia)',
      'Abia State University Teaching Hospital (ABSUTH, Aba)',
      'General Hospital Amachara'
    ]
  },
  {
    state: 'Imo',
    zone: 'South East',
    capital: 'Owerri',
    tollFree: ['112'],
    maternalAmbulanceHelpline: '0803 703 3388 (Imo State Emergency Response)',
    stateEmergencyOpsCenter: '0803 710 4422 / 0802 841 9920',
    referralHospitals: [
      'Federal Medical Centre (FMC Owerri)',
      'Imo State University Teaching Hospital (IMSUTH, Orlu)',
      'General Hospital Umuguma'
    ]
  },
  {
    state: 'Ebonyi',
    zone: 'South East',
    capital: 'Abakaliki',
    tollFree: ['112'],
    maternalAmbulanceHelpline: '0803 392 4111 (Ebonyi Health Emergency)',
    stateEmergencyOpsCenter: '0803 711 2233 / 0802 884 5519',
    referralHospitals: [
      'Alex Ekwueme Federal University Teaching Hospital (AE-FUTHA, Abakaliki)',
      'Mater Misericordiae Hospital (Afikpo)',
      'General Hospital Onueke'
    ]
  },

  // --- NORTH CENTRAL (including FCT Abuja) ---
  {
    state: 'FCT (Abuja)',
    zone: 'North Central',
    capital: 'Abuja',
    tollFree: ['112'],
    maternalAmbulanceHelpline: '0809 993 6312 (FCT Emergency Management Agency - FEMA)',
    stateEmergencyOpsCenter: '0803 123 0340 / 0802 845 5120',
    referralHospitals: [
      'National Hospital Abuja (Central Area, CEmONC Center)',
      'University of Abuja Teaching Hospital (UATH, Gwagwalada)',
      'Maitama District Hospital',
      'Asokoro District Hospital',
      'Wuse District Hospital',
      'Kubwa General Hospital'
    ],
    emergencyNotes: 'FEMA ambulances coordinate directly with FCT Primary Healthcare Board for emergency transfers.'
  },
  {
    state: 'Plateau',
    zone: 'North Central',
    capital: 'Jos',
    tollFree: ['112'],
    maternalAmbulanceHelpline: '0803 700 8820 (Plateau State Emergency Operations)',
    stateEmergencyOpsCenter: '0803 615 3564 / 0802 541 3320',
    referralHospitals: [
      'Jos University Teaching Hospital (JUTH, Jos)',
      'Plateau State Specialist Hospital (Jos)',
      'Bingham University Teaching Hospital (Jankwano, Jos)',
      'General Hospital Pankshin'
    ]
  },
  {
    state: 'Kwara',
    zone: 'North Central',
    capital: 'Ilorin',
    tollFree: ['112'],
    maternalAmbulanceHelpline: '0803 388 6474 (Kwara State Ambulance & Emergency Desk)',
    stateEmergencyOpsCenter: '0803 723 5511 / 0802 334 1198',
    referralHospitals: [
      'University of Ilorin Teaching Hospital (UITH, Ilorin)',
      'Kwara State General Hospital (Ilorin)',
      'General Hospital Offa'
    ]
  },
  {
    state: 'Benue',
    zone: 'North Central',
    capital: 'Makurdi',
    tollFree: ['112'],
    maternalAmbulanceHelpline: '0803 612 4433 (Benue State Health Emergency)',
    stateEmergencyOpsCenter: '0803 711 9900 / 0802 841 3311',
    referralHospitals: [
      'Benue State University Teaching Hospital (BSUTH, Makurdi)',
      'Federal Medical Centre (FMC Makurdi)',
      'General Hospital Otukpo',
      'General Hospital Gboko'
    ]
  },
  {
    state: 'Niger',
    zone: 'North Central',
    capital: 'Minna',
    tollFree: ['112'],
    maternalAmbulanceHelpline: '0803 600 4455 (Niger State Health Helpline)',
    stateEmergencyOpsCenter: '0803 714 2211 / 0802 884 1122',
    referralHospitals: [
      'Federal Medical Centre (FMC Bida)',
      'General Hospital Minna',
      'General Hospital Suleja',
      'General Hospital Kontagora'
    ]
  },
  {
    state: 'Kogi',
    zone: 'North Central',
    capital: 'Lokoja',
    tollFree: ['112'],
    maternalAmbulanceHelpline: '0803 381 2299 (Kogi Emergency Response)',
    stateEmergencyOpsCenter: '0803 711 8844 / 0802 841 7722',
    referralHospitals: [
      'Federal Teaching Hospital (FTH Lokoja, formerly FMC)',
      'Kogi State Specialist Hospital (Lokoja)',
      'Grimard Catholic Hospital (Anyigba)'
    ]
  },
  {
    state: 'Nasarawa',
    zone: 'North Central',
    capital: 'Lafia',
    tollFree: ['112'],
    maternalAmbulanceHelpline: '0803 621 5566 (Nasarawa Emergency Desk)',
    stateEmergencyOpsCenter: '0803 714 8833 / 0802 884 3344',
    referralHospitals: [
      'Dalhatu Araf Specialist Hospital (DASH, Lafia)',
      'Federal Medical Centre (FMC Keffi)',
      'General Hospital Akwanga'
    ]
  },

  // --- NORTH WEST ---
  {
    state: 'Kano',
    zone: 'North West',
    capital: 'Kano',
    tollFree: ['112'],
    maternalAmbulanceHelpline: '0803 688 8872 (Kano State Emergency Operations)',
    stateEmergencyOpsCenter: '0803 714 5511 / 0802 841 0022',
    referralHospitals: [
      'Aminu Kano Teaching Hospital (AKTH, Kano)',
      'Murtala Muhammad Specialist Hospital (Kano City, CEmONC Hub)',
      'Muhammad Abdullahi Wase Teaching Hospital (Nassarawa Hospital)',
      'Wudil General Hospital'
    ],
    emergencyNotes: 'Murtala Muhammad Specialist Hospital runs one of Nigeria’s highest-volume 24/7 maternal triage units.'
  },
  {
    state: 'Kaduna',
    zone: 'North West',
    capital: 'Kaduna',
    tollFree: ['112'],
    maternalAmbulanceHelpline: '0803 587 1662 (Kaduna State Emergency Medical Service - KADSEMS)',
    stateEmergencyOpsCenter: '0803 711 3344 / 0802 884 9911',
    referralHospitals: [
      'Ahmadu Bello University Teaching Hospital (ABUTH, Shika-Zaria)',
      'Barau Dikko Teaching Hospital (Kaduna City)',
      'Yusuf Dantsoho Memorial Hospital (Tudun Wada, Kaduna)',
      'Gwamna Awan General Hospital (Kakuri)'
    ]
  },
  {
    state: 'Katsina',
    zone: 'North West',
    capital: 'Katsina',
    tollFree: ['112'],
    maternalAmbulanceHelpline: '0803 614 7788 (Katsina Health Emergency Desk)',
    stateEmergencyOpsCenter: '0803 714 6622 / 0802 884 2233',
    referralHospitals: [
      'Federal Teaching Hospital (FTH Katsina)',
      'General Hospital Katsina (Maternal Unit)',
      'General Hospital Daura',
      'General Hospital Funtua'
    ]
  },
  {
    state: 'Sokoto',
    zone: 'North West',
    capital: 'Sokoto',
    tollFree: ['112'],
    maternalAmbulanceHelpline: '0803 592 1144 (Sokoto Emergency Operations Center)',
    stateEmergencyOpsCenter: '0803 711 5566 / 0802 884 7788',
    referralHospitals: [
      'Usmanu Danfodiyo University Teaching Hospital (UDUTH, Sokoto)',
      'Sokoto State Specialist Hospital',
      'Maryam Abacha Women and Children Hospital (Sokoto)'
    ]
  },
  {
    state: 'Jigawa',
    zone: 'North West',
    capital: 'Dutse',
    tollFree: ['112'],
    maternalAmbulanceHelpline: '0803 632 8899 (Jigawa Emergency Ambulance)',
    stateEmergencyOpsCenter: '0803 714 4455 / 0802 884 5566',
    referralHospitals: [
      'Federal Medical Centre (FMC Birnin Kudu)',
      'Rasheed Shekoni Specialist Hospital (Dutse)',
      'General Hospital Hadejia',
      'General Hospital Gumel'
    ]
  },
  {
    state: 'Kebbi',
    zone: 'North West',
    capital: 'Birnin Kebbi',
    tollFree: ['112'],
    maternalAmbulanceHelpline: '0803 641 9900 (Kebbi Health Emergency Helpline)',
    stateEmergencyOpsCenter: '0803 711 7788 / 0802 884 6677',
    referralHospitals: [
      'Federal Medical Centre (FMC Birnin Kebbi)',
      'Sir Yahaya Memorial Hospital (Birnin Kebbi)',
      'General Hospital Yauri'
    ]
  },
  {
    state: 'Zamfara',
    zone: 'North West',
    capital: 'Gusau',
    tollFree: ['112'],
    maternalAmbulanceHelpline: '0803 652 1122 (Zamfara Health Emergency Desk)',
    stateEmergencyOpsCenter: '0803 714 9900 / 0802 884 8899',
    referralHospitals: [
      'Federal Medical Centre (FMC Gusau)',
      'Ahmad Sani Yariman Bakura Specialist Hospital (Gusau)',
      'General Hospital Talata Mafara'
    ]
  },

  // --- NORTH EAST ---
  {
    state: 'Borno',
    zone: 'North East',
    capital: 'Maiduguri',
    tollFree: ['112'],
    maternalAmbulanceHelpline: '0803 618 3344 (Borno State Emergency Operations Desk)',
    stateEmergencyOpsCenter: '0803 711 0011 / 0802 884 4455',
    referralHospitals: [
      'University of Maiduguri Teaching Hospital (UMTH, Maiduguri)',
      'State Specialist Hospital Maiduguri',
      'Umbaru General Hospital',
      'Mohammad Shuwa Memorial Hospital'
    ]
  },
  {
    state: 'Bauchi',
    zone: 'North East',
    capital: 'Bauchi',
    tollFree: ['112'],
    maternalAmbulanceHelpline: '0803 629 5566 (Bauchi Emergency Operations Center)',
    stateEmergencyOpsCenter: '0803 714 1122 / 0802 884 3355',
    referralHospitals: [
      'Abubakar Tafawa Balewa University Teaching Hospital (ATBUTH, Bauchi)',
      'State Specialist Hospital Bauchi',
      'General Hospital Azare'
    ]
  },
  {
    state: 'Adamawa',
    zone: 'North East',
    capital: 'Yola',
    tollFree: ['112'],
    maternalAmbulanceHelpline: '0803 638 7788 (Adamawa Emergency Ambulance)',
    stateEmergencyOpsCenter: '0803 711 2244 / 0802 884 7799',
    referralHospitals: [
      'Modibbo Adama University Teaching Hospital (MAUTH, Yola - formerly FMC Yola)',
      'State Specialist Hospital Yola',
      'General Hospital Mubi'
    ]
  },
  {
    state: 'Gombe',
    zone: 'North East',
    capital: 'Gombe',
    tollFree: ['112'],
    maternalAmbulanceHelpline: '0803 649 9900 (Gombe State Health Emergency Desk)',
    stateEmergencyOpsCenter: '0803 714 3366 / 0802 884 6688',
    referralHospitals: [
      'Federal Teaching Hospital (FTH Gombe)',
      'State Specialist Hospital Gombe',
      'General Hospital Kaltungo'
    ]
  },
  {
    state: 'Taraba',
    zone: 'North East',
    capital: 'Jalingo',
    tollFree: ['112'],
    maternalAmbulanceHelpline: '0803 658 2233 (Taraba Emergency Response)',
    stateEmergencyOpsCenter: '0803 711 4488 / 0802 884 9900',
    referralHospitals: [
      'Federal Medical Centre (FMC Jalingo)',
      'Taraba State Specialist Hospital (Jalingo)',
      'General Hospital Wukari'
    ]
  },
  {
    state: 'Yobe',
    zone: 'North East',
    capital: 'Damaturu',
    tollFree: ['112'],
    maternalAmbulanceHelpline: '0803 669 4455 (Yobe Health Emergency Operations)',
    stateEmergencyOpsCenter: '0803 714 7799 / 0802 884 1133',
    referralHospitals: [
      'Yobe State University Teaching Hospital (YSUTH, Damaturu)',
      'Federal Medical Centre (FMC Nguru)',
      'General Hospital Potiskum'
    ]
  }
];
