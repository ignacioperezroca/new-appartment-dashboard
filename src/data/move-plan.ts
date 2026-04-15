export type Status = "planned" | "in_progress" | "ready" | "blocked" | "critical";
export type RiskLevel = "low" | "medium" | "high";

export type IconKey =
  | "wallet"
  | "trend"
  | "timer"
  | "truck"
  | "paint"
  | "calendar"
  | "brain"
  | "key"
  | "door"
  | "home"
  | "package"
  | "wifi"
  | "move"
  | "receipt";

export interface Metric {
  id: string;
  label: string;
  value: string;
  note?: string;
  icon: IconKey;
  emphasis?: "primary" | "secondary";
  marker?: string;
}

export interface TaskGroup {
  label: string;
  items: string[];
}

export interface ActionDuration {
  label: string;
  days: number;
}

export interface Phase {
  id: string;
  number: number;
  title: string;
  shortTitle: string;
  weekLabel: string;
  calendarLabel: string;
  summary: string;
  emoji: string;
  icon: IconKey;
  flow: string[];
  taskGroups: TaskGroup[];
  durationLabel: string;
  durationDays: [number, number];
  milestone?: string;
  status: Status;
  risk: RiskLevel;
  progress: number;
  dependencyIds: string[];
  readiness: string;
  actionDurations: ActionDuration[];
  startWeek: number;
  endWeek: number;
}

export interface RoadmapBlock {
  id: string;
  label: string;
  note: string;
  startWeek: number;
  endWeek: number;
  tone: "blue" | "mint" | "amber" | "graphite";
}

export interface CriticalDependency {
  id: string;
  title: string;
  detail: string;
  impact: string;
}

export const todayLabel = "15 abril";
export const targetDate = "Junio 2026";
export const overallProgress = 22;

export const executiveSummary = {
  activePhase: "Fase 1 en curso",
  nextMilestone: "Firma + acceso al depto",
  overlapWindow: "Solapamiento ideal de 2–3 semanas",
  recommendation:
    "Firmar, asegurar acceso y recién después avisar la salida actual para sostener margen operativo y bajar estrés.",
};

export const overviewHighlights = [
  { label: "Estado actual", value: "Estrategia recomendada lista" },
  { label: "Foco operativo", value: "Bloquear entrada antes de pintar" },
  { label: "Ventana crítica", value: "Mayo semanas 2–4" },
];

export const kpiMetrics: Metric[] = [
  {
    id: "cost",
    label: "Costo total mudanza",
    value: "$4.6M – $6.0M",
    note: "Rango ejecutivo estimado",
    icon: "wallet",
    emphasis: "primary",
    marker: "Alta sensibilidad",
  },
  {
    id: "gap",
    label: "Gap mensual nuevo vs actual",
    value: "+$40K",
    note: "Impacto incremental mensual",
    icon: "trend",
    emphasis: "secondary",
    marker: "Absorbible",
  },
  {
    id: "process",
    label: "Tiempo total proceso",
    value: "4 a 8 semanas",
    note: "Incluye solapamiento y cierre",
    icon: "timer",
    emphasis: "primary",
    marker: "Ruta completa",
  },
  {
    id: "move-days",
    label: "Días reales de mudanza",
    value: "1–2 días",
    note: "Carga, traslado y descarga",
    icon: "truck",
    emphasis: "secondary",
    marker: "Pico operativo",
  },
  {
    id: "paint-days",
    label: "Días pintura",
    value: "4–8 días",
    note: "Incluye relevamiento y limpieza",
    icon: "paint",
    emphasis: "secondary",
    marker: "Antes de habitar",
  },
  {
    id: "target",
    label: "Fecha objetivo",
    value: "Junio 2026",
    note: "Instalado y con cierre resuelto",
    icon: "calendar",
    emphasis: "primary",
    marker: "Hito final",
  },
];

