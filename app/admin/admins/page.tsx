"use client"

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { UserPlus, UserMinus } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClient } from "@/lib/supabase/client"
import { useConfirmDialog } from "@/hooks/use-confirm-dialog"

interface Admin {
  id: string
  name: string
  account_number: number
  phone_number?: string
  id_number?: string
}

export default function AdminsManagement() {
  const [isLoading, setIsLoading] = useState(true)
  const [admins, setAdmins] = useState<Admin[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const confirmDialog = useConfirmDialog()

  const [newAdmin, setNewAdmin] = useState({
    name: "",
    account_number: "",
    phone_number: "",
    id_number: "",
  })

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true"
    const userRole = localStorage.getItem("userRole")
    if (!loggedIn || userRole !== "admin") {
      router.push("/login")
    } else {
      fetchAdmins()
    }
  }, [router])

  const fetchAdmins = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("role", "admin")
        .order("account_number", { ascending: true })

      if (error) {
        console.error("[v0] Error fetching admins:", error)
        return
      }

      if (data) {
        setAdmins(data)
      }
    } catch (error) {
      console.error("[v0] Error fetching admins:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddAdmin = async () => {
    if (!newAdmin.name.trim() || !newAdmin.account_number.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from("users")
        .insert({
          name: newAdmin.name,
          account_number: Number.parseInt(newAdmin.account_number),
          phone_number: newAdmin.phone_number || null,
          id_number: newAdmin.id_number || null,
          role: "admin",
        })
        .select()

      if (error) {
        console.error("[v0] Error adding admin:", error)
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء إضافة الإداري",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "✓ تم الحفظ بنجاح",
        description: `تم إضافة الإداري ${newAdmin.name} بنجاح`,
        className: "bg-gradient-to-r from-[#D4AF37] to-[#C9A961] text-white border-none",
      })

      setNewAdmin({
        name: "",
        account_number: "",
        phone_number: "",
        id_number: "",
      })
      setIsAddDialogOpen(false)
      fetchAdmins()
    } catch (error) {
      console.error("[v0] Error adding admin:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة الإداري",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAdmin = async (adminId: string, adminName: string) => {
    const confirmed = await confirmDialog({
      title: "تأكيد حذف الإداري",
      description: `هل أنت متأكد من حذف الإداري ${adminName}؟`,
      confirmText: "نعم، احذف",
      cancelText: "إلغاء",
    })

    if (!confirmed) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from("users").delete().eq("id", adminId)

      if (error) {
        console.error("[v0] Error deleting admin:", error)
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء حذف الإداري",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "✓ تم الحذف بنجاح",
        description: `تم حذف الإداري ${adminName} بنجاح`,
        className: "bg-gradient-to-r from-[#D4AF37] to-[#C9A961] text-white border-none",
      })

      fetchAdmins()
    } catch (error) {
      console.error("[v0] Error deleting admin:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف الإداري",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-[#1a2332]">جاري التحميل...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f5f1e8] to-white">
      <Header />

      <main className="flex-1 py-6 md:py-12 px-3 md:px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-4 md:mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-[#1a2332] mb-1 md:mb-2">إدارة الإداريين</h1>
            <p className="text-sm md:text-lg text-[#1a2332]/70">إضافة وإزالة الإداريين في النظام</p>
          </div>

          <div className="mb-4 md:mb-6">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[#D4AF37] to-[#C9A961] hover:from-[#C9A961] hover:to-[#BFA050] text-[#023232] font-bold text-sm md:text-base w-full md:w-auto">
                  <UserPlus className="w-4 md:w-5 h-4 md:h-5 ml-1 md:ml-2" />
                  إضافة إداري جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] max-w-[95vw]">
                <DialogHeader>
                  <DialogTitle className="text-xl md:text-2xl text-[#1a2332]">إضافة إداري جديد</DialogTitle>
                </DialogHeader>
                <div className="grid gap-3 md:gap-4 py-3 md:py-4">
                  <div className="space-y-1 md:space-y-2">
                    <Label className="text-sm md:text-base">الاسم الكامل *</Label>
                    <Input
                      value={newAdmin.name}
                      onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                      placeholder="أدخل اسم الإداري"
                      className="text-sm md:text-base"
                    />
                  </div>
                  <div className="space-y-1 md:space-y-2">
                    <Label className="text-sm md:text-base">رقم الحساب *</Label>
                    <Input
                      type="number"
                      value={newAdmin.account_number}
                      onChange={(e) => setNewAdmin({ ...newAdmin, account_number: e.target.value })}
                      placeholder="أدخل رقم الحساب"
                      className="text-sm md:text-base"
                    />
                  </div>
                  <div className="space-y-1 md:space-y-2">
                    <Label className="text-sm md:text-base">رقم الهوية</Label>
                    <Input
                      value={newAdmin.id_number}
                      onChange={(e) => setNewAdmin({ ...newAdmin, id_number: e.target.value })}
                      placeholder="أدخل رقم الهوية (اختياري)"
                      className="text-sm md:text-base"
                    />
                  </div>
                  <div className="space-y-1 md:space-y-2">
                    <Label className="text-sm md:text-base">رقم الجوال</Label>
                    <Input
                      value={newAdmin.phone_number}
                      onChange={(e) => setNewAdmin({ ...newAdmin, phone_number: e.target.value })}
                      placeholder="أدخل رقم الجوال (اختياري)"
                      dir="ltr"
                      className="text-sm md:text-base"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 md:gap-3">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="text-sm md:text-base">
                    إلغاء
                  </Button>
                  <Button
                    onClick={handleAddAdmin}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-[#D4AF37] to-[#C9A961] hover:from-[#C9A961] hover:to-[#BFA050] text-[#023232] font-bold text-sm md:text-base"
                  >
                    {isSubmitting ? "جاري الحفظ..." : "حفظ"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="border border-[#D4AF37]/30 shadow-md">
            <CardHeader className="bg-gradient-to-r from-[#D4AF37]/10 to-[#C9A961]/10 p-3 md:p-6">
              <CardTitle className="text-xl md:text-2xl text-[#1a2332]">قائمة الإداريين</CardTitle>
            </CardHeader>
            <CardContent className="pt-3 md:pt-6 p-3 md:p-6">
              {admins.length === 0 ? (
                <div className="text-center py-6 md:py-8 text-[#1a2332]/60 text-sm md:text-base">لا يوجد إداريين مسجلين</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right text-xs md:text-sm">رقم الحساب</TableHead>
                        <TableHead className="text-right text-xs md:text-sm">الاسم</TableHead>
                        <TableHead className="text-right text-xs md:text-sm hidden md:table-cell">رقم الهوية</TableHead>
                        <TableHead className="text-right text-xs md:text-sm hidden md:table-cell">رقم الجوال</TableHead>
                        <TableHead className="text-right text-xs md:text-sm">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {admins.map((admin) => (
                        <TableRow key={admin.id}>
                          <TableCell className="font-bold text-xs md:text-base">{admin.account_number}</TableCell>
                          <TableCell className="text-xs md:text-base">{admin.name}</TableCell>
                          <TableCell className="text-xs md:text-base hidden md:table-cell">{admin.id_number || "-"}</TableCell>
                          <TableCell dir="ltr" className="text-right text-xs md:text-base hidden md:table-cell">
                            {admin.phone_number || "-"}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteAdmin(admin.id, admin.name)}
                              className="text-xs md:text-sm"
                            >
                              <UserMinus className="w-3 md:w-4 h-3 md:h-4 ml-1" />
                              حذف
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
