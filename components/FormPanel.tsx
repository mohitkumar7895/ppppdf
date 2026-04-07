import type { FormFields } from "@/utils/formTypes";

type FormPanelProps = {
  form: FormFields;
  onChange: (field: keyof FormFields, value: string) => void;
  offsetX: number;
  offsetY: number;
  onOffsetChange: (x: number, y: number) => void;
  livePreview: boolean;
  onLivePreviewChange: (value: boolean) => void;
  onGenerate: () => void;
  onClear: () => void;
  loading: boolean;
};

const FIELD_CONFIG: { key: keyof FormFields; label: string; placeholder: string }[] = [
  { key: "refNo", label: "Ref No", placeholder: "e.g. REF-2026-001" },
  { key: "name", label: "Name", placeholder: "Full name" },
  { key: "address", label: "Address", placeholder: "Street, city (use Enter for new lines)" },
  { key: "subject", label: "Subject", placeholder: "Letter subject" },
  { key: "salary", label: "Salary", placeholder: "e.g. $85,000" },
  { key: "email", label: "Email", placeholder: "you@company.com" },
  { key: "mobile", label: "Mobile", placeholder: "+1 …" },
];

/** High-contrast fields so text is always readable (light + dark). */
const fieldClass =
  "box-border w-full min-h-11 rounded-lg border-2 border-slate-400 bg-white px-3 py-2.5 text-base leading-normal text-slate-950 caret-indigo-600 shadow-sm outline-none transition placeholder:text-slate-500 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/15 dark:border-slate-500 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20";

const numberFieldClass =
  "box-border w-full min-h-11 rounded-lg border-2 border-slate-400 bg-white px-3 py-2.5 text-base tabular-nums text-slate-950 outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/15 dark:border-slate-500 dark:bg-slate-800 dark:text-white dark:focus:border-indigo-400";

export function FormPanel({
  form,
  onChange,
  offsetX,
  offsetY,
  onOffsetChange,
  livePreview,
  onLivePreviewChange,
  onGenerate,
  onClear,
  loading,
}: FormPanelProps) {
  return (
    <div className="flex flex-col gap-6 rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60 dark:border-slate-600 dark:bg-slate-900 dark:shadow-black/50 sm:p-6">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
          Document fields
        </h2>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
          Values replace the matching lines on <strong className="font-semibold">sample.pdf</strong> (ref
          no., name, address, subject, salary, email, mobile). Use offsets to nudge all text together if
          needed.
        </p>
      </div>

      <div className="flex max-h-[72vh] flex-col gap-4 overflow-y-auto overflow-x-hidden pr-1 [scrollbar-gutter:stable] lg:max-h-none lg:overflow-visible">
        {FIELD_CONFIG.map(({ key, label, placeholder }) => {
          const multiline = key === "address";
          return (
            <label key={key} className="block shrink-0 text-sm">
              <span className="mb-1.5 block font-semibold text-slate-800 dark:text-slate-100">
                {label}
              </span>
              {multiline ? (
                <div className="space-y-1">
                  <textarea
                    value={form[key]}
                    onChange={(e) => onChange(key, e.target.value)}
                    placeholder={placeholder}
                    rows={4}
                    className={`${fieldClass} resize-y`}
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Long address wraps to max 2 lines so &quot;Congratulations!&quot; stays visible; extra
                    text gets … on the PDF.
                  </p>
                </div>
              ) : (
                <input
                  type="text"
                  value={form[key]}
                  onChange={(e) => onChange(key, e.target.value)}
                  placeholder={placeholder}
                  autoComplete="off"
                  className={fieldClass}
                />
              )}
            </label>
          );
        })}
      </div>

      <div className="shrink-0 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-800/80">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
          Position offset (PDF coordinates)
        </p>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm font-medium text-slate-800 dark:text-slate-100">
            <span className="mb-1.5 block">Offset X</span>
            <input
              type="number"
              value={offsetX}
              onChange={(e) => {
                const n = parseFloat(e.target.value);
                onOffsetChange(Number.isFinite(n) ? n : 0, offsetY);
              }}
              className={numberFieldClass}
            />
          </label>
          <label className="text-sm font-medium text-slate-800 dark:text-slate-100">
            <span className="mb-1.5 block">Offset Y</span>
            <input
              type="number"
              value={offsetY}
              onChange={(e) => {
                const n = parseFloat(e.target.value);
                onOffsetChange(offsetX, Number.isFinite(n) ? n : 0);
              }}
              className={numberFieldClass}
            />
          </label>
        </div>
      </div>

      <label className="flex shrink-0 cursor-pointer items-center gap-3 text-sm font-medium text-slate-800 dark:text-slate-200">
        <input
          type="checkbox"
          checked={livePreview}
          onChange={(e) => onLivePreviewChange(e.target.checked)}
          className="size-5 shrink-0 rounded border-2 border-slate-400 text-indigo-600 focus:ring-2 focus:ring-indigo-500 dark:border-slate-500"
        />
        Live preview (regenerates PDF while you edit)
      </label>

      <div className="mt-auto flex shrink-0 flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onGenerate}
          disabled={loading}
          className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/25 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Spinner />
              Generating…
            </>
          ) : (
            <>Generate &amp; download PDF</>
          )}
        </button>
        <button
          type="button"
          onClick={onClear}
          disabled={loading}
          className="min-h-12 rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
        >
          Clear fields
        </button>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span
      className="inline-block size-4 animate-spin rounded-full border-2 border-white border-t-transparent"
      aria-hidden
    />
  );
}
