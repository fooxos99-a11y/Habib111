"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Star, Check, BookOpen } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const EFFECTS = [
  {
    id: "effect_bats",
    name: "تأثير الخفافيش",
    description: "خفافيش متحركة بلون أسود داخل بطاقة الترتيب",
    price: 3000,
    preview: (
      <div className="relative w-full h-32 mx-auto overflow-hidden">
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: "linear-gradient(135deg, rgba(249, 250, 251, 1), rgba(243, 244, 246, 1))",
          }}
        >
          {[
            { top: "15%", right: "20%", size: "20px", delay: "0s" },
            { top: "25%", left: "35%", size: "18px", delay: "0.6s" },
            { top: "50%", left: "50%", size: "19px", delay: "1.2s", center: true },
            { bottom: "20%", left: "25%", size: "16px", delay: "1.8s" },
            { bottom: "30%", right: "30%", size: "22px", delay: "2.4s" },
          ].map((bat, i) => (
            <div
              key={i}
              className="absolute animate-[fly_3s_ease-in-out_infinite]"
              style={{
                ...(bat.center
                  ? { top: bat.top, left: bat.left, transform: "translate(-50%, -50%)" }
                  : { top: bat.top, right: bat.right, left: bat.left, bottom: bat.bottom }),
                fontSize: bat.size,
                animationDelay: bat.delay,
                filter: "grayscale(100%) brightness(0)",
              }}
            >
              🦇
            </div>
          ))}

          <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
            <div className="text-center">
              <span className="text-xl font-bold text-gray-800">خفافيش طائرة</span>
              <p className="text-xs text-gray-600 mt-2">تأثير مميز ومخيف</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "effect_fire",
    name: "تأثير النار",
    description: "لهب برتقالي متحرك داخل بطاقة الترتيب",
    price: 3500,
    preview: (
      <div className="relative w-full h-32 mx-auto overflow-hidden">
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: "linear-gradient(135deg, rgba(254, 243, 230, 1), rgba(253, 230, 200, 1))",
          }}
        >
          {[
            { top: "10%", right: "15%", size: "28px", delay: "0s" },
            { top: "20%", left: "30%", size: "24px", delay: "0.5s" },
            { top: "45%", left: "45%", size: "32px", delay: "1s", center: true },
            { bottom: "15%", left: "20%", size: "22px", delay: "1.5s" },
            { bottom: "25%", right: "25%", size: "30px", delay: "2s" },
          ].map((flame, i) => (
            <div
              key={i}
              className="absolute animate-[flicker_2s_ease-in-out_infinite]"
              style={{
                ...(flame.center
                  ? { top: flame.top, left: flame.left, transform: "translate(-50%, -50%)" }
                  : { top: flame.top, right: flame.right, left: flame.left, bottom: flame.bottom }),
                fontSize: flame.size,
                animationDelay: flame.delay,
                filter: "hue-rotate(-10deg) saturate(1.2)",
              }}
            >
              🔥
            </div>
          ))}

          <div className="absolute inset-0 flex items-center justify-center bg-orange-500/10 backdrop-blur-[1px]">
            <div className="text-center">
              <span className="text-xl font-bold text-orange-900">لهب متوهج</span>
              <p className="text-xs text-orange-700 mt-2">تأثير ناري قوي</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "effect_snow",
    name: "تأثير الثلج",
    description: "كريستالات ثلجية متحركة داخل بطاقة الترتيب",
    price: 3200,
    preview: (
      <div className="relative w-full h-32 mx-auto overflow-hidden">
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: "linear-gradient(135deg, rgba(240, 249, 255, 1), rgba(224, 242, 254, 1))",
          }}
        >
          {[
            { top: "12%", right: "18%", size: "26px", delay: "0s" },
            { top: "22%", left: "32%", size: "22px", delay: "0.7s" },
            { top: "48%", left: "48%", size: "28px", delay: "1.4s", center: true },
            { bottom: "18%", left: "22%", size: "20px", delay: "2.1s" },
            { bottom: "28%", right: "28%", size: "30px", delay: "2.8s" },
          ].map((snow, i) => (
            <div
              key={i}
              className="absolute animate-[float_3s_ease-in-out_infinite]"
              style={{
                ...(snow.center
                  ? { top: snow.top, left: snow.left, transform: "translate(-50%, -50%)" }
                  : { top: snow.top, right: snow.right, left: snow.left, bottom: snow.bottom }),
                fontSize: snow.size,
                animationDelay: snow.delay,
                filter: "brightness(1.1)",
              }}
            >
              ❄️
            </div>
          ))}

          <div className="absolute inset-0 flex items-center justify-center bg-blue-500/10 backdrop-blur-[1px]">
            <div className="text-center">
              <span className="text-xl font-bold text-blue-900">ثلج متساقط</span>
              <p className="text-xs text-blue-700 mt-2">تأثير ثلجي بارد</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "effect_leaves",
    name: "تأثير ورق الشجر",
    description: "أوراق شجر خضراء متحركة داخل بطاقة الترتيب",
    price: 2800,
    preview: (
      <div className="relative w-full h-32 mx-auto overflow-hidden">
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: "linear-gradient(135deg, rgba(240, 253, 244, 1), rgba(220, 252, 231, 1))",
          }}
        >
          {[
            { top: "14%", right: "16%", size: "25px", delay: "0s" },
            { top: "24%", left: "34%", size: "23px", delay: "0.6s" },
            { top: "46%", left: "46%", size: "29px", delay: "1.2s", center: true },
            { bottom: "16%", left: "24%", size: "21px", delay: "1.8s" },
            { bottom: "26%", right: "26%", size: "27px", delay: "2.4s" },
          ].map((leaf, i) => (
            <div
              key={i}
              className="absolute animate-[wave_2.5s_ease-in-out_infinite]"
              style={{
                ...(leaf.center
                  ? { top: leaf.top, left: leaf.left, transform: "translate(-50%, -50%)" }
                  : { top: leaf.top, right: leaf.right, left: leaf.left, bottom: leaf.bottom }),
                fontSize: leaf.size,
                animationDelay: leaf.delay,
                filter: "hue-rotate(0deg) saturate(1.3)",
              }}
            >
              🍃
            </div>
          ))}

          <div className="absolute inset-0 flex items-center justify-center bg-green-500/10 backdrop-blur-[1px]">
            <div className="text-center">
              <span className="text-xl font-bold text-green-900">أوراق متطايرة</span>
              <p className="text-xs text-green-700 mt-2">تأثير طبيعي</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "effect_royal",
    name: "تأثير الملكية",
    description: "تأثير فاخر مع تيجان ملكية متحركة داخل بطاقة الترتيب",
    price: 6000,
    preview: (
      <div className="relative w-full h-32 mx-auto overflow-hidden">
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: "linear-gradient(135deg, rgba(250, 245, 255, 1), rgba(233, 213, 255, 1))",
          }}
        >
          {[
            { top: "15%", right: "20%", size: "26px", delay: "0s" },
            { top: "25%", left: "35%", size: "22px", delay: "0.6s" },
            { top: "50%", left: "50%", size: "28px", delay: "1.2s", center: true },
            { bottom: "20%", left: "25%", size: "20px", delay: "1.8s" },
            { bottom: "30%", right: "30%", size: "24px", delay: "2.4s" },
          ].map((crown, i) => (
            <div
              key={i}
              className="absolute animate-[bounce_2s_ease-in-out_infinite]"
              style={{
                ...(crown.center
                  ? { top: crown.top, left: crown.left, transform: "translate(-50%, -50%)" }
                  : { top: crown.top, right: crown.right, left: crown.left, bottom: crown.bottom }),
                fontSize: crown.size,
                animationDelay: crown.delay,
                filter: "drop-shadow(0 2px 6px rgba(168, 85, 247, 0.4))",
              }}
            >
              👑
            </div>
          ))}

          <div className="absolute inset-0 flex items-center justify-center bg-purple-500/10 backdrop-blur-[1px]">
            <div className="text-center">
              <span className="text-xl font-bold text-purple-900">تأثير ملكي</span>
              <p className="text-xs text-purple-700 mt-2">فاخر وراقي</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
]

