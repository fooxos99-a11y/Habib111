"use client";

import { useState, useEffect, useRef } from "react";
import { getSupabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

// --- أيقونات للتصميم ---
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
);
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
);
const TagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
);
const ImageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
);
const DollarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
);
const ShoppingBagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
);
const BoxIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" x2="12" y1="22" y2="12"/></svg>
);

export default function StoreManagementPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const supabase = getSupabase();
    const { data: productsData } = await supabase.from("store_products").select("*").order('created_at', { ascending: false });
    const { data: categoriesData } = await supabase.from("store_categories").select("*");
    setProducts(productsData || []);
    setCategories(categoriesData || []);
    setLoading(false);
  }

  async function handleAddProduct(e: any) {
    e.preventDefault();
    if (!name || !price || !selectedCategoryId) {
      alert("يرجى تعبئة جميع الحقول واختيار الفئة");
      return;
    }
    setLoading(true);
    let imageUrl = null;
    try {
      if (imageFile) {
        const supabase = getSupabase();
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const { error } = await supabase.storage.from("store-products").upload(fileName, imageFile);
        if (error) {
          alert("فشل رفع الصورة: " + error.message);
          setLoading(false);
          return;
        }
        imageUrl = supabase.storage.from("store-products").getPublicUrl(fileName).data.publicUrl;
      }
      const supabase = getSupabase();
      const { error: insertError } = await supabase.from("store_products").insert({
          name,
          price: Number(price),
          category_id: selectedCategoryId,
          image_url: imageUrl,
        });
      if (insertError) {
        alert("فشل إضافة المنتج: " + insertError.message);
        setLoading(false);
        return;
      }
      alert("تمت إضافة المنتج بنجاح");
      setName("");
      setPrice("");
      setSelectedCategoryId("");
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchData();
    } catch (err) {
      alert("حدث خطأ غير متوقع");
    }
    setLoading(false);
  }

  async function handleAddCategory(e: any) {
    e.preventDefault();
    if (!newCategory) return;
    setLoading(true);
    const supabase = getSupabase();
    await supabase.from("store_categories").insert({ name: newCategory });
    setNewCategory("");
    fetchData();
  }

  async function handleDeleteProduct(id: string) {
    if (!window.confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    setLoading(true);
    const supabase = getSupabase();
    await supabase.from("store_products").delete().eq("id", id);
    fetchData();
  }

  async function handleDeleteCategory(id: string) {
    if (!window.confirm("سيتم حذف الفئة وكل المنتجات المرتبطة بها. هل أنت متأكد؟")) return;
    setLoading(true);
    const supabase = getSupabase();
    await supabase.from("store_categories").delete().eq("id", id);
    fetchData();
  }

  return (
    // الخلفية: تدرج بيج فاتح جداً ليعطي انطباع الفخامة والنظافة
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-[#fdfbf7] via-[#fffefc] to-[#f7f3eb] font-sans py-10 px-4 md:px-8">
      <div className="container mx-auto max-w-6xl">
        
        {/* Banner / Header Section */}
        {/* تم تغيير اللون البنفسجي إلى تدرجات البيج/الذهبي كما طلبت */}
        <div className="bg-gradient-to-r from-[#d8a355] to-[#c59d5f] rounded-3xl p-8 mb-10 shadow-xl shadow-[#d8a355]/20 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          {/* دوائر زخرفية خفيفة */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-black/5 rounded-full blur-2xl"></div>

          <div className="relative z-10">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2 text-white drop-shadow-sm">إدارة المتجر</h1>
            <p className="text-amber-50 text-lg opacity-90 font-medium">التحكم الكامل في المنتجات والفئات</p>
          </div>
          
          <a
            href="/admin/store-orders"
            className="relative z-10 flex items-center gap-2 bg-white text-[#b6853d] hover:bg-[#faf6f0] px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <ShoppingBagIcon />
            طلبات الطلاب
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Input Forms */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* 1. قسم الفئات */}
            <Card className="border-0 shadow-lg shadow-[#d8a355]/10 bg-white rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-[#d8a355] to-[#eebc69] p-4 flex items-center gap-2 text-white">
                 <TagIcon />
                 <h3 className="font-bold text-lg">الفئات</h3>
              </div>
              <CardContent className="p-5">
                <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
                  <Input
                    placeholder="اسم فئة جديدة..."
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="bg-[#fcfaf7] border-gray-200 focus:ring-[#d8a355] focus:border-[#d8a355]"
                  />
                  <Button
                    type="submit"
                    disabled={loading || !newCategory}
                    className="bg-[#d8a355] hover:bg-[#c2924c] text-white shadow-md shadow-orange-100"
                  >
                    <PlusIcon />
                  </Button>
                </form>

                <div className="flex flex-wrap gap-2">
                    {categories.length === 0 ? (
                        <p className="text-xs text-gray-400 w-full text-center">لا توجد فئات</p>
                    ) : (
                        categories.map((cat) => (
                        <div key={cat.id} className="flex items-center gap-2 bg-[#fdf8f0] text-[#9c7b40] px-3 py-1.5 rounded-lg text-sm font-bold border border-[#f3e9d8] group transition-all hover:bg-[#f3e9d8]">
                            <span>{cat.name}</span>
                            <button 
                                onClick={() => handleDeleteCategory(cat.id)}
                                className="text-[#d8a355]/60 hover:text-red-500 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>
                        ))
                    )}
                </div>
              </CardContent>
            </Card>

            {/* 2. قسم إضافة منتج */}
            <Card className="border-0 shadow-lg shadow-[#d8a355]/10 bg-white rounded-2xl overflow-hidden relative">
              {/* توحيد لون الهيدر ليكون متناسقاً مع التصميم العام */}
              <div className="bg-gradient-to-r from-[#d8a355] to-[#c69245] p-4 text-white">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <BoxIcon />
                    منتج جديد
                </h3>
              </div>
              <CardContent className="p-6 space-y-5">
                <form onSubmit={handleAddProduct} className="flex flex-col gap-5">
                  
                  {/* رفع الصورة بتصميم متناسق */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#e6dcc8] bg-[#fdfbf7] rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#d8a355] hover:bg-[#fcf5e8] transition-all group"
                  >
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} className="hidden" />
                    
                    {imageFile ? (
                        <div className="text-center">
                            <div className="bg-green-100 text-green-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            </div>
                            <p className="text-gray-800 font-bold text-sm truncate max-w-[200px]">{imageFile.name}</p>
                            <p className="text-xs text-[#d8a355] mt-1">اضغط للتغيير</p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-white p-3 shadow-sm rounded-full mb-3 text-[#d8a355] group-hover:scale-110 transition-transform duration-300">
                                <ImageIcon />
                            </div>
                            <p className="text-sm text-gray-600 font-semibold">اضغط لرفع صورة</p>
                            <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP</p>
                        </>
                    )}
                  </div>

                  <div className="space-y-4">
                    <Input
                        placeholder="اسم المنتج"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-12 bg-[#fcfaf7] border-gray-200 focus:ring-2 focus:ring-[#d8a355] focus:border-transparent rounded-xl"
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <span className="absolute left-3 top-3.5 text-gray-400"><DollarIcon /></span>
                            <Input
                                placeholder="السعر"
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="h-12 pl-10 bg-[#fcfaf7] border-gray-200 focus:ring-2 focus:ring-[#d8a355] focus:border-transparent rounded-xl"
                            />
                        </div>
                        <div className="relative">
                             <select
                                value={selectedCategoryId}
                                onChange={(e) => setSelectedCategoryId(e.target.value)}
                                className="w-full h-12 appearance-none bg-[#fcfaf7] border border-gray-200 rounded-xl px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d8a355] transition-all cursor-pointer"
                            >
                                <option value="">الفئة...</option>
                                {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            <span className="absolute left-3 top-4 text-gray-400 pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                            </span>
                        </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-gradient-to-r from-[#d8a355] to-[#c69245] hover:from-[#c2924c] hover:to-[#b0823d] text-white font-bold rounded-xl shadow-lg shadow-[#d8a355]/30 transition-all hover:shadow-[#d8a355]/50 mt-2"
                  >
                    {loading ? "جاري الإضافة..." : "حفظ المنتج"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Products Grid */}
          <div className="lg:col-span-8">
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">قائمة المنتجات</h2>
                <div className="bg-white px-4 py-1.5 rounded-full shadow-sm border border-gray-100 text-sm font-semibold text-gray-600">
                    العدد: <span className="text-[#d8a355] font-bold">{products.length}</span>
                </div>
             </div>

             {products.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-24 bg-white/60 backdrop-blur-sm rounded-3xl border border-dashed border-[#e6dcc8]">
                    <div className="bg-[#fcf5e8] p-4 rounded-full mb-4 text-[#d8a355]">
                        <ShoppingBagIcon />
                    </div>
                    <p className="text-gray-500 font-medium text-lg">المكتبة فارغة حالياً</p>
                    <p className="text-gray-400 text-sm">أضف منتجاتك من القائمة الجانبية</p>
                 </div>
             ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {products.map((prod) => (
                        <Card key={prod.id} className="group border-0 shadow-md hover:shadow-xl hover:shadow-[#d8a355]/10 hover:-translate-y-1 transition-all duration-300 bg-white rounded-2xl overflow-hidden">
                            <CardContent className="p-0 flex flex-col h-full">
                                {/* صورة المنتج */}
                                <div className="h-40 w-full bg-[#fcfaf7] relative overflow-hidden flex items-center justify-center">
                                    {prod.image_url ? (
                                        <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    ) : (
                                        <div className="text-[#e6dcc8]">
                                            <ImageIcon />
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3">
                                        <span className="bg-white/90 backdrop-blur-md text-[#8a6a36] text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm border border-[#f3e9d8]">
                                            {categories.find(c => c.id === prod.category_id)?.name || "عام"}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* تفاصيل المنتج */}
                                <div className="p-4 flex flex-col flex-1 justify-between">
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-lg mb-1 line-clamp-1 group-hover:text-[#d8a355] transition-colors">{prod.name}</h3>
                                        <p className="text-xs text-gray-400 mb-3">تمت الإضافة حديثاً</p>
                                    </div>
                                    
                                    <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-100">
                                        <span className="font-extrabold text-[#d8a355] text-lg">{prod.price} <span className="text-xs font-normal text-gray-400">نقطة</span></span>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => handleDeleteProduct(prod.id)}
                                            className="h-9 w-9 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                        >
                                            <TrashIcon />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                 </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}