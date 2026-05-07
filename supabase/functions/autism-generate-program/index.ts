// Generates a 3-month interactive program (90 days × 10 games) ONCE per child.
// Uses AI ONLY for day-level themes; composes the 10 daily games deterministically
// from the registered templates to ensure variety and reliability.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TEMPLATES = [
  'bubble_tracking', 'look_with_me', 'emotion_cards', 'calm_sounds',
  'story_sequence', 'magic_mirror', 'change_the_rule', 'request_to_get',
  'social_choice', 'rhythm_turns', 'spot_difference', 'name_response',
];

const TEMPLATE_SKILLS: Record<string, string> = {
  bubble_tracking: 'انتباه بصري',
  look_with_me: 'انتباه مشترك',
  emotion_cards: 'تمييز المشاعر',
  calm_sounds: 'تنظيم حسي',
  story_sequence: 'تسلسل الأحداث',
  magic_mirror: 'التقليد',
  change_the_rule: 'مرونة معرفية',
  request_to_get: 'طلبات وظيفية',
  social_choice: 'مهارات اجتماعية',
  rhythm_turns: 'تبادل الأدوار',
  spot_difference: 'الانتباه للتفاصيل',
  name_response: 'الاستجابة للاسم',
};

const TEMPLATE_TITLES: Record<string, string> = {
  bubble_tracking: 'تتبّع الفقاعات',
  look_with_me: 'انظر معي',
  emotion_cards: 'بطاقات المشاعر',
  calm_sounds: 'الأصوات الهادئة',
  story_sequence: 'رتّب القصة',
  magic_mirror: 'المرآة السحرية',
  change_the_rule: 'غيّر القاعدة',
  request_to_get: 'اطلب لتحصل',
  social_choice: 'اختر الرد المناسب',
  rhythm_turns: 'الإيقاع المتبادل',
  spot_difference: 'اعثر على الفرق',
  name_response: 'استجابة للاسم',
};

const PHASES = [
  { range: [1, 14], theme: 'تأسيس الانتباه والاستجابة', focus: 'انتباه واستجابة', diff: 'easy' },
  { range: [15, 28], theme: 'التواصل المشترك والتقليد', focus: 'تواصل مشترك', diff: 'easy' },
  { range: [29, 45], theme: 'تمييز المشاعر والتعبير', focus: 'مشاعر وتعبير', diff: 'medium' },
  { range: [46, 60], theme: 'المرونة وتغيير القواعد', focus: 'مرونة معرفية', diff: 'medium' },
  { range: [61, 75], theme: 'مهارات اجتماعية ومحادثة', focus: 'مهارات اجتماعية', diff: 'hard' },
  { range: [76, 90], theme: 'الدمج والاستقلالية', focus: 'دمج اجتماعي', diff: 'hard' },
];

function getPhase(dayIdx: number) {
  return PHASES.find(p => dayIdx >= p.range[0] && dayIdx <= p.range[1]) ?? PHASES[0];
}

// Deterministic-but-varied template ordering for a day
function templatesForDay(dayIdx: number): string[] {
  // Rotate templates so each day starts at a different offset
  const offset = (dayIdx - 1) % TEMPLATES.length;
  const rotated = [...TEMPLATES.slice(offset), ...TEMPLATES.slice(0, offset)];
  // Build 10 games with no template repeated more than twice
  const out: string[] = [];
  let i = 0;
  while (out.length < 10) {
    const t = rotated[i % rotated.length];
    const count = out.filter(x => x === t).length;
    if (count < 2) out.push(t);
    i++;
    if (i > 200) break;
  }
  // Shuffle within the day with a deterministic seed for variety
  const seed = dayIdx * 7919;
  for (let j = out.length - 1; j > 0; j--) {
    const k = Math.floor(((Math.sin(seed + j) + 1) / 2) * (j + 1));
    [out[j], out[k]] = [out[k], out[j]];
  }
  return out;
}

