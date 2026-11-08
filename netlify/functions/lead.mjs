/**
 * NETLIFY FUNCTION: /api/lead (netlify/functions/lead.mjs)
 *
 * Flujo completo al registrar un lead en el formulario:
 * 1. Guarda todos los datos + etiquetas + evidencia legal TCPA/CAN-SPAM en Supabase (tabla `leads`).
 * 2. Registra el contacto en Resend Audiences (para que aparezca en tu lista de Contactos de Resend).
 * 3. Envía de inmediato el correo HTML "Correo Entrega Guia.html" personalizado con Resend.
 * 4. Envía una notificación interna a tu correo (NOTIFY_EMAIL) con la ficha completa del lead.
 * 5. Programa automáticamente en Resend (scheduled_at) un trigger de seguimiento a las 24h
 *    personalizado según la preocupación que marcó el lead ("¿Qué te quita más el sueño hoy?").
 */

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sanitizeTagValue(val) {
  return String(val || "none")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 64);
}

/**
 * Genera el HTML exacto de `referencia/Correo Entrega Guia.html` (Sección 6 del README)
 */
function buildDeliveryEmailHtml({
  nombre,
  urlLogo,
  urlMockupLibro,
  enlacePdf,
  enlaceAgenda,
  direccionPostal,
  enlaceBaja
}) {
  const safeNombre = escapeHtml(nombre || "colega");
  return `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>Aquí están tus 10 reglas de oro</title>
<!--[if mso]><style>table,td{border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;}</style><![endif]-->
<style>
@media (max-width:620px){ .px{padding-left:22px !important;padding-right:22px !important;} .h1{font-size:24px !important;line-height:30px !important;} }
</style>
</head>
<body style="margin:0;padding:0;background-color:#EEF3F9;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#EEF3F9;">Léela hoy con tu equipo. Te toma 10 minutos.&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#EEF3F9;">
<tr><td align="center" style="padding:24px 12px;">
<!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#FFFFFE;border-radius:16px;overflow:hidden;">

<tr><td align="center" bgcolor="#E3F8FE" style="background-color:#E3F8FE;padding:28px 24px;">
  <img src="${urlLogo}" width="200" alt="Clear Onboarding" style="display:block;width:200px;max-width:200px;height:auto;border:0;font-family:Arial,sans-serif;font-size:20px;font-weight:bold;color:#012B8B;">
</td></tr>

<tr><td align="center" bgcolor="#E3F8FE" style="background-color:#E3F8FE;padding:0 24px 32px;">
  <img src="${urlMockupLibro}" width="300" alt="Guía: Las 10 reglas de oro de un equipo de limpieza" style="display:block;width:300px;max-width:100%;height:auto;border:0;border-radius:8px;">
</td></tr>

<tr><td class="px" style="padding:36px 44px 8px;font-family:'Poppins',Arial,Helvetica,sans-serif;color:#1B2440;">
  <p style="margin:0 0 16px;font-size:18px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;color:#012B8B;">Hola, ${safeNombre}:</p>
  <p style="margin:0 0 16px;font-size:16px;line-height:25px;mso-line-height-rule:exactly;">Gracias por descargar <strong style="color:#012B8B;">Las 10 reglas de oro de un equipo de limpieza</strong>.</p>
  <p style="margin:0 0 28px;font-size:16px;line-height:25px;mso-line-height-rule:exactly;">Mi recomendación: léela con tu equipo en una reunión corta y pídele a cada persona que firme que la recibió. Una regla que nadie firmó es difícil de exigir.</p>
</td></tr>

<tr><td class="px" align="left" style="padding:0 44px 36px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
    <td align="center" bgcolor="#009ED7" style="background-color:#009ED7;border-radius:12px;">
      <a href="${enlacePdf}" style="display:block;padding:16px 32px;font-family:'Poppins',Arial,Helvetica,sans-serif;font-size:17px;line-height:20px;font-weight:bold;color:#FFFFFF;text-decoration:none;border-radius:12px;">Descargar mi guía</a>
    </td>
  </tr></table>
</td></tr>

<tr><td class="px" style="padding:0 44px 36px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#F3FBFE" style="background-color:#F3FBFE;border:1px solid #CDEFFB;border-radius:14px;">
    <tr><td style="padding:24px 24px 8px;font-family:'Poppins',Arial,Helvetica,sans-serif;font-size:17px;line-height:22px;font-weight:bold;color:#012B8B;">Empieza por aquí</td></tr>
    <tr><td style="padding:8px 24px 20px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="34" valign="top" style="padding:8px 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="20" height="20" style="width:20px;height:20px;border:2px solid #009ED7;border-radius:5px;background-color:#FFFFFE;font-size:1px;line-height:1px;">&nbsp;</td></tr></table></td>
          <td valign="top" style="padding:8px 0;font-family:'Poppins',Arial,Helvetica,sans-serif;font-size:15px;line-height:22px;color:#1B2440;">Lee la guía completa</td>
        </tr>
        <tr>
          <td width="34" valign="top" style="padding:8px 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="20" height="20" style="width:20px;height:20px;border:2px solid #009ED7;border-radius:5px;background-color:#FFFFFE;font-size:1px;line-height:1px;">&nbsp;</td></tr></table></td>
          <td valign="top" style="padding:8px 0;font-family:'Poppins',Arial,Helvetica,sans-serif;font-size:15px;line-height:22px;color:#1B2440;">Elige las 3 reglas que más le hacen falta a tu equipo</td>
        </tr>
        <tr>
          <td width="34" valign="top" style="padding:8px 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="20" height="20" style="width:20px;height:20px;border:2px solid #009ED7;border-radius:5px;background-color:#FFFFFE;font-size:1px;line-height:1px;">&nbsp;</td></tr></table></td>
          <td valign="top" style="padding:8px 0;font-family:'Poppins',Arial,Helvetica,sans-serif;font-size:15px;line-height:22px;color:#1B2440;">Compártelas con tu equipo esta semana</td>
        </tr>
      </table>
    </td></tr>
  </table>
</td></tr>

<tr><td class="px" style="padding:0 44px 36px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#012B8B" style="background-color:#012B8B;border-radius:14px;">
    <tr><td style="padding:28px 28px 20px;font-family:'Poppins',Arial,Helvetica,sans-serif;font-size:17px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;">Clear Onboarding hace que cada empleada reciba las reglas en su portal, con fecha y confirmación de lectura.</td></tr>
    <tr><td style="padding:0 28px 28px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td align="center" bgcolor="#009ED7" style="background-color:#009ED7;border-radius:12px;">
          <a href="${enlaceAgenda}" style="display:block;padding:14px 26px;font-family:'Poppins',Arial,Helvetica,sans-serif;font-size:16px;line-height:20px;font-weight:bold;color:#FFFFFF;text-decoration:none;border-radius:12px;">Agendar llamada rápida</a>
        </td>
      </tr></table>
    </td></tr>
  </table>
</td></tr>

<tr><td class="px" style="padding:0 44px 40px;font-family:'Poppins',Arial,Helvetica,sans-serif;">
  <p style="margin:0;font-size:16px;line-height:24px;color:#1B2440;">Luma<br><span style="color:#5A6785;">Clear Onboarding</span></p>
</td></tr>

<tr><td class="px" bgcolor="#F4F6FA" style="background-color:#F4F6FA;padding:28px 44px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:19px;color:#5A6785;">
  <p style="margin:0 0 8px;"><strong style="color:#1B2440;">Clear Onboarding</strong><br>${escapeHtml(direccionPostal)}</p>
  <p style="margin:0 0 8px;">Recibes este correo porque descargaste nuestra guía.</p>
  <p style="margin:0;"><a href="${enlaceBaja}" style="color:#012B8B;text-decoration:underline;font-weight:bold;">Darme de baja</a></p>
</td></tr>

</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr>
</table>
</body>
</html>`;
}

