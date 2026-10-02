// online-exam: واجهة عامة للطلاب. تعرض الأسئلة بدون إجاباتها، وتصحّح التسليم من جهة الخادم.
// الإجابات الصحيحة لا تغادر الخادم إلا إذا سمح المعلم بإظهارها بعد التسليم.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, jsonResponse } from "../_shared/exam-common.ts";
import { gradeAnswer, normText } from "../_shared/exam-normalize.ts";

const MAX_BODY_CHARS = 400_000;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY_CHARS) return jsonResponse({ error: "حجم الطلب كبير جداً" }, 413);
    const body = JSON.parse(raw);

    const token = String(body.token ?? "");
    if (!/^[A-Za-z0-9]{8,32}$/.test(token)) return jsonResponse({ error: "رابط الامتحان غير صحيح" }, 400);

    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { persistSession: false },
    });
    const { data: row, error } = await db.from("online_exams").select("*").eq("token", token).maybeSingle();
    if (error) throw error;
    if (!row) return jsonResponse({ error: "لم يُعثر على هذا الامتحان" }, 404);
    if (!row.is_active) return jsonResponse({ error: "هذا الامتحان مغلق حالياً" }, 410);

    const exam = row.exam as { title: string; questions: any[]; meta?: any };
    const settings = (row.settings ?? {}) as Record<string, any>;
    const questions: any[] = Array.isArray(exam.questions) ? exam.questions : [];

    // ───────── عرض الامتحان للطالب ─────────
    if (body.action === "get") {
      return jsonResponse({
        title: row.title,
        subject: row.subject,
        grade: row.grade,
        schoolName: exam.meta?.schoolName ?? "",
        settings: {
          durationMinutes: Number(settings.durationMinutes) || 0,
          shuffleQuestions: !!settings.shuffleQuestions,
          shuffleOptions: !!settings.shuffleOptions,
          requireClass: !!settings.requireClass,
          instructions: String(settings.instructions ?? ""),
        },
        questions: questions.map((q) => ({
          id: q.id,
          type: q.type,
          question: q.question,
          options: q.options,
          table: q.table,
          figure: q.figure?.url ? { url: q.figure.url, caption: q.figure.caption } : undefined,
        })),
      });
    }

    // ───────── تسليم وتصحيح ─────────
    if (body.action === "submit") {
      const name = String(body.student?.name ?? "").trim().slice(0, 120);
      if (!name) return jsonResponse({ error: "اكتب اسمك قبل التسليم" }, 400);
      const cls = String(body.student?.class ?? "").trim().slice(0, 60);
      if (settings.requireClass && !cls) return jsonResponse({ error: "اكتب صفك/شعبتك قبل التسليم" }, 400);

      const rawAnswers = body.answers && typeof body.answers === "object" ? body.answers : {};
      const answers: Record<string, string> = {};
      for (const q of questions) {
        const v = rawAnswers[String(q.id)];
        if (typeof v === "string" && v.trim()) answers[String(q.id)] = v.slice(0, 4000);
      }

      const nameNorm = normText(name);
      if (!settings.allowRetake) {
        const { data: dup } = await db.from("online_exam_submissions")
          .select("id").eq("exam_id", row.id).eq("student_name_norm", nameNorm).limit(1);
        if (dup && dup.length) return jsonResponse({ error: "سبق أن سلّمت هذا الامتحان بهذا الاسم" }, 409);
      }

      let score = 0, autoTotal = 0, pending = 0;
      const perQuestion = questions.map((q) => {
        const g = gradeAnswer(q, answers[String(q.id)]);
        if (g === "manual") pending++;
        else { autoTotal++; if (g === "correct") score++; }
        return { id: q.id, grade: g, q };
      });

      const timeTaken = Math.max(0, Math.min(86_400, Math.floor(Number(body.timeTakenSeconds) || 0)));
      const { error: insErr } = await db.from("online_exam_submissions").insert({
        exam_id: row.id,
        student_name: name,
        student_name_norm: nameNorm,
        student_info: { class: cls, id: String(body.student?.id ?? "").slice(0, 60) },
        answers,
        auto_score: score,
        auto_total: autoTotal,
        manual_pending: pending,
        time_taken_seconds: timeTaken,
      });
      if (insErr) throw insErr;

      const mode = String(settings.showResult ?? "score");
      const out: any = { submitted: true, showResult: mode };
      if (mode === "score" || mode === "score_answers") {
        out.score = score; out.total = autoTotal; out.pendingManual = pending;
      }
      if (mode === "score_answers") {
        out.review = perQuestion.map(({ id, grade, q }) => ({
          id, grade, correctAnswer: q.answer, explanation: q.explanation ?? "", yourAnswer: answers[String(id)] ?? "",
        }));
      }
      return jsonResponse(out);
    }

    return jsonResponse({ error: "إجراء غير معروف" }, 400);
  } catch (e: any) {
    console.error("online-exam error:", e);
    return jsonResponse({ error: "حدث خطأ غير متوقع، حاول مجدداً" }, 500);
  }
});
