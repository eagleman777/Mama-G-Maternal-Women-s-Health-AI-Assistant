import { StateFacilityRegistry } from './nigeriaHealthFacilities';
import { SOUTH_WEST_STATES } from './facilitiesSouthWest';
import { SOUTH_EAST_STATES } from './facilitiesSouthEast';
import { SOUTH_SOUTH_STATES } from './facilitiesSouthSouth';
import { NORTH_CENTRAL_STATES } from './facilitiesNorthCentral';
import { NORTH_WEST_STATES } from './facilitiesNorthWest';
import { NORTH_EAST_STATES } from './facilitiesNorthEast';

// All 36 States + FCT Abuja and their complete 774 Local Government Areas
export const ALL_ZONES_STATE_REGISTRIES: StateFacilityRegistry[] = [
  ...SOUTH_WEST_STATES,
  ...SOUTH_EAST_STATES,
  ...SOUTH_SOUTH_STATES,
  ...NORTH_CENTRAL_STATES,
  ...NORTH_WEST_STATES,
  ...NORTH_EAST_STATES,
];
