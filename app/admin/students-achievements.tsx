"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Medal, Gem, Trash2, Plus, ArrowRight, User, Trophy, Star } from "lucide-react";

interface Student {
  id: string;
  name: string;
}

interface Achievement {
  id: string;
  title: string;
  icon_type: string;
  date: string;
}

function StudentsAchievementsAdmin() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [icon, setIcon] = useState<string>("trophy");
  const [achievementName, setAchievementName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [achievementsMap, setAchievementsMap] = useState<Record<string, Achievement[]>>({});

  // جلب البيانات
  useEffect(() => {
    fetch("/api/students")
      .then((res) => res.json())
      .then((data) => {
        setStudents(data.students || []);
        (data.students || []).forEach((student: Student) => {
          fetch(`/api/achievements?student_id=${student.id}`)
            .then((res) => res.json())
            .then((achData) => {
              setAchievementsMap((prev) => ({ ...prev, [student.id]: achData.achievements || [] }));
            });
        });
      });
  }, []);

  const handleSave = async () => {
    if (!selectedStudent || !achievementName) return;
    setIsSaving(true);
    await fetch("/api/achievements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_name: selectedStudent.name,
        student_id: selectedStudent.id,
        icon_type: icon,
        title: achievementName,
        achievement_type: "student",
        date: new Date().toLocaleDateString("ar-EG"),
        description: "تم إضافة إنجاز جديد للطالب.",
        category: "عام",
        status: "مكتمل",
        level: "ممتاز",
      }),
    });

    const res = await fetch(`/api/achievements?student_id=${selectedStudent.id}`);
    const achData = await res.json();
    setAchievementsMap((prev) => ({ ...prev, [selectedStudent.id]: achData.achievements || [] }));
    setIsSaving(false);
    setSelectedStudent(null);
    setAchievementName("");
    setIcon("trophy");
  };

  const handleDelete = async (achievementId: string, studentId: string) => {
    if(!confirm("هل أنت متأكد من حذف هذا الإنجاز؟")) return;
    await fetch(`/api/achievements?id=${achievementId}`, { method: "DELETE" });
    
    const res = await fetch(`/api/achievements?student_id=${studentId}`);
    const achData = await res.json();
    setAchievementsMap((prev) => ({ ...prev, [studentId]: achData.achievements || [] }));
  };

  // أيقونة ديناميكية
  const renderIcon = (type: string, size = "w-6 h-6", active = true) => {
    const colorClass = active ? "text-[#d8a355]" : "text-gray-300";
    switch (type) {
      case "medal": return <Medal className={`${size} ${colorClass}`} />;
      case "gem": return <Gem className={`${size} ${colorClass}`} />;
      default: return <Award className={`${size} ${colorClass}`} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf9f5] p-6" dir="rtl">
      {/* الهيدر الرئيسي */}
      <div className="max-w-4xl mx-auto mb-10 text-center">
        <div className="inline-flex items-center justify-center p-4 rounded-full bg-[#d8a355]/10 mb-4 border border-[#d8a355]/20">
            <Trophy className="w-10 h-10 text-[#d8a355]" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">لوحة التميز والإنجازات</h1>
        <div className="h-1 w-24 bg-[#d8a355] mx-auto rounded-full mt-2"></div>
      </div>

      <div className="max-w-4xl mx-auto">
        {!selectedStudent ? (
          /* قائمة الطلاب */
          <div className="grid gap-6">
            {students.map((student) => (
              <Card key={student.id} className="group overflow-hidden border border-[#d8a355]/20 shadow-sm hover:shadow-md hover:border-[#d8a355] transition-all duration-300 bg-white">
                
                <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#d8a355] flex items-center justify-center shadow-lg shadow-[#d8a355]/20 text-white">
                        <User className="w-6 h-6" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-bold text-gray-800">{student.name}</CardTitle>
                        <span className="text-xs font-medium text-[#d8a355] bg-[#d8a355]/10 px-2 py-0.5 rounded-full mt-1 inline-block">
                             {achievementsMap[student.id]?.length || 0} وسام
                        </span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setSelectedStudent(student)} 
                    className="bg-white border-2 border-[#d8a355] text-[#d8a355] hover:bg-[#d8a355] hover:text-white font-bold gap-2 transition-all"
                  >
                    <Plus className="w-4 h-4" /> إضافة جديد
                  </Button>
                </CardHeader>

                <CardContent className="pt-4">
                  <div className="min-h-[60px]">
                    {(achievementsMap[student.id]?.length > 0) ? (
                      <div className="flex flex-wrap gap-3">
                        {achievementsMap[student.id].map((ach) => (
                          <div key={ach.id} className="relative group/item flex items-center gap-2 bg-[#d8a355]/5 px-4 py-2 rounded-full border border-[#d8a355]/20">
                            {renderIcon(ach.icon_type, "w-4 h-4")}
                            <span className="text-sm font-semibold text-gray-700">{ach.title}</span>
                            <button 
                                onClick={() => handleDelete(ach.id, student.id)}
                                className="mr-2 p-1 hover:bg-red-100 rounded-full text-red-400 opacity-0 group-hover/item:opacity-100 transition-all scale-0 group-hover/item:scale-100"
                                title="حذف"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-2">
                         <span className="text-xs text-gray-400 italic">لا توجد إنجازات مسجلة حالياً</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* واجهة إضافة إنجاز */
          <div className="max-w-lg mx-auto">
            <Button 
                variant="ghost" 
                onClick={() => setSelectedStudent(null)} 
                className="mb-4 text-gray-500 hover:text-[#d8a355] hover:bg-transparent p-0 gap-2"
            >
                <ArrowRight className="w-4 h-4" /> الرجوع للقائمة
            </Button>
            
            <Card className="border border-[#d8a355]/20 shadow-xl bg-white">
              <div className="h-2 w-full bg-[#d8a355]" />
              <CardContent className="p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#d8a355]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Star className="w-8 h-8 text-[#d8a355]" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">إنجاز جديد</h2>
                    <p className="text-gray-500 text-sm mt-1">تخصيص وسام للطالب <span className="text-[#d8a355] font-bold">{selectedStudent.name}</span></p>
                </div>

                {/* اختيار الأيقونة */}
                <div className="mb-8">
                    <label className="text-xs font-bold text-gray-400 uppercase mb-4 block text-center tracking-widest">اختر الرمز</label>
                    <div className="flex justify-center gap-4">
                        {["trophy", "medal", "gem"].map((type) => (
                            <button
                                key={type}
                                onClick={() => setIcon(type)}
                                className={`
                                    p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 w-24
                                    ${icon === type 
                                        ? "border-[#d8a355] bg-[#d8a355] text-white shadow-lg shadow-[#d8a355]/30 transform -translate-y-1" 
                                        : "border-gray-100 bg-gray-50 text-gray-400 hover:border-[#d8a355]/50"
                                    }
                                `}
                            >
                                {renderIcon(type, "w-6 h-6", icon === type)}
                                <span className="text-xs font-bold">
                                    {type === 'trophy' ? 'كأس' : type === 'medal' ? 'ميدالية' : 'جوهرة'}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* حقل الإدخال */}
                <div className="space-y-6">
                    <div className="relative">
                        <input
                            className="w-full border-2 border-gray-100 rounded-lg px-4 py-3 outline-none focus:border-[#d8a355] focus:ring-4 focus:ring-[#d8a355]/10 transition-all text-gray-700 font-medium bg-gray-50 focus:bg-white"
                            placeholder="عنوان الإنجاز (مثال: حفظ جزء عم)"
                            value={achievementName}
                            onChange={(e) => setAchievementName(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <Button 
                        onClick={handleSave} 
                        disabled={isSaving || !achievementName} 
                        className="w-full h-12 bg-[#d8a355] hover:bg-[#c49248] text-white font-bold rounded-lg shadow-md transition-all active:scale-95"
                    >
                        {isSaving ? "جاري الحفظ..." : "تأكيد الإنجاز"}
                    </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentsAchievementsAdmin;