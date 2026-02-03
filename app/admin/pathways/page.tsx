"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

import {
  Lock,
  Unlock,
  Plus,
  Trash2,
  FileText,
  Pencil,
  Video,
  LinkIcon,
} from "lucide-react"

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

interface Level {
  id: number
  level_number: number
  title: string
  description: string | null
  points: number
  is_locked: boolean
  half_points_applied: boolean
}

interface LevelContent {
  id: string
  content_title: string
  content_description?: string
  content_url: string
  content_type: "pdf" | "video" | "link"
}

interface Quiz {
  id: number
  question: string
  options: string[]
  correctAnswer: number
}

/* -------------------------------------------------------------------------- */

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminPathwaysPage() {
  const router = useRouter()

  const [levels, setLevels] = useState<Level[]>([])
  const [selectedLevel, setSelectedLevel] = useState<number>(1)

  const [contents, setContents] = useState<Record<number, LevelContent[]>>({})
  const [quizzes, setQuizzes] = useState<Record<number, Quiz[]>>({})

  const [showContentForm, setShowContentForm] = useState(false)
  const [showQuizForm, setShowQuizForm] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const [notification, setNotification] = useState<string>("")

  /* ------------------------------ Content Form ----------------------------- */
  const [contentTitle, setContentTitle] = useState("")
  const [contentDescription, setContentDescription] = useState("")
  const [contentUrl, setContentUrl] = useState("")
  const [contentType, setContentType] =
    useState<LevelContent["content_type"]>("link")

  /* ------------------------------- Quiz Form -------------------------------- */
  const [quizQuestion, setQuizQuestion] = useState("")
  const [quizOptions, setQuizOptions] = useState(["", "", "", ""])
  const [correctAnswer, setCorrectAnswer] = useState(0)

  /* ------------------------------ Edit Level Modal ----------------------------- */
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")

  /* -------------------------------------------------------------------------- */
  /*                                   EFFECTS                                  */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true"
    const role = localStorage.getItem("userRole")

    if (!loggedIn || role !== "admin") {
      router.push("/login")
      return
    }

    loadLevels()
  }, [])

  useEffect(() => {
    loadContents()
    loadQuizzes()
  }, [selectedLevel])

  /* -------------------------------------------------------------------------- */
  /*                                   LOADERS                                  */
  /* -------------------------------------------------------------------------- */

  async function loadLevels() {
    const { data, error } = await supabase
      .from("pathway_levels")
      .select("*")
      .order("level_number")

    if (!error && data) setLevels(data as Level[])
  }

  async function loadContents() {
    const res = await fetch(`/api/pathway-contents?level_id=${selectedLevel}`)
    const json = await res.json()
    setContents((p) => ({ ...p, [selectedLevel]: json.contents || [] }))
  }

  async function loadQuizzes() {
    const { data } = await supabase
      .from("pathway_level_questions")
      .select("*")
      .eq("level_number", selectedLevel)
      .order("id")

    if (data) {
      setQuizzes((p) => ({
        ...p,
        [selectedLevel]: data.map((q) => ({
          id: q.id,
          question: q.question,
          options: q.options,
          correctAnswer: q.correct_answer,
        })),
      }))
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                                  HANDLERS                                  */
  /* -------------------------------------------------------------------------- */

  async function handleAddContent() {
    if (!contentTitle || !contentUrl) return

    await fetch("/api/pathway-contents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        level_id: selectedLevel,
        content_title: contentTitle,
        content_description: contentDescription,
        content_url: contentUrl,
        content_type: contentType,
      }),
    })

    setShowContentForm(false)
    setContentTitle("")
    setContentDescription("")
    setContentUrl("")
    loadContents()
  }

  async function handleDeleteContent(id: string) {
    await fetch(`/api/pathway-contents?id=${id}`, { method: "DELETE" })
    loadContents()
  }

  async function handleAddQuiz() {
    if (!quizQuestion || quizOptions.some((o) => !o)) return

    await supabase.from("pathway_level_questions").insert({
      level_number: selectedLevel,
      question: quizQuestion,
      options: quizOptions,
      correct_answer: correctAnswer,
    })

    setQuizQuestion("")
    setQuizOptions(["", "", "", ""])
    setCorrectAnswer(0)
    setShowQuizForm(false)
    loadQuizzes()
  }

  async function handleDeleteQuiz(id: number) {
    await supabase.from("pathway_level_questions").delete().eq("id", id)
    loadQuizzes()
  }

  async function handleAddLevel() {
    // احسب رقم المستوى الجديد
    const nextNumber = (levels[levels.length - 1]?.level_number || 0) + 1;
    const { data, error } = await supabase.from('pathway_levels').insert({
      level_number: nextNumber,
      title: `المستوى ${nextNumber}`,
      description: '',
      points: 100,
      is_locked: false,
      half_points_applied: false
    });
    if (!error) {
      setNotification('تمت إضافة مستوى جديد بنجاح');
      loadLevels();
    } else {
      setNotification('حدث خطأ أثناء إضافة المستوى');
    }
  }

  async function handleDeleteLevel() {
    if (levels.length === 0) {
      setNotification('لا يوجد مستويات للحذف');
      return;
    }
    // احصل على رقم آخر مستوى
    const maxLevel = Math.max(...levels.map(l => l.level_number));
    // حذف بدون تأكيد
    const { error } = await supabase.from('pathway_levels').delete().eq('level_number', maxLevel);
    if (!error) {
      setNotification('تم حذف آخر مستوى بنجاح');
      // جلب المستويات من القاعدة مباشرة بعد الحذف
      const { data: newLevels, error: fetchError } = await supabase
        .from('pathway_levels')
        .select('*')
        .order('level_number');
      if (!fetchError && newLevels) {
        setLevels(newLevels);
        if (newLevels.length > 0) {
          const prevMax = Math.max(...newLevels.map(l => l.level_number));
          setSelectedLevel(prevMax);
        } else {
          setSelectedLevel(1);
        }
      } else {
        setNotification('تم الحذف لكن لم يتم تحديث القائمة!');
      }
    } else {
      setNotification('حدث خطأ أثناء حذف المستوى: ' + error.message);
    }
  }

  async function handleToggleLockLevel() {
    if (!level) return;
    const { error } = await supabase.from('pathway_levels').update({ is_locked: !level.is_locked }).eq('level_number', selectedLevel);
    if (!error) {
      setNotification(level.is_locked ? 'تم فتح المستوى بنجاح' : 'تم قفل المستوى بنجاح');
      loadLevels();
    } else {
      setNotification('حدث خطأ أثناء تحديث حالة القفل');
    }
  }

  /* -------------------------------------------------------------------------- */

  const level = levels.find((l) => l.level_number === selectedLevel)
  const levelContents = contents[selectedLevel] || []
  const levelQuizzes = quizzes[selectedLevel] || []

  const icon = (t: string) =>
    t === "pdf" ? <FileText /> : t === "video" ? <Video /> : <LinkIcon />

  return (
    <div dir="rtl" className="min-h-screen flex flex-col">
      <Header />

      {notification && (
        <div className="fixed top-4 inset-x-0 mx-auto max-w-md z-50">
          <Card>
            <CardContent className="text-center">{notification}</CardContent>
          </Card>
        </div>
      )}

      <main className="flex-1 container mx-auto py-6 max-w-6xl">
        {/* نتائج المسار */}
        <div className="flex justify-end mb-4">
          <Button
            className="bg-gradient-to-r from-[#d8a355] to-[#c99347] text-[#00312e] font-bold rounded-xl px-6 py-2 text-base flex flex-row-reverse items-center gap-2 shadow-none border-none"
            onClick={() => router.push("/admin/pathways-results")}
          >
            نتائج المسار
          </Button>
        </div>
        {/* LEVEL SELECT */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>المستويات</CardTitle>
            <div className="flex gap-3 mt-4">
              <Button onClick={handleAddLevel} className="bg-green-600 hover:bg-green-700 text-white rounded-xl w-9 h-9 flex items-center justify-center shadow-none border-none">
                <Plus className="w-5 h-5 text-white" />
              </Button>
              <Button onClick={handleDeleteLevel} className="bg-red-600 hover:bg-red-700 text-white rounded-xl w-9 h-9 flex items-center justify-center shadow-none border-none">
                <Trash2 className="w-5 h-5 text-white" />
              </Button>
              <Button onClick={handleToggleLockLevel} className={level?.is_locked ? "bg-red-200 hover:bg-red-300 text-white rounded-xl w-9 h-9 flex items-center justify-center shadow-none border-none" : "bg-green-200 hover:bg-green-300 text-white rounded-xl w-9 h-9 flex items-center justify-center shadow-none border-none"}>
                {level?.is_locked ? <Lock className="w-5 h-5 text-red-600" /> : <Unlock className="w-5 h-5 text-green-600" />}
              </Button>
              <Button onClick={() => { setEditTitle(level?.title || ""); setEditDescription(level?.description || ""); setShowEditModal(true); }} className="bg-gradient-to-r from-[#d8a355] to-[#c99347] text-[#00312e] rounded-xl w-9 h-9 flex items-center justify-center shadow-none border-none">
                <Pencil className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {levels.map((l) => (
              <Button
                key={l.id}
                onClick={() => setSelectedLevel(l.level_number)}
                className={
                  (l.level_number === selectedLevel
                    ? "bg-gradient-to-r from-[#d8a355] to-[#c99347] hover:bg-gradient-to-r hover:from-[#d8a355] hover:to-[#c99347] text-[#00312e] font-bold border border-[#d8a355] rounded-xl px-6 py-2 flex items-center gap-2"
                    : "bg-white text-[#00312e] font-normal border border-[#d8a355] rounded-xl px-6 py-2 flex items-center gap-2 hover:bg-gradient-to-r hover:from-[#d8a355] hover:to-[#c99347] hover:text-[#00312e]")
                }
              >
                {l.is_locked ? <Lock className="mr-2 w-4" /> : <Unlock className="mr-2 w-4" />}
                {l.title}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* CONTENT */}
        <Card className="mb-6">
          <CardHeader className="flex-row justify-between">
            <div>
              <CardTitle>محتوى المستوى</CardTitle>
              <CardDescription>ملفات وروابط تعليمية</CardDescription>
            </div>
            <Button onClick={() => setShowContentForm(!showContentForm)} className="bg-gradient-to-r from-[#d8a355] to-[#c99347] text-[#00312e] font-normal rounded-xl px-6 py-2 text-base flex flex-row-reverse items-center gap-2 shadow-none border-none">
              <Plus className="ml-2 w-4" />
              <span>إضافة</span>
            </Button>
          </CardHeader>

          <CardContent>
            {showContentForm && (
              <div className="space-y-3 mb-6">
                <Input
                  placeholder="عنوان المحتوى"
                  value={contentTitle}
                  onChange={(e) => setContentTitle(e.target.value)}
                />
                <Textarea
                  placeholder="الوصف"
                  value={contentDescription}
                  onChange={(e) => setContentDescription(e.target.value)}
                />
                <Input
                  placeholder="الرابط"
                  value={contentUrl}
                  onChange={(e) => setContentUrl(e.target.value)}
                />
                <Button onClick={handleAddContent} className="bg-gradient-to-r from-[#d8a355] to-[#c99347] text-[#00312e] font-normal rounded-xl px-6 py-2 text-base flex flex-row-reverse items-center gap-2 shadow-none border-none">حفظ</Button>
              </div>
            )}

            {levelContents.map((c) => (
              <Card key={c.id} className="mb-2">
                <CardContent className="flex justify-between">
                  <div className="flex gap-2">
                    {icon(c.content_type)}
                    <span>{c.content_title}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteContent(c.id)}
                  >
                    <Trash2 className="w-4 text-red-500" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* QUIZ */}
        <Card>
          <CardHeader className="flex-row justify-between">
            <CardTitle>الاختبار</CardTitle>
              <Button onClick={() => setShowQuizForm(!showQuizForm)} className="bg-gradient-to-r from-[#d8a355] to-[#c99347] text-[#00312e] font-normal rounded-xl px-6 py-2 text-base flex flex-row-reverse items-center gap-2 shadow-none border-none">
                <Plus className="ml-2 w-4" />
                <span>سؤال</span>
              </Button>
          </CardHeader>

          <CardContent>
            {showQuizForm && (
              <div className="space-y-3 mb-6">
                <Input
                  placeholder="السؤال"
                  value={quizQuestion}
                  onChange={(e) => setQuizQuestion(e.target.value)}
                />
                {quizOptions.map((o, i) => (
                  <Input
                    key={i}
                    placeholder={`خيار ${i + 1}`}
                    value={o}
                    onChange={(e) => {
                      const n = [...quizOptions]
                      n[i] = e.target.value
                      setQuizOptions(n)
                    }}
                  />
                ))}
                <Select
                  value={String(correctAnswer)}
                  onValueChange={(v) => setCorrectAnswer(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {quizOptions.map((_, i) => (
                      <SelectItem key={i} value={String(i)}>
                        الخيار {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                  <Button onClick={handleAddQuiz} className="bg-gradient-to-r from-[#d8a355] to-[#c99347] text-[#00312e] font-normal rounded-xl px-6 py-2 text-base flex flex-row-reverse items-center gap-2 shadow-none border-none">حفظ السؤال</Button>
              </div>
            )}

            {levelQuizzes.map((q, i) => (
              <Card key={q.id} className="mb-2">
                <CardContent className="flex justify-between">
                  <span>
                    {i + 1}. {q.question}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteQuiz(q.id)}
                  >
                    <Trash2 className="w-4 text-red-500" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Edit Level Modal */}
        {showEditModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md flex flex-col gap-4 border-2 border-[#d8a355]">
              <h2 className="text-lg font-bold text-[#00312e] mb-2">تعديل اسم ووصف المستوى</h2>
              <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="اسم المستوى" className="mb-2" />
              <Textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} placeholder="وصف المستوى" className="mb-2" />
              <div className="flex gap-2 justify-end">
                <Button onClick={() => setShowEditModal(false)} className="bg-red-600 text-white px-4 py-2 rounded">إلغاء</Button>
                <Button onClick={async () => {
                  if (level) {
                    await supabase.from('pathway_levels').update({ title: editTitle, description: editDescription }).eq('id', level.id);
                    setShowEditModal(false);
                    loadLevels();
                  }
                }} className="bg-gradient-to-r from-[#d8a355] to-[#c99347] text-[#00312e] px-4 py-2 rounded">حفظ</Button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
