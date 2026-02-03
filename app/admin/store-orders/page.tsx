"use client";
import { getSupabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// --- الأيقونات ---
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
);
const PackageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" x2="12" y1="22" y2="12"/></svg>
);

export default function StoreOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDelivered, setShowDelivered] = React.useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    const supabase = getSupabase();
    const { data } = await supabase
      .from("store_orders")
      .select("*")
      .order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  }

  const notDelivered = orders.filter((o) => !o.is_delivered);
  const delivered = orders.filter((o) => o.is_delivered);

  // تعليم جميع الطلبات كـ تم التسليم
  async function markAllAsDelivered() {
    if (notDelivered.length === 0) return;
    const res = await fetch("/api/store-orders/delivered", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mark_all: true }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      alert(data.error || "حدث خطأ أثناء تحديث حالة التسليم للجميع!");
      return;
    }
    fetchOrders();
  }

  // حذف جميع الطلبات
  async function deleteAllOrders() {
    if (!confirm("هل أنت متأكد من حذف جميع الطلبات في هذه القائمة؟")) return;
    
    const idsToDelete = showDelivered
      ? delivered.map((o) => o.id)
      : notDelivered.map((o) => o.id);

    if (idsToDelete.length === 0) return;
    const res = await fetch("/api/store-orders", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: idsToDelete }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      alert(data.error || "حدث خطأ أثناء حذف الطلبات!");
      return;
    }
    fetchOrders();
  }

  async function deleteOrder(orderId: string) {
    const res = await fetch("/api/store-orders", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: orderId }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      alert(data.error || "حدث خطأ أثناء حذف الطلب!");
      return;
    }
    fetchOrders();
  }

  async function markAsDelivered(orderId: string) {
    try {
      const res = await fetch("/api/store-orders/delivered", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "حدث خطأ أثناء تحديث حالة التسليم!");
        return;
      }
      fetchOrders();
    } catch (err) {
      alert("تعذر الاتصال بالخادم. حاول مرة أخرى.");
    }
  }

  const currentList = showDelivered ? delivered : notDelivered;

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 font-sans py-12 px-4 md:px-8">
      <div className="container mx-auto max-w-3xl">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            {/* تم تغيير الخط وإزالة الوصف الفرعي */}
            <h1 className="text-4xl md:text-5xl font-bold text-[#1a2332]">
              طلبات الطلاب
            </h1>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {showDelivered ? (
              <Button
                variant="destructive"
                className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 shadow-sm"
                onClick={deleteAllOrders}
                disabled={currentList.length === 0}
              >
                <TrashIcon />
                <span className="mr-2">حذف السجل</span>
              </Button>
            ) : (
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200"
                onClick={markAllAsDelivered}
                disabled={currentList.length === 0}
              >
                <CheckIcon />
                <span className="mr-2">تسليم الكل</span>
              </Button>
            )}
          </div>
        </div>

        {/* Custom Tabs */}
        <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex mb-8 w-full md:w-fit mx-auto md:mx-0">
          <button
            onClick={() => setShowDelivered(false)}
            className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
              !showDelivered
                ? "bg-[#d8a355] text-white shadow-md" // تم تغيير اللون هنا إلى الذهبي
                : "text-slate-500 hover:text-[#d8a355] hover:bg-amber-50"
            }`}
          >
            الطلبات الجديدة
            <span className={`mr-2 px-2 py-0.5 rounded-full text-xs ${!showDelivered ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
              {notDelivered.length}
            </span>
          </button>
          <button
            onClick={() => setShowDelivered(true)}
            className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
              showDelivered
                ? "bg-emerald-500 text-white shadow-md" // تغيير إلى الأخضر للتمييز
                : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"
            }`}
          >
            التم تسليمها
            <span className={`mr-2 px-2 py-0.5 rounded-full text-xs ${showDelivered ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
              {delivered.length}
            </span>
          </button>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d8a355]"></div>
             <p className="text-slate-500">جاري تحميل البيانات...</p>
          </div>
        ) : currentList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
            <PackageIcon />
            <h3 className="text-lg font-bold text-slate-900 mt-4">لا توجد طلبات هنا</h3>
            <p className="text-slate-500 text-sm">القائمة فارغة حالياً</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {currentList.map((order) => (
              <Card
                key={order.id}
                className="group overflow-hidden border border-slate-100 hover:border-[#d8a355]/50 bg-white shadow-sm hover:shadow-md transition-all duration-300"
              >
                <CardContent className="p-0">
                  <div className="flex items-center justify-between p-4 md:p-5">
                    
                    {/* Order Info */}
                    <div className="flex items-center gap-4">
                       <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                         showDelivered ? "bg-emerald-50 text-emerald-600" : "bg-[#fcf5e8] text-[#d8a355]"
                       }`}>
                          {showDelivered ? <CheckIcon /> : <span className="font-bold text-lg">#</span>}
                       </div>

                       <div className="flex flex-col">
                          <h3 className="font-bold text-slate-900 text-lg leading-tight">
                            {order.student_name}
                          </h3>
                          <span className="text-sm font-medium text-slate-500 mt-1">
                            طلب: <span className="text-[#d8a355] font-bold">{order.product_name}</span>
                          </span>
                       </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      {!showDelivered && (
                        <Button
                          size="icon"
                          onClick={() => markAsDelivered(order.id)}
                          className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-200 transition-colors shadow-sm"
                          title="تأكيد التسليم"
                        >
                          <CheckIcon />
                        </Button>
                      )}
                      
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteOrder(order.id)}
                        className="h-10 w-10 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="حذف الطلب"
                      >
                         <TrashIcon />
                      </Button>
                    </div>

                  </div>
                  {/* Bottom Border Line - يتغير لونه حسب الحالة */}
                  <div className={`h-1 w-full ${showDelivered ? "bg-emerald-500" : "bg-[#d8a355]"} transition-colors`} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}