/**
 * Trigger de Marketing #1 (Seguimiento automático a las 24h según la preocupación principal elegida)
 */
function buildFollowUpTriggerEmail({ nombre, empresa, preocupaciones, enlaceAgenda, direccionPostal, enlaceBaja }) {
  const safeNombre = escapeHtml(nombre || "colega");
  const safeEmpresa = escapeHtml(empresa || "tu empresa");
  const principal = Array.isArray(preocupaciones) && preocupaciones.length > 0 ? preocupaciones[0] : "";

  const hooksPorDolor = {
    "Rotación y renuncias": "Vi que al descargar la guía marcaste <strong>Rotación y renuncias</strong>. La mayoría de las renuncias sorpresa ocurren en los primeros 14 días cuando la empleada siente que no hay estructura clara desde el día uno.",
    "Quejas de clientes": "Vi que al descargar la guía marcaste <strong>Quejas de clientes</strong>. Cuando cada empleada limpia a su manera, el cliente nota la diferencia. La Regla #4 de la guía resuelve exactamente eso.",
    "Faltas y llegadas tarde": "Vi que al descargar la guía marcaste <strong>Faltas y llegadas tarde</strong>. Empieza hoy mismo por la Regla #1 («Llega a tiempo. Si no puedes, avisa antes») y haz que cada empleada la firme.",
    "Papeles y documentos de las empleadas": "Vi que al descargar la guía marcaste <strong>Papeles y documentos de las empleadas</strong>. Tener los documentos y firmas dispersos en WhatsApp o papel te deja expuesta ante cualquier reclamo.",
    "Capacitar a las nuevas": "Vi que al descargar la guía marcaste <strong>Capacitar a las nuevas</strong>. Cuando estandarizas las 10 reglas desde el primer día, entrenar a una nueva empleada deja de depender de tu memoria."
  };

  const parrafoPersonalizado =
    hooksPorDolor[principal] ||
    ` Quería saber si pudiste revisar las <strong>10 reglas de oro</strong> para implementarlas esta semana en <strong>${safeEmpresa}</strong>.`;

  return {
    subject: `${nombre}, ¿por cuál regla vas a empezar en ${empresa}?`,
    html: `<!DOCTYPE html>
<html lang="es">
<body style="margin:0;padding:24px 12px;background-color:#EEF3F9;font-family:'Poppins',Arial,sans-serif;color:#1B2440;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;margin:0 auto;background:#FFFFFF;border-radius:16px;padding:36px 40px;">
    <tr><td>
      <p style="margin:0 0 16px;font-size:18px;font-weight:bold;color:#012B8B;">Hola, ${safeNombre}:</p>
      <p style="margin:0 0 16px;font-size:16px;line-height:25px;">${parrafoPersonalizado}</p>
      <p style="margin:0 0 24px;font-size:16px;line-height:25px;">En <strong>Clear Onboarding</strong> ayudamos a dueñas de empresas de limpieza a que cada empleada reciba estas reglas en su propio portal desde el celular, con fecha y firma digital de lectura.</p>
      <p style="margin:0 0 28px;">
        <a href="${enlaceAgenda}" style="display:inline-block;padding:14px 26px;background-color:#009ED7;color:#FFFFFF;font-weight:bold;font-size:16px;text-decoration:none;border-radius:12px;">Agendar llamada rápida (15 minutos)</a>
      </p>
      <p style="margin:0 0 24px;font-size:15px;color:#5A6785;">Luma<br>Clear Onboarding</p>
      <hr style="border:none;border-top:1px solid #E3EAF4;margin:24px 0;">
      <p style="margin:0;font-size:12px;color:#5A6785;">Clear Onboarding · ${escapeHtml(direccionPostal)} · <a href="${enlaceBaja}" style="color:#012B8B;">Darme de baja</a></p>
    </td></tr>
  </table>
</body>
</html>`
  };
}

