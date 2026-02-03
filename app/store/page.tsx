"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Star } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { getSupabase } from "@/lib/supabase"

export default function StorePage() {
  const [studentPoints, setStudentPoints] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true"
    const role = localStorage.getItem("userRole")
    setUserRole(role)

    if (loggedIn && role === "student") {
      fetchStudentData()
      fetchStoreData()
    } else {
      setIsLoading(false)
    }
    // eslint-disable-next-line
  }, [])

  const fetchStudentData = async () => {
    try {
      const accountNumber = localStorage.getItem("accountNumber")
      const response = await fetch(`/api/students`)
      const data = await response.json()
      const student = data.students?.find((s: any) => s.account_number === Number(accountNumber))
      if (student) {
        setStudentPoints(student.store_points || 0)
      }
    } catch (error) {
      console.error("[v0] Error fetching student data:", error)
    }
  }

  const fetchStoreData = async () => {
    setIsLoading(true)
    const supabase = getSupabase()
    const { data: productsData } = await supabase.from("store_products").select("*")
    const { data: categoriesData } = await supabase.from("store_categories").select("*")
    setProducts(productsData || [])
    setCategories(categoriesData || [])
    setIsLoading(false)
  }

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/store/${categoryId}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-2xl text-[#1a2332]">جاري التحميل...</div>
      </div>
    )
  }

  if (userRole !== "student") {
    return (
      <div className="min-h-screen flex flex-col bg-white" dir="rtl">
        <Header />
        <main className="flex-1 py-12 px-4 sm:px-6 flex items-center justify-center">
          <div className="text-center max-w-md">
            <ShoppingBag className="w-16 h-16 text-[#d8a355] mx-auto mb-4" />
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

      <main className="flex-1 py-6 md:py-12 px-3 md:px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Page Header */}
          <div className="text-center mb-8 md:mb-12">
            <div className="flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
              <ShoppingBag className="w-6 h-6 md:w-8 md:h-8 text-[#d8a355]" />
              <h1 className="text-3xl md:text-5xl font-bold text-[#1a2332]">المتجر</h1>
            </div>
            <p className="text-base md:text-lg text-gray-600">استخدم نقاطك لشراء منتجات مميزة</p>
          </div>

          {/* Points Card */}
          <div className="bg-gradient-to-r from-[#00312e] to-[#023232] rounded-xl md:rounded-2xl p-6 md:p-8 mb-8 md:mb-12 text-white shadow-lg">
            <div className="flex items-center justify-center gap-4 md:gap-6">
              <Star className="w-8 h-8 md:w-12 md:h-12 text-[#d8a355]" />
              <div className="text-center">
                <div className="text-3xl md:text-5xl font-bold text-[#d8a355] mb-1 md:mb-2">{studentPoints}</div>
                <p className="text-sm md:text-lg opacity-90">نقطة متاحة للشراء</p>
              </div>
            </div>
          </div>

          {/* Products by Category */}
          <div className="space-y-12 mb-8 md:mb-12">
            {categories.length === 0 ? (
              <div className="text-center text-gray-500">لا توجد فئات متاحة حالياً</div>
            ) : (
              categories.map((category) => {
                const categoryProducts = products.filter((prod) => prod.category_id === category.id)
                return (
                  <div key={category.id} className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-[#1a2332] mb-4 text-center">{category.name}</h2>
                    {categoryProducts.length === 0 ? (
                      <div className="text-center text-gray-400">لا توجد منتجات في هذه الفئة</div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {categoryProducts.map((prod) => (
                          <div key={prod.id} className="flex flex-col items-center">
                            <Card className="border border-[#D4AF37]/40 shadow-sm rounded-xl p-0 w-full">
                              <CardContent className="flex flex-col items-center p-0">
                                <div className="w-full aspect-square flex items-center justify-center bg-white rounded-t-xl overflow-hidden border-b border-[#eee]">
                                  {prod.image_url ? (
                                    <img
                                      src={prod.image_url}
                                      alt={prod.name}
                                      className="object-contain w-full h-full"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">لا توجد صورة</div>
                                  )}
                                </div>
                                <div className="w-full flex flex-col items-center gap-0 py-3 px-2">
                                  <Button
                                    className="bg-[#d8a355] hover:bg-[#c99347] text-white font-bold px-4 py-1 rounded-md text-xl h-auto min-w-[60px] w-full mt-0"
                                    onClick={async () => {
                                      const accountNumber = localStorage.getItem("accountNumber")
                                      const studentsRes = await fetch(`/api/students`)
                                      const studentsData = await studentsRes.json()
                                      const student = studentsData.students?.find((s: any) => s.account_number === Number(accountNumber))
                                      if (!student) {
                                        toast({ title: "خطأ", description: "لم يتم العثور على الطالب", variant: "destructive" })
                                        return
                                      }
                                      if ((student.store_points ?? 0) < prod.price) {
                                        toast({ title: "نقاط المتجر غير كافية", description: `لا تملك نقاط متجر كافية لشراء هذا المنتج`, variant: "destructive" })
                                        return
                                      }
                                      const res = await fetch("/api/store-orders", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                          student_id: student.id,
                                          student_name: student.name,
                                          product_id: prod.id,
                                          product_name: prod.name,
                                          price: prod.price,
                                        })
                                      })
                                      const data = await res.json()
                                      if (res.ok && data.success) {
                                        setStudentPoints(data.remaining_store_points)
                                        toast({ title: "تم الشراء" })
                                      } else {
                                        toast({ title: "فشل الشراء", description: data.error || "حدث خطأ غير متوقع", variant: "destructive" })
                                      }
                                    }}
                                  >
                                    {prod.price} نقطة
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Info Section */}
          <div className="bg-[#faf9f6] rounded-xl md:rounded-2xl p-6 md:p-8 border-2 border-[#d8a355]/20">
            <h2 className="text-xl md:text-2xl font-bold text-[#1a2332] mb-3 md:mb-4">كيف يعمل المتجر؟</h2>
            <ul className="space-y-2 md:space-y-3 text-sm md:text-base text-gray-700">
              <li className="flex items-start gap-2 md:gap-3">
                <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-[#d8a355] mt-1 flex-shrink-0" />
                <span>استخدم نقاطك المكتسبة من التحضير والإنجاز لشراء المنتجات</span>
              </li>
              <li className="flex items-start gap-2 md:gap-3">
                <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-[#d8a355] mt-1 flex-shrink-0" />
                <span>كل فئة لديها منتجات مختلفة ومميزة</span>
              </li>
              <li className="flex items-start gap-2 md:gap-3">
                <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-[#d8a355] mt-1 flex-shrink-0" />
                <span>نقاط ملفك الشخصي وترتيبك في اللائحة لا تتأثر بالشراء</span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
