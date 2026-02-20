import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyMobileAuth } from "@/lib/mobile-auth"
import { isValidId } from "@/lib/security"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; certId: string }> }
) {
  try {
    const authResult = await verifyMobileAuth(request)
    if (!authResult.authenticated || !authResult.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tenantId = authResult.tenantId
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
}