function buildGamesForDay(dayIdx: number, phase: typeof PHASES[number], occurrenceMap: Map<string, number>) {
  const templates = templatesForDay(dayIdx);
  return templates.map((tid, idx) => {
    const occ = (occurrenceMap.get(tid) ?? 0) + 1;
    occurrenceMap.set(tid, occ);
    const variant = (occ % 3); // creates micro-variations
    const baseDuration = phase.diff === 'easy' ? 60 : phase.diff === 'medium' ? 75 : 90;
    return {
      template_id: tid,
      title_ar: `${TEMPLATE_TITLES[tid]} • مستوى ${dayIdx}`,
      instructions_ar: `جلسة ${TEMPLATE_TITLES[tid]} ضمن مرحلة "${phase.theme}". ركّز على ${TEMPLATE_SKILLS[tid]} مع تشجيع لفظي مستمر.`,
      target_skill_ar: TEMPLATE_SKILLS[tid],
      difficulty: phase.diff,
      duration_sec: baseDuration + variant * 10,
      success_criteria_ar: 'أداء صحيح في 60% من المحاولات على الأقل مع تفاعل مرئي.',
      adaptations_ar: [
        'خفّض المحفّزات البصرية والصوتية إذا ظهر إرهاق حسي.',
        'قسّم الجلسة إلى دفعات قصيرة مع فواصل قصيرة.',
        'استخدم تعزيزاً اجتماعياً فورياً لكل استجابة صحيحة.',
      ],
      order_index: idx,
    };
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const body = await req.json();
    const { profile, childProfileId } = body;
    const totalDays = 90; // ثابت: 3 أشهر
    if (!profile || !childProfileId) {
      return new Response(JSON.stringify({ error: 'profile + childProfileId مطلوبان' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Auth
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const userResp = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { Authorization: authHeader, apikey: serviceKey },
    });
    if (!userResp.ok) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const { id: userId } = await userResp.json();

    // Check existing active program (idempotent)
    const existingResp = await fetch(
      `${supabaseUrl}/rest/v1/autism_programs?child_profile_id=eq.${childProfileId}&status=eq.active&select=id,share_token&limit=1`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } },
    );
    const existing = await existingResp.json();
    if (Array.isArray(existing) && existing.length > 0) {
      return new Response(JSON.stringify({ programId: existing[0].id, shareToken: existing[0].share_token, existing: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Compose program locally — fast and reliable
    const programTitle = `برنامج علاجي تفاعلي لـ ${profile.child_name ?? 'الطفل'} (3 أشهر)`;
    const programSummary = `جدول يومي لمدة 90 يوماً، 10 ألعاب يومياً متنوّعة عبر 6 مراحل تدرّجية تغطّي الانتباه والتواصل والمشاعر والمرونة والمهارات الاجتماعية. مخصّص لمستوى الدعم ${profile.support_level ?? 1}.`;

    const insProgramResp = await fetch(`${supabaseUrl}/rest/v1/autism_programs`, {
      method: 'POST',
      headers: {
        apikey: serviceKey, Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json', Prefer: 'return=representation',
      },
      body: JSON.stringify({
        user_id: userId, child_profile_id: childProfileId,
        total_days: totalDays, title_ar: programTitle, summary_ar: programSummary,
      }),
    });
    if (!insProgramResp.ok) throw new Error(`insert program ${insProgramResp.status}: ${await insProgramResp.text()}`);
    const [progRow] = await insProgramResp.json();

    // Insert all 90 days in one batch
    const dayRows = [];
    for (let d = 1; d <= totalDays; d++) {
      const phase = getPhase(d);
      dayRows.push({
        program_id: progRow.id,
        day_index: d,
        theme_ar: `يوم ${d}: ${phase.theme}`,
        focus_skill_ar: phase.focus,
        rationale_ar: `يوم ضمن مرحلة "${phase.theme}" يعزّز ${phase.focus} عبر 10 ألعاب متدرّجة.`,
      });
    }
    const insDaysResp = await fetch(`${supabaseUrl}/rest/v1/autism_program_days`, {
      method: 'POST',
      headers: {
        apikey: serviceKey, Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json', Prefer: 'return=representation',
      },
      body: JSON.stringify(dayRows),
    });
    if (!insDaysResp.ok) throw new Error(`insert days ${insDaysResp.status}: ${await insDaysResp.text()}`);
    const insertedDays: any[] = await insDaysResp.json();
    const dayIdByIndex = new Map<number, string>();
    insertedDays.forEach((r: any) => dayIdByIndex.set(r.day_index, r.id));

    // Build all games (900) and insert in batches of 200
    const occurrenceMap = new Map<string, number>();
    const allGames: any[] = [];
    for (let d = 1; d <= totalDays; d++) {
      const phase = getPhase(d);
      const games = buildGamesForDay(d, phase, occurrenceMap);
      const dayId = dayIdByIndex.get(d);
      games.forEach(g => allGames.push({
        day_id: dayId,
        order_index: g.order_index,
        template_id: g.template_id,
        title_ar: g.title_ar,
        instructions_ar: g.instructions_ar,
        target_skill_ar: g.target_skill_ar,
        difficulty: g.difficulty,
        duration_sec: g.duration_sec,
        success_criteria_ar: g.success_criteria_ar,
        adaptations_ar: g.adaptations_ar,
      }));
    }

    const BATCH = 200;
    for (let i = 0; i < allGames.length; i += BATCH) {
      const slice = allGames.slice(i, i + BATCH);
      const r = await fetch(`${supabaseUrl}/rest/v1/autism_program_games`, {
        method: 'POST',
        headers: {
          apikey: serviceKey, Authorization: `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(slice),
      });
      if (!r.ok) throw new Error(`insert games batch ${i}: ${r.status}: ${await r.text()}`);
    }

    return new Response(JSON.stringify({ programId: progRow.id, shareToken: progRow.share_token, totalDays, totalGames: allGames.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('autism-generate-program', e);
    const msg = e instanceof Error ? e.message : 'error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
