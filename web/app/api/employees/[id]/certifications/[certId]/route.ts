import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { withPermission } from "@/lib/auth/with-permission"
import { P } from "@/lib/auth/permissions"
import { isValidId } from "@/lib/security"

export const DELETE = withPermission(P.USERS_UPDATE, async (request, { auth, params }) => {
  try {
    const tenantId = auth.tenantId
    const { id, certId } = await params

    if (!isValidId(id) || !isValidId(certId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
    }

    // Verify employee belongs to tenant
    const employee = await prisma.employeeProfile.findUnique({ where: { id } })
    if (!employee || employee.tenantId !== tenantId) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    // Verify certification belongs to this employee
    const certification = await prisma.technicianCertification.findUnique({
      where: { id: certId },
    })
    if (!certification || certification.employeeId !== id) {
      return NextResponse.json({ error: "Certification not found" }, { status: 404 })
    }

    await prisma.technicianCertification.delete({ where: { id: certId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/employees/[id]/certifications/[certId] error:", error)
    return NextResponse.json(
      { error: "Failed to remove certification" },
      { status: 500 }
    )
  }
})
