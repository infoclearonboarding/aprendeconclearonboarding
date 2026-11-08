/**
 * CONFIGURACIÓN GLOBAL DEL FUNNEL — CLEAR ONBOARDING
 * Edita este archivo para actualizar enlaces, endpoints (Supabase / Resend) y píxeles.
 */
window.FUNNEL_CONFIG = {
  // 1. Enlaces principales del funnel (Sección 2 del README)
  ENLACE_PDF: "./assets/Las-10-reglas-de-oro-Clear-Onboarding.pdf", // Reemplazar por la URL pública final del PDF
  ENLACE_AGENDA: "https://calendly.com/clearonboarding/15min",      // Reemplazar por el enlace real de Calendly / GHL / Google Calendar
  DIRECCION_POSTAL: "Clear Onboarding LLC · Estados Unidos",        // Dirección física para cumplimiento CAN-SPAM

  // 2. Conexión con Netlify Function (/api/lead) + Resend + Supabase
  LEAD_ENDPOINT: "/api/lead",

  // Proyecto Supabase conectado (respaldo directo desde cliente si se prueba fuera de Netlify)
  SUPABASE_URL: "https://uzztuurhzzdlyttumqgk.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable_7kBcJDX7v3yjDoQbyVUF1g_xhGHCBzM",
  SUPABASE_ANON_KEY: "",

  // Modo demostración: si aún no has puesto tu URL de Supabase en GitHub Pages,
  // permite probar el flujo completo (guarda respaldo en localStorage y redirige a /guia/gracias)
  ALLOW_DEMO_FALLBACK: true,

  // 3. Analítica y Píxeles (Sección 2 del README)
  META_PIXEL_ID: "",     // Ej: "123456789012345"
  TIKTOK_PIXEL_ID: "",   // Ej: "CXXXXXXXXXXXXXXX"
  GA4_MEASUREMENT_ID: "",// Ej: "G-XXXXXXXXXX"

  // 4. Textos de vista previa de páginas interiores (Sección 4.4 del README)
  PAGINAS_PREVIEW: [
    { n: "01", regla: "Llega a tiempo. Si no puedes, avisa antes.", tf: "rotate(-9deg) translateY(10px)", z: 1 },
    { n: "04", regla: "Cada casa se limpia en el mismo orden.", tf: "translateY(-8px)", z: 3 },
    { n: "07", regla: "Lo que ves en casa del cliente, se queda ahí.", tf: "rotate(9deg) translateY(10px)", z: 2 }
  ],

  // 5. Pendiente Sección 8: Video de TikTok (desactivado hasta que el cliente entregue el MP4)
  TIKTOK_VIDEO: {
    enabled: false,
    pillText: "▶ Mira el caso en 40 segundos",
    blockTitle: "Este caso lo contamos en TikTok",
    videoUrl: "",
    posterUrl: "",
    tiktokProfileUrl: "https://www.tiktok.com/@clearonboarding"
  }
};

