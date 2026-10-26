import { ALL_ZONES_STATE_REGISTRIES } from './nigeriaAllStatesData';

export type FacilityTier = 'Primary' | 'Secondary' | 'Tertiary';

export interface HealthFacility {
  id: string;
  name: string;
  tier: FacilityTier;
  state: string;
  lga: string;
  wardOrTown: string;
  address: string;
  phone: string;
  has247LaborWard: boolean;
  hasEmergencyCSection: boolean;
  hasBloodBank: boolean;
  hasAmbulance: boolean;
  nphcdaAccredited: boolean;
  emergencyCapability: string;
}

export interface LgaFacilityInfo {
  name: string;
  headquarters: string;
  primaryFacilityName: string;
  primaryFacilityAddress: string;
  primaryFacilityPhone: string;
  has247LaborWard: boolean;
  hasEmergencyCSection: boolean;
  hasBloodBank: boolean;
  hasAmbulance: boolean;
}

export interface SecondaryHospitalInfo {
  name: string;
  lga: string;
  address: string;
  phone: string;
  hasEmergencyCSection: boolean;
  hasBloodBank: boolean;
  hasAmbulance: boolean;
}

export interface TertiaryHospitalInfo {
  name: string;
  type: 'Teaching Hospital' | 'Federal Medical Centre' | 'Specialist Hospital' | 'National Hospital' | 'Fistula Centre' | 'Neuropsychiatric Hospital';
  lga: string;
  address: string;
  phone: string;
  hasEmergencyCSection: boolean;
  hasBloodBank: boolean;
  hasAmbulance: boolean;
  keySpecialties: string[];
}

export interface StateFacilityRegistry {
  state: string;
  zone: 'South West' | 'South South' | 'South East' | 'North Central' | 'North West' | 'North East';
  capital: string;
  stateDispatchLine: string;
  maternalAmbulanceLine: string;
  lgas: LgaFacilityInfo[];
  generalHospitals: SecondaryHospitalInfo[];
  specialistHospitals: TertiaryHospitalInfo[];
}

export const NATIONAL_DISPATCH_LINES = {
  nationalTollFree: '112',
  nphcdaEmergencyDesk: '0803 123 0414',
  frscAmbulanceRescue: '122',
  policeEmergency: '199',
  ncdcPublicHealthDesk: '6232',
  gbvTollFreeDesk: '0800 111 2222',
  mentalHealthCrisisLine: '0800 800 2000',
};

export const NIGERIA_774_LGA_HEALTH_REGISTRY: StateFacilityRegistry[] = ALL_ZONES_STATE_REGISTRIES;

// Helper function to extract flattened searchable facility list
export function getAllFacilities(): HealthFacility[] {
  const list: HealthFacility[] = [];

  NIGERIA_774_LGA_HEALTH_REGISTRY.forEach((st) => {
    // 1. Primary Health Centres for every single LGA
    st.lgas.forEach((lga) => {
      list.push({
        id: `phc-${st.state}-${lga.name}`.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        name: lga.primaryFacilityName,
        tier: 'Primary',
        state: st.state,
        lga: lga.name,
        wardOrTown: lga.headquarters,
        address: lga.primaryFacilityAddress,
        phone: lga.primaryFacilityPhone,
        has247LaborWard: lga.has247LaborWard,
        hasEmergencyCSection: lga.hasEmergencyCSection,
        hasBloodBank: lga.hasBloodBank,
        hasAmbulance: lga.hasAmbulance,
        nphcdaAccredited: true,
        emergencyCapability: lga.hasAmbulance ? 'Ambulance Dispatch & 24/7 Labor Delivery' : '24/7 Labor Delivery',
      });
    });

    // 2. Secondary General Hospitals
    st.generalHospitals.forEach((gh) => {
      list.push({
        id: `gh-${st.state}-${gh.name}`.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        name: gh.name,
        tier: 'Secondary',
        state: st.state,
        lga: gh.lga,
        wardOrTown: gh.address,
        address: gh.address,
        phone: gh.phone,
        has247LaborWard: true,
        hasEmergencyCSection: gh.hasEmergencyCSection,
        hasBloodBank: gh.hasBloodBank,
        hasAmbulance: gh.hasAmbulance,
        nphcdaAccredited: true,
        emergencyCapability: 'Secondary Hospital · Surgical Theater, C-Section & Blood Bank',
      });
    });

    // 3. Tertiary / Specialist Hospitals
    st.specialistHospitals.forEach((sh) => {
      list.push({
        id: `th-${st.state}-${sh.name}`.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        name: sh.name,
        tier: 'Tertiary',
        state: st.state,
        lga: sh.lga,
        wardOrTown: sh.address,
        address: sh.address,
        phone: sh.phone,
        has247LaborWard: true,
        hasEmergencyCSection: sh.hasEmergencyCSection,
        hasBloodBank: sh.hasBloodBank,
        hasAmbulance: sh.hasAmbulance,
        nphcdaAccredited: true,
        emergencyCapability: `Tertiary CEmONC · ${sh.type} · ${sh.keySpecialties.slice(0, 2).join(', ')}`,
      });
    });
  });

  return list;
}

export const ALL_NIGERIA_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT (Abuja)', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
  'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];
