import { type NextRequest, NextResponse } from "next/server"
import { put, list } from "@vercel/blob"

// GET: جلب المظاهر من Blob
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")

    console.log("[v0] Fetching themes from Blob")

    const { blobs } = await list({ prefix: "student-themes-" })

    const themes: Record<string, string> = {}

    for (const blob of blobs) {
      const response = await fetch(blob.url)
      const data = await response.json()
      Object.assign(themes, data)
    }

    console.log("[v0] Themes loaded from Blob:", themes)

    if (studentId) {
      const theme = themes[studentId] || null
      console.log(`[v0] Theme for student ${studentId}:`, theme)
      return NextResponse.json({ theme })
    }

    return NextResponse.json({ themes })
  } catch (error: any) {
    console.error("[v0] Error fetching themes:", error)
    if (new URL(request.url).searchParams.get("studentId")) {
      return NextResponse.json({ theme: null })
    }
    return NextResponse.json({ themes: {} })
  }
}

// POST: حفظ مظهر طالب في Blob
export async function POST(request: NextRequest) {
  try {
    const { studentId, theme } = await request.json()

    if (!studentId || !theme) {
      return NextResponse.json({ error: "Missing studentId or theme" }, { status: 400 })
    }

    console.log("[v0] Saving theme:", theme, "for student:", studentId)

    const blob = await put(`student-themes-${studentId}.json`, JSON.stringify({ [studentId]: theme }), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
    })

    console.log("[v0] Theme saved to Blob:", blob.url)

    return NextResponse.json({ success: true, url: blob.url })
  } catch (error: any) {
    console.error("[v0] Error saving theme:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
