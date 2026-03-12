import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: session.user.tenantId },
      select: {
        subscriptionPlan: true,
        subscriptionStatus: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        trialEndsAt: true,
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const now = new Date();
    const trialEndsAt = tenant.trialEndsAt;
    const isTrialing = tenant.subscriptionPlan === "FREE" && !!trialEndsAt;
    const trialExpired = isTrialing && trialEndsAt < now;
    const trialDaysLeft = isTrialing && !trialExpired
      ? Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return NextResponse.json({
      plan: tenant.subscriptionPlan,
      status: tenant.subscriptionStatus,
      hasStripeCustomer: !!tenant.stripeCustomerId,
      hasSubscription: !!tenant.stripeSubscriptionId,
      trialEndsAt: trialEndsAt?.toISOString() ?? null,
      trialDaysLeft,
      trialExpired,
    });
  } catch (error) {
    console.error("Billing status error:", error);
    return NextResponse.json(
      { error: "Failed to fetch billing status" },
      { status: 500 }
    );
  }
}
