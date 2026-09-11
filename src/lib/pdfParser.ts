export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  let extractedText = '';

  // Pass 1: Try PDFParse Class (pdf-parse v2 API)
  try {
    const pdfModule = require('pdf-parse');
    if (pdfModule && pdfModule.PDFParse) {
      const parser = new pdfModule.PDFParse({ data: new Uint8Array(buffer), verbosity: 0 });
      await parser.load();
      const textResult = await parser.getText();
      if (typeof textResult === 'string') {
        extractedText = textResult;
      } else if (textResult && typeof textResult.text === 'string') {
        extractedText = textResult.text;
      } else if (textResult && Array.isArray(textResult.pages)) {
        extractedText = textResult.pages.map((p: any) => p.text || '').join('\n');
      }
    }
  } catch (err) {
    console.warn('[PDFParse Class Engine Warning]', err);
  }

  // Pass 2: Try pdf-parse Legacy Function Export
  if (!extractedText || extractedText.trim().length < 15) {
    try {
      const pdfModule = require('pdf-parse');
      const parseFn = typeof pdfModule === 'function' ? pdfModule : (pdfModule.default || pdfModule.pdf);
      if (typeof parseFn === 'function') {
        const data = await parseFn(buffer);
        if (data && data.text) {
          extractedText = data.text;
        }
      }
    } catch (err) {
      console.warn('[PDFParse Legacy Function Engine Warning]', err);
    }
  }

  // Pass 3: Direct Stream & Literal Text Token Extraction (Failsafe for custom/Canva PDFs)
  if (!extractedText || extractedText.trim().length < 15) {
    try {
      const textChunks: string[] = [];
      const rawStr = buffer.toString('binary');

      // Extract literal strings: (Text here)
      const literalMatches = rawStr.match(/\(([^()]{2,})\)/g);
      if (literalMatches) {
        literalMatches.forEach(m => {
          const clean = m.slice(1, -1).replace(/\\([()])/g, '$1').replace(/\\[nrtbf]/g, ' ').trim();
          if (clean.length >= 2 && /[a-zA-Z0-9]/.test(clean) && !clean.startsWith('/') && !clean.includes('Font') && !clean.includes('MediaBox')) {
            textChunks.push(clean);
          }
        });
      }

      // Extract hex encoded strings: <4a6f686e>
      const hexMatches = rawStr.match(/<([0-9a-fA-F]{4,})>/g);
      if (hexMatches) {
        hexMatches.forEach(h => {
          const hex = h.slice(1, -1);
          if (hex.length % 2 === 0 && hex.length < 500) {
            try {
              const decoded = Buffer.from(hex, 'hex').toString('utf8').trim();
              if (decoded.length >= 2 && /[a-zA-Z0-9]/.test(decoded)) {
                textChunks.push(decoded);
              }
            } catch {}
          }
        });
      }

      if (textChunks.length > 0) {
        extractedText = Array.from(new Set(textChunks)).join(' ');
      }
    } catch (err) {
      console.warn('[PDF Stream Text Extractor Warning]', err);
    }
  }

  return extractedText ? extractedText.trim() : '';
}
