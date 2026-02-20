// Built-in multi-point inspection templates for heavy-duty truck shops.
// Stored as JSON in WorkOrder.checklist field.

export type ItemStatus = 'green' | 'yellow' | 'red' | 'na' | null;

export interface InspectionItem {
  id: string;
  category: string;
  label: string;
  status: ItemStatus;
  note: string;
}

export interface InspectionData {
  v: 1;
  templateName: string;
  startedAt: string;
  completedAt: string | null;
  items: InspectionItem[];
}

export interface InspectionTemplate {
  name: string;
  items: Omit<InspectionItem, 'status' | 'note'>[];
}

export const INSPECTION_TEMPLATES: InspectionTemplate[] = [
  {
    name: 'DOT Annual Inspection',
    items: [
      // Brakes
      { id: 'dot-brake-service',   category: 'Brakes',     label: 'Service brake system – lining, drums, hardware' },
      { id: 'dot-brake-parking',   category: 'Brakes',     label: 'Parking brake operation' },
      { id: 'dot-brake-air',       category: 'Brakes',     label: 'Air brake system – hoses, fittings, compressor' },
      { id: 'dot-brake-slack',     category: 'Brakes',     label: 'Slack adjuster travel (auto/manual)' },
      // Lighting
      { id: 'dot-light-head',      category: 'Lighting',   label: 'Headlamps – high & low beam' },
      { id: 'dot-light-tail',      category: 'Lighting',   label: 'Taillamps, brake lights, turn signals' },
      { id: 'dot-light-marker',    category: 'Lighting',   label: 'Clearance & marker lights' },
      { id: 'dot-light-refl',      category: 'Lighting',   label: 'Reflectors & conspicuity tape' },
      // Steering & Suspension
      { id: 'dot-steer-play',      category: 'Steering',   label: 'Steering wheel free play & column' },
      { id: 'dot-steer-linkage',   category: 'Steering',   label: 'Steering linkage – tie rods, draglink, pitman arm' },
      { id: 'dot-susp-springs',    category: 'Suspension', label: 'Springs, U-bolts & suspension fasteners' },
      { id: 'dot-susp-shocks',     category: 'Suspension', label: 'Shock absorbers' },
      // Tires & Wheels
      { id: 'dot-tire-tread',      category: 'Tires',      label: 'Tread depth – steering axle (min 4/32"), drives & trailers (min 2/32")' },
      { id: 'dot-tire-sidewall',   category: 'Tires',      label: 'Tire sidewalls – cuts, bulges, exposed cord' },
      { id: 'dot-tire-pressure',   category: 'Tires',      label: 'Tire inflation pressure (all positions)' },
      { id: 'dot-wheel-lugs',      category: 'Wheels',     label: 'Lug nuts – present, tight, no missing' },
      { id: 'dot-wheel-hubs',      category: 'Wheels',     label: 'Hub seals – no leaks' },
      // Frame & Body
      { id: 'dot-frame-rails',     category: 'Frame',      label: 'Frame rails & crossmembers – no cracks or severe corrosion' },
      { id: 'dot-fifth-wheel',     category: 'Frame',      label: 'Fifth wheel – locking jaws, slides, mounting bolts' },
      // Exhaust & Engine
      { id: 'dot-exhaust',         category: 'Exhaust',    label: 'Exhaust system – no leaks into cab' },
      { id: 'dot-engine-mounts',   category: 'Engine',     label: 'Engine mounts & visible belts / hoses' },
      { id: 'dot-fluids',          category: 'Engine',     label: 'Fluid levels – oil, coolant, power steering, washer' },
      // Cab & Safety
      { id: 'dot-wipers',          category: 'Cab',        label: 'Windshield wipers & washers' },
      { id: 'dot-horn',            category: 'Cab',        label: 'Horn operation' },
      { id: 'dot-mirrors',         category: 'Cab',        label: 'Mirrors – mounted, clean, no cracks' },
      { id: 'dot-seatbelt',        category: 'Cab',        label: 'Seat belts & emergency exits' },
      { id: 'dot-fire-ext',        category: 'Cab',        label: 'Fire extinguisher & triangles present' },
    ],
  },
  {
    name: 'PM-A Service Inspection',
    items: [
      { id: 'pma-oil',         category: 'Engine',     label: 'Engine oil level & condition (change at this service)' },
      { id: 'pma-coolant',     category: 'Engine',     label: 'Coolant level & freeze point' },
      { id: 'pma-belts',       category: 'Engine',     label: 'Drive belts – condition & tension' },
      { id: 'pma-hoses',       category: 'Engine',     label: 'Coolant hoses – cracks, leaks, clamps' },
      { id: 'pma-air-filter',  category: 'Engine',     label: 'Air filter – restriction indicator' },
      { id: 'pma-grease',      category: 'Chassis',    label: 'Chassis lubrication – all zerks, fifth wheel, slack adjusters' },
      { id: 'pma-drain',       category: 'Air System', label: 'Air dryer & tank drains – purged' },
      { id: 'pma-lights',      category: 'Lighting',   label: 'All exterior lights operational' },
      { id: 'pma-tires',       category: 'Tires',      label: 'Tire tread & pressure – all positions' },
      { id: 'pma-brakes',      category: 'Brakes',     label: 'Brake lining condition & adjustment check' },
      { id: 'pma-leaks',       category: 'General',    label: 'Walk-around – no visible fuel, oil, or coolant leaks' },
      { id: 'pma-wipers',      category: 'Cab',        label: 'Wiper blades & washers' },
    ],
  },
  {
    name: 'Pre-Trip Inspection',
    items: [
      { id: 'pt-engine-oil',   category: 'Engine',   label: 'Engine oil – on dipstick, no leaks below' },
      { id: 'pt-coolant',      category: 'Engine',   label: 'Coolant overflow tank level' },
      { id: 'pt-power-steer',  category: 'Steering', label: 'Power steering fluid level & hose condition' },
      { id: 'pt-belts',        category: 'Engine',   label: 'Fan belt – no cracks or fraying' },
      { id: 'pt-lights-front', category: 'Lighting', label: 'Headlamps, turn signals, marker lights – front' },
      { id: 'pt-lights-rear',  category: 'Lighting', label: 'Taillamps, brake lights, turn signals – rear' },
      { id: 'pt-tires-front',  category: 'Tires',    label: 'Steer tires – tread, sidewalls, lug nuts' },
      { id: 'pt-tires-drive',  category: 'Tires',    label: 'Drive tires – tread, sidewalls, lug nuts, valve stems' },
      { id: 'pt-brakes',       category: 'Brakes',   label: 'Air pressure build, governor cut-out, no audible leaks' },
      { id: 'pt-mirrors',      category: 'Cab',      label: 'All mirrors clean & properly adjusted' },
      { id: 'pt-wipers',       category: 'Cab',      label: 'Wipers, washer fluid, defroster' },
      { id: 'pt-horn',         category: 'Cab',      label: 'Horn works' },
      { id: 'pt-seatbelt',     category: 'Cab',      label: 'Seat belt latches & retracts' },
    ],
  },
];

export function newInspection(template: InspectionTemplate): InspectionData {
  return {
    v: 1,
    templateName: template.name,
    startedAt: new Date().toISOString(),
    completedAt: null,
    items: template.items.map((item) => ({ ...item, status: null, note: '' })),
  };
}

export function parseChecklist(raw: string | null | undefined): InspectionData | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.v === 1 && Array.isArray(parsed.items)) return parsed as InspectionData;
    return null;
  } catch {
    return null;
  }
}

export function inspectionSummary(data: InspectionData) {
  const counts = { red: 0, yellow: 0, green: 0, na: 0, pending: 0 };
  for (const item of data.items) {
    if (item.status === 'red') counts.red++;
    else if (item.status === 'yellow') counts.yellow++;
    else if (item.status === 'green') counts.green++;
    else if (item.status === 'na') counts.na++;
    else counts.pending++;
  }
  return counts;
}
