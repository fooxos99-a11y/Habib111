"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Gamepad2, Grid3x3, Puzzle, Lock } from "lucide-react"

export default function CompetitionsPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true"
    const role = localStorage.getItem("userRole")

    if (!loggedIn || (role !== "teacher" && role !== "admin")) {
      router.push("/login")
      return
    }

    setIsLoggedIn(true)
    setUserRole(role)
  }, [router])

  const games = [
    {
      id: "categories",
      title: "لعبة الفئات",
      description: "لعبة تنافسية بين فريقين مع 4 فئات مختلفة",
      icon: Grid3x3,
      color: "from-blue-500 to-blue-600",
      available: true,
      comingSoon: false,
    },
    {
      id: "auction",
      title: "لعبة المزاد",
      description: "لعبة تنافسية مع نظام النقاط والأسئلة العشوائية",
      icon: Gamepad2,
      color: "from-amber-500 to-amber-600",
      available: true,
      comingSoon: false,
    },
    {
      id: "guess-images",
      title: "خمن الصورة",
      description: "اكتشف معنى الصورة قبل الفريق الآخر",
      icon: Puzzle,
      color: "from-[#d8a355] to-[#c89547]",
      available: true,
      comingSoon: false,
    },
  ]

  if (!isLoggedIn) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8f5] via-[#f5ead8] to-[#faf8f5]">
      <Header />
      
      <main className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-[#1a2332] mb-4">
            المسابقات التفاعلية
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {games.map((game) => (
            <Card
              key={game.id}
              className={`relative overflow-hidden border-2 border-[#d8a355]/20 hover:border-[#d8a355] transition-all duration-300 ${
                game.available ? "hover:shadow-xl hover:scale-105 cursor-pointer" : "opacity-75"
              }`}
              onClick={() => {
                if (game.available) {
                  router.push(`/competitions/${game.id}`)
                }
              }}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${game.color} opacity-10 rounded-bl-full`} />
              
              <CardHeader className="relative">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${game.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <game.icon className="w-8 h-8 text-white" />
                </div>
                
                <CardTitle className="text-2xl text-[#1a2332] flex items-center gap-2">
                  {game.title}
                  {!game.available && (
                    <span className="text-sm bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                      قريباً
                    </span>
                  )}
                </CardTitle>
                
                <CardDescription className="text-[#1a2332]/70 text-base">
                  {game.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="relative">
                {game.available ? (
                  <button className="w-full bg-gradient-to-r from-[#d8a355] to-[#c89547] hover:from-[#c89547] hover:to-[#b88341] text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg">
                    ابدأ اللعب
                  </button>
                ) : (
                  <button disabled className="w-full bg-gray-300 text-gray-500 font-bold py-3 px-6 rounded-lg cursor-not-allowed flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4" />
                    غير متاح حالياً
                  </button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
