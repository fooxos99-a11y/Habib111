"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Download } from "lucide-react"
import { useState, useEffect } from "react"

export default function ProgramsPage() {
  const [downloadMessage, setDownloadMessage] = useState<string | null>(null)
  const [programs, setPrograms] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await fetch("/api/programs")
        const data = await response.json()
        const sortedPrograms = (data.programs || []).sort((a: any, b: any) => {
          if (a.is_active && !b.is_active) return -1
          if (!a.is_active && b.is_active) return 1
          return 0
        })
        setPrograms(sortedPrograms)
      } catch (error) {
        console.error("[v0] Error fetching programs:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrograms()
  }, [])

  const handleDownload = (programName: string) => {
    setDownloadMessage(`جاري تحميل ${programName}...`)
    setTimeout(() => {
      setDownloadMessage(null)
    }, 3000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-[#1a2332]">جاري التحميل...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 py-16 px-6">
        <div className="container mx-auto max-w-5xl">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1a2332] mb-4">البرامج والأنشطة</h1>
            <p className="text-lg text-gray-600">تعرف على برامجنا المميزة والجوائز المتاحة</p>
          </div>

          {downloadMessage && (
            <div className="mb-6 bg-[#d8a355] text-white px-6 py-4 rounded-lg text-center font-semibold shadow-lg">
              {downloadMessage}
            </div>
          )}

          {programs.length === 0 ? (
            <div className="text-center py-16 text-xl text-gray-500">لا توجد برامج حالياً</div>
          ) : (
            <div className="space-y-6">
              {programs.map((program) => (
                <div
                  key={program.id}
                  className={`rounded-xl p-6 transition-all duration-300 relative ${
                    program.is_active
                      ? "bg-white border-2 border-[#d8a355] shadow-md hover:shadow-xl"
                      : "bg-gray-50 border-2 border-gray-300 opacity-60"
                  }`}
                >
                  <div className="absolute top-4 right-4">
                    {program.is_active ? (
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        حالياً
                      </span>
                    ) : (
                      <span className="bg-gray-400 text-white px-3 py-1 rounded-full text-sm font-semibold">قريباً</span>
                    )}
                  </div>

                  {program.is_active && (
                    <div className="absolute top-4 left-4">
                      <button
                        onClick={() => handleDownload(program.name)}
                        className="flex items-center gap-2 bg-[#d8a355] text-white px-4 py-2 rounded-lg hover:bg-[#c99245] transition-colors shadow-lg"
                      >
                        <Download className="w-4 h-4" />
                        <span className="text-sm font-semibold">تنزيل</span>
                      </button>
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row md:items-center gap-6 mt-12">
                    {/* Program Info */}
                    <div className="flex-1">
                      <h3
                        className={`text-2xl font-bold mb-2 ${program.is_active ? "text-[#1a2332]" : "text-gray-500"}`}
                      >
                        {program.name}
                      </h3>
                      <p
                        className={`text-base leading-relaxed mb-4 ${program.is_active ? "text-gray-600" : "text-gray-400"}`}
                      >
                        {program.description}
                      </p>
                      <p className={`text-sm ${program.is_active ? "text-gray-500" : "text-gray-400"}`}>
                        📅 {program.date}
                      </p>
                    </div>

                    {/* Reward Boxes */}
                    <div className="flex gap-3 items-center">
                      {/* Duration Box */}
                      <div
                        className={`rounded-lg px-6 py-3 text-center min-w-[140px] ${
                          program.is_active
                            ? "bg-[#d8a355]/10 border border-[#d8a355]"
                            : "bg-gray-200 border border-gray-300"
                        }`}
                      >
                        <p className={`font-semibold ${program.is_active ? "text-[#1a2332]" : "text-gray-500"}`}>
                          المدة: {program.duration}
                        </p>
                      </div>

                      {/* Points Box */}
                      <div
                        className={`rounded-lg px-6 py-3 text-center min-w-[140px] ${
                          program.is_active
                            ? "bg-[#d8a355]/10 border border-[#d8a355]"
                            : "bg-gray-200 border border-gray-300"
                        }`}
                      >
                        <p className={`font-semibold ${program.is_active ? "text-[#1a2332]" : "text-gray-500"}`}>
                          المكافأة: {program.points} نقطة
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
