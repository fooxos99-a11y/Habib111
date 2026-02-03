import { type NextRequest, NextResponse } from "next/server"
import { put, list } from "@vercel/blob"

export const runtime = "edge"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")

    if (studentId) {
      const blobPath = `badges/${studentId}.json`

      try {
        const { blobs } = await list({ prefix: blobPath })

        if (blobs.length === 0) {
          console.log("[v0] No badge found for student:", studentId)
          return NextResponse.json({ badge: null })
        }

        const response = await fetch(`${blobs[0].url}?t=${Date.now()}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        })

        if (!response.ok) {
          return NextResponse.json({ badge: null })
        }

        const data = await response.json()
        console.log("[v0] Loaded badge for student:", studentId, data.badge)
        return NextResponse.json({ badge: data.badge || null })
      } catch (error) {
        console.log("[v0] Error loading badge, returning null:", error)
        return NextResponse.json({ badge: null })
      }
    } else {
      const { blobs } = await list({ prefix: "badges/" })
      const badges: Record<string, string> = {}

      for (const blob of blobs) {
        try {
          const response = await fetch(`${blob.url}?t=${Date.now()}`, {
            cache: "no-store",
            headers: { "Cache-Control": "no-cache" },
          })

          if (response.ok) {
            const data = await response.json()
            const studentIdMatch = blob.pathname.match(/badges\/(.+)\.json/)
            if (studentIdMatch && data.badge) {
              badges[studentIdMatch[1]] = data.badge
            }
          }
        } catch (error) {
          continue
        }
      }

      console.log("[v0] Loaded all badges:", badges)
      return NextResponse.json({ badges })
    }
  } catch (error) {
    console.error("[v0] Error in GET /api/badges:", error)
    return NextResponse.json({ badges: {} }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, badge } = body

    if (!studentId || !badge) {
      return NextResponse.json({ error: "Student ID and badge required" }, { status: 400 })
    }

    console.log("[v0] Saving badge for student:", studentId, badge)

    const blobPath = `badges/${studentId}.json`

    const blob = await put(blobPath, JSON.stringify({ badge, updatedAt: new Date().toISOString() }), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
    })

    console.log("[v0] Badge saved successfully to:", blob.url)
    return NextResponse.json({ success: true, badge })
  } catch (error) {
    console.error("[v0] Error in POST /api/badges:", error)
    return NextResponse.json({ error: "Failed to save badge" }, { status: 500 })
  }
}