export const movePhases: Phase[] = [
  {
    id: "fase-1",
    number: 1,
    title: "Decisión & Cierre",
    shortTitle: "Decisión",
    weekLabel: "Semana 1",
    calendarLabel: "Abril · semana 3–4",
    summary: "Validar el deal completo antes de abrir el resto de la cadena.",
    emoji: "🧠",
    icon: "brain",
    flow: ["Decidir", "Revisar contrato", "Negociar", "OK final"],
    taskGroups: [
      {
        label: "Qué hacés",
        items: [
          "Confirmar que avanzás con el depto",
          "Revisar contrato",
          "Validar expensas (modelo real)",
          "Definir forma de pago",
        ],
      },
    ],
    durationLabel: "3–5 días",
    durationDays: [3, 5],
    status: "in_progress",
    risk: "medium",
    progress: 58,
    dependencyIds: [],
    readiness: "Listo para cerrar si el contrato y el modelo de expensas validan.",
    actionDurations: [
      { label: "Decidir", days: 1 },
      { label: "Contrato", days: 1 },
      { label: "Negociar", days: 2 },
      { label: "OK final", days: 1 },
    ],
    startWeek: 0,
    endWeek: 1,
  },
  {
    id: "fase-2",
    number: 2,
    title: "Bloquear Entrada",
    shortTitle: "Entrada",
    weekLabel: "Semana 2",
    calendarLabel: "Mayo · semana 1–2",
    summary: "Firmar y garantizar acceso temprano para empezar preparación sin fricción.",
    emoji: "🔑",
    icon: "key",
    flow: ["Firma", "Pago inicial", "Acceso al depto"],
    taskGroups: [
      {
        label: "Qué hacés",
        items: [
          "Firmar contrato nuevo",
          "Pagar depósito + mes",
          "Asegurar acceso para pintar",
        ],
      },
    ],
    durationLabel: "2–4 días",
    durationDays: [2, 4],
    status: "ready",
    risk: "high",
    progress: 16,
    dependencyIds: ["fase-1"],
    readiness: "Puede activarse apenas cierres la decisión y el contrato quede limpio.",
    actionDurations: [
      { label: "Firma", days: 1 },
      { label: "Pago inicial", days: 1 },
      { label: "Acceso", days: 2 },
    ],
    startWeek: 2,
    endWeek: 3,
  },
  {
    id: "fase-3",
    number: 3,
    title: "Salida Actual",
    shortTitle: "Salida",
    weekLabel: "Semana 2–3",
    calendarLabel: "Mayo · semana 1–2",
    summary: "Anunciar la salida solo con la entrada nueva completamente asegurada.",
    emoji: "📩",
    icon: "door",
    flow: ["Aviso rescisión", "Penalidad", "Fecha entrega"],
    taskGroups: [
      {
        label: "Qué hacés",
        items: [
          "Avisar salida formal",
          "Definir fecha entrega",
          "Calcular costo total final",
        ],
      },
    ],
    durationLabel: "2–3 días",
    durationDays: [2, 3],
    status: "blocked",
    risk: "high",
    progress: 0,
    dependencyIds: ["fase-2"],
    readiness: "Bloqueada hasta que el contrato nuevo esté firmado y con acceso confirmado.",
    actionDurations: [
      { label: "Aviso", days: 1 },
      { label: "Entrega", days: 1 },
      { label: "Costo final", days: 1 },
    ],
    startWeek: 2,
    endWeek: 3,
  },
  {
    id: "fase-4",
    number: 4,
    title: "Preparación Depto Nuevo",
    shortTitle: "Preparación",
    weekLabel: "Semana 3–4",
    calendarLabel: "Mayo · semana 2–4",
    summary: "Dejar el nuevo depto terminado antes del día de carga.",
    emoji: "🎨",
    icon: "home",
    flow: ["Relevamiento", "Materiales", "Pintura", "Limpieza"],
    taskGroups: [
      {
        label: "Qué hacés",
        items: [
          "Coordinar pintor",
          "Comprar materiales",
          "Ejecutar pintura",
          "Limpieza final",
        ],
      },
    ],
    durationLabel: "5–8 días",
    durationDays: [5, 8],
    milestone: "Depto listo para vivir",
    status: "planned",
    risk: "high",
    progress: 0,
    dependencyIds: ["fase-2"],
    readiness: "Lista apenas tengas llaves, materiales y agenda de pintor cerrada.",
    actionDurations: [
      { label: "Relevamiento", days: 1 },
      { label: "Materiales", days: 1 },
      { label: "Pintura", days: 4 },
      { label: "Limpieza", days: 2 },
    ],
    startWeek: 3,
    endWeek: 5,
  },
  {
    id: "fase-5",
    number: 5,
    title: "Logística Mudanza",
    shortTitle: "Logística",
    weekLabel: "Semana 3–5",
    calendarLabel: "Mayo · semana 2–4",
    summary: "Solapar packing y definición de proveedor con la preparación del depto nuevo.",
    emoji: "📦",
    icon: "package",
    flow: ["Presupuestos", "Packing", "Reserva", "Organización"],
    taskGroups: [
      {
        label: "Qué hacés",
        items: [
          "Cotizar mudanza",
          "Empezar packing progresivo",
          "Tirar / vender / donar",
          "Etiquetar todo",
        ],
      },
    ],
    durationLabel: "7–10 días",
    durationDays: [7, 10],
    status: "planned",
    risk: "medium",
    progress: 0,
    dependencyIds: ["fase-2"],
    readiness: "Puede arrancar en paralelo con pintura para ganar aire.",
    actionDurations: [
      { label: "Presupuestos", days: 2 },
      { label: "Packing", days: 4 },
      { label: "Reserva", days: 1 },
      { label: "Organización", days: 2 },
    ],
    startWeek: 3,
    endWeek: 5,
  },
  {
    id: "fase-6",
    number: 6,
    title: "Servicios & Admin",
    shortTitle: "Servicios",
    weekLabel: "Semana 4–5",
    calendarLabel: "Mayo · semana 4 / Junio · semana 1",
    summary: "Mover servicios y domicilios con precisión para evitar fricción post mudanza.",
    emoji: "🔌",
    icon: "wifi",
    flow: ["Internet", "Luz/Gas", "Domicilios", "Apps"],
    taskGroups: [
      {
        label: "Qué hacés",
        items: [
          "Alta servicios nuevo",
          "Baja/transferencia actuales",
          "Cambio domicilio",
        ],
      },
    ],
    durationLabel: "3–7 días",
    durationDays: [3, 7],
    status: "planned",
    risk: "medium",
    progress: 0,
    dependencyIds: ["fase-2"],
    readiness: "Conviene activarla una vez confirmes fecha real de mudanza.",
    actionDurations: [
      { label: "Internet", days: 2 },
      { label: "Luz/Gas", days: 2 },
      { label: "Domicilios", days: 2 },
      { label: "Apps", days: 1 },
    ],
    startWeek: 5,
    endWeek: 6,
  },
  {
    id: "fase-7",
    number: 7,
    title: "Mudanza",
    shortTitle: "Mudanza",
    weekLabel: "Día clave",
    calendarLabel: "Junio · semana 1–3",
    summary: "Día crítico: todo debe caer sobre un depto nuevo ya habitable.",
    emoji: "🚚",
    icon: "move",
    flow: ["Carga", "Traslado", "Descarga", "Setup básico"],
    taskGroups: [
      {
        label: "Día 1",
        items: [
          "Supervisar carga",
          "Supervisar descarga",
          "Chequear todo",
        ],
      },
      {
        label: "Día 2–3",
        items: [
          "Orden básico",
          "Dejar funcional: cama / baño / cocina",
        ],
      },
    ],
    durationLabel: "1–3 días",
    durationDays: [1, 3],
    status: "critical",
    risk: "high",
    progress: 0,
    dependencyIds: ["fase-4", "fase-5", "fase-6"],
    readiness: "No debería ejecutarse sin depto listo, proveedor reservado y servicios mínimos resueltos.",
    actionDurations: [
      { label: "Carga", days: 1 },
      { label: "Traslado", days: 1 },
      { label: "Descarga", days: 1 },
      { label: "Setup básico", days: 1 },
    ],
    startWeek: 6,
    endWeek: 7,
  },
  {
    id: "fase-8",
    number: 8,
    title: "Cierre",
    shortTitle: "Cierre",
    weekLabel: "Post mudanza",
    calendarLabel: "Junio · semana 2–3",
    summary: "Cerrar el ciclo con evidencia, entrega y reclamo de depósito ordenados.",
    emoji: "🧾",
    icon: "receipt",
    flow: ["Limpieza final", "Entrega", "Evidencia", "Depósito"],
    taskGroups: [
      {
        label: "Qué hacés",
        items: [
          "Entregar depto actual",
          "Sacar fotos",
          "Guardar comprobantes",
          "Reclamar depósito",
        ],
      },
    ],
    durationLabel: "1–30 días",
    durationDays: [1, 30],
    status: "planned",
    risk: "low",
    progress: 0,
    dependencyIds: ["fase-3", "fase-7"],
    readiness: "Se ordena mejor si la evidencia ya está preparada el mismo día de salida.",
    actionDurations: [
      { label: "Limpieza final", days: 1 },
      { label: "Entrega", days: 1 },
      { label: "Evidencia", days: 1 },
      { label: "Depósito", days: 30 },
    ],
    startWeek: 7,
    endWeek: 8,
  },
];

