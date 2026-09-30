/**
 * Intelligent File Parser Service for Educational Documents
 * Extracts clean, pedagogical text from PDF, DOCX, TXT, and Markdown files.
 * Uses Mammoth, PDF.js, Pako stream decompression, and Arabic Unicode Hex decoding.
 */
import JSZip from 'jszip';
import pako from 'pako';
import mammoth from 'mammoth';

export interface ParsedDocumentResult {
  fileName: string;
  fileSize: number;
  fileType: 'pdf' | 'docx' | 'txt' | 'md' | 'image' | 'unknown';
  extractedText: string;
  wordCount: number;
  characterCount: number;
  previewSnippet: string;
  topicsSummary: string[];
}

export class FileParserService {
  /**
   * Parse an uploaded file based on its MIME type and extension
   */
  public async parseFile(file: File): Promise<ParsedDocumentResult> {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    let extractedText = '';
    let fileType: ParsedDocumentResult['fileType'] = 'unknown';

    if (extension === 'txt' || extension === 'md' || file.type.includes('text')) {
      fileType = extension === 'md' ? 'md' : 'txt';
      extractedText = await this.readTextFile(file);
    } else if (extension === 'docx' || file.type.includes('wordprocessingml')) {
      fileType = 'docx';
      extractedText = await this.readDocxFile(file);
    } else if (extension === 'pdf' || file.type.includes('pdf')) {
      fileType = 'pdf';
      extractedText = await this.readPdfFile(file);
    } else if (file.type.startsWith('image/')) {
      fileType = 'image';
      extractedText = await this.readImageFileWithOcr(file);
    } else {
      // Fallback text read
      extractedText = await this.readTextFile(file);
    }

    // Clean text and extract metrics
    const cleanedText = this.cleanExtractedText(extractedText);
    const words = cleanedText.trim() ? cleanedText.trim().split(/\s+/) : [];
    const wordCount = words.length;
    const characterCount = cleanedText.length;
    const previewSnippet = cleanedText.slice(0, 450) + (cleanedText.length > 450 ? '...' : '');
    const topicsSummary = this.extractTopicKeywords(cleanedText, file.name);

    return {
      fileName: file.name,
      fileSize: file.size,
      fileType,
      extractedText: cleanedText,
      wordCount,
      characterCount,
      previewSnippet,
      topicsSummary
    };
  }

