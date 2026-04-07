"use client";

import { useMemo } from "react";

type PdfPreviewProps = {
  /** App route (`/sample.pdf`) or `blob:` URL from generated PDF */
  fileUrl: string;
};

/**
 * Native PDF embedding via object/embed (often more reliable than iframe for
 * Chrome/Edge on Windows). No pdfjs-dist.
 */
export default function PdfPreview({ fileUrl }: PdfPreviewProps) {
  const src = useMemo(() => {
    if (fileUrl.startsWith("blob:")) return fileUrl;
    const hash = "#view=FitH&toolbar=1";
    return fileUrl.includes("#") ? fileUrl : `${fileUrl}${hash}`;
  }, [fileUrl]);

  return (
    <div className="flex h-full min-h-[320px] flex-col rounded-2xl border border-slate-200/80 bg-slate-100/80 p-4 shadow-inner dark:border-slate-800 dark:bg-slate-950/60 sm:min-h-[480px]">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          PDF preview
        </h2>
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-indigo-600 underline-offset-2 hover:underline dark:text-indigo-400"
        >
          Open in new tab
        </a>
      </div>

      <div className="relative flex min-h-[min(75vh,52rem)] flex-1 flex-col overflow-hidden rounded-xl bg-slate-200/50 shadow-inner dark:bg-slate-800/50">
        <object
          key={src}
          data={src}
          type="application/pdf"
          className="h-[min(75vh,52rem)] w-full flex-1 rounded-lg bg-white"
        >
          <embed
            key={src}
            src={src}
            type="application/pdf"
            className="h-[min(75vh,52rem)] w-full rounded-lg bg-white"
          />
          <p className="p-6 text-center text-sm text-slate-600 dark:text-slate-400">
            This browser cannot show the PDF inline. Use{" "}
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-indigo-600 underline dark:text-indigo-400"
            >
              Open in new tab
            </a>
            .
          </p>
        </object>
      </div>
    </div>
  );
}
