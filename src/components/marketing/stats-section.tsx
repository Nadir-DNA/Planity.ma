const stats = [
  { value: "+500", label: "Salons partenaires" },
  { value: "5", label: "RDV chaque minute" },
  { value: "24/7", label: "Disponibilité" },
  { value: "10+", label: "Villes au Maroc" },
];

export function StatsSection() {
  return (
    <section className="py-16 bg-surface">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-8 sm:gap-0">
          {stats.map((stat, i) => (
            <div key={stat.label} className="flex items-center">
              {/* Stat block */}
              <div className="text-center px-8">
                <p className="text-3xl sm:text-4xl font-semibold tracking-tight text-on-surface">
                  {stat.value}
                </p>
                <p className="text-xs uppercase tracking-wider text-on-surface-muted mt-1">
                  {stat.label}
                </p>
              </div>

              {/* Separator — ghost border, not solid line */}
              {i < stats.length - 1 && (
                <div className="hidden sm:block h-12 w-px bg-outline-light" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}