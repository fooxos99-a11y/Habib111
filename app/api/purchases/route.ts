import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { student_id, product_id, price } = body

    console.log("[v0] POST /api/purchases - Received data:", { student_id, product_id, price })

    if (!student_id || !product_id || price === undefined) {
      return NextResponse.json({ error: "البيانات المطلوبة ناقصة" }, { status: 400 })
    }

    // Check if student has enough points
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("points")
      .eq("id", student_id)
      .single()

    if (studentError || !student) {
      console.error("[v0] Error fetching student:", studentError)
      return NextResponse.json({ error: "لم يتم العثور على الطالب" }, { status: 404 })
    }

    if (student.points < price) {
      return NextResponse.json({ error: "نقاط غير كافية" }, { status: 400 })
    }

    const newPoints = student.points - price
    const { error: updateError } = await supabase.from("students").update({ points: newPoints }).eq("id", student_id)

    if (updateError) {
      console.error("[v0] Error updating student points:", updateError)
      return NextResponse.json({ error: "فشل في تحديث النقاط" }, { status: 500 })
    }

    console.log("[v0] Purchase successful:", { student_id, product_id, remaining_points: newPoints })

    return NextResponse.json(
      {
        success: true,
        remaining_points: newPoints,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Error in POST /api/purchases:", error)
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("student_id")

    if (!studentId) {
      return NextResponse.json({ error: "معرف الطالب مطلوب" }, { status: 400 })
    }

    // Purchases are stored in localStorage, so return empty list
    return NextResponse.json({ purchases: [] }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error in GET /api/purchases:", error)
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 })
  }
}
