import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {

    const { account_number } = await request.json()
    console.log("[v0] Login attempt with account number:", account_number)
    console.log("[v0] Account number type:", typeof account_number)

    // تحقق أن المدخل رقم صحيح موجب فقط
    if (!account_number || typeof account_number !== "string" || !/^[0-9]+$/.test(account_number)) {
      return NextResponse.json({ error: "رقم الحساب يجب أن يكون أرقام فقط" }, { status: 400 })
    }

    const accountNum = Number.parseInt(account_number)
    if (isNaN(accountNum) || accountNum <= 0) {
      return NextResponse.json({ error: "رقم الحساب غير صحيح" }, { status: 400 })
    }
    console.log("[v0] Converted account number:", accountNum, "type:", typeof accountNum)

    const supabase = await createClient()

    const { data: allUsers, error: allUsersError } = await supabase
      .from("users")
      .select("account_number, name, role")
      .limit(10)

    console.log("[v0] All users in database:", allUsers)
    console.log("[v0] All users error:", allUsersError)

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, name, role, account_number, halaqah")
      .eq("account_number", accountNum)
      .maybeSingle()

    console.log("[v0] User query result:", { user, userError })
    console.log("[v0] User query - looking for account_number:", accountNum)

    if (user) {
      console.log("[v0] User found in users table:", user.name, user.role)
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
          accountNumber: user.account_number,
          halaqah: user.halaqah,
        },
      })
    }

    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("id, name, account_number, halaqah")
      .eq("account_number", accountNum)
      .maybeSingle()

    console.log("[v0] Student query result:", { student, studentError })

    if (student) {
      console.log("[v0] Student found in students table:", student.name)
      return NextResponse.json({
        success: true,
        user: {
          id: student.id,
          name: student.name,
          role: "student",
          accountNumber: student.account_number,
          halaqah: student.halaqah,
        },
      })
    }

    console.log("[v0] Account number not found in database:", accountNum)
    return NextResponse.json({ error: "رقم الحساب غير صحيح" }, { status: 401 })
  } catch (error) {
    console.error("[v0] Auth error:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء تسجيل الدخول" }, { status: 500 })
  }
}
