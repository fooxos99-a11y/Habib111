"use client"

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus, Trash2, ArrowRight } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { useConfirmDialog } from "@/hooks/use-confirm-dialog"
import { useAlertDialog } from "@/hooks/use-confirm-dialog"

interface Teacher {
  id: string
  name: string
  accountNumber: string
  idNumber: string
  halaqah: string
  studentCount: number
  phoneNumber?: string
}

interface Circle {
  id: string
  name: string
}

export default function TeacherManagement() {
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [circles, setCircles] = useState<Circle[]>([])
  const [newTeacherName, setNewTeacherName] = useState("")
  const [newTeacherIdNumber, setNewTeacherIdNumber] = useState("")
  const [newTeacherAccountNumber, setNewTeacherAccountNumber] = useState("")
  const [selectedHalaqah, setSelectedHalaqah] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)
  const [editPhoneNumber, setEditPhoneNumber] = useState("")
  const [editIdNumber, setEditIdNumber] = useState("")
  const router = useRouter()
  const confirmDialog = useConfirmDialog()
  const showAlert = useAlertDialog()

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true"
    const userRole = localStorage.getItem("userRole")
    if (!loggedIn || userRole !== "admin") {
      router.push("/login")
    } else {
      setIsLoading(false)
      loadData()
    }
  }, [router])

  const loadData = async () => {
    setIsLoadingData(true)
    await Promise.all([fetchTeachers(), fetchCircles()])
    setIsLoadingData(false)
  }

  const fetchTeachers = async () => {
    try {
      const response = await fetch("/api/teachers")
      const data = await response.json()
      if (data.teachers) {
        const mappedTeachers = data.teachers.map((t: any) => ({
          ...t,
          phoneNumber: t.phoneNumber || "",
          idNumber: t.idNumber || "",
        }))
        setTeachers(mappedTeachers)
      }
    } catch (error) {
      console.error("[v0] Error fetching teachers:", error)
    }
  }

  const fetchCircles = async () => {
    try {
      const response = await fetch("/api/circles")
      const data = await response.json()
      if (data.circles) {
        setCircles(data.circles)
      }
    } catch (error) {
      console.error("[v0] Error fetching circles:", error)
    }
  }

  const handleAddTeacher = async () => {
    if (
      newTeacherName.trim() &&
      newTeacherIdNumber.trim() &&
      newTeacherAccountNumber.trim() &&
      selectedHalaqah.trim()
    ) {
      try {
        const response = await fetch("/api/teachers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newTeacherName,
            id_number: newTeacherIdNumber,
            account_number: Number.parseInt(newTeacherAccountNumber),
            halaqah: selectedHalaqah,
          }),
        })

        const data = await response.json()

        if (data.success) {
          setTeachers([...teachers, data.teacher])
          setNewTeacherName("")
          setNewTeacherIdNumber("")
          setNewTeacherAccountNumber("")
          setSelectedHalaqah("")
          setIsAddDialogOpen(false)
          await showAlert(`تم إضافة المعلم ${newTeacherName} إلى ${selectedHalaqah} بنجاح`, "نجاح")
        } else {
          await showAlert(data.error ? data.error : "فشل في إضافة المعلم", "خطأ")
        }
      } catch (error) {
        console.error("[v0] Error adding teacher:", error)
        await showAlert("حدث خطأ أثناء إضافة المعلم", "خطأ")
      }
    } else {
      await showAlert("الرجاء ملء جميع الحقول", "تنبيه")
    }
  }

  const handleRemoveTeacher = async (id: string, name: string) => {
    const confirmed = await confirmDialog(`هل أنت متأكد من إزالة المعلم ${name}؟`)
    if (confirmed) {
      try {
        const response = await fetch(`/api/teachers?id=${id}`, {
          method: "DELETE",
        })

        const data = await response.json()

        if (data.success) {
          setTeachers(teachers.filter((t) => t.id !== id))
          await showAlert(`تم إزالة المعلم ${name} بنجاح`, "نجاح")
        } else {
          await showAlert("فشل في إزالة المعلم", "خطأ")
        }
      } catch (error) {
        console.error("[v0] Error removing teacher:", error)
        await showAlert("حدث خطأ أثناء إزالة المعلم", "خطأ")
      }
    }
  }

  const handleEditTeacher = (teacher: Teacher) => {
    setEditingTeacher(teacher)
    setEditPhoneNumber(teacher.phoneNumber || "")
    setEditIdNumber(teacher.idNumber || "")
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingTeacher) return

    try {
      const response = await fetch("/api/teachers", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingTeacher.id,
          phone_number: editPhoneNumber,
          id_number: editIdNumber,
        }),
      })

      const data = await response.json()

      if (data.success) {
        await showAlert(`تم تحديث معلومات المعلم ${editingTeacher.name} بنجاح`, "نجاح")
        setIsEditDialogOpen(false)
        setEditingTeacher(null)
        fetchTeachers()
      } else {
        await showAlert("فشل في تحديث المعلم", "خطأ")
      }
    } catch (error) {
      console.error("[v0] Error updating teacher:", error)
      await showAlert("حدث خطأ أثناء تحديث المعلم", "خطأ")
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
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-8 gap-3">
            <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
              <Button onClick={() => router.back()} variant="outline" size="sm" className="md:h-auto">
                <ArrowRight className="w-4 md:w-5 h-4 md:h-5 ml-1 md:ml-2" />
              </Button>
              <div>
                <h1 className="text-2xl md:text-4xl font-bold text-[#1a2332]">إدارة المعلمين</h1>
                <p className="text-sm md:text-lg text-[#1a2332]/70 mt-0.5 md:mt-1">إضافة وإدارة معلمي الحلقات</p>
              </div>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[#D4AF37] to-[#C9A961] hover:from-[#C9A961] hover:to-[#BFA050] text-[#00312e] font-bold text-sm md:text-lg py-4 md:py-6 px-4 md:px-8 w-full md:w-auto">
                  <UserPlus className="w-4 md:w-6 h-4 md:h-6 ml-1 md:ml-2" />
                  إضافة معلم
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-[#1a2332]">إضافة معلم جديد</DialogTitle>
                  <DialogDescription className="text-base">أضف معلماً جديداً إلى النظام</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="teacherName" className="text-base font-semibold text-[#1a2332]">
                      اسم المعلم
                    </Label>
                    <Input
                      id="teacherName"
                      value={newTeacherName}
                      onChange={(e) => setNewTeacherName(e.target.value)}
                      placeholder="أدخل اسم المعلم"
                      className="text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teacherAccountNumber" className="text-base font-semibold text-[#1a2332]">
                      رقم الحساب
                    </Label>
                    <Input
                      id="teacherAccountNumber"
                      value={newTeacherAccountNumber}
                      onChange={(e) => setNewTeacherAccountNumber(e.target.value)}
                      placeholder="أدخل رقم الحساب"
                      className="text-base"
                      dir="ltr"
                      type="number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teacherIdNumber" className="text-base font-semibold text-[#1a2332]">
                      رقم الهوية
                    </Label>
                    <Input
                      id="teacherIdNumber"
                      value={newTeacherIdNumber}
                      onChange={(e) => setNewTeacherIdNumber(e.target.value)}
                      placeholder="أدخل رقم الهوية"
                      className="text-base"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="halaqah" className="text-base font-semibold text-[#1a2332]">
                      اختر الحلقة
                    </Label>
                    <Select value={selectedHalaqah} onValueChange={setSelectedHalaqah}>
                      <SelectTrigger className="text-base">
                        <SelectValue placeholder="اختر الحلقة" />
                      </SelectTrigger>
                      <SelectContent>
                        {circles.map((circle) => (
                          <SelectItem key={circle.id} value={circle.name}>
                            {circle.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="font-bold">
                    إلغاء
                  </Button>
                  <Button
                    onClick={handleAddTeacher}
                    className="bg-gradient-to-r from-[#D4AF37] to-[#C9A961] hover:from-[#C9A961] hover:to-[#BFA050] text-[#00312e] font-bold"
                  >
                    حفظ
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-[#1a2332]">تعديل معلومات المعلم</DialogTitle>
                  <DialogDescription className="text-base">
                    تعديل رقم الهوية ورقم الجوال للمعلم {editingTeacher?.name}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="editIdNumber" className="text-base font-semibold text-[#1a2332]">
                      رقم الهوية
                    </Label>
                    <Input
                      id="editIdNumber"
                      value={editIdNumber}
                      onChange={(e) => setEditIdNumber(e.target.value)}
                      placeholder="أدخل رقم الهوية"
                      className="text-base"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editPhoneNumber" className="text-base font-semibold text-[#1a2332]">
                      رقم الجوال
                    </Label>
                    <Input
                      id="editPhoneNumber"
                      value={editPhoneNumber}
                      onChange={(e) => setEditPhoneNumber(e.target.value)}
                      placeholder="أدخل رقم الجوال"
                      className="text-base"
                      dir="ltr"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditDialogOpen(false)
                      setEditingTeacher(null)
                    }}
                    className="font-bold"
                  >
                    إلغاء
                  </Button>
                  <Button
                    onClick={handleSaveEdit}
                    className="bg-gradient-to-r from-[#D4AF37] to-[#C9A961] hover:from-[#C9A961] hover:to-[#BFA050] text-[#00312e] font-bold"
                  >
                    حفظ التعديلات
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Teachers List */}
          {isLoadingData ? (
            <Card className="border-2 border-[#35A4C7]/20 shadow-lg">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <p className="text-xl text-[#1a2332]/60">جاري تحميل المعلمين...</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {teachers.map((teacher) => (
                <Card
                  key={teacher.id}
                  className="border-2 border-[#35A4C7]/20 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <CardContent className="pt-3 md:pt-6 p-3 md:p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-6">
                      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 w-full">
                        <div className="space-y-1 md:space-y-2">
                          <label className="text-xs md:text-sm font-semibold text-[#1a2332]/70">اسم المعلم</label>
                          <div className="text-base md:text-xl font-bold text-[#1a2332]">{teacher.name}</div>
                        </div>
                        <div className="space-y-1 md:space-y-2">
                          <label className="text-xs md:text-sm font-semibold text-[#1a2332]/70">رقم الحساب</label>
                          <div className="text-sm md:text-lg font-bold text-[#d8a355]">{teacher.accountNumber}</div>
                        </div>
                        <div className="space-y-1 md:space-y-2">
                          <Badge className="bg-white border-2 border-[#d8a355]/30 text-[#1a2332] text-xs md:text-base px-2 md:px-3 py-0.5 md:py-1">
                            {teacher.halaqah}
                          </Badge>
                        </div>
                        <div className="space-y-1 md:space-y-2">
                          <label className="text-xs md:text-sm font-semibold text-[#1a2332]/70">عدد الطلاب</label>
                          <div className="text-sm md:text-lg font-bold text-[#1a2332]">{teacher.studentCount}</div>
                        </div>
                      </div>
                      <div className="flex gap-2 md:gap-3 w-full md:w-auto">
                        <Button
                          onClick={() => handleEditTeacher(teacher)}
                          variant="outline"
                          size="sm"
                          className="border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 font-bold text-xs md:text-base flex-1 md:flex-none"
                        >
                          تعديل
                        </Button>
                        <Button
                          onClick={() => handleRemoveTeacher(teacher.id, teacher.name)}
                          variant="outline"
                          size="sm"
                          className="border-2 border-red-500 text-red-600 hover:bg-red-50 font-bold text-xs md:text-base flex-1 md:flex-none"
                        >
                          <Trash2 className="w-4 md:w-5 h-4 md:h-5 ml-1 md:ml-2" />
                          إزالة
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoadingData && teachers.length === 0 && (
            <Card className="border-2 border-[#35A4C7]/20 shadow-lg">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <p className="text-xl text-[#1a2332]/60">لا يوجد معلمين حالياً</p>
                  <p className="text-base text-[#1a2332]/40 mt-2">قم بإضافة معلم جديد للبدء</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
