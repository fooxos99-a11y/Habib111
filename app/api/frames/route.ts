import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { studentId, frame } = await request.json()

    console.log("[v0] Saving frame:", { studentId, frame })

    if (!studentId || !frame) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Frame data is already stored in localStorage on client side
    // This endpoint just acknowledges the save

    console.log("[v0] Frame saved successfully")
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error in frames POST:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")

    if (!studentId) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 })
    }

    // Frame data is already stored in localStorage on client side
    // This endpoint just fetches the frame from localStorage

    const frame = localStorage.getItem(`frame-${studentId}`)

    return NextResponse.json({
      success: true,
      active_frame: frame || null,
    })
  } catch (error: any) {
    console.error("[v0] Error in frames GET:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
