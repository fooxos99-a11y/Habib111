"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Stage {
  id: number;
  name: string;
}

export default function GuessStagesAdmin() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [newStage, setNewStage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStages();
  }, []);

  async function fetchStages() {
    setLoading(true);
    const res = await fetch("/api/guess-image-stages");
    const data = await res.json();
    setStages(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function addStage(e: React.FormEvent) {
    e.preventDefault();
    if (!newStage.trim()) return;
    setLoading(true);
    const res = await fetch("/api/guess-image-stages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newStage })
    });
    if (res.ok) {
      setNewStage("");
      fetchStages();
    }
    setLoading(false);
  }

  // حذف مرحلة
  async function deleteStage(id: number) {
    if (!confirm("هل أنت متأكد من حذف المرحلة؟")) return;
    setLoading(true);
    await fetch(`/api/guess-image-stages?id=${id}`, { method: "DELETE" });
    fetchStages();
    setLoading(false);
  }

  return (
    <div className="container mx-auto p-4 max-w-xl">
      <h1 className="text-2xl font-bold mb-6">إدارة مراحل خمن الصورة</h1>
      <form onSubmit={addStage} className="flex gap-2 mb-6">
        <Input
          value={newStage}
          onChange={e => setNewStage(e.target.value)}
          placeholder="اسم المرحلة الجديدة"
          required
        />
        <Button type="submit" disabled={loading || !newStage.trim()}>
          إضافة مرحلة
        </Button>
      </form>
      {loading ? (
        <p>جاري التحميل...</p>
      ) : (
        <ul className="space-y-2">
          {stages.map(stage => (
            <li key={stage.id} className="flex items-center justify-between border rounded p-2">
              <span>{stage.name}</span>
              <Button variant="destructive" size="sm" onClick={() => deleteStage(stage.id)}>
                حذف
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
