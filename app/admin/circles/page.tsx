"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
import { Plus, Trash2, ArrowRight, Users, BookOpen, Eye, UserX, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useConfirmDialog } from "@/hooks/use-confirm-dialog"
import { useAlertDialog } from "@/hooks/use-confirm-dialog"
import { TeacherAttendanceModal } from "@/components/teacher-attendance-modal"

interface Circle {
  name: string
  studentCount: number
}

interface Student {
  id: string
  name: string
  national_id: string
  rank: number
  halaqah: string
  created_at: string
  points: number
}

export default function CircleManagement() {
  const [isLoading, setIsLoading] = useState(true)
  const [newCircleName, setNewCircleName] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedCircle, setSelectedCircle] = useState<Circle | null>(null)
  const [isStudentsDialogOpen, setIsStudentsDialogOpen] = useState(false)
  const [circleStudents, setCircleStudents] = useState<Student[]>([])
  const [isLoadingStudents, setIsLoadingStudents] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isStudentInfoDialogOpen, setIsStudentInfoDialogOpen] = useState(false)
  const [circles, setCircles] = useState<Circle[]>([])
  const [showTeacherAttendance, setShowTeacherAttendance] = useState(true)
  const router = useRouter()
  const confirmDialog = useConfirmDialog()
  const showAlert = useAlertDialog()

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true"
    const userRole = localStorage.getItem("userRole")
    if (!loggedIn || userRole !== "admin") {
      router.push("/login")
    } else {
      fetchCircles()
    }
  }, [router])

  const fetchCircles = async () => {
    try {
      const response = await fetch("/api/circles")
      const data = await response.json()
      if (data.circles) {
        setCircles(data.circles)
      }
    } catch (error) {
      console.error("[v0] Error fetching circles:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCircle = async () => {
    if (newCircleName.trim()) {
      try {
        const response = await fetch("/api/circles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newCircleName }),
        })

        if (response.ok) {
          localStorage.removeItem("circlesCache")
          localStorage.removeItem("circlesCacheTime")
          setNewCircleName("")
          setIsAddDialogOpen(false)
          await showAlert(`تم إضافة الحلقة ${newCircleName} بنجاح. سيتم إنشاؤها عند إضافة أول طالب.`, "نجاح")
          fetchCircles()
        }
      } catch (error) {
        console.error("[v0] Error adding circle:", error)
        await showAlert("حدث خطأ أثناء إضافة الحلقة", "خطأ")
      }
    }
  }

  const handleRemoveCircle = async (name: string) => {
    const confirmed = await confirmDialog(
      `هل أنت متأكد من إزالة ${name}؟ سيتم حذف جميع الطلاب في هذه الحلقة.`,
      "تأكيد إزالة الحلقة",
    )
    if (confirmed) {
      try {
        const response = await fetch(`/api/circles?name=${encodeURIComponent(name)}`, {
          method: "DELETE",
        })

        if (response.ok) {
          // امسح الكاش المحلي للحلقات
          localStorage.removeItem("circlesCache")
          localStorage.removeItem("circlesCacheTime")
          // أرسل حدث لتحديث الهيدر في كل الصفحات المفتوحة
          window.dispatchEvent(new Event("circlesChanged"))
          await showAlert(`تم إزالة ${name} بنجاح`, "نجاح")
          fetchCircles()
        }
      } catch (error) {
        console.error("[v0] Error removing circle:", error)
        await showAlert("حدث خطأ أثناء إزالة الحلقة", "خطأ")
      }
    }
  }

  const handleViewCircle = async (circle: Circle) => {
    setSelectedCircle(circle)
    setIsStudentsDialogOpen(true)
    setIsLoadingStudents(true)
    setCircleStudents([])

    try {
      const response = await fetch(`/api/students?circle=${encodeURIComponent(circle.name)}`)
      const data = await response.json()
      if (data.students) {
        const sortedStudents = (data.students || []).sort((a: any, b: any) => (a.rank || 999) - (b.rank || 999))
        setCircleStudents(sortedStudents)
      }
    } catch (error) {
      console.error("[v0] Error fetching students:", error)
    } finally {
      setIsLoadingStudents(false)
    }
  }

  const handleRemoveStudent = async (studentId: string, studentName: string) => {
    const confirmed = await confirmDialog(`هل أنت متأكد من إزالة ${studentName} من الحلقة؟`)
    if (confirmed) {
      try {
        const response = await fetch(`/api/students?id=${studentId}`, {
          method: "DELETE",
        })

        if (response.ok) {
          await showAlert(`تم إزالة ${studentName} من الحلقة بنجاح`, "نجاح")
          if (selectedCircle) {
            const studentsResponse = await fetch(`/api/students?circle=${encodeURIComponent(selectedCircle.name)}`)
            const data = await studentsResponse.json()
            if (data.students) {
              setCircleStudents(data.students)
            }
          }
          fetchCircles()
        }
      } catch (error) {
        console.error("[v0] Error removing student:", error)
        await showAlert("حدث خطأ أثناء إزالة الطالب", "خطأ")
      }
    }
  }

  const handleViewStudentInfo = (student: Student) => {
    setSelectedStudent(student)
    setIsStudentInfoDialogOpen(true)
  }

  const handleAttendanceClose = () => {
    setShowTeacherAttendance(false)
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

      {/* تم إزالة نافذة التحضير للمعلمين */}

      <main className="flex-1 py-6 md:py-12 px-3 md:px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-8 gap-3">
            <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
              <Button onClick={() => router.back()} variant="outline" size="sm" className="md:h-auto">
                <ArrowRight className="w-4 md:w-5 h-4 md:h-5 ml-1 md:ml-2" />
              </Button>
              <div>
                <h1 className="text-2xl md:text-4xl font-bold text-[#1a2332]">إدارة الحلقات</h1>
                <p className="text-sm md:text-lg text-[#1a2332]/70 mt-0.5 md:mt-1">إضافة وإدارة حلقات التحفيظ</p>
              </div>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[#D4AF37] to-[#C9A961] hover:from-[#C9A961] hover:to-[#BFA050] text-[#023232] font-bold text-sm md:text-lg py-4 md:py-6 px-4 md:px-8 w-full md:w-auto">
                  <Plus className="w-4 md:w-6 h-4 md:h-6 ml-1 md:ml-2" />
                  إضافة حلقة
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-[#1a2332]">إضافة حلقة جديدة</DialogTitle>
                  <DialogDescription className="text-base">أضف حلقة تحفيظ جديدة إلى النظام</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="circleName" className="text-base font-semibold text-[#1a2332]">
                      اسم الحلقة
                    </Label>
                    <Input
                      id="circleName"
                      value={newCircleName}
                      onChange={(e) => setNewCircleName(e.target.value)}
                      placeholder="مثال: حلقة أبو بكر الصديق"
                      className="text-base"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="font-bold">
                    إلغاء
                  </Button>
                  <Button
                    onClick={handleAddCircle}
                    className="bg-gradient-to-r from-[#D4AF37] to-[#C9A961] hover:from-[#C9A961] hover:to-[#BFA050] text-[#023232] font-bold"
                  >
                    حفظ
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {circles.map((circle) => (
              <Card key={circle.name} className="border-2 border-[#D4AF37]/20 shadow-lg hover:shadow-xl transition-all">
                <CardContent className="pt-3 md:pt-6 p-3 md:p-6">
                  <div className="space-y-2 md:space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 md:mb-2">
                          <BookOpen className="w-4 md:w-6 h-4 md:h-6 text-[#d8a355]" />
                          <h3 className="text-lg md:text-2xl font-bold text-[#1a2332]">{circle.name}</h3>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 md:space-y-3 pt-2 md:pt-4 border-t-2 border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs md:text-sm font-semibold text-[#1a2332]/70">عدد الطلاب:</span>
                        <div className="flex items-center gap-1 md:gap-2">
                          <Users className="w-4 md:w-5 h-4 md:h-5 text-[#d8a355]" />
                          <span className="text-base md:text-lg font-bold text-[#1a2332]">{circle.studentCount}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 md:pt-4">
                      <Button
                        onClick={() => handleViewCircle(circle)}
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-[#D4AF37] to-[#C9A961] hover:from-[#C9A961] hover:to-[#BFA050] text-[#023232] font-bold text-xs md:text-base"
                      >
                        <Eye className="w-3 md:w-5 h-3 md:h-5 ml-1 md:ml-2" />
                        عرض الطلاب
                      </Button>
                      <Button
                        onClick={() => handleRemoveCircle(circle.name)}
                        variant="outline"
                        size="sm"
                        className="border-2 border-red-500 text-red-600 hover:bg-red-50 font-bold"
                      >
                        <Trash2 className="w-3 md:w-5 h-3 md:h-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {circles.length === 0 && (
            <Card className="border-2 border-[#D4AF37]/20 shadow-lg">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-[#1a2332]/20 mx-auto mb-4" />
                  <p className="text-xl text-[#1a2332]/60">لا يوجد حلقات حالياً</p>
                  <p className="text-base text-[#1a2332]/40 mt-2">قم بإضافة حلقة جديدة للبدء</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Dialog open={isStudentsDialogOpen} onOpenChange={setIsStudentsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#1a2332]">طلاب {selectedCircle?.name}</DialogTitle>
            <DialogDescription className="text-base">إدارة طلاب الحلقة - عرض المعلومات وإزالة الطلاب</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {isLoadingStudents ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
                <p className="text-lg text-[#1a2332]/60">جاري تحميل الطلاب...</p>
              </div>
            ) : circleStudents.length > 0 ? (
              circleStudents.map((student) => (
                <Card key={student.id} className="border-2 border-[#D4AF37]/20">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#C9A961] flex items-center justify-center text-white font-bold text-lg">
                          {student.rank || "-"}
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-[#1a2332]">{student.name}</h4>
                          <p className="text-sm text-[#1a2332]/60">{student.national_id}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleViewStudentInfo(student)}
                          size="sm"
                          className="bg-gradient-to-r from-[#D4AF37] to-[#C9A961] hover:from-[#C9A961] hover:to-[#BFA050] text-[#023232] font-bold"
                        >
                          <Info className="w-4 h-4 ml-1" />
                          عرض
                        </Button>
                        <Button
                          onClick={() => handleRemoveStudent(student.id, student.name)}
                          size="sm"
                          variant="outline"
                          className="border-2 border-red-500 text-red-600 hover:bg-red-50 font-bold"
                        >
                          <UserX className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-[#1a2332]/20 mx-auto mb-4" />
                <p className="text-lg text-[#1a2332]/60">لا يوجد طلاب في هذه الحلقة</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isStudentInfoDialogOpen} onOpenChange={setIsStudentInfoDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#1a2332]">معلومات الطالب</DialogTitle>
            <DialogDescription className="text-base">البيانات الشخصية للطالب</DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <>
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#C9A961] flex items-center justify-center text-white font-bold text-3xl">
                    {selectedStudent.rank}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-[#f5f1e8] rounded-lg">
                    <span className="font-semibold text-[#1a2332]">الاسم:</span>
                    <span className="text-[#1a2332]/80">{selectedStudent.name}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-[#f5f1e8] rounded-lg">
                    <span className="font-semibold text-[#1a2332]">رقم الهوية:</span>
                    <span className="text-[#1a2332]/80 font-mono">{selectedStudent.national_id}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-[#f5f1e8] rounded-lg">
                    <span className="font-semibold text-[#1a2332]">المرتبة:</span>
                    <Badge className="bg-[#D4AF37] text-white text-base px-3 py-1">#{selectedStudent.rank}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-[#f5f1e8] rounded-lg">
                    <span className="font-semibold text-[#1a2332]">الحلقة:</span>
                    <span className="text-[#1a2332]/80">{selectedStudent.halaqah}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-[#f5f1e8] rounded-lg">
                    <span className="font-semibold text-[#1a2332]">تاريخ الانضمام:</span>
                    <span className="text-[#1a2332]/80">
                      {new Date(selectedStudent.created_at).toLocaleDateString("ar-SA")}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => setIsStudentInfoDialogOpen(false)}
                  className="bg-gradient-to-r from-[#D4AF37] to-[#C9A961] hover:from-[#C9A961] hover:to-[#BFA050] text-[#023232] font-bold"
                >
                  إغلاق
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