export default function EffectsPage() {
  const [studentPoints, setStudentPoints] = useState(0)
  const [studentId, setStudentId] = useState<string | null>(null)
  const [purchases, setPurchases] = useState<string[]>([])
  const [activeEffect, setActiveEffect] = useState<string | null>(null)
  const [purchasedNotActivated, setPurchasedNotActivated] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true"
    const userRole = localStorage.getItem("userRole")
    if (!loggedIn || userRole !== "student") {
      router.push("/login")
    } else {
      fetchStudentData()
    }
  }, [])

  const fetchStudentData = async () => {
    try {
      const accountNumber = localStorage.getItem("accountNumber")
      const response = await fetch(`/api/students`)
      const data = await response.json()

      const student = data.students?.find((s: any) => s.account_number === Number(accountNumber))

      if (student) {
        setStudentId(student.id)
        setStudentPoints(student.points || 0)
        await fetchPurchases(student.id)
        await fetchActiveEffect(student.id)
      }
    } catch (error) {
      console.error("Error fetching student data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPurchases = async (studentId: string) => {
    try {
      const purchases = localStorage.getItem(`effect_purchases_${studentId}`)
      const notActivated = localStorage.getItem(`effect_not_activated_${studentId}`)
      if (purchases) {
        setPurchases(JSON.parse(purchases))
      }
      if (notActivated) {
        setPurchasedNotActivated(JSON.parse(notActivated))
      }
    } catch (error) {
      console.error("Error fetching purchases:", error)
    }
  }

  const fetchActiveEffect = async (studentId: string) => {
    try {
      const activeEffect = localStorage.getItem(`active_effect_${studentId}`)
      if (activeEffect) {
        setActiveEffect(activeEffect)
      }
    } catch (error) {
      console.error("Error fetching active effect:", error)
    }
  }

  const handlePurchase = async (effectId: string, effectPrice: number) => {
    if (!studentId) {
      toast({
        title: "خطأ",
        description: "معرف الطالب غير موجود",
        variant: "destructive",
      })
      return
    }

    if (studentPoints < effectPrice) {
      toast({
        title: "نقاط غير كافية",
        description: `تحتاج إلى ${effectPrice - studentPoints} نقطة إضافية`,
        variant: "destructive",
      })
      return
    }

    try {
      const newPoints = studentPoints - effectPrice
      setStudentPoints(newPoints)

      const updatedNotActivated = [...purchasedNotActivated, effectId]
      setPurchasedNotActivated(updatedNotActivated)
      localStorage.setItem(`effect_not_activated_${studentId}`, JSON.stringify(updatedNotActivated))

      toast({
        title: "تم الشراء بنجاح!",
        description: "يرجى الضغط على 'تفعيل' لتفعيل التأثير",
      })
    } catch (error) {
      console.error("Error purchasing effect:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الشراء",
        variant: "destructive",
      })
    }
  }

  const handleActivate = async (effectId: string) => {
    if (!studentId) return

    try {
      const updatedNotActivated = purchasedNotActivated.filter((id) => id !== effectId)
      setPurchasedNotActivated(updatedNotActivated)
      localStorage.setItem(`effect_not_activated_${studentId}`, JSON.stringify(updatedNotActivated))

      const updatedPurchases = [...purchases, effectId]
      setPurchases(updatedPurchases)
      localStorage.setItem(`effect_purchases_${studentId}`, JSON.stringify(updatedPurchases))

      setActiveEffect(effectId)
      localStorage.setItem(`active_effect_${studentId}`, effectId)

      toast({
        title: "تم التفعيل بنجاح!",
        description: "تم تفعيل التأثير على ملفك الشخصي",
      })
    } catch (error) {
      console.error("Error activating effect:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء التفعيل",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">جاري التحميل...</div>
      </div>
    )
  }

  const userRole = localStorage.getItem("userRole")
  if (!userRole || userRole !== "student") {
    return (
      <div className="min-h-screen flex flex-col bg-white" dir="rtl">
        <Header />
        <main className="flex-1 py-12 px-4 sm:px-6 flex items-center justify-center">
          <div className="text-center max-w-md">
            <BookOpen className="w-16 h-16 text-[#d8a355] mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-[#1a2332] mb-2">يظهر للطلاب فقط</h2>
            <p className="text-lg text-gray-600">هذا القسم متاح للطلاب المسجلين فقط</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white" dir="rtl">
      <Header />

      <main className="flex-1 py-12 px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl">
          <button
            onClick={() => router.push("/store")}
            className="flex items-center gap-2 text-[#d8a355] hover:text-[#c99347] mb-8 font-semibold"
          >
            <ArrowRight className="w-5 h-5" />
            العودة للمتجر
          </button>

          <h1 className="text-4xl font-bold text-[#1a2332] mb-4">التأثيرات</h1>
          <p className="text-gray-600 mb-12 text-lg">اختر تأثيراً مميزاً لبطاقتك الكاملة في لائحة الترتيب</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {EFFECTS.map((effect) => {
              const isPurchased = purchases.includes(effect.id)
              const waitingActivation = purchasedNotActivated.includes(effect.id)
              const isActive = activeEffect === effect.id
              const canAfford = studentPoints >= effect.price

              return (
                <Card
                  key={effect.id}
                  className={`overflow-hidden hover:shadow-lg transition-all relative border-2 ${
                    isActive ? "border-[#22C55E] shadow-lg ring-2 ring-[#22C55E33]" : "border-gray-200"
                  }`}
                >
                  {isActive && (
                    <div className="absolute top-4 right-4 z-10 bg-[#22C55E] rounded-full p-2">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="mb-4">{effect.preview}</div>

                    <h3 className="text-xl font-bold text-[#1a2332] mb-2">{effect.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{effect.description}</p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-[#d8a355]" />
                        <span className="text-2xl font-bold text-[#1a2332]">{effect.price}</span>
                      </div>
                    </div>

                    {isActive ? (
                      <Button disabled className="w-full bg-[#22C55E] cursor-default text-white hover:bg-[#22C55E]">
                        مُفعّل
                      </Button>
                    ) : waitingActivation ? (
                      <Button
                        onClick={() => handleActivate(effect.id)}
                        className="w-full bg-[#d8a355] hover:bg-[#c99347] text-white font-bold py-3 rounded-lg transition-colors"
                      >
                        تفعيل
                      </Button>
                    ) : isPurchased ? (
                      <Button
                        onClick={() => handleActivate(effect.id)}
                        className="w-full bg-[#d8a355] hover:bg-[#c99347] text-white font-bold py-3 rounded-lg transition-colors"
                      >
                        تفعيل
                      </Button>
                    ) : canAfford ? (
                      <Button
                        onClick={() => handlePurchase(effect.id, effect.price)}
                        className="w-full bg-[#d8a355] hover:bg-[#c99347] text-white font-bold py-3 rounded-lg transition-colors"
                      >
                        شراء
                      </Button>
                    ) : (
                      <Button disabled className="w-full bg-gray-300 cursor-not-allowed text-gray-600">
                        نقاط غير كافية
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
