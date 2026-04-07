import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import type { FormFields, OverlayOptions } from "./formTypes";

/**
 * Coordinates match `public/sample.pdf` (612×792 pt, bottom-left origin).
 */
const BODY = 11;
const NARROW = 10;

/**
 * "Congratulations!" baseline ≈ 636.5 (caps extend a bit above). The old whiteout
 * used height fontSize+8 from yBaseline-4, which reached ~baseline+15 — so the
 * **Dear** line (622.9) erase box went up to ~638 and painted over Congratulations.
 * Use a tight band around the baseline only.
 */
const PAGE3_SAFE_Y = 643;

function whiteout(
  page: PDFPage,
  x: number,
  yBaseline: number,
  width: number,
  fontSize: number,
): void {
  const descenderPad = 2.5;
  const ascender = fontSize * 0.85;
  page.drawRectangle({
    x: x - 2,
    y: yBaseline - descenderPad,
    width,
    height: ascender + descenderPad,
    color: rgb(1, 1, 1),
    borderWidth: 0,
  });
}

function drawLine(
  page: PDFPage,
  font: PDFFont,
  text: string,
  x: number,
  yBaseline: number,
  size: number,
  coverWidth: number,
): void {
  whiteout(page, x, yBaseline, coverWidth, size);
  page.drawText(text, { x, y: yBaseline, size, font, color: rgb(0, 0, 0) });
}

function wrapToWidth(
  font: PDFFont,
  text: string,
  size: number,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let idx = 0;

  while (idx < words.length && lines.length < maxLines) {
    let line = words[idx] as string;
    idx += 1;
    while (idx < words.length) {
      const next = `${line} ${words[idx]}`;
      if (font.widthOfTextAtSize(next, size) <= maxWidth) {
        line = next;
        idx += 1;
      } else {
        break;
      }
    }
    lines.push(line);
  }

  if (idx < words.length && lines.length > 0) {
    let last = lines[lines.length - 1] ?? "";
    const ell = "…";
    while (
      last.length > 0 &&
      font.widthOfTextAtSize(last + ell, size) > maxWidth
    ) {
      last = last.slice(0, -1);
    }
    lines[lines.length - 1] = last + ell;
  }

  return lines.length > 0 ? lines : [text];
}

/** Address sits above "Congratulations!" — only 2 wrapped lines fit safely. */
function drawAddressSafe(
  page: PDFPage,
  font: PDFFont,
  address: string,
  x: number,
  yFirstBaseline: number,
  size: number,
  maxWidth: number,
): void {
  const oneLine = `Address – ${address.replace(/\r\n/g, " ").replace(/\s+/g, " ").trim()}`;
  const lineHeight = size * 1.12;
  let lines = wrapToWidth(font, oneLine, size, maxWidth, 2);
  let lastBaseline = yFirstBaseline - (lines.length - 1) * lineHeight;
  if (lastBaseline < PAGE3_SAFE_Y) {
    lines = wrapToWidth(font, oneLine, size, maxWidth, 1);
    lastBaseline = yFirstBaseline;
  }

  const desc = 2.5;
  const asc = size * 0.85;
  const yBottom = Math.max(PAGE3_SAFE_Y - 1, lastBaseline - desc);
  const yTopUncapped = yFirstBaseline + asc + 3;
  const yTop = Math.min(yTopUncapped, 676.5);
  page.drawRectangle({
    x: x - 2,
    y: yBottom,
    width: maxWidth + 4,
    height: yTop - yBottom,
    color: rgb(1, 1, 1),
    borderWidth: 0,
  });

  let yy = yFirstBaseline;
  for (const ln of lines) {
    page.drawText(ln, { x, y: yy, size, font, color: rgb(0, 0, 0) });
    yy -= lineHeight;
  }
}

function drawInline(
  page: PDFPage,
  font: PDFFont,
  text: string,
  x: number,
  yBaseline: number,
  size: number,
  coverWidth: number,
): void {
  whiteout(page, x, yBaseline, coverWidth, size);
  page.drawText(text, { x, y: yBaseline, size, font, color: rgb(0, 0, 0) });
}

export async function buildEditedPdf(
  templateUrl: string,
  data: FormFields,
  options: OverlayOptions,
): Promise<Uint8Array> {
  const response = await fetch(templateUrl);
  if (!response.ok) {
    throw new Error(`Failed to load PDF template (${response.status})`);
  }
  const bytes = await response.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();

  const ox = options.offsetX;
  const oy = options.offsetY;

  const page2 = pages[1];
  const page3 = pages[2];
  const page5 = pages[4];

  if (!page2 || !page3 || !page5) {
    throw new Error("Template must have at least 5 pages (offer letter format).");
  }

  const ref = data.refNo?.trim();
  if (ref) {
    drawLine(
      page2,
      font,
      `REF NO: ${ref}`,
      26.4 + ox,
      693.2 + oy,
      BODY,
      520,
    );
  }

  const name = data.name?.trim();
  if (name) {
    drawLine(page3, font, `Name – ${name}`, 49.6 + ox, 678.1 + oy, BODY, 520);
    drawLine(page3, font, `Dear, ${name}`, 49.6 + ox, 622.9 + oy, BODY, 520);
    drawInline(page5, font, name, 90.5 + ox, 324.4 + oy, BODY, 220);
  }

  const address = data.address?.trim();
  if (address) {
    drawAddressSafe(
      page3,
      font,
      address,
      49.6 + ox,
      664.3 + oy,
      BODY,
      500,
    );
  }

  const subject = data.subject?.trim();
  if (subject) {
    drawLine(page3, font, `SUB: ${subject}`, 49.6 + ox, 595.3 + oy, BODY, 520);
  }

  const salary = data.salary?.trim();
  if (salary) {
    drawLine(
      page3,
      font,
      `Stack Developer on Salary of Rs – ${salary}/- for 3 month and there after depend on`,
      49.6 + ox,
      553.9 + oy,
      BODY,
      520,
    );
  }

  const email = data.email?.trim();
  if (email) {
    drawInline(page5, font, email, 89.1 + ox, 311.9 + oy, NARROW, 340);
  }

  const mobile = data.mobile?.trim();
  if (mobile) {
    const line =
      mobile.startsWith("+") || mobile.startsWith("91")
        ? mobile
        : `+91-${mobile}`;
    drawInline(page5, font, line, 91.9 + ox, 299.5 + oy, NARROW, 260);
  }

  return doc.save();
}

export function pdfUint8ToBlob(bytes: Uint8Array): Blob {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return new Blob([copy], { type: "application/pdf" });
}

export function downloadPdfBytes(bytes: Uint8Array, filename: string): void {
  const blob = pdfUint8ToBlob(bytes);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
