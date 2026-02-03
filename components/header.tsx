"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { 
  ChevronDown, User, LogOut, Users, 
  LayoutDashboard, Menu, X, ClipboardCheck,
  Trophy, Store, Map, Target, MessageSquare
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { useConfirmDialog } from "@/hooks/use-confirm-dialog"
import { TeacherAttendanceModal } from "@/components/teacher-attendance-modal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Circle {
  name: string
  studentCount: number
}

const CIRCLES_CACHE_DURATION = 5 * 60 * 1000

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [circles, setCircles] = useState<Circle[]>([])
  const [circlesLoading, setCirclesLoading] = useState(true)
  const [teacherInfo, setTeacherInfo] = useState<{ id: string; name: string; accountNumber: number } | null>(null)

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCirclesDropdownOpen, setIsCirclesDropdownOpen] = useState(false)
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false)

  const router = useRouter()
  const pathname = usePathname()
  const confirmDialog = useConfirmDialog()

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "instant" })

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true"
    const role = localStorage.getItem("userRole")
    setIsLoggedIn(loggedIn)
    setUserRole(role)

    if (loggedIn && role === "teacher") {
      const accNum = localStorage.getItem("accountNumber")
      if (accNum) fetchTeacherInfo(accNum)
    }
    loadCircles()
  }, [])

  const loadCircles = () => {
    const cachedData = localStorage.getItem("circlesCache")
    const cacheTime = localStorage.getItem("circlesCacheTime")
    if (cachedData && cacheTime && (Date.now() - Number(cacheTime) < CIRCLES_CACHE_DURATION)) {
      setCircles(JSON.parse(cachedData))
      setCirclesLoading(false)
    } else {
      fetchCircles()
    }
  }

  const fetchCircles = async () => {
    try {
      setCirclesLoading(true)
      const res = await fetch("/api/circles")
      const data = await res.json()
      if (data.circles) {
        setCircles(data.circles)
        localStorage.setItem("circlesCache", JSON.stringify(data.circles))
        localStorage.setItem("circlesCacheTime", Date.now().toString())
      }
    } catch (e) { console.error(e) } finally { setCirclesLoading(false) }
  }

  const fetchTeacherInfo = async (accNum: string) => {
    try {
      const res = await fetch(`/api/teachers?account_number=${accNum}`)
      const data = await res.json()
      if (data.teachers?.[0]) {
        setTeacherInfo({ id: data.teachers[0].id, name: data.teachers[0].name, accountNumber: data.teachers[0].account_number })
      }
    } catch (e) { console.error(e) }
  }

  const handleLogout = async () => {
    const confirmed = await confirmDialog({
      title: "تأكيد تسجيل الخروج",
      description: "هل أنت متأكد من أنك تريد تسجيل الخروج؟",
      confirmText: "نعم، تسجيل الخروج",
      cancelText: "إلغاء",
    })
    if (confirmed) {
      setIsLoggingOut(true)
      await new Promise(r => setTimeout(r, 800))
      localStorage.clear()
      setIsLoggedIn(false)
      setUserRole(null)
      setIsLoggingOut(false)
      router.push("/")
    }
  }

  const handleNav = (href: string) => {
    setIsMobileMenuOpen(false)
    scrollToTop()
    router.push(href)
  }

  // دالة لتوجيه المستخدم لملفه الشخصي حسب رتبته
  const goToProfile = () => {
    if (userRole === "admin") router.push("/admin/profile")
    else if (userRole === "teacher") router.push("/teacher/dashboard")
    else router.push("/profile")
    scrollToTop()
  }

  return (
    <>
      {isLoggedIn && userRole === "teacher" && teacherInfo && (
        <TeacherAttendanceModal 
          isOpen={isAttendanceModalOpen} 
          onClose={() => setIsAttendanceModalOpen(false)} 
          teacherId={teacherInfo.id} 
          teacherName={teacherInfo.name} 
          accountNumber={teacherInfo.accountNumber} 
        />
      )}

      {isLoggingOut && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl">
            <div className="w-12 h-12 border-4 border-[#d8a355]/20 border-t-[#d8a355] rounded-full animate-spin" />
            <p className="font-bold text-[#d8a355] text-lg">جاري تسجيل الخروج...</p>
          </div>
        </div>
      )}

      <header className="bg-[#00312e] text-white sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between relative">
          
          <button className="md:hidden p-2 z-20 order-3" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>

          <div className="flex-1 md:flex-initial flex justify-center md:justify-start order-2 md:order-1">
            <Image 
              src="/قبس.png" alt="قبس" width={100} height={60} 
              className="w-20 md:w-24 h-auto cursor-pointer" 
              onClick={() => handleNav("/")}
            />
          </div>

          {/* القائمة المكتبية */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-8 order-2 font-bold text-sm lg:text-base">
            <button onClick={() => handleNav("/")} className={`hover:text-[#d8a355] transition-colors ${pathname === "/" ? "text-[#d8a355]" : ""}`}>الرئيسية</button>
            <button onClick={() => handleNav("/achievements")} className={`hover:text-[#d8a355] transition-colors ${pathname === "/achievements" ? "text-[#d8a355]" : ""}`}>الإنجازات</button>
            
            {isLoggedIn && userRole === "student" && (
              <>
                <button onClick={() => handleNav("/pathways")} className={`hover:text-[#d8a355] transition-colors ${pathname === "/pathways" ? "text-[#d8a355]" : ""}`}>المسار</button>
                <button onClick={() => handleNav("/daily-challenge")} className={`hover:text-[#d8a355] transition-colors ${pathname === "/daily-challenge" ? "text-[#d8a355]" : ""}`}>التحدي اليومي</button>
                <button onClick={() => handleNav("/store")} className={`hover:text-[#d8a355] transition-colors ${pathname === "/store" ? "text-[#d8a355]" : ""}`}>المتجر</button>
              </>
            )}

            {isLoggedIn && (userRole === "teacher" || userRole === "admin") && (
              <button onClick={() => handleNav("/competitions")} className={`hover:text-[#d8a355] transition-colors ${pathname === "/competitions" ? "text-[#d8a355]" : ""}`}>المسابقات</button>
            )}

            <button onClick={() => handleNav("/contact")} className={`hover:text-[#d8a355] transition-colors ${pathname === "/contact" ? "text-[#d8a355]" : ""}`}>تواصل معنا</button>

            <div className="relative" onMouseEnter={() => setIsCirclesDropdownOpen(true)} onMouseLeave={() => setIsCirclesDropdownOpen(false)}>
              <button className="flex items-center gap-1 hover:text-[#d8a355]">أفضل الطلاب <ChevronDown size={16} /></button>
              {isCirclesDropdownOpen && (
                <div className="absolute top-full right-0 w-48 bg-white text-[#00312e] shadow-xl rounded-lg py-2 mt-0 animate-in fade-in slide-in-from-top-1">
                  <button onClick={() => handleNav("/students/all")} className="w-full text-right px-4 py-2 hover:bg-[#f5f1e8] font-bold border-b border-[#eee]">جميع الطلاب</button>
                  {circlesLoading ? <div className="p-3 text-xs text-gray-400">جاري التحميل...</div> :
                    circles.map(c => (
                      <button key={c.name} onClick={() => handleNav(`/halaqat/${c.name}`)} className="w-full text-right px-4 py-2 hover:bg-[#f5f1e8] text-sm">{c.name}</button>
                    ))
                  }
                </div>
              )}
            </div>
          </nav>

          {/* قسم الحساب (الزاوية اليسرى) */}
          <div className="order-1 md:order-3 flex items-center min-w-[80px]">
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#d8a355] flex items-center justify-center ring-2 ring-offset-2 ring-offset-[#00312e] ring-[#d8a355] hover:scale-105 transition-transform">
                    <User className="text-[#00312e]" size={24} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 mt-2 p-2">
                   {/* خيار الملف الشخصي العام */}
                   <DropdownMenuItem onClick={goToProfile} className="py-3 gap-2 cursor-pointer font-bold">
                      <User size={18}/> الملف الشخصي
                   </DropdownMenuItem>

                   <DropdownMenuSeparator />

                   {/* خيارات إضافية حسب الدور */}
                   {userRole === "teacher" && (
                     <>
                        <DropdownMenuItem onClick={() => handleNav("/teacher/halaqah/1")} className="py-3 gap-2 cursor-pointer text-slate-600"><Users size={18}/> إدارة الحلقة</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setIsAttendanceModalOpen(true)} className="py-3 gap-2 cursor-pointer text-slate-600"><ClipboardCheck size={18}/> تحضير</DropdownMenuItem>
                     </>
                   )}
                   {userRole === "admin" && (
                        <DropdownMenuItem onClick={() => handleNav("/admin/dashboard")} className="py-3 gap-2 cursor-pointer text-slate-600"><LayoutDashboard size={18}/> لوحة التحكم</DropdownMenuItem>
                   )}

                   <DropdownMenuSeparator />
                   <DropdownMenuItem onClick={handleLogout} className="py-3 gap-2 text-red-600 focus:bg-red-50 cursor-pointer font-bold">
                      <LogOut size={18}/> تسجيل الخروج
                   </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => handleNav("/login")} className="bg-[#d8a355] hover:bg-[#c99347] text-[#00312e] font-extrabold rounded-md px-4 h-9">دخول</Button>
            )}
          </div>
        </div>

        {/* قائمة الموبايل */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white text-[#00312e] border-t absolute w-full shadow-2xl animate-in slide-in-from-top duration-300">
            <nav className="flex flex-col p-4">
              <button onClick={() => handleNav("/")} className="text-right py-4 border-b flex items-center justify-between">الرئيسية <Target size={18}/></button>
              <button onClick={() => handleNav("/achievements")} className="text-right py-4 border-b flex items-center justify-between">الإنجازات <Trophy size={18}/></button>
              
              {isLoggedIn && userRole === "student" && (
                <>
                  <button onClick={() => handleNav("/pathways")} className="text-right py-4 border-b flex items-center justify-between">المسار <Map size={18}/></button>
                  <button onClick={() => handleNav("/daily-challenge")} className="text-right py-4 border-b flex items-center justify-between text-[#d8a355]">التحدي اليومي <Target size={18}/></button>
                  <button onClick={() => handleNav("/store")} className="text-right py-4 border-b flex items-center justify-between">المتجر <Store size={18}/></button>
                </>
              )}
              
              <button onClick={() => handleNav("/contact")} className="text-right py-4 border-b flex items-center justify-between">تواصل معنا <MessageSquare size={18}/></button>
              
              <div className="py-4">
                <p className="text-gray-400 text-xs mb-3 font-bold uppercase">الحلقات</p>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => handleNav("/students/all")} className="bg-[#f5f1e8] p-3 rounded-lg text-sm font-bold">جميع الطلاب</button>
                  {circles.map(c => (
                    <button key={c.name} onClick={() => handleNav(`/halaqat/${c.name}`)} className="bg-slate-50 p-3 rounded-lg text-sm">{c.name}</button>
                  ))}
                </div>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  )
}

export default Header