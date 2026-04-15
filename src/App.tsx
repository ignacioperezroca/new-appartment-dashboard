import { type ReactNode, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  CalendarClock,
  CalendarRange,
  CheckCircle2,
  ChevronDown,
  DoorOpen,
  Flame,
  Home,
  KeyRound,
  LayoutDashboard,
  MoveRight,
  PaintRoller,
  Package,
  ReceiptText,
  ShieldAlert,
  TimerReset,
  TrendingUp,
  Truck,
  Wallet2,
  Wifi,
  Workflow,
  LucideIcon,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { cn } from "./lib/utils";
import {
  calendarMonths,
  calendarWeeks,
  criticalDependencies,
  executiveSummary,
  kpiMetrics,
  movePhases,
  overallProgress,
  overviewHighlights,
  recommendationPanel,
  roadmapWindows,
  targetDate,
  todayLabel,
  type CriticalDependency,
  type IconKey,
  type Phase,
  type RoadmapBlock,
  type Status,
  visualFlow,
} from "./data/move-plan";

type ViewMode = "executive" | "pm";
type DensityMode = "compact" | "detailed";
type PhaseFilter = "all" | "next" | "critical" | "ready";

const iconMap: Record<IconKey, LucideIcon> = {
  wallet: Wallet2,
  trend: TrendingUp,
  timer: TimerReset,
  truck: Truck,
  paint: PaintRoller,
  calendar: CalendarRange,
  brain: BrainCircuit,
  key: KeyRound,
  door: DoorOpen,
  home: Home,
  package: Package,
  wifi: Wifi,
  move: Truck,
  receipt: ReceiptText,
};

const phaseFilterOptions: Array<{ value: PhaseFilter; label: string }> = [
  { value: "all", label: "Todo" },
  { value: "next", label: "Próximas 3 semanas" },
  { value: "critical", label: "Críticas" },
  { value: "ready", label: "Listas para activar" },
];

const statusMeta: Record<
  Status,
  {
    label: string;
    pill: string;
    dot: string;
    bar: string;
  }
> = {
  planned: {
    label: "Planificado",
    pill: "border-slate-200 bg-white text-slate-600",
    dot: "bg-slate-400",
    bar: "from-slate-300 to-slate-500",
  },
  in_progress: {
    label: "En curso",
    pill: "border-[rgba(91,124,250,0.16)] bg-[rgba(91,124,250,0.10)] text-[rgb(58,78,167)]",
    dot: "bg-[rgb(91,124,250)]",
    bar: "from-[rgb(91,124,250)] to-[rgb(122,146,255)]",
  },
  ready: {
    label: "Listo",
    pill: "border-[rgba(100,183,159,0.16)] bg-[rgba(100,183,159,0.10)] text-[rgb(34,102,87)]",
    dot: "bg-[rgb(100,183,159)]",
    bar: "from-[rgb(100,183,159)] to-[rgb(129,197,179)]",
  },
  blocked: {
    label: "Bloqueado",
    pill: "border-[rgba(217,111,104,0.16)] bg-[rgba(217,111,104,0.10)] text-[rgb(155,64,59)]",
    dot: "bg-[rgb(217,111,104)]",
    bar: "from-[rgb(217,111,104)] to-[rgb(234,144,138)]",
  },
  critical: {
    label: "Crítico",
    pill: "border-[rgba(208,154,67,0.16)] bg-[rgba(208,154,67,0.12)] text-[rgb(130,84,17)]",
    dot: "bg-[rgb(208,154,67)]",
    bar: "from-[rgb(208,154,67)] to-[rgb(226,184,113)]",
  },
};

const riskMeta = {
  low: "Bajo",
  medium: "Medio",
  high: "Alto",
};

const progressChart = [
  { name: "Completado", value: overallProgress, color: "rgb(91,124,250)" },
  { name: "Restante", value: 100 - overallProgress, color: "rgba(148,163,184,0.14)" },
];

const durationChart = movePhases.map((phase) => ({
  name: `F${phase.number}`,
  title: phase.shortTitle,
  days: Number(((phase.durationDays[0] + phase.durationDays[1]) / 2).toFixed(1)),
}));

const visualWindowGroups = [
  {
    month: "Abril",
    range: "Semanas 3–4",
    summary: "Decisión + contrato",
    weeks: ["Abr S3", "Abr S4"],
    tone: "blue" as const,
  },
  {
    month: "Mayo",
    range: "Semanas 1–4",
    summary: "Firma, salida, pintura y packing",
    weeks: ["May S1", "May S2", "May S3", "May S4"],
    tone: "mint" as const,
  },
  {
    month: "Junio",
    range: "Semanas 1–3",
    summary: "Mudanza + cierre",
    weeks: ["Jun S1", "Jun S2", "Jun S3"],
    tone: "graphite" as const,
  },
];

const commandCenterSignals = [
  {
    label: "Próxima presión",
    value: "Acceso al depto + aviso de salida",
    tone: "amber" as const,
  },
  {
    label: "Momento más sensible",
    value: "Mayo semanas 2–4",
    tone: "blue" as const,
  },
  {
    label: "Lectura recomendada",
    value: "Solapar para bajar fricción",
    tone: "mint" as const,
  },
];

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>("executive");
  const [density, setDensity] = useState<DensityMode>("detailed");
  const [contentTab, setContentTab] = useState("all");
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>("all");
  const [activeSection, setActiveSection] = useState("resumen");
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({
    "fase-1": true,
    "fase-4": true,
    "fase-7": true,
  });

  const filteredPhases = movePhases.filter((phase) => {
    if (phaseFilter === "next") return phase.startWeek <= 5;
    if (phaseFilter === "critical") {
      return phase.status === "critical" || phase.risk === "high" || phase.status === "blocked";
    }
    if (phaseFilter === "ready") {
      return phase.status === "ready" || phase.status === "in_progress";
    }
    return true;
  });

  const statusCounts = {
    inProgress: movePhases.filter((phase) => phase.status === "in_progress").length,
    ready: movePhases.filter((phase) => phase.status === "ready").length,
    critical: criticalDependencies.length,
  };

  const isCompact = density === "compact";
  const isDetailed = density === "detailed";
  const isExecutive = viewMode === "executive";

  const visibleSections = useMemo(
    () =>
      [
        { id: "resumen", label: "Resumen", visible: true },
        { id: "timeline", label: "Timeline", visible: true },
        { id: "roadmap", label: "Roadmap", visible: !isExecutive || isDetailed },
        { id: "flujo", label: "Flujo", visible: !isExecutive && isDetailed },
        { id: "critico", label: "Ruta crítica", visible: !isExecutive && isDetailed },
        { id: "recomendaciones", label: "Recomendación", visible: isExecutive || isDetailed },
      ].filter((section) => section.visible),
    [isDetailed, isExecutive],
  );

  const showAllSections = contentTab === "all";
  const shouldShowSection = (sectionId: string) => showAllSections || contentTab === sectionId;

  useEffect(() => {
    if (!showAllSections) {
      setActiveSection(contentTab);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveSection(visible.target.id);
        }
      },
      {
        threshold: [0.2, 0.45, 0.7],
        rootMargin: "-10% 0px -55% 0px",
      },
    );

    visibleSections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [contentTab, showAllSections, visibleSections]);

  return (
    <div className="relative min-h-screen overflow-x-hidden text-slate-900">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-gradient-to-b from-white/50 via-white/10 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-full bg-soft-grid opacity-[0.12]" />

      <main className="relative mx-auto flex w-full max-w-[1480px] flex-col gap-6 px-4 pb-16 pt-5 sm:px-6 lg:px-8 lg:pt-8">
        <HeroOverview statusCounts={statusCounts} />

        <Tabs
          value={viewMode}
          onValueChange={(value) => setViewMode(value as ViewMode)}
          className="flex flex-col gap-0"
        >
          <div className="sticky top-4 z-40">
            <Card className="overflow-hidden border-white/80 bg-white/[0.76] p-3 shadow-float backdrop-blur-2xl">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <nav className="flex gap-2 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setContentTab("all")}
                    className={cn(
                      "whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition-all",
                      showAllSections
                        ? "bg-slate-950 text-white shadow-sm"
                        : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-900",
                    )}
                  >
                    Mostrar todo
                  </button>
                  {visibleSections.map((link) => (
                    <button
                      key={link.id}
                      type="button"
                      onClick={() => setContentTab(link.id)}
                      className={cn(
                        "whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition-all",
                        !showAllSections && activeSection === link.id
                          ? "bg-slate-950 text-white shadow-sm"
                          : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-900",
                      )}
                    >
                      {link.label}
                    </button>
                  ))}
                </nav>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <TabsList className="w-full sm:w-auto">
                    <TabsTrigger value="executive">Vista ejecutiva</TabsTrigger>
                    <TabsTrigger value="pm">Vista PM detallada</TabsTrigger>
                  </TabsList>

                  <div className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 p-1 shadow-sm">
                    <button
                      className={cn(
                        "rounded-full px-3 py-2 text-sm font-semibold transition-all",
                        density === "compact"
                          ? "bg-slate-950 text-white"
                          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
                      )}
                      onClick={() => setDensity("compact")}
                      type="button"
                    >
                      Visión resumida
                    </button>
                    <button
                      className={cn(
                        "rounded-full px-3 py-2 text-sm font-semibold transition-all",
                        density === "detailed"
                          ? "bg-slate-950 text-white"
                          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
                      )}
                      onClick={() => setDensity("detailed")}
                      type="button"
                    >
                      Visión avanzada
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {shouldShowSection("resumen") ? (
          <div id="resumen" className="scroll-mt-28">
            <AnimatedSection className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {kpiMetrics.map((metric) => (
                <MetricCard key={metric.id} metric={metric} />
              ))}
            </AnimatedSection>

            {isDetailed ? (
              <AnimatedSection className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <Card className="section-shell">
                  <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                    <div className="max-w-2xl">
                      <div className="eyebrow">Pulso operativo</div>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <h2 className="text-2xl font-semibold text-slate-950 sm:text-3xl">
                          Señales clave para tomar decisiones rápido
                        </h2>
                        <Badge variant="accent">Desde hoy · {todayLabel}</Badge>
                      </div>
                      <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                        La mejor jugada es mantener el control sobre contratos, acceso, pintura y
                        logística como una sola secuencia. El costo fuerte está al principio; el
                        riesgo fuerte, justo antes del día de mudanza.
                      </p>
                    </div>

                    <div className="surface-muted grid min-w-[260px] gap-3 p-4">
                      <div className="flex items-center justify-between text-sm font-semibold text-slate-500">
                        <span>Rango de costo</span>
                        <span className="font-mono text-xs uppercase tracking-[0.2em] text-slate-400">
                          estimado
                        </span>
                      </div>
                      <div className="relative h-3 overflow-hidden rounded-full bg-slate-100">
                        <div className="absolute inset-y-0 left-[18%] right-[14%] rounded-full bg-gradient-to-r from-[rgba(91,124,250,0.28)] via-[rgba(91,124,250,0.52)] to-[rgba(100,183,159,0.48)]" />
                      </div>
                      <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                        <span>$4.6M</span>
                        <span className="text-slate-500">centro ejecutivo · $5.3M</span>
                        <span>$6.0M</span>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="section-shell">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="eyebrow">Carga por fase</div>
                      <h3 className="mt-3 text-xl font-semibold text-slate-950">
                        Duración estimada por bloque
                      </h3>
                    </div>
                    <Badge>Promedio operativo</Badge>
                  </div>
                  <div className="mt-6 h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={durationChart} margin={{ left: -20, right: 10, top: 8 }}>
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#94a3b8", fontSize: 12 }}
                        />
                        <Tooltip
                          cursor={{ fill: "rgba(148, 163, 184, 0.06)" }}
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const point = payload[0]?.payload as { title: string; days: number };
                            return (
                              <div className="rounded-2xl border border-white/80 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-xl">
                                <div className="text-sm font-semibold text-slate-950">{point.title}</div>
                                <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                                  {point.days} días promedio
                                </div>
                              </div>
                            );
                          }}
                        />
                        <Bar
                          dataKey="days"
                          radius={[12, 12, 6, 6]}
                          fill="rgba(91, 124, 250, 0.82)"
                          maxBarSize={46}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </AnimatedSection>
            ) : (
              <AnimatedSection className="mt-4">
                <CompactOverviewPanel />
              </AnimatedSection>
            )}
          </div>
          ) : null}

          <TabsContent value="executive">
            {shouldShowSection("timeline") ? <TimelineSection
              phases={filteredPhases}
              density={density}
              expandedPhases={expandedPhases}
              onTogglePhase={(phaseId) =>
                setExpandedPhases((current) => ({ ...current, [phaseId]: !current[phaseId] }))
              }
              phaseFilter={phaseFilter}
              setPhaseFilter={setPhaseFilter}
              detailed={false}
            /> : null}
            {isDetailed && shouldShowSection("roadmap") ? <RoadmapSection detailed={false} /> : null}
            {shouldShowSection("recomendaciones") ? <RecommendationSection /> : null}
          </TabsContent>

          <TabsContent value="pm">
            {shouldShowSection("timeline") ? <TimelineSection
              phases={filteredPhases}
              density={density}
              expandedPhases={expandedPhases}
              onTogglePhase={(phaseId) =>
                setExpandedPhases((current) => ({ ...current, [phaseId]: !current[phaseId] }))
              }
              phaseFilter={phaseFilter}
              setPhaseFilter={setPhaseFilter}
              detailed
            /> : null}
            {shouldShowSection("roadmap") ? <RoadmapSection detailed /> : null}
            {isDetailed && shouldShowSection("flujo") ? <FlowSection /> : null}
            {isDetailed && shouldShowSection("critico") ? <CriticalPathSection /> : null}
            {shouldShowSection("recomendaciones") ? <RecommendationSection /> : null}
          </TabsContent>
        </Tabs>

        {isDetailed ? (
          <AnimatedSection>
            <Card className="section-shell border-dashed border-slate-300/90 bg-[#f9f7f2]/90">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="eyebrow">Siguiente nivel</div>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    Gantt detallado día por día desde hoy ({todayLabel}) con dependencias y buffers.
                  </p>
                </div>
                <Button variant="secondary" size="lg">
                  Expandir a nivel diario
                </Button>
              </div>
            </Card>
          </AnimatedSection>
        ) : null}
      </main>
    </div>
  );
}

