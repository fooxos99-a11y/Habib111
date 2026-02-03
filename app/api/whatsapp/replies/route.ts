import { NextResponse } from "next/server"

/**
 * GET /api/whatsapp/replies
 * الحصول على قائمة الردود المستلمة
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get("unread_only") === "true"
    const limit = parseInt(searchParams.get("limit") || "100")

    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    let query = supabase
      .from("whatsapp_replies")
      .select("*")
      .order("received_at", { ascending: false })
      .limit(limit)

    if (unreadOnly) {
      query = query.eq("is_read", false)
    }

    const { data: replies, error } = await query

    if (error) {
      console.error("[WhatsApp] Error fetching replies:", error)
      return NextResponse.json(
        { error: "فشل في جلب الردود" },
        { status: 500 }
      )
    }

    return NextResponse.json({ replies, count: replies.length })
  } catch (error) {
    console.error("[WhatsApp] Get replies error:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الردود" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/whatsapp/replies
 * تحديث حالة القراءة للرد
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { replyId, isRead } = body

    if (!replyId) {
      return NextResponse.json(
        { error: "معرف الرد مطلوب" },
        { status: 400 }
      )
    }

    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("whatsapp_replies")
      .update({ is_read: isRead })
      .eq("id", replyId)
      .select()
      .single()

    if (error) {
      console.error("[WhatsApp] Error updating reply:", error)
      return NextResponse.json(
        { error: "فشل في تحديث الرد" },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      reply: data,
      message: "تم تحديث حالة القراءة" 
    })
  } catch (error) {
    console.error("[WhatsApp] Update reply error:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحديث الرد" },
      { status: 500 }
    )
  }
}
