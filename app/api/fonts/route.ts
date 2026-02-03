import { put, list, del } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

const FONTS_BLOB_KEY = "student-fonts"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Fetching fonts from Blob")
    const { blobs } = await list({ prefix: FONTS_BLOB_KEY })

    console.log(
      "[v0] Found blobs:",
      blobs.length,
      blobs.map((b) => ({ url: b.url, uploadedAt: b.uploadedAt })),
    )

    if (blobs.length === 0) {
      console.log("[v0] No fonts found, returning empty")
      return NextResponse.json({ fonts: {} })
    }

    const latestBlob = blobs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())[0]

    console.log("[v0] Using latest blob:", latestBlob.url)

    const timestamp = Date.now()
    const response = await fetch(`${latestBlob.url}?t=${timestamp}`)
    const fonts = await response.json()

    console.log("[v0] Loaded fonts from Blob:", fonts)

    return NextResponse.json({ fonts })
  } catch (error) {
    console.error("[v0] Error fetching fonts:", error)
    return NextResponse.json({ fonts: {} })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { student_id, font_id } = body

    if (!student_id || !font_id) {
      return NextResponse.json({ error: "Missing student_id or font_id" }, { status: 400 })
    }

    let fonts: Record<string, string> = {}

    console.log("[v0] Loading existing fonts before save")
    const { blobs } = await list({ prefix: FONTS_BLOB_KEY })
    console.log("[v0] Found existing blobs:", blobs.length)

    if (blobs.length > 0) {
      const latestBlob = blobs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())[0]
      const response = await fetch(latestBlob.url)
      fonts = await response.json()
      console.log("[v0] Loaded existing fonts:", fonts)

      console.log("[v0] Deleting old blobs")
      for (const blob of blobs) {
        await del(blob.url)
      }
    }

    fonts[student_id] = font_id

    console.log("[v0] Saving updated fonts:", fonts)
    const blob = await put(`${FONTS_BLOB_KEY}.json`, JSON.stringify(fonts), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: true,
    })

    console.log("[v0] Font saved to blob:", blob.url)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json({ success: true, fonts })
  } catch (error) {
    console.error("[v0] Error saving font:", error)
    return NextResponse.json({ error: "Failed to save font" }, { status: 500 })
  }
}
