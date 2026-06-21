const Loader = ({ label = "Loading" }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-pasture-100 border-t-pasture-600 dark:border-noir-700 dark:border-t-gold-400" />
    <p className="text-sm font-medium text-ink-700 dark:text-cream-100/70">{label}…</p>
  </div>
);

export default Loader;
