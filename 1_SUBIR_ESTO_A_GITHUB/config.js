/**
 * CONFIGURACIÓN GLOBAL DEL FUNNEL — CLEAR ONBOARDING
 * Edita este archivo para actualizar enlaces, endpoints (Supabase / Resend) y píxeles.
 */
window.FUNNEL_CONFIG = {
  // 1. Enlaces principales del funnel (Sección 2 del README)
  ENLACE_PDF: "/assets/Las-10-reglas-de-oro-Clear-Onboarding.pdf", // PDF oficial de 16 páginas alojado en /assets/
  ENLACE_AGENDA: "https://wa.me/584124784922?text=Hola%2C%20descargu%C3%A9%20la%20gu%C3%ADa%20de%20las%2010%20reglas%20de%20oro%20y%20quiero%20ver%20c%C3%B3mo%20funciona%20Clear%20Onboarding", // Enlace de contacto / agenda (pág. 15 del PDF)
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

  // 4. Textos reales de vista previa de páginas interiores del PDF (Sección 4.4 del README)
  PAGINAS_PREVIEW: [
    { n: "01", regla: "El servicio se hace entre todos: quien termina, ayuda.", tf: "rotate(-9deg) translateY(10px)", z: 1 },
    { n: "04", regla: "Con uniforme, eres la empresa.", tf: "translateY(-8px)", z: 3 },
    { n: "07", regla: "El celular es herramienta de trabajo, no distracción.", tf: "rotate(9deg) translateY(10px)", z: 2 }
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