  /**
   * Read plain text or markdown file
   */
  private readTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || '');
      reader.onerror = () => reject(new Error('فشل قراءة الملف النصي'));
      reader.readAsText(file, 'UTF-8');
    });
  }

  /**
   * Read and parse Microsoft Word (.docx) files using Mammoth + JSZip fallback
   */
  private async readDocxFile(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      // Primary: Mammoth extraction
      try {
        const mammothResult = await mammoth.extractRawText({ arrayBuffer });
        if (mammothResult.value && mammothResult.value.trim().length > 15) {
          return mammothResult.value;
        }
      } catch (mErr) {
        console.warn('Mammoth docx parse fallback:', mErr);
      }

      // Secondary: JSZip XML parse
      const zip = await JSZip.loadAsync(file);
      const documentXml = await zip.file('word/document.xml')?.async('text');

      if (!documentXml) {
        throw new Error('لم يتم العثور على محتوى document.xml داخل ملف Word');
      }

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(documentXml, 'application/xml');
      
      const paragraphs = xmlDoc.getElementsByTagName('w:p');
      const lines: string[] = [];

      for (let i = 0; i < paragraphs.length; i++) {
        const textNodes = paragraphs[i].getElementsByTagName('w:t');
        let paragraphText = '';
        for (let j = 0; j < textNodes.length; j++) {
          paragraphText += textNodes[j].textContent || '';
        }
        if (paragraphText.trim()) {
          lines.push(paragraphText.trim());
        }
      }

      return lines.join('\n');
    } catch (err: any) {
      console.warn('DOCX parse error, falling back to text read:', err);
      return await this.readTextFile(file);
    }
  }

  /**
   * Read and parse PDF files using PDF.js worker, Pako stream decompression, and Hex Unicode decoding
   */
  private async readPdfFile(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();

    // 1. First Priority: PDF.js with CDN Worker
    try {
      const pdfjs = await import('pdfjs-dist/build/pdf.mjs');
      if (pdfjs && pdfjs.getDocument) {
        try {
          if (pdfjs.GlobalWorkerOptions && !pdfjs.GlobalWorkerOptions.workerSrc) {
            pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version || '5.7.284'}/build/pdf.worker.min.mjs`;
          }
        } catch {}

        const loadingTask = pdfjs.getDocument({
          data: new Uint8Array(arrayBuffer),
          useSystemFonts: true,
          isEvalSupported: false
        });

        const pdf = await loadingTask.promise;
        let fullText = '';

        for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 60); pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str || '')
            .join(' ');
          if (pageText.trim()) {
            fullText += `[صفحة ${pageNum}]\n${pageText}\n\n`;
          }
        }

        if (fullText.trim().length > 25) {
          return fullText;
        }

        // Try OCR on scanned PDF pages if digital text is empty
        const ocrText = await this.ocrPdfPages(pdf, 5);
        if (ocrText && ocrText.trim().length > 25) {
          return ocrText;
        }
      }
    } catch (pdfErr) {
      console.warn('PDF.js extraction failed, falling back to direct stream inflator:', pdfErr);
    }

    // 2. Second Priority: Pako Stream Decompressor & Hex Unicode Decoder
    try {
      const pakoText = this.extractTextFromPdfBinaryWithPako(arrayBuffer);
      if (pakoText && pakoText.trim().length > 25) {
        return pakoText;
      }
    } catch (pakoErr) {
      console.warn('Pako stream decompression failed:', pakoErr);
    }

    // 3. Third Priority: Raw Latin string scanning
    const decoder = new TextDecoder('utf-8');
    const rawString = decoder.decode(new Uint8Array(arrayBuffer));
    const rawMatches = this.extractStringsFromPdfText(rawString);
    if (rawMatches && rawMatches.trim().length > 25) {
      return rawMatches;
    }

    return `وثيقة منهاج تعليمية (${file.name}): تحتوي على نصوص ومفاهيم الدرس.`;
  }

  /**
   * Run OCR on scanned PDF pages by rendering them to off-screen canvas
   */
  private async ocrPdfPages(pdf: any, maxPages: number): Promise<string> {
    try {
      if (typeof document === 'undefined') return '';
      const Tesseract = (await import('tesseract.js')).default;
      let combinedOcr = '';
      const pagesToScan = Math.min(pdf.numPages || 1, maxPages);

      for (let pageNum = 1; pageNum <= pagesToScan; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            await page.render({ canvasContext: ctx, viewport }).promise;
            const res = await Tesseract.recognize(canvas, 'ara+eng');
            if (res?.data?.text && res.data.text.trim().length > 10) {
              combinedOcr += `[صفحة ${pageNum} (OCR)]\n${res.data.text.trim()}\n\n`;
            }
          }
        } catch {}
      }
      return combinedOcr;
    } catch {
      return '';
    }
  }

  /**
   * Perform Optical Character Recognition (OCR) on an image file
   */
  private async readImageFileWithOcr(file: File): Promise<string> {
    try {
      const Tesseract = (await import('tesseract.js')).default;
      const res = await Tesseract.recognize(file, 'ara+eng');
      if (res?.data?.text && res.data.text.trim().length > 5) {
        return res.data.text.trim();
      }
    } catch (err) {
      console.warn('Image OCR error:', err);
    }
    return `صورة تعليمية (${file.name})`;
  }

  /**
   * Decompresses all PDF streams using Pako and extracts Latin/Arabic text and Unicode Hex strings
   */
  private extractTextFromPdfBinaryWithPako(buffer: ArrayBuffer): string {
    const uint8 = new Uint8Array(buffer);
    const extractedBlocks: string[] = [];

    let idx = 0;
    while (idx < uint8.length) {
      // Find 'stream'
      let streamPos = -1;
      for (let i = idx; i < uint8.length - 6; i++) {
        if (
          uint8[i] === 115 && // s
          uint8[i + 1] === 116 && // t
          uint8[i + 2] === 114 && // r
          uint8[i + 3] === 101 && // e
          uint8[i + 4] === 97 && // a
          uint8[i + 5] === 109 // m
        ) {
          streamPos = i + 6;
          break;
        }
      }
      if (streamPos === -1) break;

      // Skip newline after stream keyword (\r\n or \n)
      if (uint8[streamPos] === 13) streamPos++;
      if (uint8[streamPos] === 10) streamPos++;

      // Find 'endstream'
      let endPos = -1;
      for (let j = streamPos; j < uint8.length - 9; j++) {
        if (
          uint8[j] === 101 && // e
          uint8[j + 1] === 110 && // n
          uint8[j + 2] === 100 && // d
          uint8[j + 3] === 115 && // s
          uint8[j + 4] === 116 && // t
          uint8[j + 5] === 114 && // r
          uint8[j + 6] === 101 && // e
          uint8[j + 7] === 97 && // a
          uint8[j + 8] === 109 // m
        ) {
          endPos = j;
          break;
        }
      }
      if (endPos === -1) break;

      let actualEnd = endPos;
      while (actualEnd > streamPos && (uint8[actualEnd - 1] === 10 || uint8[actualEnd - 1] === 13 || uint8[actualEnd - 1] === 32)) {
        actualEnd--;
      }

      const chunk = uint8.slice(streamPos, actualEnd);
      idx = endPos + 9;

      let rawStream = '';
      try {
        const decompressed = pako.inflate(chunk);
        rawStream = new TextDecoder('utf-8').decode(decompressed);
      } catch {
        rawStream = new TextDecoder('latin1').decode(chunk);
      }

      const streamText = this.extractStringsFromPdfText(rawStream);
      if (streamText.trim()) {
        extractedBlocks.push(streamText.trim());
      }
    }

    return extractedBlocks.join('\n\n');
  }

  /**
   * Extract text from raw PDF stream operators: (...) Tj, [(...)] TJ, <hex> Tj
   */
  private extractStringsFromPdfText(raw: string): string {
    const lines: string[] = [];

    // 1. Match parentheses (text) Tj
    const regexTj = /\(([^)]+)\)\s*(?:Tj|'|")/g;
    let match;
    while ((match = regexTj.exec(raw)) !== null) {
      const txt = match[1].replace(/\\([()\\])/g, '$1').trim();
      if (txt.length > 1 && !txt.startsWith('/') && !txt.match(/^[0-9A-Za-z_-]{1,3}$/)) {
        lines.push(txt);
      }
    }

    // 2. Match array text [(...)] TJ
    const regexArray = /\[([^\]]+)\]\s*TJ/g;
    while ((match = regexArray.exec(raw)) !== null) {
      const inner = match[1];
      const partRegex = /\(([^)]+)\)/g;
      let part;
      let lineParts = '';
      while ((part = partRegex.exec(inner)) !== null) {
        lineParts += part[1].replace(/\\([()\\])/g, '$1') + ' ';
      }
      if (lineParts.trim().length > 2) {
        lines.push(lineParts.trim());
      }
    }

    // 3. Match Unicode Hex strings <06270644...> Tj (Common in Arabic PDFs)
    const regexHex = /<([0-9a-fA-F]{4,})>\s*(?:Tj|'|")/g;
    while ((match = regexHex.exec(raw)) !== null) {
      const decodedHex = this.decodePdfHexString(match[1]);
      if (decodedHex.trim().length > 1) {
        lines.push(decodedHex.trim());
      }
    }

    return lines.join('\n');
  }

  /**
   * Decode UTF-16BE hex strings into Arabic characters
   */
  private decodePdfHexString(hex: string): string {
    hex = hex.replace(/\s+/g, '');
    if (hex.length % 2 !== 0) hex += '0';
    if (hex.length >= 4) {
      const chars: string[] = [];
      for (let i = 0; i < hex.length; i += 4) {
        const code = parseInt(hex.substring(i, i + 4), 16);
        if (!isNaN(code) && code > 0) {
          chars.push(String.fromCharCode(code));
        }
      }
      return chars.join('');
    }
    return '';
  }

  /**
   * Clean extracted text and remove control artifacts
   */
  private cleanExtractedText(text: string): string {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();
  }

  /**
   * Extract meaningful topic keywords and headings from the document
   */
  private extractTopicKeywords(text: string, fileName?: string): string[] {
    const keywords: string[] = [];

    // 1. Match headings like "الوحدة الأولى: ..." or "الفصل الثاني: ..." or "الدرس: ..."
    const unitMatches = text.match(/الوحدة\s+(?:الأولى|الثانية|الثالثة|الرابعة|الخامسة|السادسة|السابعة|الثامنة|[٠-٩\d]+)[^:\n]*[:\-]?\s*([^\n.؛]{3,50})/g);
    if (unitMatches) {
      unitMatches.forEach(m => keywords.push(m.trim()));
    }

    const lessonMatches = text.match(/(?:الدرس|الفصل|موضوع|قانون|مبدأ|نظرية)\s+([^\n.؛]{3,45})/g);
    if (lessonMatches) {
      lessonMatches.slice(0, 4).forEach(m => keywords.push(m.trim()));
    }

    // 2. High-value scientific concept candidates
    const candidates = [
      'الحث الكهرومغناطيسي', 'قانون فاراداي', 'قانون لنز', 'الظاهرة الكهروضوئية',
      'ميكانيكا الكم', 'نموذج بور', 'أطياف الانبعاث', 'الاتزان الكيميائي',
      'الحموض والقواعد', 'المحلول المنظم', 'الخلايا الجلفانية', 'تأكسد واختزال',
      'الوراثة المندلية', 'تضاعف DNA', 'بناء البروتين', 'السيال العصبي',
      'قواعد الاشتقاق', 'المعدلات المرتبطة بالزمن', 'تطبيقات القيم القصوى', 'التكامل',
      'المتحكمات الدقيقة', 'برمجة أردوينو', 'الحساسات الرقمية', 'Pearson BTEC'
    ];

    for (const kw of candidates) {
      if (text.includes(kw) && !keywords.includes(kw)) {
        keywords.push(kw);
      }
    }

    // 3. Fallback to clean file name if keywords are sparse
    if (keywords.length === 0 && fileName) {
      const cleanName = fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      keywords.push(cleanName);
    }

    return keywords.length > 0 ? Array.from(new Set(keywords)).slice(0, 5) : ['المحتوى العلمي المرفق'];
  }
}

export const fileParserService = new FileParserService();
