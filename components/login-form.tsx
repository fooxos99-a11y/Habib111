"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LogIn, CheckCircle2 } from 'lucide-react'

export function LoginForm() {
  const [accountNumber, setAccountNumber] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account_number: accountNumber,
        }),
      })

      if (!response.ok) {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json()
          setError(data.error || "رقم الحساب غير صحيح")
        } else {
          setError("حدث خطأ في الاتصال بالخادم")
        }
        setIsLoading(false)
        return
      }

      const data = await response.json()

      if (data.success && data.user) {
        const currentUser = {
          account_number: data.user.accountNumber,
          role: data.user.role,
          name: data.user.name,
          halaqah: data.user.halaqah || "",
          id: data.user.id // أضف uuid للطالب
        }
        localStorage.setItem("currentUser", JSON.stringify(currentUser))

        localStorage.setItem("account_number", data.user.accountNumber.toString())
        localStorage.setItem("accountNumber", data.user.accountNumber.toString())
        localStorage.setItem("userRole", data.user.role)
        localStorage.setItem("userName", data.user.name)
        localStorage.setItem("studentName", data.user.name)
        localStorage.setItem("userHalaqah", data.user.halaqah || "")
        localStorage.setItem("isLoggedIn", "true")

        // إذا كان الطالب، احفظ studentId (uuid) في localStorage
        if (data.user.role === "student" && data.user.id) {
          localStorage.setItem("studentId", data.user.id);
        }

        setIsSuccess(true)
        setTimeout(() => {
          router.push("/")
        }, 1500)
      } else {
        setError(data.error || "رقم الحساب غير صحيح")
        setIsLoading(false)
      }
    } catch (error) {
      console.error("[v0] Login error:", error)
      setError("حدث خطأ أثناء تسجيل الدخول")
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 md:p-8 border-2 border-[#d8a355]/30 relative">
      {isSuccess && (
        <div className="absolute inset-0 bg-white rounded-2xl flex flex-col items-center justify-center z-10 animate-in fade-in duration-300">
          <CheckCircle2 className="w-20 h-20 md:w-32 md:h-32 text-[#d8a355] animate-in zoom-in duration-500" />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        <div className="space-y-2">
          <Label htmlFor="accountNumber" className="text-[#023232] font-semibold text-base md:text-lg">
            رقم الحساب
          </Label>
          <Input
            id="accountNumber"
            type="text"
            placeholder="أدخل رقم الحساب"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            className="h-12 md:h-14 text-base md:text-lg text-center border-2 border-gray-200 focus:border-[#d8a355] transition-colors"
            required
            dir="ltr"
          />
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-3 md:px-4 py-2 md:py-3 rounded-lg text-center text-sm md:text-base">{error}</div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 md:h-14 bg-gradient-to-r from-[#d8a355] to-[#c99347] hover:from-[#d8a355]/90 hover:to-[#c99347]/90 text-[#023232] font-bold text-base md:text-lg shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {isLoading ? (
            "جاري تسجيل الدخول..."
          ) : (
            <span className="flex items-center justify-center gap-2">
              <LogIn className="w-4 h-4 md:w-5 md:h-5" />
              تسجيل الدخول
            </span>
          )}
        </Button>
      </form>

      <div className="mt-4 md:mt-6 text-center text-xs md:text-sm text-[#023232]/60">
        <p>استخدم رقم الحساب الخاص بك للدخول</p>
      </div>
    </div>
  )
}
