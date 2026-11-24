-- مكتبة المراجع: كتب يرفعها فريق «رفع الملفات» (دور file_manager)، تُخزَّن في Cloudflare R2،
-- ويُستخرج نصها ويُقسَّم إلى مقاطع قابلة للبحث ليستعملها الذكاء الاصطناعي التعليمي كمصدر معرفة.
-- الوصول: الرفع والمعالجة عبر دوال الحافة (service role) بعد التحقق من الدور؛ القائمة تُرى للرفع الخاص بالعضو أو للقيادة.

CREATE TABLE public.reference_books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 300),
  original_filename text NOT NULL,
  mime_type text NOT NULL,
  size_bytes bigint NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 104857600),
  storage_key text NOT NULL UNIQUE,
  uploaded_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'uploading' CHECK (status IN ('uploading', 'processing', 'ready', 'failed')),
  extraction_method text CHECK (extraction_method IN ('text_layer', 'docx', 'ocr', 'mixed')),
  total_pages integer,
  processed_pages integer NOT NULL DEFAULT 0,
  extracted_chars integer NOT NULL DEFAULT 0,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);
CREATE INDEX reference_books_uploaded_by_idx ON public.reference_books (uploaded_by, created_at DESC);
CREATE INDEX reference_books_status_idx ON public.reference_books (status);

CREATE TABLE public.reference_book_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES public.reference_books(id) ON DELETE CASCADE,
  chunk_index integer NOT NULL,
  page_number integer,
  content text NOT NULL CHECK (length(content) BETWEEN 1 AND 6000),
  search tsvector GENERATED ALWAYS AS (to_tsvector('arabic', content)) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (book_id, chunk_index)
);
CREATE INDEX reference_book_chunks_search_idx ON public.reference_book_chunks USING gin (search);

ALTER TABLE public.reference_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reference_book_chunks ENABLE ROW LEVEL SECURITY;

-- القائمة: العضو يرى ما رفعه هو (لمتابعة الحالة)، والقيادة (الرئيس/المشرف) ترى كل شيء.
CREATE POLICY "uploader or lead reads reference books" ON public.reference_books
  FOR SELECT TO authenticated USING (uploaded_by = auth.uid() OR public.team_is_lead());
-- الحذف للقيادة فقط (يُنفَّذ عبر دالة الحافة لأنه يزيل الملف من R2 أيضاً).
CREATE POLICY "lead deletes reference books" ON public.reference_books
  FOR DELETE TO authenticated USING (public.team_is_lead());
-- لا سياسات على المقاطع: لا يصلها إلا service role عبر دوال الحافة.

-- بحث نصي في المقاطع الجاهزة فقط؛ لا يُنفَّذ إلا من service role (دوال الحافة).
CREATE OR REPLACE FUNCTION public.reference_books_search(p_query text, p_limit integer DEFAULT 6)
RETURNS TABLE (book_id uuid, book_title text, page_number integer, content text, rank real)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH q AS (SELECT websearch_to_tsquery('arabic', p_query) AS tsq)
  SELECT c.book_id, b.title, c.page_number, c.content, ts_rank(c.search, q.tsq) AS rank
  FROM public.reference_book_chunks c
  JOIN public.reference_books b ON b.id = c.book_id AND b.status = 'ready'
  CROSS JOIN q
  WHERE numnode(q.tsq) > 0 AND c.search @@ q.tsq
  ORDER BY rank DESC, c.book_id, c.chunk_index
  LIMIT least(greatest(coalesce(p_limit, 6), 1), 20)
$$;
REVOKE ALL ON FUNCTION public.reference_books_search(text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reference_books_search(text, integer) TO service_role;