export async function handler(event) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Método no permitido. Usa POST." })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (_) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: "JSON inválido." })
    };
  }

  const nombre = (body.nombre || "").trim();
  const correo = (body.correo || "").trim().toLowerCase();
  const empresa = (body.empresa || "").trim();
  const estado = (body.estado || "").trim();
  const whatsapp = (body.whatsapp || "").trim() || null;
  const tamanoEquipo = body.tamano_equipo || null;
  const preocupaciones = Array.isArray(body.preocupaciones) ? body.preocupaciones : [];
  const tags = Array.isArray(body.tags) ? body.tags : [];

  if (!nombre || !correo || !empresa || !estado || !body.consent_email || !body.consent_privacidad) {
    return {
      statusCode: 422,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Faltan campos obligatorios o consentimientos requeridos." })
    };
  }

  // IP real y metadatos TCPA/CAN-SPAM desde Netlify
  const ipAddress =
    event.headers["x-nf-client-connection-ip"] ||
    (event.headers["x-forwarded-for"] ? event.headers["x-forwarded-for"].split(",")[0].trim() : null) ||
    "0.0.0.0";
  const userAgent = body.user_agent || event.headers["user-agent"] || "";
  const createdAtIso = body.timestamp || new Date().toISOString();

  // Variables de entorno configuradas en Netlify
  const SUPABASE_URL = process.env.SUPABASE_URL || "https://uzztuurhzzdlyttumqgk.supabase.co";
  const SUPABASE_KEY =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY;
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const RESEND_SEGMENT_ID =
    process.env.RESEND_SEGMENT_ID ||
    process.env.RESEND_AUDIENCE_ID ||
    "add9347d-89b4-4b1f-afb3-579bd5e51bb2";
  const RESEND_FROM_EMAIL =
    process.env.RESEND_FROM_EMAIL || "Luma - Clear Onboarding <info@clearonboarding.com>";
  const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || "mayegomezconsultor@gmail.com";
  const ENABLE_24H_TRIGGER = process.env.ENABLE_24H_TRIGGER !== "false";

  const SITE_URL = process.env.URL || "https://guia.clearonboarding.com";
  const ENLACE_PDF = process.env.ENLACE_PDF || `${SITE_URL}/assets/Las-10-reglas-de-oro-Clear-Onboarding.pdf`;
  const ENLACE_AGENDA = process.env.ENLACE_AGENDA || "https://calendly.com/clearonboarding/15min";
  const DIRECCION_POSTAL = process.env.DIRECCION_POSTAL || "Clear Onboarding LLC, Estados Unidos";
  const ENLACE_BAJA = process.env.ENLACE_BAJA || `${SITE_URL}/politica-de-privacidad/`;
  const URL_LOGO = process.env.URL_LOGO || `${SITE_URL}/assets/logo-color.png`;
  const URL_MOCKUP_LIBRO = process.env.URL_MOCKUP_LIBRO || `${SITE_URL}/assets/portada-ebook-10-reglas.webp`;

  const results = {
    supabase_saved: false,
    resend_contact_created: false,
    resend_email_sent: false,
    resend_trigger_scheduled: false
  };

  let resendContactId = null;
  let resendEmailId = null;

  // -------------------------------------------------------------------------
  // PASO 1: Crear Contacto en Resend (soporta nuevo Contacts + Properties + Segment ID)
  // -------------------------------------------------------------------------
  if (RESEND_API_KEY) {
    try {
      const contactPayload = {
        email: correo,
        first_name: nombre,
        last_name: `${empresa} (${estado})`,
        unsubscribed: false,
        properties: {
          empresa: empresa,
          estado: estado,
          whatsapp: whatsapp || "",
          tamano_equipo: tamanoEquipo || "",
          preocupaciones: preocupaciones.join(", ")
        }
      };

      const contactEndpoint = RESEND_SEGMENT_ID
        ? `https://api.resend.com/audiences/${RESEND_SEGMENT_ID}/contacts`
        : "https://api.resend.com/contacts";

      let contactRes = await fetch(contactEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(contactPayload)
      });

      // Fallback si las propiedades aún no han sido creadas en el panel de Resend
      if (!contactRes.ok) {
        const { properties, ...basicContactPayload } = contactPayload;
        contactRes = await fetch(contactEndpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(basicContactPayload)
        });
      }

      if (contactRes.ok) {
        const contactData = await contactRes.json();
        resendContactId = contactData.id || null;
        results.resend_contact_created = true;
      }

      // Asegurar que el contacto quede asignado al Segmento en el nuevo API de Resend Segments
      if (RESEND_SEGMENT_ID) {
        await fetch(
          `https://api.resend.com/contacts/${encodeURIComponent(correo)}/segments/${RESEND_SEGMENT_ID}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json"
            }
          }
        ).catch(() => {});
      }
    } catch (err) {
      console.error("Error creando contacto en Resend:", err);
    }
  }

  // -------------------------------------------------------------------------
  // PASO 2: Enviar correo de entrega inmediato con Resend ("Correo Entrega Guia.html")
  // -------------------------------------------------------------------------
  if (RESEND_API_KEY) {
    try {
      const htmlEmail = buildDeliveryEmailHtml({
        nombre,
        urlLogo: URL_LOGO,
        urlMockupLibro: URL_MOCKUP_LIBRO,
        enlacePdf: ENLACE_PDF,
        enlaceAgenda: ENLACE_AGENDA,
        direccionPostal: DIRECCION_POSTAL,
        enlaceBaja: ENLACE_BAJA
      });

      const resendTags = [
        { name: "funnel", value: "10_reglas_oro" },
        { name: "estado", value: sanitizeTagValue(estado) },
        { name: "equipo", value: sanitizeTagValue(tamanoEquipo || "no_especificado") },
        { name: "dolor_principal", value: sanitizeTagValue(preocupaciones[0] || "ninguno") }
      ];

      const sendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: RESEND_FROM_EMAIL,
          to: [correo],
          subject: `Aquí están tus 10 reglas de oro, ${nombre}`,
          html: htmlEmail,
          tags: resendTags
        })
      });

      if (sendRes.ok) {
        const sendData = await sendRes.json();
        resendEmailId = sendData.id || null;
        results.resend_email_sent = true;
      } else {
        console.error("Error enviando correo en Resend:", await sendRes.text());
      }
    } catch (err) {
      console.error("Excepción enviando correo en Resend:", err);
    }

    // -----------------------------------------------------------------------
    // PASO 3: Enviar aviso interno con la ficha completa del lead a NOTIFY_EMAIL
    // -----------------------------------------------------------------------
    if (NOTIFY_EMAIL) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: RESEND_FROM_EMAIL,
            to: [NOTIFY_EMAIL],
            subject: `Nuevo Lead Guía: ${nombre} — ${empresa} (${estado})`,
            html: `
              <div style="font-family:Arial,sans-serif;max-width:560px;padding:20px;border:1px solid #E3EAF4;border-radius:12px;">
                <h2 style="color:#012B8B;margin-top:0;">Nuevo lead registrado en el Funnel</h2>
                <p><strong>Nombre:</strong> ${escapeHtml(nombre)}</p>
                <p><strong>Correo:</strong> ${escapeHtml(correo)}</p>
                <p><strong>Empresa:</strong> ${escapeHtml(empresa)}</p>
                <p><strong>Estado:</strong> ${escapeHtml(estado)}</p>
                <p><strong>WhatsApp:</strong> ${escapeHtml(whatsapp || "No proporcionado")}</p>
                <p><strong>Tamaño de equipo:</strong> ${escapeHtml(tamanoEquipo || "No especificado")}</p>
                <p><strong>¿Qué le quita el sueño?:</strong> ${escapeHtml(preocupaciones.join(", ") || "Ninguno seleccionado")}</p>
                <p><strong>Consentimiento SMS/WhatsApp:</strong> ${body.consent_sms ? "Sí" : "No"}</p>
                <p><strong>UTM Source / Medium / Campaign:</strong> ${escapeHtml(body.utm_source || "-")} / ${escapeHtml(body.utm_medium || "-")} / ${escapeHtml(body.utm_campaign || "-")}</p>
                <p style="font-size:12px;color:#5A6785;">Fecha: ${escapeHtml(createdAtIso)} · IP: ${escapeHtml(ipAddress)}</p>
              </div>
            `
          })
        });
      } catch (err) {
        console.error("Error enviando notificación interna:", err);
      }
    }

    // -----------------------------------------------------------------------
    // PASO 4: Trigger de Marketing — Correo de seguimiento a las 24h personalizado por dolor
    // -----------------------------------------------------------------------
    if (ENABLE_24H_TRIGGER && body.consent_email) {
      try {
        const scheduledDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        const followUp = buildFollowUpTriggerEmail({
          nombre,
          empresa,
          preocupaciones,
          enlaceAgenda: ENLACE_AGENDA,
          direccionPostal: DIRECCION_POSTAL,
          enlaceBaja: ENLACE_BAJA
        });

        const triggerRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: RESEND_FROM_EMAIL,
            to: [correo],
            subject: followUp.subject,
            html: followUp.html,
            scheduled_at: scheduledDate,
            tags: [
              { name: "funnel", value: "10_reglas_oro" },
              { name: "sequence_step", value: "followup_24h" }
            ]
          })
        });

        if (triggerRes.ok) {
          results.resend_trigger_scheduled = true;
        }
      } catch (err) {
        console.error("Error programando trigger 24h en Resend:", err);
      }
    }
  }

  // -------------------------------------------------------------------------
  // PASO 5: Guardar registro completo en Supabase (Tabla `leads`)
  // -------------------------------------------------------------------------
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const dbRecord = {
        nombre,
        correo,
        empresa,
        estado,
        whatsapp,
        tamano_equipo: tamanoEquipo,
        preocupaciones,
        tags,
        consent_email: !!body.consent_email,
        consent_sms: !!body.consent_sms,
        consent_privacidad: !!body.consent_privacidad,
        consent_texts: body.consent_texts || {},
        ip_address: ipAddress,
        user_agent: userAgent,
        page_url: body.page_url || "",
        utm_source: body.utm_source || null,
        utm_medium: body.utm_medium || null,
        utm_campaign: body.utm_campaign || null,
        utm_content: body.utm_content || null,
        utm_term: body.utm_term || null,
        resend_contact_id: resendContactId,
        resend_email_id: resendEmailId,
        email_status: results.resend_email_sent ? "sent" : "pending",
        created_at: createdAtIso
      };

      const sbHeaders = {
        apikey: SUPABASE_KEY,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      };
      if (!SUPABASE_KEY.startsWith("sb_")) {
        sbHeaders["Authorization"] = `Bearer ${SUPABASE_KEY}`;
      }

      const sbRes = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
        method: "POST",
        headers: sbHeaders,
        body: JSON.stringify(dbRecord)
      });

      if (sbRes.ok) {
        results.supabase_saved = true;
      } else {
        console.error("Error guardando en Supabase:", await sbRes.text());
      }
    } catch (err) {
      console.error("Excepción guardando en Supabase:", err);
    }
  }

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({
      ok: true,
      ...results
    })
  };
}

