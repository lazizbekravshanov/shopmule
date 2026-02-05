import { NextResponse } from "next/server"
import { verifyMobileAuth } from "@/lib/mobile-auth"

interface NHTSAResult {
  Variable: string
  Value: string | null
  ValueId: string | null
}

interface NHTSAResponse {
  Count: number
  Message: string
  SearchCriteria: string
  Results: NHTSAResult[]
}

export async function GET(request: Request) {
  try {
    // Verify authentication (supports both session and Bearer token)
    const authResult = await verifyMobileAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const vin = searchParams.get("vin")

    if (!vin) {
      return NextResponse.json(
        { error: "VIN parameter is required" },
        { status: 400 }
      )
    }

    // Validate VIN format (17 characters, alphanumeric except I, O, Q)
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i
    if (!vinRegex.test(vin)) {
      return NextResponse.json(
        { error: "Invalid VIN format" },
        { status: 400 }
      )
    }

    const normalizedVin = vin.toUpperCase()

    // Call NHTSA API
    const nhtsaUrl = `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${normalizedVin}?format=json`

    const nhtsaResponse = await fetch(nhtsaUrl, {
      headers: {
        Accept: "application/json",
      },
    })

    if (!nhtsaResponse.ok) {
      console.error("NHTSA API error:", nhtsaResponse.status)
      return NextResponse.json(
        { error: "Failed to decode VIN from NHTSA" },
        { status: 502 }
      )
    }

    const nhtsaData: NHTSAResponse = await nhtsaResponse.json()

    // Extract relevant fields from NHTSA response
    const getValue = (variableName: string): string | null => {
      const result = nhtsaData.Results.find(
        (r) => r.Variable === variableName
      )
      return result?.Value || null
    }

    const getIntValue = (variableName: string): number | null => {
      const value = getValue(variableName)
      if (!value) return null
      const parsed = parseInt(value, 10)
      return isNaN(parsed) ? null : parsed
    }

    // Check for errors in decode
    const errorCode = getValue("Error Code")
    const errorText = getValue("Error Text")

    // Build response
    const response = {
      vin: normalizedVin,
      make: getValue("Make") || "Unknown",
      model: getValue("Model") || "Unknown",
      year: getIntValue("Model Year"),
      vehicleType: getValue("Vehicle Type"),
      manufacturer: getValue("Manufacturer Name"),
      plantCountry: getValue("Plant Country"),
      bodyClass: getValue("Body Class"),
      driveType: getValue("Drive Type"),
      fuelType: getValue("Fuel Type - Primary"),
      engineCylinders: getIntValue("Engine Number of Cylinders"),
      engineDisplacement: getValue("Displacement (L)"),
      errorCode: errorCode !== "0" ? errorCode : undefined,
      errorText: errorCode !== "0" ? errorText : undefined,
    }

    // If we couldn't decode essential fields, return a partial error
    if (response.make === "Unknown" && response.model === "Unknown" && !response.year) {
      return NextResponse.json(
        {
          ...response,
          error: "Unable to decode VIN - may be invalid or too old",
        },
        { status: 200 } // Still return 200 with partial data
      )
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error decoding VIN:", error)
    return NextResponse.json(
      { error: "Failed to decode VIN" },
      { status: 500 }
    )
  }
}
