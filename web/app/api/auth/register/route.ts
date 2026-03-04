import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import bcrypt from "bcryptjs";

const registerSchema = z.object({
  shopName: z.string().min(2, "Shop name must be at least 2 characters").max(100),
  ownerName: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[0-9]/, "Password must contain a digit"),
  phone: z.string().optional(),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { shopName, ownerName, email, password, phone } = parsed.data;

    // Check email uniqueness
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Generate slug with collision handling
    let slug = slugify(shopName);
    if (!slug) slug = "shop";

    let finalSlug = slug;
    let suffix = 0;
    while (await prisma.tenant.findUnique({ where: { slug: finalSlug } })) {
      suffix++;
      finalSlug = `${slug}-${suffix}`;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Atomic transaction: create tenant, user, and employee profile
    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: shopName,
          slug: finalSlug,
          subscriptionPlan: "FREE",
        },
      });

      const user = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          name: ownerName,
          passwordHash,
          role: "OWNER",
          tenantId: tenant.id,
        },
      });

      await tx.employeeProfile.create({
        data: {
          userId: user.id,
          tenantId: tenant.id,
          name: ownerName,
          phoneNumber: phone || null,
          role: "OWNER",
          payRate: 0,
        },
      });

      return { userId: user.id, tenantId: tenant.id, email: user.email };
    });

    return NextResponse.json(
      {
        success: true,
        userId: result.userId,
        tenantId: result.tenantId,
        email: result.email,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
