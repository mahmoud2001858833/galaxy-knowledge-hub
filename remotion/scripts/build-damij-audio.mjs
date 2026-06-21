// Generate Arabic narration MP3 via Lovable AI gateway TTS
// Output: remotion/public/audio/damij-vo-ar.mp3
import fs from "node:fs";
import path from "node:path";

const KEY = process.env.LOVABLE_API_KEY;
if (!KEY) { console.error("Missing LOVABLE_API_KEY"); process.exit(1); }

const SCENES = [
  // [delaySeconds before this chunk starts within scene, text]
  // Scene 0 cover (0-15s)
  { startSec: 2, text: "بسم الله الرحمن الرحيم. من قلب الأردن، من مدرسة عنبه الثانوية الشاملة للبنين، نقدم لكم منظومة دامج الرقمية الشاملة." },
  // Scene 1 (15-75s)
  { startSec: 17, text: "دامج منصة سيادية ذكية، تعيد تعريف الدمج الرقمي، وتحول ذوي الإعاقة من فئة مستقبلة إلى شركاء في صناعة المعرفة." },
  { startSec: 30, text: "ثمانية أنظمة ذكية متكاملة: عين الأعمى للملاحة البصرية، وبرايل لتعلم الكتابة النافرة، وترجمة الإشارة بالزمن الحقيقي، ومنظومة تأهيل فرط الحركة وتشتت الانتباه، وجسر الحواس التكيفي، والمختبر السريري الافتراضي المعمق، ومنظومة التوحد، ومنظومة الإدارة." },
  { startSec: 60, text: "ابتكارنا ليس في الميزات، بل في دمجها جميعاً تحت خوارزميات عصبية واحدة، تخدم خمس فئات من ذوي الإعاقة في منصة واحدة مفتوحة المصدر." },
  // Scene 2 (75-145s)
  { startSec: 77, text: "دامج ينقل الطالب من مستهلك تكنولوجيا إلى قائد حلول. ارتكز المشروع على إرث نجاح ذروة العلم، الذي أتقن خلاله خمسة عشر طالباً لغتين برمجيتين كاملتين، وأساسيات هندسة البرمجيات وقواعد البيانات." },
  { startSec: 108, text: "عبر هذه الجائزة، سنؤهل ثلاثين طالباً جديداً في الذكاء الاصطناعي والأمن السيبراني، ليكونوا الظهر البرمجي المستدام لمنصة دامج." },
  { startSec: 128, text: "طلابنا يتعلمون أن التكنولوجيا مسؤولية أخلاقية، وأن ريادة الأعمال الحقيقية تبدأ بحل معاناة إنسان." },
  // Scene 3 (145-220s)
  { startSec: 147, text: "صممت دامج لتعيش سنوات لا أشهراً. منحة الجائزة البالغة مئة وخمسين ألف دولار كافية تماماً لتشغيل المنصة خمس سنوات كاملة دون انقطاع، إذ لا تتجاوز الكلفة التشغيلية خمسمئة وخمسين دولاراً شهرياً." },
  { startSec: 173, text: "نموذجنا المالي تبادلي ذكي: مجاني مئة بالمئة للأسر والمدارس الحكومية، ومدفوع للجامعات الطبية والمدارس الدولية عبر اشتراكات B2B، مع ترخيص خوارزمياتنا للشركات التقنية مستقبلاً." },
  { startSec: 195, text: "وزارة التربية والتعليم الأردنية تبنت المنصة رسمياً لتعميمها على مدارس المملكة وجامعاتها. ونال المشروع إشادة سامية من سمو الأمير الحسن بن طلال حفظه الله. أكثر من خمسين ألف مستفيد نشط خلال ثلاث سنوات." },
  // Scene 4 (220-290s)
  { startSec: 222, text: "مدرسة عنبه ليست مرشحة بفكرة، بل بسجل نجاح موثق على مستوى المملكة. فريقنا الطلابي قاد مشروع ذروة العلم الذي يدرس دمجه رسمياً في منصة أجيال الحكومية، وبنى خمسة عشر بالمئة من منظومة دامج بنفقته الشخصية، وحصد المركز الأول في البحث العلمي بالمملكة لعام ألفين وستة وعشرين." },
  { startSec: 258, text: "أيد المنصة أكثر من خمسمئة متخصص، واعتمدها أربعة صروح طبية كبرى: وزارة الصحة، ومستشفى الملك المؤسس الجامعي، ومستشفى الأميرة بسمة، ومستشفى رحمة التعليمي للأطفال. ومدرستنا حائزة على جائزة الحسن بن طلال للتميز العلمي، وجائزة أنا موهوب، وأولمبياد الكيمياء الوطني." },
  // Scene 5 CTA (290-305s)
  { startSec: 292, text: "من قلب الأردن، إلى الشرق الأوسط، إلى العالم. دامج، جسر العدالة الرقمية الشامل. ترسيخاً لإرث الأب المؤسس الشيخ زايد بن سلطان آل نهيان، طيب الله ثراه. شكراً لكم." },
];

const SAMPLE_RATE = 24000;
const TOTAL_SEC = 305;
const totalSamples = SAMPLE_RATE * TOTAL_SEC;
const pcm = new Int16Array(totalSamples); // mono 16-bit, init silence

async function ttsPCM(text, instructions) {
  const r = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini-tts",
      input: text,
      voice: "verse",
      response_format: "pcm",
      instructions,
      speed: 1.0,
    }),
  });
  if (!r.ok) throw new Error(`TTS ${r.status}: ${await r.text()}`);
  const buf = Buffer.from(await r.arrayBuffer());
  return new Int16Array(buf.buffer, buf.byteOffset, buf.byteLength / 2);
}

const instructions = "Speak in clear, formal Modern Standard Arabic (Fusha). Tone: warm, confident, inspirational, dignified — like a documentary narrator. Pace: moderate.";

for (const [i, sc] of SCENES.entries()) {
  process.stdout.write(`[${i + 1}/${SCENES.length}] @${sc.startSec}s ... `);
  try {
    const samples = await ttsPCM(sc.text, instructions);
    const offset = Math.floor(sc.startSec * SAMPLE_RATE);
    const end = Math.min(offset + samples.length, totalSamples);
    for (let j = 0; j < end - offset; j++) pcm[offset + j] = samples[j];
    console.log(`${samples.length} samples (${(samples.length / SAMPLE_RATE).toFixed(1)}s)`);
  } catch (e) {
    console.log("FAIL", e.message);
  }
}

// Write as WAV then convert to MP3 via ffmpeg
const outDir = path.resolve("remotion/public/audio");
fs.mkdirSync(outDir, { recursive: true });
const wavPath = path.join(outDir, "damij-vo-ar.wav");

const headerSize = 44;
const dataSize = pcm.length * 2;
const wav = Buffer.alloc(headerSize + dataSize);
wav.write("RIFF", 0);
wav.writeUInt32LE(36 + dataSize, 4);
wav.write("WAVE", 8);
wav.write("fmt ", 12);
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(SAMPLE_RATE, 24);
wav.writeUInt32LE(SAMPLE_RATE * 2, 28);
wav.writeUInt16LE(2, 32);
wav.writeUInt16LE(16, 34);
wav.write("data", 36);
wav.writeUInt32LE(dataSize, 40);
Buffer.from(pcm.buffer, pcm.byteOffset, dataSize).copy(wav, headerSize);
fs.writeFileSync(wavPath, wav);
console.log("WAV written:", wavPath, wav.length, "bytes");
