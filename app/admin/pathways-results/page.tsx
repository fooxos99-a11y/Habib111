"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function PathwaysResultsPage() {
  const [levels, setLevels] = useState<any[]>([])
  const [results, setResults] = useState<any[]>([])
  const [selectedLevel, setSelectedLevel] = useState<string>("")

  useEffect(() => {
    loadLevels()
  }, [])

  useEffect(() => {
    if (selectedLevel) {
      loadResults(selectedLevel)
    } else {
      setResults([])
    }
  }, [selectedLevel])

  async function loadLevels() {
    const { data } = await supabase
      .from("pathway_levels")
      .select("level_number, title")
      .order("level_number")
    setLevels(data || [])
    if (data && data.length > 0) setSelectedLevel(String(data[0].level_number))
  }

  async function loadResults(levelNumber: string) {
    // Join pathway_level_completions with students to get student name
    const { data, error } = await supabase
      .from("pathway_level_completions")
      .select("id, student_id, points, level_number, students(name)")
      .eq("level_number", levelNumber)
    if (error) {
      setResults([])
      return
    }
    // Map results to include student name
    const mapped = (data || []).map((r: any) => ({
      id: r.id,
      student_id: r.student_id,
      points: r.points,
      student_name: r.students?.name || "-"
    }))
    setResults(mapped)
  }

  return (
    <div dir="rtl" className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto py-6 max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>نتائج المسار</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex gap-4 items-center">
              <span className="font-semibold">اختر المستوى:</span>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="اختر المستوى" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level.level_number} value={String(level.level_number)}>{level.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <table className="w-full border mb-2">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2">اسم الطالب</th>
                  <th className="p-2">النقاط</th>
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr><td colSpan={2} className="text-center text-gray-400">لا يوجد طلاب اختبروا هذا المستوى بعد</td></tr>
                ) : (
                  results.map((r) => (
                    <tr key={r.id}>
                      <td className="p-2 font-semibold">{r.student_name}</td>
                      <td className="p-2">{r.points}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
