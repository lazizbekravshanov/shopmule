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
    const maxDistanceMiles = parseInt(searchParams.get("maxDistance") || "50");

    const myShop = await prisma.shop.findFirst({
      where: { tenantId },
      select: { latitude: true, longitude: true },
    });

    if (!myShop?.latitude || !myShop?.longitude) {
      return NextResponse.json({ error: "Your shop location is not set" }, { status: 400 });
    }

    const shops = await prisma.shop.findMany({
      where: {
        networkEnabled: true,
        tenantId: { not: tenantId },
        latitude: { not: null },
        longitude: { not: null },
      },
      select: {
        id: true,
        name: true,
        city: true,
        state: true,
        latitude: true,
        longitude: true,
        bayCount: true,
        Tenant: { select: { id: true, name: true } },
      },
    });

    const nearbyShops = shops
      .map((shop) => {
        const distanceMeters = calculateDistance(
          myShop.latitude!, myShop.longitude!,
          shop.latitude!, shop.longitude!
        );
        const distanceMiles = Math.round((distanceMeters / MILES_TO_METERS) * 10) / 10;
        return {
          shopId: shop.id,
          name: shop.Tenant?.name || shop.name,
          city: shop.city,
          state: shop.state,
          bayCount: shop.bayCount,
          distanceMiles,
        };
      })
      .filter((s) => s.distanceMiles <= maxDistanceMiles)
      .sort((a, b) => a.distanceMiles - b.distanceMiles);

    return NextResponse.json({ shops: nearbyShops, total: nearbyShops.length });
  } catch (error) {
    console.error("[Nearby Shops Error]", error);
    return NextResponse.json({ error: "Failed to find nearby shops" }, { status: 500 });
  }
}
