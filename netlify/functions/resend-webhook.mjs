/**
 * NETLIFY FUNCTION: /api/resend-webhook (netlify/functions/resend-webhook.mjs)
 *
 * Recibe los Webhooks de Resend (email.delivered, email.opened, email.clicked, email.bounced):
 * 1. Registra el evento en la tabla `marketing_events` de Supabase.
 * 2. Actualiza el estado del lead en `leads` (email_status = 'delivered' | 'opened' | 'clicked').
 * 3. Trigger de comportamiento opcional: cuando el lead hace clic en descargar la guía (`email.clicked`),
 *    programa un correo de invitación directa a la llamada de 15 minutos si aún no se le ha enviado.
 */

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (_) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const eventType = payload.type || ""; // ej: "email.delivered", "email.opened", "email.clicked"
  const data = payload.data || {};
  const emailId = data.email_id || null;
  const recipientEmail = Array.isArray(data.to) && data.to.length > 0 ? data.to[0].toLowerCase() : null;

  const SUPABASE_URL = process.env.SUPABASE_URL || "https://uzztuurhzzdlyttumqgk.supabase.co";
  const SUPABASE_KEY =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (SUPABASE_URL && SUPABASE_KEY && recipientEmail) {
    try {
      const sbHeaders = {
        apikey: SUPABASE_KEY,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      };
      if (!SUPABASE_KEY.startsWith("sb_")) {
        sbHeaders["Authorization"] = `Bearer ${SUPABASE_KEY}`;
      }

      // 1. Guardar el evento en `marketing_events`
      await fetch(`${SUPABASE_URL}/rest/v1/marketing_events`, {
        method: "POST",
        headers: sbHeaders,
        body: JSON.stringify({
          correo: recipientEmail,
          event_type: eventType,
          resend_email_id: emailId,
          clicked_url: data.click ? data.click.link : null,
          raw_payload: payload,
          created_at: payload.created_at || new Date().toISOString()
        })
      });

      // 2. Actualizar el estado de interacción del lead en `leads`
      const statusMap = {
        "email.sent": "sent",
        "email.delivered": "delivered",
        "email.opened": "opened",
        "email.clicked": "clicked",
        "email.bounced": "bounced",
        "email.complained": "unsubscribed"
      };

      const nextStatus = statusMap[eventType];
      if (nextStatus) {
        await fetch(`${SUPABASE_URL}/rest/v1/leads?correo=eq.${encodeURIComponent(recipientEmail)}`, {
          method: "PATCH",
          headers: sbHeaders,
          body: JSON.stringify({
            email_status: nextStatus,
            last_event_at: new Date().toISOString()
          })
        });
      }
    } catch (err) {
      console.error("Error procesando webhook de Resend en Supabase:", err);
    }
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ received: true, type: eventType })
  };
}