function HeroOverview({
  statusCounts,
}: {
  statusCounts: { inProgress: number; ready: number; critical: number };
}) {
  return (
    <AnimatedSection className="grid gap-4 xl:grid-cols-[1.35fr_0.95fr]">
      <Card className="section-shell overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-br from-[rgba(91,124,250,0.14)] via-transparent to-transparent" />
        <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-[rgba(100,183,159,0.10)] blur-3xl" />
        <div className="relative flex flex-col gap-8">
          <div className="grid gap-6 lg:grid-cols-[1.18fr_0.82fr]">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="subtle">Centro de comando</Badge>
                <Badge variant="accent">{targetDate}</Badge>
                <Badge>Plan activo · 8 fases</Badge>
              </div>
              <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl">
                Plan de Mudanza
              </h1>
              <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                Timeline visual optimizado para decidir, bloquear entradas, absorber dependencias y
                ejecutar la mudanza con margen real.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {overviewHighlights.map((item) => (
                  <div key={item.label} className="rounded-[26px] border border-white/70 bg-white/72 p-4 shadow-sm">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                      {item.label}
                    </div>
                    <div className="mt-2 text-sm font-semibold leading-6 text-slate-800">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface-muted p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="eyebrow">Resumen ejecutivo</span>
                <Badge>Hoy · {todayLabel}</Badge>
              </div>

              <div className="mt-5 space-y-3">
                <ExecutiveSignal
                  icon={LayoutDashboard}
                  tone="blue"
                  label="Estado actual"
                  value={executiveSummary.activePhase}
                />
                <ExecutiveSignal
                  icon={CalendarClock}
                  tone="mint"
                  label="Próximo hito"
                  value={executiveSummary.nextMilestone}
                />
                <ExecutiveSignal
                  icon={Workflow}
                  tone="amber"
                  label="Solapamiento ideal"
                  value={executiveSummary.overlapWindow}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
            <div className="surface-muted p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-2xl">
                  <div className="eyebrow">Recomendación ejecutiva</div>
                  <p className="mt-3 text-lg font-semibold leading-8 text-slate-950">
                    {executiveSummary.recommendation}
                  </p>
                </div>
                <div className="rounded-[24px] border border-[rgba(91,124,250,0.14)] bg-white/72 px-4 py-3 text-right shadow-sm">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Ruta sugerida
                  </div>
                  <div className="mt-2 text-sm font-semibold text-slate-800">
                    Firma → acceso → aviso → pintura
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {commandCenterSignals.map((signal) => (
                  <SignalCard key={signal.label} {...signal} />
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              <SummaryStat title="En curso" value={`${statusCounts.inProgress}`} detail="fase activa hoy" />
              <SummaryStat title="Lista para activar" value={`${statusCounts.ready}`} detail="con decisión cerrada" />
              <SummaryStat
                title="Dependencias críticas"
                value={`${statusCounts.critical}`}
                detail="no negociables"
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="section-shell">
        <div className="grid gap-6">
          <div className="grid gap-4 lg:grid-cols-[0.88fr_1.12fr]">
            <div className="surface-muted p-5">
              <div className="eyebrow text-center">Avance total del plan</div>
              <div className="relative mx-auto mt-5 h-52 w-full max-w-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={progressChart}
                      dataKey="value"
                      innerRadius={72}
                      outerRadius={92}
                      startAngle={90}
                      endAngle={-270}
                      stroke="none"
                    >
                      {progressChart.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-4xl font-semibold tracking-[-0.03em] text-slate-950">
                    {overallProgress}%
                  </div>
                  <div className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    progreso total
                  </div>
                </div>
              </div>
            </div>

            <div className="surface-muted p-5">
              <div className="flex items-center justify-between">
                <span className="eyebrow">Lectura ejecutiva</span>
                <ShieldAlert className="h-4 w-4 text-[rgb(208,154,67)]" />
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Mantener semanas de solapamiento es la decisión que más compra tranquilidad y baja
                costo oculto de improvisación.
              </p>
            </div>
          </div>

          <div className="surface-muted p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="eyebrow">Resumen compacto</div>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                  Comando visual del proyecto
                </h2>
              </div>
              <div className="rounded-full border border-slate-200/80 bg-white/75 px-4 py-2 text-sm font-semibold text-slate-600">
                Ventana objetivo · abril a junio
              </div>
            </div>

            <div className="mt-6 rounded-[26px] border border-slate-200/80 bg-white/84 p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="max-w-2xl">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Vista compacta
                  </div>
                  <div className="mt-2 text-lg font-semibold leading-7 text-slate-950">
                    Lectura recomendada por tramo
                  </div>
                </div>
                <Badge variant="accent">Secuencia recomendada</Badge>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-[22px] border border-slate-200/80 bg-[#faf8f4] p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Abril
                  </div>
                  <div className="mt-2 text-sm font-semibold leading-6 text-slate-900">
                    Definición y cierre contractual
                  </div>
                </div>
                <div className="rounded-[22px] border border-slate-200/80 bg-[#faf8f4] p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Mayo
                  </div>
                  <div className="mt-2 text-sm font-semibold leading-6 text-slate-900">
                    Absorción operativa y preparación
                  </div>
                </div>
                <div className="rounded-[22px] border border-slate-200/80 bg-[#faf8f4] p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Junio
                  </div>
                  <div className="mt-2 text-sm font-semibold leading-6 text-slate-900">
                    Ejecución final y cierre
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 xl:grid-cols-3">
                {visualWindowGroups.map((window) => (
                  <WindowSummaryCard key={window.month} {...window} />
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-[26px] border border-slate-200/80 bg-white/80 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Lectura por tramo
                  </div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">
                    Abril abre la decisión, mayo absorbe complejidad y junio ejecuta el cierre.
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {calendarMonths.map((month) => (
                    <span
                      key={month.label}
                      className="rounded-full border border-slate-200 bg-[#faf8f4] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500"
                    >
                      {month.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </AnimatedSection>
  );
}

function SummaryStat({
  title,
  value,
  detail,
}: {
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="surface-muted flex flex-col justify-between p-4">
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{title}</span>
      <div className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-slate-950">{value}</div>
      <span className="mt-2 text-sm text-slate-500">{detail}</span>
    </div>
  );
}

function CompactOverviewPanel() {
  return (
    <Card className="section-shell">
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="eyebrow">Lectura resumida</div>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950 sm:text-3xl">
            Qué mirar primero
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            En visión resumida priorizamos costo, secuencia y riesgos no negociables para entender
            rápido el plan sin abrir todavía el detalle operativo.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
          <MetaBlock label="Secuencia" value="Firma → acceso → pintura → mudanza" />
          <MetaBlock label="Riesgo principal" value="Avisar salida antes de bloquear entrada" />
          <MetaBlock label="Ventana clave" value="Mayo semanas 2–4" />
        </div>
      </div>
    </Card>
  );
}

function ExecutiveSignal({
  icon: Icon,
  tone,
  label,
  value,
}: {
  icon: LucideIcon;
  tone: "blue" | "mint" | "amber";
  label: string;
  value: string;
}) {
  const tones = {
    blue: "bg-[rgba(91,124,250,0.12)] text-[rgb(58,78,167)]",
    mint: "bg-[rgba(100,183,159,0.12)] text-[rgb(34,102,87)]",
    amber: "bg-[rgba(208,154,67,0.12)] text-[rgb(130,84,17)]",
  };

  return (
    <div className="rounded-[24px] border border-white/70 bg-white/70 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className={cn("inline-flex h-9 w-9 items-center justify-center rounded-2xl", tones[tone])}>
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            {label}
          </div>
          <div className="mt-1 text-sm font-semibold leading-6 text-slate-800">{value}</div>
        </div>
      </div>
    </div>
  );
}

function SignalCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "blue" | "mint" | "amber";
}) {
  const toneClasses = {
    blue: "border-[rgba(91,124,250,0.14)] bg-[rgba(91,124,250,0.07)]",
    mint: "border-[rgba(100,183,159,0.14)] bg-[rgba(100,183,159,0.07)]",
    amber: "border-[rgba(208,154,67,0.14)] bg-[rgba(208,154,67,0.08)]",
  };

  return (
    <div className={cn("rounded-[24px] border p-4", toneClasses[tone])}>
      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</div>
      <div className="mt-2 text-sm font-semibold leading-6 text-slate-800">{value}</div>
    </div>
  );
}

function WindowSummaryCard({
  month,
  range,
  summary,
  weeks,
  tone,
}: {
  month: string;
  range: string;
  summary: string;
  weeks: string[];
  tone: "blue" | "mint" | "graphite";
}) {
  const shellTone =
    tone === "blue"
      ? "border-[rgba(91,124,250,0.14)] bg-[rgba(91,124,250,0.07)]"
      : tone === "mint"
        ? "border-[rgba(100,183,159,0.14)] bg-[rgba(100,183,159,0.07)]"
        : "border-slate-900/10 bg-slate-950 text-white";

  const pillTone =
    tone === "blue"
      ? "border-[rgba(91,124,250,0.16)] bg-white/80 text-[rgb(58,78,167)]"
      : tone === "mint"
        ? "border-[rgba(100,183,159,0.16)] bg-white/80 text-[rgb(34,102,87)]"
        : "border-white/10 bg-white/10 text-white/78";

  return (
    <div className={cn("rounded-[26px] border p-4", shellTone)}>
      <div className="flex flex-col gap-3">
        <div>
          <div className={cn("text-[11px] font-semibold uppercase tracking-[0.2em]", tone === "graphite" ? "text-white/45" : "text-slate-400")}>
            {month}
          </div>
          <div className={cn("mt-2 text-base font-semibold", tone === "graphite" ? "text-white" : "text-slate-900")}>
            {summary}
          </div>
        </div>
        <span className={cn("w-fit rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]", pillTone)}>
          {range}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {weeks.map((week) => (
          <span
            key={week}
            className={cn(
              "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
              pillTone,
            )}
          >
            {week}
          </span>
        ))}
      </div>
    </div>
  );
}

function MetricCard({ metric }: { metric: (typeof kpiMetrics)[number] }) {
  const Icon = iconMap[metric.icon];

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 280, damping: 22 }}>
      <Card
        className={cn(
          "section-shell h-full",
          metric.emphasis === "primary" && "border-slate-300/80 bg-white/90 shadow-float",
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-4">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/80 bg-slate-50 text-slate-700">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-500">{metric.label}</div>
              <div className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                {metric.value}
              </div>
            </div>
          </div>

          {metric.marker ? <Badge>{metric.marker}</Badge> : null}
        </div>

        {metric.note ? <p className="mt-4 text-sm leading-6 text-slate-500">{metric.note}</p> : null}
      </Card>
    </motion.div>
  );
}

function TimelineSection({
  phases,
  density,
  expandedPhases,
  onTogglePhase,
  phaseFilter,
  setPhaseFilter,
  detailed,
}: {
  phases: Phase[];
  density: DensityMode;
  expandedPhases: Record<string, boolean>;
  onTogglePhase: (phaseId: string) => void;
  phaseFilter: PhaseFilter;
  setPhaseFilter: (filter: PhaseFilter) => void;
  detailed: boolean;
}) {
  return (
    <AnimatedSection id="timeline" className="scroll-mt-28">
      <Card className="section-shell">
        <SectionHeader
          eyebrow="Timeline integral"
          title="Secuencia completa de la mudanza"
          description={
            density === "compact"
              ? "Lectura resumida para ver la cadena completa, las ventanas de semana y el estado de cada fase sin abrir todo el detalle."
              : "Cada fase se presenta como una unidad ejecutiva con flujo, tareas, duración, readiness y dependencias clave."
          }
        />

        <div className="mt-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {phaseFilterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPhaseFilter(option.value)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-semibold transition-all",
                  phaseFilter === option.value
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {(["planned", "in_progress", "ready", "blocked", "critical"] as Status[]).map((status) => (
              <StatusPill key={status} status={status} />
            ))}
          </div>
        </div>

        {density === "compact" ? (
          <CompactTimelineView phases={phases} />
        ) : (
          <div className="mt-8 grid gap-4">
            {phases.map((phase) => (
              <TimelinePhaseCard
                key={phase.id}
                phase={phase}
                expanded={expandedPhases[phase.id] ?? density === "detailed"}
                onToggle={() => onTogglePhase(phase.id)}
                detailed={detailed}
                density={density}
              />
            ))}
          </div>
        )}
      </Card>
    </AnimatedSection>
  );
}

function CompactTimelineView({ phases }: { phases: Phase[] }) {
  return (
    <div className="mt-8 grid gap-4">
      <div className="grid gap-3 lg:grid-cols-4">
        <MetaBlock label="Fases visibles" value={`${phases.length} bloques`} />
        <MetaBlock label="Inicio" value={phases[0]?.weekLabel ?? "Definir"} />
        <MetaBlock label="Cierre" value={phases[phases.length - 1]?.weekLabel ?? "Cierre"} />
        <MetaBlock label="Modelo" value="Secuencia resumida" />
      </div>

      <div className="grid gap-3">
        {phases.map((phase) => (
          <div key={phase.id} className="surface-muted p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border border-white/80 bg-white text-lg shadow-sm">
                  {phase.emoji}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{`Fase ${phase.number}`}</Badge>
                    <StatusPill status={phase.status} />
                    <Badge variant="subtle">{phase.weekLabel}</Badge>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold text-slate-950">{phase.title}</h3>
                  <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">{phase.summary}</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
                <MetaBlock label="Calendario" value={phase.calendarLabel} />
                <MetaBlock label="Duración" value={phase.durationLabel} />
                <MetaBlock label="Riesgo" value={riskMeta[phase.risk]} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelinePhaseCard({
  phase,
  expanded,
  onToggle,
  detailed,
  density,
}: {
  phase: Phase;
  expanded: boolean;
  onToggle: () => void;
  detailed: boolean;
  density: DensityMode;
}) {
  const Icon = iconMap[phase.icon];
  const dependencyLabel =
    phase.dependencyIds.length === 0
      ? "Sin dependencias previas"
      : `Depende de ${phase.dependencyIds.length} fase${phase.dependencyIds.length > 1 ? "s" : ""}`;

  return (
    <motion.div
      layout
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="surface-muted p-4 sm:p-5"
    >
      <button type="button" onClick={onToggle} className="w-full text-left">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] border border-white/80 bg-white text-xl shadow-sm">
              <span>{phase.emoji}</span>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <Badge>{`Fase ${phase.number}`}</Badge>
                <StatusPill status={phase.status} />
                <Badge variant="subtle">{phase.weekLabel}</Badge>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                    {phase.title}
                  </h3>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600">
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                  {phase.summary}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start">
            <div className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 sm:inline-flex">
              {phase.calendarLabel}
            </div>
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500">
              <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="flex flex-wrap gap-2">
            {phase.flow.map((step, index) => (
              <div key={step} className="flex items-center gap-2">
                <span className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
                  {step}
                </span>
                {index < phase.flow.length - 1 ? (
                  <MoveRight className="h-4 w-4 text-slate-300" />
                ) : null}
              </div>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <MetaBlock label="Duración" value={phase.durationLabel} />
            <MetaBlock label="Riesgo" value={riskMeta[phase.risk]} />
            <MetaBlock label="Dependencias" value={dependencyLabel} />
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 20 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="soft-divider" />

            <div
              className={cn(
                "mt-5 grid gap-4",
                detailed || density === "detailed" ? "xl:grid-cols-[1.25fr_0.95fr]" : "lg:grid-cols-2",
              )}
            >
              <div className="space-y-4">
                {phase.taskGroups.map((group) => (
                  <div key={group.label} className="surface-card bg-white/[0.78] p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                      {group.label}
                    </div>
                    <div className="mt-3 grid gap-3">
                      {group.items.map((item) => (
                        <div key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                          <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[rgb(100,183,159)]" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="surface-card bg-white/[0.78] p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Estado de preparación
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                      {phase.progress}% preparado
                    </span>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={cn(
                        "h-full rounded-full bg-gradient-to-r",
                        statusMeta[phase.status].bar,
                      )}
                      style={{ width: `${Math.max(phase.progress, 6)}%` }}
                    />
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{phase.readiness}</p>
                </div>

                <div className="surface-card bg-white/[0.78] p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Dependencias y buffer
                  </div>
                  <div className="mt-3 space-y-3">
                    <div className="rounded-3xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm leading-6 text-slate-600">
                      {phase.bufferLabel}
                    </div>
                    {phase.milestone ? (
                      <div className="rounded-3xl border border-[rgba(100,183,159,0.18)] bg-[rgba(100,183,159,0.10)] px-4 py-3 text-sm font-semibold text-[rgb(34,102,87)]">
                        Hito: {phase.milestone}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

function RoadmapSection({ detailed }: { detailed: boolean }) {
  const rows = detailed ? movePhases : roadmapWindows;

  return (
    <AnimatedSection id="roadmap" className="scroll-mt-28">
      <Card className="section-shell">
        <SectionHeader
          eyebrow="Calendario real"
          title={detailed ? "Roadmap PM con solapamientos y buffers" : "Roadmap estratégico con fechas reales"}
          description={
            detailed
              ? "Vista tipo Gantt para leer superposición de fases, buffers y secuencias no negociables."
              : "Barra temporal orientada a decisión para ver rápidamente cómo se distribuye el plan entre abril, mayo y junio."
          }
        />

        <div className="mt-8 grid gap-4">
          <div className="grid gap-3 md:grid-cols-3">
            {calendarMonths.map((month) => (
              <div key={month.label} className="rounded-[24px] border border-slate-200/80 bg-[#fbfaf7]/80 p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Mes
                </div>
                <div className="mt-2 text-lg font-semibold text-slate-900">{month.label}</div>
                <div className="mt-1 text-sm text-slate-500">
                  {month.span} bloque{month.span > 1 ? "s" : ""} de semana
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-3 xl:hidden">
            {rows.map((row, rowIndex) => (
              <RoadmapMobileCard key={row.id} row={row} detailed={detailed} index={rowIndex} />
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/[0.68] xl:block">
            <div className="grid grid-cols-[250px_minmax(820px,1fr)]">
              <div className="border-r border-slate-200/80 bg-[#faf8f4]/90 p-4">
                <div className="eyebrow">{detailed ? "Fases" : "Bloques"}</div>
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-[860px]">
                  <div className="grid grid-cols-9 border-b border-slate-200/80 bg-[#faf8f4]/90">
                    {calendarMonths.map((month) => (
                      <div
                        key={month.label}
                        className="border-r border-slate-200/80 px-4 py-4 text-sm font-semibold text-slate-700 last:border-r-0"
                        style={{ gridColumn: `span ${month.span}` }}
                      >
                        {month.label}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-9 bg-white/80">
                    {calendarWeeks.map((week) => (
                      <div
                        key={week}
                        className="border-r border-slate-200/60 px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 last:border-r-0"
                      >
                        {week}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-[250px_minmax(820px,1fr)]">
              <div className="border-r border-slate-200/80 bg-[#faf8f4]/90">
                {rows.map((row) => (
                  <div key={row.id} className="border-b border-slate-200/70 px-4 py-4 last:border-b-0">
                    <div className="text-sm font-semibold text-slate-900">
                      {"shortTitle" in row ? row.title : row.label}
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">
                      {"calendarLabel" in row ? row.calendarLabel : row.note}
                    </div>
                  </div>
                ))}
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[860px]">
                  {rows.map((row, rowIndex) => (
                    <div
                      key={row.id}
                      className="relative grid h-[92px] grid-cols-9 border-b border-slate-200/70 bg-white/80 last:border-b-0"
                    >
                      {calendarWeeks.map((week) => (
                        <div key={`${row.id}-${week}`} className="border-r border-slate-200/60 last:border-r-0" />
                      ))}

                      <div
                        className="absolute inset-x-0 top-1/2 grid -translate-y-1/2 px-4"
                        style={{ gridTemplateColumns: "repeat(9, minmax(0, 1fr))" }}
                      >
                        <motion.div
                          initial={{ opacity: 0, scaleX: 0.94 }}
                          whileInView={{ opacity: 1, scaleX: 1 }}
                          viewport={{ once: true, amount: 0.5 }}
                          transition={{ duration: 0.35, delay: rowIndex * 0.04 }}
                          className={cn(
                            "flex h-[52px] items-center justify-between rounded-[18px] px-4 text-sm font-semibold text-white shadow-md",
                            getRoadmapTone("tone" in row ? row.tone : row.status),
                          )}
                          style={{
                            gridColumn: `${row.startWeek + 1} / span ${row.endWeek - row.startWeek + 1}`,
                          }}
                        >
                          <div className="min-w-0">
                            <span className="truncate">
                              {"shortTitle" in row ? `F${row.number} · ${row.shortTitle}` : row.label}
                            </span>
                            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/70">
                              {"durationLabel" in row ? row.durationLabel : row.note}
                            </div>
                          </div>
                          {detailed && "bufferLabel" in row ? (
                            <span className="ml-3 hidden rounded-full bg-white/[0.18] px-2 py-1 text-[10px] uppercase tracking-[0.18em] 2xl:inline-flex">
                              Colchón
                            </span>
                          ) : null}
                        </motion.div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </AnimatedSection>
  );
}

function RoadmapMobileCard({
  row,
  detailed,
  index,
}: {
  row: Phase | RoadmapBlock;
  detailed: boolean;
  index: number;
}) {
  const label = "shortTitle" in row ? row.title : row.label;
  const meta = "calendarLabel" in row ? row.calendarLabel : row.note;
  const duration = "durationLabel" in row ? row.durationLabel : row.note;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.28, delay: index * 0.04 }}
      className="rounded-[26px] border border-slate-200/80 bg-white/78 p-4 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-900">{label}</div>
          <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-slate-400">{meta}</div>
        </div>
        <Badge>{duration}</Badge>
      </div>

      <div className="mt-4 grid grid-cols-9 gap-1">
        {calendarWeeks.map((week, weekIndex) => {
          const active = weekIndex >= row.startWeek && weekIndex <= row.endWeek;
          return (
            <div key={`${row.id}-${week}`} className="space-y-1">
              <div
                className={cn(
                  "h-2 rounded-full",
                  active
                    ? getRoadmapTone("tone" in row ? row.tone : row.status)
                    : "bg-slate-100",
                )}
              />
              <div className="text-center text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                {week.replace(" ", "")}
              </div>
            </div>
          );
        })}
      </div>

      {detailed && "bufferLabel" in row ? (
        <div className="mt-4 rounded-[20px] border border-slate-200/80 bg-[#faf8f4] px-4 py-3 text-sm text-slate-600">
          {row.bufferLabel}
        </div>
      ) : null}
    </motion.div>
  );
}

function FlowSection() {
  return (
    <AnimatedSection id="flujo" className="scroll-mt-28">
      <Card className="section-shell">
        <SectionHeader
          eyebrow="Mapa visual de flujo"
          title="Flujo visual de decisión a cierre"
          description="Diagrama limpio para presentar la secuencia operativa sin abrir aún el detalle táctico."
        />

        <div className="mt-10">
          <div className="hidden xl:block">
            <div className="relative grid grid-cols-7 gap-3">
              <div className="pointer-events-none absolute left-[7%] right-[7%] top-[2.35rem] h-px bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200" />
              {visualFlow.map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.45 }}
                  transition={{ duration: 0.25, delay: index * 0.05 }}
                  className="relative"
                >
                  <div className="surface-muted flex h-full min-h-[160px] flex-col justify-between px-5 py-5">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-slate-900">{item}</div>
                      <div className="mt-2 text-sm leading-6 text-slate-500">
                        {index === 0
                          ? "Abre la decisión y fija el rumbo."
                          : index === visualFlow.length - 1
                            ? "Ordena la salida y recupera el depósito."
                            : "Activa el siguiente bloque sin perder continuidad."}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center xl:hidden">
            {visualFlow.map((item, index) => (
              <div key={item} className="flex w-full max-w-xl flex-col items-center">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.45 }}
                  transition={{ duration: 0.25, delay: index * 0.05 }}
                  className="surface-muted flex w-full items-center justify-between gap-4 px-5 py-4"
                >
                  <div className="flex items-center gap-4">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-600">
                      {index + 1}
                    </span>
                    <span className="text-lg font-semibold text-slate-900">{item}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300" />
                </motion.div>

                {index < visualFlow.length - 1 ? (
                  <div className="flex h-8 items-center justify-center">
                    <div className="h-8 w-px bg-gradient-to-b from-slate-200 via-slate-300 to-transparent" />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </AnimatedSection>
  );
}

function CriticalPathSection() {
  return (
    <AnimatedSection id="critico" className="scroll-mt-28">
      <Card className="section-shell border-[rgba(208,154,67,0.18)] bg-[linear-gradient(180deg,rgba(255,252,246,0.96),rgba(255,248,235,0.92))]">
        <SectionHeader
          eyebrow="Ruta crítica"
          title="Lo que no puede fallar"
          description="Estas dependencias sostienen la secuencia. Si una se rompe, el resto del plan pierde aire inmediatamente."
        />

        <div className="mt-8 grid gap-4 xl:grid-cols-4">
          {criticalDependencies.map((item, index) => (
            <CriticalDependencyCard key={item.id} item={item} index={index} />
          ))}
        </div>
      </Card>
    </AnimatedSection>
  );
}

function RecommendationSection() {
  return (
    <AnimatedSection id="recomendaciones" className="scroll-mt-28">
      <Card className="section-shell">
        <SectionHeader
          eyebrow="Panel de recomendación"
          title="Decisión recomendada, error típico y pin map final"
          description="La propuesta ganadora es simple: comprar tiempo útil antes de comprar tensión operativa."
        />

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <RecommendationCard
            title="Estrategia ganadora"
            icon={Workflow}
            tone="mint"
            items={recommendationPanel.strategy}
          />
          <RecommendationCard
            title="Error típico"
            icon={Flame}
            tone="rose"
            items={recommendationPanel.pitfall}
          />
          <RecommendationCard
            title="Pin map final"
            icon={CalendarRange}
            tone="graphite"
            items={recommendationPanel.pinMap}
          />
        </div>
      </Card>
    </AnimatedSection>
  );
}

function RecommendationCard({
  title,
  icon: Icon,
  tone,
  items,
}: {
  title: string;
  icon: LucideIcon;
  tone: "mint" | "rose" | "graphite";
  items: string[];
}) {
  const toneClass =
    tone === "mint"
      ? "border-[rgba(100,183,159,0.16)] bg-[rgba(100,183,159,0.08)]"
      : tone === "rose"
        ? "border-[rgba(217,111,104,0.16)] bg-[rgba(217,111,104,0.08)]"
        : "border-slate-900/[0.12] bg-slate-950 text-white";

  const textTone = tone === "graphite" ? "text-white/[0.72]" : "text-slate-600";
  const titleTone = tone === "graphite" ? "text-white" : "text-slate-950";

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 260, damping: 22 }}>
      <Card className={cn("section-shell h-full", toneClass)}>
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "inline-flex h-11 w-11 items-center justify-center rounded-2xl border",
              tone === "graphite"
                ? "border-white/[0.15] bg-white/[0.08] text-white"
                : "border-white/70 bg-white/70 text-slate-700",
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
          <h3 className={cn("text-xl font-semibold", titleTone)}>{title}</h3>
        </div>

        <div className="mt-6 space-y-3">
          {items.map((item) => (
            <div
              key={item}
              className={cn(
                "rounded-3xl px-4 py-3 text-sm font-semibold leading-6",
                tone === "graphite" ? "bg-white/[0.08] text-white/[0.82]" : "bg-white/[0.78] text-slate-700",
              )}
            >
              {item}
            </div>
          ))}
        </div>

        <p className={cn("mt-6 text-sm leading-7", textTone)}>
          {tone === "mint"
            ? "Gana aire, orden y mejor experiencia final."
            : tone === "rose"
              ? "Aumenta presión, caos y costo invisible."
              : "Secuencia ideal para quedar instalado durante junio."}
        </p>
      </Card>
    </motion.div>
  );
}

function CriticalDependencyCard({
  item,
  index,
}: {
  item: CriticalDependency;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.28, delay: index * 0.05 }}
      className="surface-card h-full border-[rgba(208,154,67,0.18)] bg-white/[0.84] p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(208,154,67,0.18)] bg-[rgba(208,154,67,0.10)] text-[rgb(130,84,17)]">
            <ShieldAlert className="h-5 w-5" />
          </span>
          <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
        </div>
        {index < criticalDependencies.length - 1 ? (
          <ArrowRight className="mt-2 hidden h-4 w-4 text-slate-300 xl:block" />
        ) : null}
      </div>

      <p className="mt-4 text-sm leading-7 text-slate-600">{item.detail}</p>
      <div className="mt-4 rounded-3xl border border-[rgba(208,154,67,0.16)] bg-[rgba(208,154,67,0.08)] px-4 py-3 text-sm font-semibold leading-6 text-[rgb(130,84,17)]">
        Impacto: {item.impact}
      </div>
    </motion.div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl">
      <div className="eyebrow">{eyebrow}</div>
      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-[2.25rem]">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">{description}</p>
    </div>
  );
}

function AnimatedSection({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.34, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

function MetaBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white/80 px-4 py-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="mt-2 text-sm font-semibold text-slate-700">{value}</div>
    </div>
  );
}

function StatusPill({ status }: { status: Status }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
        statusMeta[status].pill,
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", statusMeta[status].dot)} />
      {statusMeta[status].label}
    </span>
  );
}

function getRoadmapTone(tone: RoadmapBlock["tone"] | Status) {
  switch (tone) {
    case "blue":
    case "in_progress":
      return "bg-[linear-gradient(90deg,rgba(91,124,250,0.92),rgba(91,124,250,0.72))]";
    case "mint":
    case "ready":
      return "bg-[linear-gradient(90deg,rgba(100,183,159,0.95),rgba(100,183,159,0.74))]";
    case "amber":
    case "critical":
      return "bg-[linear-gradient(90deg,rgba(208,154,67,0.95),rgba(208,154,67,0.74))]";
    case "blocked":
      return "bg-[linear-gradient(90deg,rgba(217,111,104,0.95),rgba(217,111,104,0.74))]";
    case "graphite":
    case "planned":
    default:
      return "bg-[linear-gradient(90deg,rgba(20,26,34,0.96),rgba(58,66,77,0.84))]";
  }
}

export default App;
