import { NextRequest, NextResponse } from 'next/server';

const FMCSA_API_BASE = 'https://mobile.fmcsa.dot.gov/qc/services';
const FMCSA_WEB_KEY = process.env.FMCSA_WEB_KEY || '';

type CarrierResult = {
  dotNumber: string;
  mcNumber: string;
  legalName: string;
  dbaName: string;
  phyStreet: string;
  phyCity: string;
  phyState: string;
  phyZipcode: string;
  phone: string;
  totalDrivers: number;
  totalPowerUnits: number;
  statusCode: string;
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // 'dot' or 'mc'
  const number = searchParams.get('number');

  if (!type || !number) {
    return NextResponse.json(
      { error: 'Missing type or number parameter' },
      { status: 400 }
    );
  }

  const cleaned = number.replace(/[^0-9]/g, '');
  if (!cleaned) {
    return NextResponse.json(
      { error: 'Invalid number format' },
      { status: 400 }
    );
  }

  // If no FMCSA key is configured, return a helpful message
  if (!FMCSA_WEB_KEY) {
    return NextResponse.json(
      { error: 'FMCSA API key not configured. Set FMCSA_WEB_KEY in .env.local.' },
      { status: 503 }
    );
  }

  try {
    let url: string;

    if (type === 'dot') {
      url = `${FMCSA_API_BASE}/carriers/${cleaned}?webKey=${FMCSA_WEB_KEY}`;
    } else if (type === 'mc') {
      url = `${FMCSA_API_BASE}/carriers/docket-number/${cleaned}?webKey=${FMCSA_WEB_KEY}`;
    } else {
      return NextResponse.json(
        { error: 'Type must be "dot" or "mc"' },
        { status: 400 }
      );
    }

    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Carrier not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'FMCSA lookup failed' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // The FMCSA API nests carrier info under content[0].carrier
    const carrier = data?.content?.[0]?.carrier ?? data?.content ?? data;

    // Normalize response
    const result: CarrierResult = {
      dotNumber: String(carrier.dotNumber || carrier.dot_number || ''),
      mcNumber: String(carrier.mcNumber || carrier.mc_number || carrier.docketNumber || ''),
      legalName: carrier.legalName || carrier.legal_name || '',
      dbaName: carrier.dbaName || carrier.dba_name || '',
      phyStreet: carrier.phyStreet || carrier.phy_street || '',
      phyCity: carrier.phyCity || carrier.phy_city || '',
      phyState: carrier.phyState || carrier.phy_state || '',
      phyZipcode: carrier.phyZipcode || carrier.phy_zipcode || '',
      phone: carrier.telephone || carrier.phone || '',
      totalDrivers: carrier.totalDrivers || carrier.total_drivers || 0,
      totalPowerUnits: carrier.totalPowerUnits || carrier.total_power_units || 0,
      statusCode: carrier.statusCode || carrier.carrier_status || '',
    };

    return NextResponse.json({ carrier: result });
  } catch {
    return NextResponse.json(
      { error: 'Failed to connect to FMCSA' },
      { status: 502 }
    );
  }
}
