import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("teacher_attendance")
      .select("*")
      .order("attendance_date", { ascending: false })
      .order("check_in_time", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching all teacher attendance:", error)
      return NextResponse.json({ error: "Failed to fetch attendance records" }, { status: 500 })
    }

    return NextResponse.json({
      records: data || [],
    })
  } catch (error) {
    console.error("[v0] Error in teacher attendance all GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
