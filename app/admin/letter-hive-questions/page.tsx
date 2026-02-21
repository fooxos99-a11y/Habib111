"use client";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

const ARABIC_LETTERS = [
  "أ","ب","ت","ث","ج","ح","خ","د","ذ","ر","ز","س","ش","ص","ض","ط","ظ","ع","غ","ف","ق","ك","ل","م","ن","هـ","و","ي"
];

export default function LetterHiveQuestionsAdmin() {
  const [questions, setQuestions] = useState<Record<string, {question: string, answer: string}[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const supabase = createClient();

  useEffect(() => {
    fetchQuestions();
  }, []);

  async function fetchQuestions() {
    setLoading(true);
    const { data, error } = await supabase.from("letter_hive_questions").select();
    if (!error && data) {
      const grouped: Record<string, {question: string, answer: string}[]> = {};
      for (const row of data) {
        if (!grouped[row.letter]) grouped[row.letter] = [];
        grouped[row.letter].push({ question: row.question, answer: row.answer });
      }
      setQuestions(grouped);
    }
    setLoading(false);
  }

  async function addQuestion() {
    if (!selectedLetter || !newQuestion || !newAnswer) return;
    const { error } = await supabase.from("letter_hive_questions").insert({ letter: selectedLetter, question: newQuestion, answer: newAnswer });
    if (!error) {
      setNewQuestion("");
      setNewAnswer("");
      fetchQuestions();
    }
  }

  async function deleteQuestion(letter: string, question: string) {
    await supabase.from("letter_hive_questions").delete().eq("letter", letter).eq("question", question);
    fetchQuestions();
  }

  return (
    <div style={{ padding: 32, maxWidth: 800, margin: "0 auto" }}>
      <h2 style={{ fontSize: 28, fontWeight: "bold", marginBottom: 24 }}>إدارة أسئلة خلية الحروف</h2>
      {loading ? <div>جاري التحميل...</div> : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 32 }}>
          {ARABIC_LETTERS.map((ltr) => (
            <button
              key={ltr}
              style={{
                padding: "10px 18px",
                borderRadius: 8,
                border: selectedLetter === ltr ? "2px solid #e20000" : "1px solid #ccc",
                background: selectedLetter === ltr ? "#ffeaea" : "#fff",
                fontWeight: "bold",
                fontSize: 22,
                cursor: "pointer"
              }}
              onClick={() => setSelectedLetter(ltr)}
            >
              {ltr}
            </button>
          ))}
        </div>
      )}
      {selectedLetter && (
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 22, marginBottom: 12 }}>أسئلة حرف "{selectedLetter}"</h3>
          <ul style={{ marginBottom: 16 }}>
            {(questions[selectedLetter] || []).map((q, idx) => (
              <li key={q.question+idx} style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <span><b>س:</b> {q.question} <b>ج:</b> {q.answer}</span>
                <button onClick={() => deleteQuestion(selectedLetter, q.question)} style={{ color: "#e20000", border: "none", background: "none", cursor: "pointer" }}>حذف</button>
              </li>
            ))}
          </ul>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              value={newQuestion}
              onChange={e => setNewQuestion(e.target.value)}
              placeholder="أضف سؤال جديد لهذا الحرف"
              style={{ flex: 2, padding: 8, borderRadius: 6, border: "1px solid #ccc", fontSize: 18 }}
            />
            <input
              type="text"
              value={newAnswer}
              onChange={e => setNewAnswer(e.target.value)}
              placeholder="الإجابة"
              style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #ccc", fontSize: 18 }}
            />
            <button onClick={addQuestion} style={{ background: "#e20000", color: "#fff", border: "none", borderRadius: 6, padding: "8px 18px", fontWeight: "bold", fontSize: 18, cursor: "pointer" }}>إضافة</button>
          </div>
        </div>
      )}
    </div>
  );
}
