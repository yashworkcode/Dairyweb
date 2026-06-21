/**
 * Brand mark: a stylised milk-pot (matka) inside a thin ring,
 * echoing Vaishnavi Milk Dairy's traditional, trusted identity.
 */
export const PotIcon = ({ size, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className={className}>
    <path
      d="M25.2 13.5c-1.3 0-2.2 1.3-1.7 2.5l1.1 2.7c-7.4 2.6-12.6 9.7-12.6 17.9 0 10.6 8.9 19.2 20 19.2s20-8.6 20-19.2c0-8.2-5.2-15.3-12.6-17.9l1.1-2.7c.5-1.2-.4-2.5-1.7-2.5H25.2z"
      fill="currentColor"
    />
  </svg>
);

const Logo = ({ size = 32, withText = true, light = false, withTagline = false }) => {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`flex shrink-0 items-center justify-center rounded-full border ${
          light
            ? "border-gold-300/70 text-gold-300"
            : "border-pasture-600/40 text-pasture-700 dark:border-gold-400/50 dark:text-gold-300"
        }`}
        style={{ width: size, height: size }}
      >
        <PotIcon size={Math.round(size * 0.58)} />
      </span>
      {withText && (
        <span className="flex flex-col leading-tight">
          <span
            className={`whitespace-nowrap font-display italic text-base font-medium tracking-tight sm:text-lg md:text-xl ${
              light ? "text-cream-50" : "text-ink dark:text-cream-50"
            }`}
          >
            Vaishnavi{" "}
            <span className={light ? "text-gold-300 not-italic font-semibold" : "text-pasture-600 not-italic font-semibold dark:text-gold-400"}>
              Milk Dairy
            </span>
          </span>
          {withTagline && (
            <span
              className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${
                light ? "text-cream-50/60" : "text-ink-700/50 dark:text-cream-100/50"
              }`}
            >
              Pure & Fresh, Every Morning
            </span>
          )}
        </span>
      )}
    </div>
  );
};

export default Logo;
