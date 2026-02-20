// HD Truck Parts Catalog
// Simulates a FleetPride / Navistar / Cummins parts database.
// In production, this would be replaced by live API calls to FleetPride's catalog API.

export interface CatalogPart {
  sku: string;
  name: string;
  category: string;
  supplier: string;         // FleetPride, Navistar, Cummins, etc.
  brand: string;            // Bendix, Haldex, Fleetguard, etc.
  cost: number;             // Dealer cost
  price: number;            // Suggested retail
  notes?: string;           // Application notes
}

export const HD_PARTS_CATALOG: CatalogPart[] = [
  // ── Brakes ──────────────────────────────────────────────────────────────
  { sku: 'BX-K001786',   name: 'Bendix King Pin Brake Shoe Set',            category: 'Brakes',      supplier: 'FleetPride',  brand: 'Bendix',     cost: 112,  price: 168  },
  { sku: 'BX-WA901588',  name: 'Bendix Brake Lining Set – Standard',        category: 'Brakes',      supplier: 'FleetPride',  brand: 'Bendix',     cost: 88,   price: 132  },
  { sku: 'BX-WA901626',  name: 'Bendix Air Disc Brake Pad Kit',             category: 'Brakes',      supplier: 'FleetPride',  brand: 'Bendix',     cost: 145,  price: 218  },
  { sku: 'HAL-40011423', name: 'Haldex Automatic Slack Adjuster 1-1/2" str',category: 'Brakes',      supplier: 'FleetPride',  brand: 'Haldex',     cost: 54,   price: 81   },
  { sku: 'HAL-40011329', name: 'Haldex Slack Adjuster 1-1/2" str Manual',   category: 'Brakes',      supplier: 'FleetPride',  brand: 'Haldex',     cost: 38,   price: 57   },
  { sku: 'WBN-104-12224',name: 'Wabco ABS Wheel Speed Sensor',              category: 'Brakes',      supplier: 'FleetPride',  brand: 'WABCO',      cost: 62,   price: 93,  notes: 'Fits most 2010+ trailers' },
  { sku: 'WBN-4410340350',name:'WABCO Brake Valve – Relay Emergency',       category: 'Brakes',      supplier: 'FleetPride',  brand: 'WABCO',      cost: 185,  price: 278  },
  { sku: 'BX-AD9',       name: 'Bendix AD-9 Air Dryer Assembly',            category: 'Brakes',      supplier: 'FleetPride',  brand: 'Bendix',     cost: 310,  price: 465  },
  { sku: 'ROC-A1-2318',  name: 'Rockwell Brake Drum 16.5" × 7"',           category: 'Brakes',      supplier: 'FleetPride',  brand: 'Rockwell',   cost: 97,   price: 146  },

  // ── Engine / Filters ────────────────────────────────────────────────────
  { sku: 'FG-LF9080',    name: 'Fleetguard Engine Oil Filter – Cummins ISX', category: 'Filters',    supplier: 'FleetPride',  brand: 'Fleetguard', cost: 12,   price: 18,  notes: 'Cummins ISX/ISM' },
  { sku: 'FG-FF5488',    name: 'Fleetguard Fuel Filter Primary',            category: 'Filters',     supplier: 'FleetPride',  brand: 'Fleetguard', cost: 18,   price: 27,  notes: 'Cummins ISX/ISM' },
  { sku: 'FG-AF25557',   name: 'Fleetguard Air Filter – Primary',           category: 'Filters',     supplier: 'FleetPride',  brand: 'Fleetguard', cost: 45,   price: 68,  notes: 'Cummins ISX' },
  { sku: 'FG-WF2076',    name: 'Fleetguard Coolant Filter – SCA',           category: 'Filters',     supplier: 'FleetPride',  brand: 'Fleetguard', cost: 8,    price: 12   },
  { sku: 'DON-P550248',  name: 'Donaldson Hydraulic Oil Filter',            category: 'Filters',     supplier: 'FleetPride',  brand: 'Donaldson',  cost: 22,   price: 33   },
  { sku: 'DON-P776523',  name: 'Donaldson Air Intake Filter Radial Seal',   category: 'Filters',     supplier: 'FleetPride',  brand: 'Donaldson',  cost: 51,   price: 77   },
  { sku: 'CUM-4089560',  name: 'Cummins ISX Fuel Pump O-Ring Kit',         category: 'Engine',      supplier: 'Cummins',     brand: 'Cummins',    cost: 28,   price: 42,  notes: 'ISX 15, QSX 15' },
  { sku: 'CUM-4965775',  name: 'Cummins EGR Valve – ISX',                  category: 'Engine',      supplier: 'Cummins',     brand: 'Cummins',    cost: 420,  price: 630  },
  { sku: 'CUM-3683009',  name: 'Cummins Thermostat 180°F – ISX/ISM',       category: 'Engine',      supplier: 'Cummins',     brand: 'Cummins',    cost: 34,   price: 51   },
  { sku: 'CUM-4001813',  name: 'Cummins ISX Turbo Inlet Elbow',            category: 'Engine',      supplier: 'Cummins',     brand: 'Cummins',    cost: 88,   price: 132  },
  { sku: 'DET-A4720700054',name:'Detroit DD15 Injector Sleeve Kit',         category: 'Engine',      supplier: 'FleetPride',  brand: 'Detroit',    cost: 185,  price: 278  },
  { sku: 'PAC-1833609PE', name: 'Paccar MX-13 Injector',                   category: 'Engine',      supplier: 'Navistar',    brand: 'Paccar',     cost: 680,  price: 1020 },

  // ── Transmission / Drivetrain ───────────────────────────────────────────
  { sku: 'EAT-4302885',  name: 'Eaton Fuller Transmission Filter Kit',      category: 'Transmission',supplier: 'FleetPride',  brand: 'Eaton',      cost: 65,   price: 98   },
  { sku: 'EAT-S-2824',   name: 'Eaton Fuller Synchronizer Clutch Kit',      category: 'Transmission',supplier: 'FleetPride',  brand: 'Eaton',      cost: 340,  price: 510  },
  { sku: 'SPR-SPL170-3X',name: 'Spicer SPL170 U-Joint',                    category: 'Drivetrain',  supplier: 'FleetPride',  brand: 'Spicer',     cost: 42,   price: 63   },
  { sku: 'SPR-5-88X',    name: 'Spicer Universal Joint 1480 Series',        category: 'Drivetrain',  supplier: 'FleetPride',  brand: 'Spicer',     cost: 38,   price: 57   },
  { sku: 'EAT-A-4059',   name: 'Eaton Drive Axle Shaft Seal',              category: 'Drivetrain',  supplier: 'FleetPride',  brand: 'Eaton',      cost: 14,   price: 21   },

  // ── Wheel End / Bearings ─────────────────────────────────────────────────
  { sku: 'STC-391-0281-0',name:'Stemco Premier Unitized Wheel Seal 3.625"', category: 'Wheel End',   supplier: 'FleetPride',  brand: 'Stemco',     cost: 48,   price: 72   },
  { sku: 'STC-395-0173-0',name:'Stemco Discover Ultra Bearing Cone HM218248',category:'Wheel End',   supplier: 'FleetPride',  brand: 'Stemco',     cost: 55,   price: 83   },
  { sku: 'TBL-LM501349',  name: 'Timken Bearing Cone LM501349',             category: 'Wheel End',   supplier: 'FleetPride',  brand: 'Timken',     cost: 28,   price: 42   },
  { sku: 'TBL-HM518445',  name: 'Timken Bearing Cone HM518445',             category: 'Wheel End',   supplier: 'FleetPride',  brand: 'Timken',     cost: 35,   price: 53   },
  { sku: 'ABT-205-0127',  name: 'Accuride Stemco Hub Seal – Scotseal Plus', category: 'Wheel End',   supplier: 'FleetPride',  brand: 'Stemco',     cost: 52,   price: 78   },

  // ── Tires ───────────────────────────────────────────────────────────────
  { sku: 'MIC-X-LINE-ENY',name: 'Michelin X Line Energy Z 295/75R22.5',    category: 'Tires',       supplier: 'FleetPride',  brand: 'Michelin',   cost: 380,  price: 570, notes: 'Steer position' },
  { sku: 'BRI-R268-29575', name: 'Bridgestone R268 Ecopia 295/75R22.5',    category: 'Tires',       supplier: 'FleetPride',  brand: 'Bridgestone',cost: 310,  price: 465, notes: 'Drive position' },
  { sku: 'CMF-HS3-11R225', name: 'Continental HSR3 11R22.5 Drive',         category: 'Tires',       supplier: 'FleetPride',  brand: 'Continental',cost: 295,  price: 443  },

  // ── Suspension ──────────────────────────────────────────────────────────
  { sku: 'HEN-50511-000', name: 'Hendrickson Equalizer Bushing Kit',        category: 'Suspension',  supplier: 'FleetPride',  brand: 'Hendrickson',cost: 88,   price: 132  },
  { sku: 'HEN-17433-001', name: 'Hendrickson Torque Rod End',               category: 'Suspension',  supplier: 'FleetPride',  brand: 'Hendrickson',cost: 72,   price: 108  },
  { sku: 'MRW-90614',     name: 'Moog Leaf Spring U-Bolt Kit 3/4"-10',     category: 'Suspension',  supplier: 'FleetPride',  brand: 'Moog',       cost: 24,   price: 36   },
  { sku: 'SAF-K9001',     name: 'Saf-Holland Kingpin Kit – Standard',       category: 'Suspension',  supplier: 'FleetPride',  brand: 'SAF-Holland',cost: 165,  price: 248  },
  { sku: 'GBRK-R30051',   name: 'Ridewell Air Bag Suspension Spring',       category: 'Suspension',  supplier: 'FleetPride',  brand: 'Firestone',  cost: 210,  price: 315  },
  { sku: 'KYB-KG5516',    name: 'KYB Shock Absorber – Steer Axle',         category: 'Suspension',  supplier: 'FleetPride',  brand: 'KYB',        cost: 62,   price: 93   },

  // ── Electrical / Lighting ───────────────────────────────────────────────
  { sku: 'TRK-60275C',    name: 'TruckLite 60 Series LED Stop/Turn/Tail',  category: 'Lighting',    supplier: 'FleetPride',  brand: 'TruckLite',  cost: 48,   price: 72   },
  { sku: 'GRT-53562',     name: 'Grote LED Clearance/Marker Light Amber',   category: 'Lighting',    supplier: 'FleetPride',  brand: 'Grote',      cost: 12,   price: 18   },
  { sku: 'GRT-11210-3',   name: 'Grote Pigtail Harness 3-Pin Metri-Pack',  category: 'Electrical',  supplier: 'FleetPride',  brand: 'Grote',      cost: 8,    price: 12   },
  { sku: 'VLT-VR-175',    name: 'Voltage Regulator – 175A Alternator',     category: 'Electrical',  supplier: 'FleetPride',  brand: 'Leece-Neville',cost:88,  price: 132  },
  { sku: 'PHX-2720-175A', name: 'Prestolite 175A Alternator – Rebuilt',    category: 'Electrical',  supplier: 'FleetPride',  brand: 'Prestolite', cost: 245,  price: 368, notes: 'Detroit Series 60 / Caterpillar C12' },
  { sku: 'BAT-31900MF',   name: 'East Penn Deka 31-900 MF Battery 900 CCA',category: 'Electrical',  supplier: 'FleetPride',  brand: 'Deka',       cost: 148,  price: 222  },

  // ── Cooling ─────────────────────────────────────────────────────────────
  { sku: 'MIS-2521',      name: 'Mishimoto Coolant Hose – Upper Radiator',  category: 'Cooling',     supplier: 'FleetPride',  brand: 'Mishimoto',  cost: 38,   price: 57   },
  { sku: 'MOD-5W3Z8592B', name: 'Modine Charge Air Cooler – Aluminum',      category: 'Cooling',     supplier: 'FleetPride',  brand: 'Modine',     cost: 580,  price: 870, notes: 'Freightliner Cascadia 2008-2018' },
  { sku: 'FAN-F6HZ8600AA',name: 'Horton Fan Clutch Assembly – Air Actuated',category: 'Cooling',     supplier: 'FleetPride',  brand: 'Horton',     cost: 385,  price: 578  },
  { sku: 'TBT-32146',     name: 'Thermoid Coolant Bypass Hose',             category: 'Cooling',     supplier: 'FleetPride',  brand: 'Thermoid',   cost: 24,   price: 36   },

  // ── Fuel System ─────────────────────────────────────────────────────────
  { sku: 'DAY-80116',     name: 'Dayco Fuel Line Hose – PTFE Lined 1/2"',  category: 'Fuel',        supplier: 'FleetPride',  brand: 'Dayco',      cost: 18,   price: 27   },
  { sku: 'CAT-1R-0762',   name: 'CAT Fuel Filter Secondary 1R-0762',       category: 'Fuel',        supplier: 'FleetPride',  brand: 'Caterpillar',cost: 22,   price: 33   },
  { sku: 'CAT-1R-0750',   name: 'CAT Fuel Filter Primary 1R-0750',         category: 'Fuel',        supplier: 'FleetPride',  brand: 'Caterpillar',cost: 28,   price: 42   },
  { sku: 'WIX-33695',     name: 'WIX Fuel Filter – Spin-On Secondary',     category: 'Fuel',        supplier: 'FleetPride',  brand: 'WIX',        cost: 14,   price: 21   },

  // ── Exhaust / Emissions ─────────────────────────────────────────────────
  { sku: 'TNK-FLT-0012',  name: 'Tenneco DPF Mounting Clamp Kit',          category: 'Exhaust',     supplier: 'FleetPride',  brand: 'Tenneco',    cost: 35,   price: 53   },
  { sku: 'NAV-EGR-ISX',   name: 'Navistar EGR Cooler Kit – Maxxforce',     category: 'Exhaust',     supplier: 'Navistar',    brand: 'Navistar',   cost: 620,  price: 930, notes: 'Maxxforce 13 / DT466E' },
  { sku: 'DPF-CUM-ISX15', name: 'Cummins OEM DPF – ISX15',                category: 'Exhaust',     supplier: 'Cummins',     brand: 'Cummins',    cost: 1850, price: 2775, notes: 'May ship from dealer warehouse' },

  // ── Clutch ──────────────────────────────────────────────────────────────
  { sku: 'EAT-8LL',       name: 'Eaton Fuller 14" Angle Spring Clutch Kit',category: 'Clutch',      supplier: 'FleetPride',  brand: 'Eaton',      cost: 640,  price: 960  },
  { sku: 'SAC-1861919034',name: 'Sachs Clutch Pressure Plate 15.5"',       category: 'Clutch',      supplier: 'FleetPride',  brand: 'Sachs',      cost: 310,  price: 465  },
  { sku: 'MUT-VCT-3550',  name: 'Mack/Volvo Clutch Release Bearing',       category: 'Clutch',      supplier: 'FleetPride',  brand: 'Mack',       cost: 55,   price: 83   },

  // ── Fifth Wheel / Coupling ──────────────────────────────────────────────
  { sku: 'SAF-2101052',   name: 'SAF-Holland 5th Wheel Jaw & Lock Assembly',category:'Fifth Wheel',  supplier: 'FleetPride',  brand: 'SAF-Holland',cost: 285,  price: 428  },
  { sku: 'JOC-FW35',      name: 'Jost FW35 5th Wheel Regrease Kit',        category: 'Fifth Wheel', supplier: 'FleetPride',  brand: 'Jost',       cost: 28,   price: 42   },

  // ── HVAC ────────────────────────────────────────────────────────────────
  { sku: 'TRP-AC-112',    name: 'TRP AC Compressor – Peterbilt 389',       category: 'HVAC',        supplier: 'FleetPride',  brand: 'TRP',        cost: 420,  price: 630  },
  { sku: 'SUU-134A-32',   name: 'R-134a Refrigerant 30 lb Drum',           category: 'HVAC',        supplier: 'FleetPride',  brand: 'DuPont',     cost: 95,   price: 143  },
  { sku: 'CAB-BLW-42',    name: 'Cab Blower Motor – Universal 12V',        category: 'HVAC',        supplier: 'FleetPride',  brand: 'Four Seasons',cost: 68,  price: 102  },

  // ── Hardware / Fasteners ────────────────────────────────────────────────
  { sku: 'HW-UBOLT-34',   name: 'U-Bolt Kit 3/4" Spring 3" × 8"',         category: 'Hardware',    supplier: 'FleetPride',  brand: 'Generic',    cost: 8,    price: 12   },
  { sku: 'LUB-WHL-GRS',   name: 'Mobilgrease XHP222 Wheel Bearing Grease 35 lb', category:'Lubricants', supplier:'FleetPride', brand:'Mobil',   cost: 68,   price: 102  },
  { sku: 'LUB-MTP-GL5',   name: 'Shell Spirax S6 ATF X Multi-Grade GL5 5 gal',category:'Lubricants', supplier:'FleetPride',brand:'Shell',        cost: 105,  price: 158  },
];

// ─── Search helper ────────────────────────────────────────────────────────────

export function searchCatalog(query: string, limit = 20): CatalogPart[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  const results = HD_PARTS_CATALOG.filter(
    (p) =>
      p.sku.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.supplier.toLowerCase().includes(q) ||
      (p.notes?.toLowerCase().includes(q) ?? false)
  );
  // Exact SKU match first, then name match, then rest
  results.sort((a, b) => {
    const aSkuMatch = a.sku.toLowerCase().startsWith(q) ? -2 : 0;
    const bSkuMatch = b.sku.toLowerCase().startsWith(q) ? -2 : 0;
    const aNameMatch = a.name.toLowerCase().startsWith(q) ? -1 : 0;
    const bNameMatch = b.name.toLowerCase().startsWith(q) ? -1 : 0;
    return (aSkuMatch + aNameMatch) - (bSkuMatch + bNameMatch);
  });
  return results.slice(0, limit);
}
