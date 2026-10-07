import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import SafeBoundary from "@/components/common/SafeBoundary";
import ExamCreatorWizard from "@/components/exam-creator/ExamCreatorWizard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Bot, FileText, FilePlus2, Loader2, MessageSquare, Send, User } from "lucide-react";
import { ApiError } from "@/lib/examCreator/api";
import { agentChat, getAgentByToken, type ChatMessage, type ChatReply, type PublicAgent } from "@/lib/examAgents/agents";

type Msg = ChatMessage & { sources?: ChatReply["sources"]; examRequest?: string };

const SUGGESTIONS = ["لخّص لي أهم ما في الملفات", "اشرح لي الوحدة الأولى", "أنشئ لي امتحاناً من 10 أسئلة"];

export default function ExamAgent() {
  const { token = "" } = useParams();
  const [agent, setAgent] = useState<PublicAgent | null | undefined>(undefined);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"chat" | "exam">("chat");
  const [examMounted, setExamMounted] = useState(false);
  const [examRequest, setExamRequest] = useState<string | undefined>();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [chatErr, setChatErr] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    getAgentByToken(token).then((a) => setAgent(a)).catch((e) => { setError(e.message); setAgent(null); });
    return () => abortRef.current?.abort();
  }, [token]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [msgs, sending]);

  const openExam = (req?: string) => { setExamRequest(req); setExamMounted(true); setTab("exam"); };

  const send = async (content: string) => {
    const t = content.trim();
    if (!t || sending) return;
    setChatErr(""); setText("");
    const next: Msg[] = [...msgs, { role: "user", content: t }];
    setMsgs(next); setSending(true);
    const ac = new AbortController();
    abortRef.current = ac;
    try {
      const r = await agentChat(token, next.map(({ role, content }) => ({ role, content })), ac.signal);
      setMsgs([...next, { role: "assistant", content: r.reply, sources: r.sources, examRequest: r.action === "create_exam" ? r.examRequest || t : undefined }]);
    } catch (e: any) {
      if (e instanceof ApiError && e.code === "aborted") return;
      setChatErr(e instanceof ApiError && e.code === "rate_limited"
        ? `الخدمة مشغولة الآن. أعد المحاولة بعد ${e.retryAfter ?? 20} ثانية.`
        : e?.message || "تعذّر الرد. حاول مرة أخرى.");
    } finally { setSending(false); }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] text-right text-slate-900 dark:bg-[#050714] dark:text-white" dir="rtl">
      <SEO title={`${agent?.name ?? "وكيل مختص"} | منصة ذروة العلم`} description={agent?.description ?? "وكيل ذكاء اصطناعي مختص يجيب من ملفات محددة وينشئ امتحانات منها."} keywords="وكيل ذكاء اصطناعي, امتحانات, ذروة العلم" canonicalUrl="https://yoursite.lovable.app/agent" />
      <SafeBoundary name="Navbar"><Navbar /></SafeBoundary>
      <main className="mx-auto w-full max-w-4xl flex-1 space-y-5 px-4 py-8">
        {agent === undefined && <Loader2 className="mx-auto mt-16 h-8 w-8 animate-spin" />}
        {agent === null && (
          <Card className="p-8 text-center">
            <Bot className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <div className="font-bold">هذا الوكيل غير موجود أو أُوقف</div>
            <p className="mt-1 text-sm text-muted-foreground">{error || "تأكد من الرابط أو اطلب رابطاً جديداً من المشرف."}</p>
          </Card>
        )}

        {agent && (
          <>
            <header className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary"><Bot className="h-7 w-7" /></div>
                <div>
                  <h1 className="text-2xl font-black">{agent.name}</h1>
                  {agent.description && <p className="text-sm text-muted-foreground">{agent.description}</p>}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {agent.subject && <Badge variant="secondary">{agent.subject}</Badge>}
                {agent.grade && <Badge variant="secondary">{agent.grade}</Badge>}
                {agent.files.map((f) => <Badge key={f.id} variant="outline"><FileText className="ml-1 h-3 w-3" />{f.title}</Badge>)}
              </div>
              <p className="text-xs text-muted-foreground">يجيب هذا الوكيل من الملفات أعلاه فقط، ولا يمكنك رفع ملفات أخرى إليه.</p>
            </header>

            <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1 text-sm">
              {([["chat", "المحادثة", MessageSquare], ["exam", "إنشاء امتحان", FilePlus2]] as const).map(([k, l, Icon]) => (
                <button key={k} type="button" onClick={() => (k === "exam" ? openExam(examRequest) : setTab("chat"))}
                  className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 ${tab === k ? "bg-background font-semibold shadow-sm" : "text-muted-foreground"}`}>
                  <Icon className="h-4 w-4" />{l}
                </button>
              ))}
            </div>

            <section hidden={tab !== "chat"} className="space-y-3">
              <Card className="flex h-[55vh] flex-col overflow-y-auto p-4">
                <div className="space-y-4">
                  <Bubble role="assistant">{agent.welcome || `مرحباً! أنا ${agent.name}. اسألني عن محتوى الملفات، أو اطلب مني إنشاء امتحان منها.`}</Bubble>
                  {msgs.length === 0 && (
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTIONS.map((s) => <Button key={s} size="sm" variant="outline" onClick={() => send(s)}>{s}</Button>)}
                    </div>
                  )}
                  {msgs.map((m, i) => (
                    <Bubble key={i} role={m.role}>
                      <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                      {!!m.sources?.length && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {m.sources.map((s, j) => <Badge key={j} variant="secondary" className="text-[10px]">{s.file} · ص {s.page}</Badge>)}
                        </div>
                      )}
                      {m.examRequest && (
                        <Button size="sm" className="mt-3" onClick={() => openExam(m.examRequest)}><FilePlus2 className="ml-1 h-4 w-4" />إنشاء امتحان بهذا الطلب</Button>
                      )}
                    </Bubble>
                  ))}
                  {sending && <Bubble role="assistant"><Loader2 className="h-4 w-4 animate-spin" /></Bubble>}
                  {chatErr && <p className="text-sm text-destructive">{chatErr}</p>}
                  <div ref={endRef} />
                </div>
              </Card>
              <form className="flex items-end gap-2" onSubmit={(e) => { e.preventDefault(); void send(text); }}>
                <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} maxLength={2000} placeholder="اكتب سؤالك عن محتوى الملفات..."
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(text); } }} />
                <Button type="submit" size="lg" disabled={sending || !text.trim()}><Send className="h-5 w-5 rotate-180" /></Button>
              </form>
            </section>

            {examMounted && (
              <section hidden={tab !== "exam"}>
                <SafeBoundary name="ExamCreatorWizard">
                  <ExamCreatorWizard locked={{ files: agent.files, subject: agent.subject ?? undefined, grade: agent.grade ?? undefined, request: examRequest, label: agent.name }} />
                </SafeBoundary>
              </section>
            )}
          </>
        )}
      </main>
      <SafeBoundary name="Footer"><Footer /></SafeBoundary>
    </div>
  );
}

function Bubble({ role, children }: { role: "user" | "assistant"; children: React.ReactNode }) {
  const mine = role === "user";
  return (
    <div className={`flex items-start gap-2 ${mine ? "flex-row" : "flex-row"}`}>
      <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${mine ? "bg-slate-200 text-slate-700" : "bg-primary/10 text-primary"}`}>
        {mine ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${mine ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{children}</div>
    </div>
  );
}
