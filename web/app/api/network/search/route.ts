import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calculateDistance } from "@/lib/geo-utils";

export const dynamic = "force-dynamic";

const MILES_TO_METERS = 1609.34;

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { checkFeatureAccess } = await import("@/lib/plans");
    const planCheck = await checkFeatureAccess(session.user.tenantId, "networkAccess");
    if (!planCheck.allowed) {
      return NextResponse.json({ error: planCheck.error }, { status: 403 });
    }

    const tenantId = session.user.tenantId;
    const { searchParams } = new URL(req.url);
    const keyword = searchParams.get("keyword") || "";
    const maxDistanceMiles = parseInt(searchParams.get("maxDistance") || "50");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

    // Get requesting shop's location
    const myShop = await prisma.shop.findFirst({
      where: { tenantId },
      select: { latitude: true, longitude: true },
    });

    // Fetch active listings from OTHER tenants
    const listings = await prisma.networkListing.findMany({
      where: {
        status: "ACTIVE",
        tenantId: { not: tenantId },
        ...(keyword ? { partName: { contains: keyword, mode: "insensitive" as const } } : {}),
      },
      take: 100, // Fetch more, then filter by distance
    });

    // Get all unique shopIds to fetch locations
    const shopIds = [...new Set(listings.map((l) => l.shopId))];
    const shops = await prisma.shop.findMany({
      where: { id: { in: shopIds }, networkEnabled: true },
      select: { id: true, name: true, city: true, state: true, latitude: true, longitude: true, tenantId: true },
    });
    const shopMap = new Map(shops.map((s) => [s.id, s]));

    // Also get tenant names
    const tenantIds = [...new Set(listings.map((l) => l.tenantId))];
    const tenants = await prisma.tenant.findMany({
      where: { id: { in: tenantIds }, networkEnabled: true },
      select: { id: true, name: true },
    });
    const tenantMap = new Map(tenants.map((t) => [t.id, t]));

    // Filter by distance and enrich
    const results = listings
      .map((listing) => {
        const shop = shopMap.get(listing.shopId);
        const tenant = tenantMap.get(listing.tenantId);
        if (!shop || !tenant) return null;

        let distanceMiles: number | null = null;
        if (myShop?.latitude && myShop?.longitude && shop.latitude && shop.longitude) {
          const distanceMeters = calculateDistance(
            myShop.latitude, myShop.longitude,
            shop.latitude, shop.longitude
          );
          distanceMiles = Math.round((distanceMeters / MILES_TO_METERS) * 10) / 10;
          if (distanceMiles > maxDistanceMiles) return null;
        }

        return {
          id: listing.id,
          partName: listing.partName,
          partNumber: listing.partNumber,
          availableQty: listing.availableQty,
          askingPrice: listing.askingPrice,
          notes: listing.notes,
          shopName: tenant.name,
          city: shop.city,
          state: shop.state,
          distanceMiles,
          createdAt: listing.createdAt.toISOString(),
        };
      })
      .filter(Boolean)
      .sort((a, b) => (a!.distanceMiles ?? 999) - (b!.distanceMiles ?? 999))
      .slice(0, limit);

    return NextResponse.json({ results, total: results.length });
  } catch (error) {
    console.error("[Network Search Error]", error);
    return NextResponse.json({ error: "Failed to search network" }, { status: 500 });
  }
}
