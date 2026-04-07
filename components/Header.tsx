export function Header() {
  return (
    <header className="border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
      <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              PDF Editor Admin
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Overlay fields on the template, preview, then download.
            </p>
          </div>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
            Next.js · pdf-lib · iframe preview
          </span>
        </div>
      </div>
    </header>
  );
}