export const roadmapWindows: RoadmapBlock[] = [
  {
    id: "roadmap-1",
    label: "Decisión + contrato",
    note: "Abril · semanas 3–4",
    startWeek: 0,
    endWeek: 1,
    tone: "blue",
  },
  {
    id: "roadmap-2",
    label: "Firma + aviso salida",
    note: "Mayo · semanas 1–2",
    startWeek: 2,
    endWeek: 3,
    tone: "amber",
  },
  {
    id: "roadmap-3",
    label: "Pintura + packing",
    note: "Mayo · semanas 2–4",
    startWeek: 3,
    endWeek: 5,
    tone: "mint",
  },
  {
    id: "roadmap-4",
    label: "Mudanza + cierre",
    note: "Junio · semanas 1–3",
    startWeek: 6,
    endWeek: 8,
    tone: "graphite",
  },
];

export const criticalDependencies: CriticalDependency[] = [
  {
    id: "dep-1",
    title: "Contrato firmado antes de avisar salida",
    detail: "La salida actual no se comunica hasta tener contrato nuevo, pago inicial y acceso asegurados.",
    impact: "Evita quedarte sin red si la negociación final se mueve.",
  },
  {
    id: "dep-2",
    title: "Acceso al depto antes de pintar",
    detail: "La fase de pintura solo funciona si llaves y ventana de trabajo están cerradas.",
    impact: "Protege la calidad del nuevo espacio y evita improvisación.",
  },
  {
    id: "dep-3",
    title: "Mudanza coordinada con depto listo",
    detail: "La logística depende de que pintura, limpieza y setup mínimo ya estén resueltos.",
    impact: "Reduce caos y doble manipulación el día clave.",
  },
  {
    id: "dep-4",
    title: "Fechas claras de entrega",
    detail: "La devolución actual y la ocupación del nuevo depto necesitan ventanas claras y compatibles.",
    impact: "Mantiene control de costos y evita fricciones administrativas.",
  },
];

export const visualFlow = [
  "Decisión",
  "Contrato nuevo",
  "Aviso salida",
  "Pintura nuevo",
  "Packing",
  "Mudanza",
  "Cierre final",
];

export const recommendationPanel = {
  strategy: [
    "Solapamiento de 2–3 semanas",
    "Te permite pintar tranquilo",
    "Evita mudanza caótica",
    "Reduce riesgo",
  ],
  pitfall: [
    "Mudarte directo sin preparación",
    "Termina en estrés",
    "Doble gasto",
    "Mala experiencia",
  ],
  pinMap: [
    "Semana 1: decisión",
    "Semana 2: firma",
    "Semana 3–4: pintura + logística",
    "Semana 5–6: mudanza",
    "Junio: instalado",
  ],
};

export const calendarWeeks = [
  "Abr S3",
  "Abr S4",
  "May S1",
  "May S2",
  "May S3",
  "May S4",
  "Jun S1",
  "Jun S2",
  "Jun S3",
];

export const calendarMonths = [
  { label: "Abril", span: 2 },
  { label: "Mayo", span: 4 },
  { label: "Junio", span: 3 },
];
