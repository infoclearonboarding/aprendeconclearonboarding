/**
 * LÓGICA DE INTERFAZ, VALIDACIÓN, ANALÍTICA Y ENVÍO A SUPABASE + RESEND
 * Funnel: "Las 10 reglas de oro de un equipo de limpieza" — Clear Onboarding
 */
(function () {
  // Purga inmediata de badges o iframes publicitarios inyectados por la plataforma de hosting
  function purgeNetlifyBadges() {
    var selectors = [
      'iframe[src*="netlify"]',
      'iframe[title*="Netlify" i]',
      'iframe[id*="netlify" i]',
      '[id*="netlify-badge" i]',
      '[class*="netlify-badge" i]',
      '[data-netlify-badge]',
      'netlify-badge',
      'div[style*="2147483647"]'
    ];
    selectors.forEach(function(sel) {
      document.querySelectorAll(sel).forEach(function(el) {
        if (!el.closest('form')) {
          el.remove();
        }
      });
    });
  }
  purgeNetlifyBadges();
  window.addEventListener('load', purgeNetlifyBadges);
  try {
    var obs = new MutationObserver(purgeNetlifyBadges);
    obs.observe(document.documentElement || document.body, { childList: true, subtree: true });
  } catch (e) {}

  const CFG = window.FUNNEL_CONFIG || {};

  const ESTADOS = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
    "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
    "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
    "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico",
    "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
    "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
    "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
  ];

  const EQUIPO_OPTS = ["1 a 5", "6 a 10", "11 a 15", "Más de 15"];

  const SUENOS_OPTS = [
    "Rotación y renuncias",
    "Quejas de clientes",
    "Faltas y llegadas tarde",
    "Papeles y documentos de las empleadas",
    "Capacitar a las nuevas"
  ];

  const CONSENT_TEXTS = {
    consent_email: "Acepto recibir la guía y correos de Clear Onboarding con recursos para mi empresa. Puedo darme de baja cuando quiera.",
    consent_sms: "Acepto recibir mensajes por WhatsApp o SMS de Clear Onboarding. Pueden aplicar tarifas de mensajes y datos. Responde STOP para cancelar.",
    consent_privacidad: "He leído la Política de Privacidad."
  };

  // ---------------------------------------------------------------------------
  // 1. Analítica (Meta Pixel, TikTok Pixel, GA4)
  // ---------------------------------------------------------------------------
  function initAnalytics() {
    if (CFG.META_PIXEL_ID && !window.fbq) {
      !(function (f, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = "2.0";
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      window.fbq("init", CFG.META_PIXEL_ID);
      window.fbq("track", "PageView");
    }

    if (CFG.GA4_MEASUREMENT_ID && !window.gtag) {
      const s = document.createElement("script");
      s.async = true;
      s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(CFG.GA4_MEASUREMENT_ID);
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag("js", new Date());
      window.gtag("config", CFG.GA4_MEASUREMENT_ID);
    }

    if (CFG.TIKTOK_PIXEL_ID && !window.ttq) {
      !(function (w, d, t) {
        w.TiktokAnalyticsObject = t;
        var ttq = (w[t] = w[t] || []);
        ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie"];
        ttq.setAndDefer = function (t, e) {
          t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))); };
        };
        for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
        ttq.load = function (e) {
          var i = "https://analytics.tiktok.com/i18n/pixel/events.js";
          var n = d.createElement("script");
          n.type = "text/javascript";
          n.async = !0;
          n.src = i + "?sdkid=" + e + "&lib=" + t;
          var a = d.getElementsByTagName("script")[0];
          a.parentNode.insertBefore(n, a);
        };
        ttq.load(CFG.TIKTOK_PIXEL_ID);
        ttq.page();
      })(window, document, "ttq");
    }
  }

  function trackEvent(eventName, payload) {
    try {
      if (typeof window.fbq === "function") {
        window.fbq("track", eventName, payload || {});
      }
      if (typeof window.ttq === "object" && typeof window.ttq.track === "function") {
        window.ttq.track(eventName === "Lead" ? "SubmitForm" : eventName, payload || {});
      }
      if (typeof window.gtag === "function") {
        window.gtag("event", eventName === "Lead" ? "generate_lead" : "view_item", payload || {});
      }
    } catch (err) {
      console.warn("Analytics warning:", err);
    }
  }

  // ---------------------------------------------------------------------------
  // 2. Año dinámico en Footer y enlaces dinámicos de configuración
  // ---------------------------------------------------------------------------
  function applyGlobalBindings() {
    const yearEls = document.querySelectorAll("[data-current-year]");
    const currentYear = new Date().getFullYear();
    yearEls.forEach(function (el) {
      el.textContent = currentYear;
    });

    if (CFG.ENLACE_PDF) {
      document.querySelectorAll("[data-pdf-link]").forEach(function (el) {
        el.setAttribute("href", CFG.ENLACE_PDF);
      });
    }
    if (CFG.ENLACE_AGENDA) {
      document.querySelectorAll("[data-agenda-link]").forEach(function (el) {
        el.setAttribute("href", CFG.ENLACE_AGENDA);
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 3. Lógica de Página de Gracias (/guia/gracias)
  // ---------------------------------------------------------------------------
  function initThankYouPage() {
    const firedAlready = sessionStorage.getItem("clear_onboarding_lead_fired");
    if (!firedAlready) {
      trackEvent("Lead", { content_name: "Las 10 reglas de oro de un equipo de limpieza" });
      sessionStorage.setItem("clear_onboarding_lead_fired", "1");
    }
  }

  // ---------------------------------------------------------------------------
  // 4. Lógica de la Landing (/guia)
  // ---------------------------------------------------------------------------
  function initLandingPage() {
    trackEvent("ViewContent", { content_name: "Las 10 reglas de oro de un equipo de limpieza" });

    const formEl = document.getElementById("lead-form");
    const formSectionEl = document.getElementById("formulario");
    const stickyBarEl = document.getElementById("mobile-sticky-bar");
    if (!formEl) return;

    // Estado del formulario
    const state = {
      f: { nombre: "", correo: "", empresa: "", estado: "", whatsapp: "" },
      equipo: "",
      suenos: [],
      c1: false,
      c2: false,
      c3: false,
      err: {},
      intento: false,
      enviando: false
    };

    // Poblar selector de los 50 estados
    const selectEstado = document.getElementById("field-estado");
    if (selectEstado && selectEstado.options.length <= 1) {
      ESTADOS.forEach(function (st) {
        const opt = document.createElement("option");
        opt.value = st;
        opt.textContent = st;
        selectEstado.appendChild(opt);
      });
    }

    // Poblar abanico de páginas interiores si existe el contenedor
    const pagesFanEl = document.getElementById("preview-pages-fan");
    const paginas = CFG.PAGINAS_PREVIEW || [
      { n: "01", regla: "El servicio se hace entre todos: quien termina, ayuda.", tf: "rotate(-9deg) translateY(10px)", z: 1 },
      { n: "04", regla: "Con uniforme, eres la empresa.", tf: "translateY(-8px)", z: 3 },
      { n: "07", regla: "El celular es herramienta de trabajo, no distracción.", tf: "rotate(9deg) translateY(10px)", z: 2 }
    ];
    if (pagesFanEl) {
      pagesFanEl.innerHTML = paginas.map(function (p) {
        return (
          '<div style="flex:none;width:clamp(104px,13vw,172px);aspect-ratio:0.773;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 24px 40px -16px rgba(0,0,0,.55);margin:0 calc(clamp(104px,13vw,172px) * -0.12);transform:' + p.tf + ';z-index:' + p.z + ';position:relative;display:flex;flex-direction:column;">' +
            '<div style="background:#E3F8FE;padding:10% 10% 8%;display:flex;align-items:flex-end;justify-content:space-between;">' +
              '<span style="font-weight:800;font-size:clamp(26px,3.2vw,42px);line-height:.9;color:#009ED7;">' + p.n + '</span>' +
              '<span style="font-size:clamp(6px,.6vw,8px);font-weight:700;letter-spacing:.12em;color:#012B8B;">REGLA</span>' +
            '</div>' +
            '<div style="padding:9% 10%;display:flex;flex-direction:column;gap:6px;flex:1;">' +
              '<div style="background:#012B8B;border-radius:6px;padding:9% 8%;color:#fff;font-weight:700;font-size:clamp(7px,.72vw,10px);line-height:1.3;">' + p.regla + '</div>' +
              '<div style="height:4px;border-radius:2px;background:#E3EAF4;margin-top:4px;"></div>' +
              '<div style="height:4px;border-radius:2px;background:#E3EAF4;width:88%;"></div>' +
              '<div style="height:4px;border-radius:2px;background:#E3EAF4;width:70%;"></div>' +
            '</div>' +
          '</div>'
        );
      }).join("");
    }

    // Referencias a campos del DOM
    const inputs = {
      nombre: document.getElementById("field-nombre"),
      correo: document.getElementById("field-correo"),
      empresa: document.getElementById("field-empresa"),
      estado: document.getElementById("field-estado"),
      whatsapp: document.getElementById("field-whatsapp")
    };

    const errorEls = {
      nombre: document.getElementById("err-nombre"),
      correo: document.getElementById("err-correo"),
      empresa: document.getElementById("err-empresa"),
      estado: document.getElementById("err-estado"),
      c1: document.getElementById("err-c1"),
      c3: document.getElementById("err-c3")
    };

    const teamGroupEl = document.getElementById("equipo-group");
    const suenosGroupEl = document.getElementById("suenos-group");
    const c1Input = document.getElementById("consent-c1");
    const c2Input = document.getElementById("consent-c2");
    const c3Input = document.getElementById("consent-c3");
    const c1Box = document.getElementById("box-c1");
    const c2Box = document.getElementById("box-c2");
    const c3Box = document.getElementById("box-c3");
    const c2Wrapper = document.getElementById("wrapper-c2");
    const globalAlertEl = document.getElementById("form-global-alert");
    const submitBtnEl = document.getElementById("submit-btn");

    // Construir botones de tamaño de equipo
    if (teamGroupEl) {
      teamGroupEl.innerHTML = "";
      EQUIPO_OPTS.forEach(function (label) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.setAttribute("role", "radio");
        btn.setAttribute("aria-checked", "false");
        btn.className = "team-btn";
        btn.textContent = label;
        btn.dataset.val = label;
        btn.addEventListener("click", function () {
          state.equipo = state.equipo === label ? "" : label;
          renderFormState();
        });
        teamGroupEl.appendChild(btn);
      });
    }

    // Construir casillas de "¿Qué te quita más el sueño hoy?"
    if (suenosGroupEl) {
      suenosGroupEl.innerHTML = "";
      SUENOS_OPTS.forEach(function (label) {
        const row = document.createElement("label");
        row.className = "concern-row";
        row.dataset.val = label;

        const chk = document.createElement("input");
        chk.type = "checkbox";
        chk.className = "sr-only-input";
        chk.addEventListener("change", function () {
          if (state.suenos.includes(label)) {
            state.suenos = state.suenos.filter(function (x) { return x !== label; });
          } else {
            state.suenos = state.suenos.concat([label]);
          }
          renderFormState();
        });

        const box = document.createElement("span");
        box.className = "custom-checkbox-box";
        box.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"></path></svg>';

        const txt = document.createElement("span");
        txt.style.cssText = "font-size:15px;color:#1B2440;line-height:1.35;";
        txt.textContent = label;

        row.appendChild(chk);
        row.appendChild(box);
        row.appendChild(txt);
        suenosGroupEl.appendChild(row);
      });
    }

    // Función de validación exacta según README 4.6
    function validar(s) {
      const e = {};
      if (!s.f.nombre.trim()) {
        e.nombre = "Escribe tu nombre.";
      }
      if (!s.f.correo.trim()) {
        e.correo = "Escribe tu correo electrónico.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.f.correo.trim())) {
        e.correo = "Revisa tu correo. Ejemplo: maria@gmail.com";
      }
      if (!s.f.empresa.trim()) {
        e.empresa = "Escribe el nombre de tu empresa.";
      }
      if (!s.f.estado) {
        e.estado = "Elige el estado donde operas.";
      }
      if (!s.c1) {
        e.c1 = "Necesitamos tu permiso para enviarte la guía.";
      }
      if (!s.c3) {
        e.c3 = "Confirma que leíste la Política de Privacidad.";
      }
      return e;
    }

    function updateState(patch) {
      Object.assign(state, patch);
      if (state.intento) {
        state.err = validar(state);
      }
      renderFormState();
    }

    function renderFormState() {
      const err = state.err;

      // Sincronizar valores y estilos de campos de texto/select
      ["nombre", "correo", "empresa", "estado", "whatsapp"].forEach(function (k) {
        const el = inputs[k];
        if (!el) return;
        if (el.value !== state.f[k]) {
          el.value = state.f[k];
        }
        if (err[k]) {
          el.classList.add("has-error");
          el.setAttribute("aria-invalid", "true");
        } else {
          el.classList.remove("has-error");
          el.removeAttribute("aria-invalid");
        }
        const errSpan = errorEls[k];
        if (errSpan) {
          const msgNode = errSpan.querySelector(".err-msg-text");
          if (msgNode) msgNode.textContent = err[k] || "";
          errSpan.classList.toggle("visible", !!err[k]);
        }
      });

      // Color del select de estado
      if (inputs.estado) {
        inputs.estado.style.color = state.f.estado ? "#1B2440" : "#8592AD";
      }

      // Botones de tamaño de equipo
      if (teamGroupEl) {
        teamGroupEl.querySelectorAll(".team-btn").forEach(function (btn) {
          const isSel = btn.dataset.val === state.equipo;
          btn.setAttribute("aria-checked", isSel ? "true" : "false");
        });
      }

      // Casillas de preocupaciones
      if (suenosGroupEl) {
        suenosGroupEl.querySelectorAll(".concern-row").forEach(function (row) {
          const isSel = state.suenos.includes(row.dataset.val);
          row.classList.toggle("selected", isSel);
          const chk = row.querySelector("input[type='checkbox']");
          const box = row.querySelector(".custom-checkbox-box");
          if (chk) chk.checked = isSel;
          if (box) box.classList.toggle("checked", isSel);
        });
      }

      // Visibilidad del consentimiento 2 (SOLO si WhatsApp tiene texto)
      const showC2 = state.f.whatsapp.trim().length > 0;
      if (c2Wrapper) {
        c2Wrapper.style.display = showC2 ? "flex" : "none";
      }

      // Estado visual de los 3 consentimientos
      if (c1Input) c1Input.checked = state.c1;
      if (c1Box) {
        c1Box.classList.toggle("checked", state.c1);
        c1Box.classList.toggle("has-error", !state.c1 && !!err.c1);
      }
      if (errorEls.c1) {
        errorEls.c1.textContent = err.c1 || "";
        errorEls.c1.style.display = err.c1 ? "block" : "none";
      }

      const c2Checked = state.c2 && showC2;
      if (c2Input) c2Input.checked = c2Checked;
      if (c2Box) c2Box.classList.toggle("checked", c2Checked);

      if (c3Input) c3Input.checked = state.c3;
      if (c3Box) {
        c3Box.classList.toggle("checked", state.c3);
        c3Box.classList.toggle("has-error", !state.c3 && !!err.c3);
      }
      if (errorEls.c3) {
        errorEls.c3.textContent = err.c3 || "";
        errorEls.c3.style.display = err.c3 ? "block" : "none";
      }

      // Alerta general de errores arriba del botón
      const hayErrores = state.intento && Object.keys(err).length > 0;
      if (globalAlertEl) {
        globalAlertEl.style.display = hayErrores ? "flex" : "none";
      }

      // Botón de envío
      if (submitBtnEl) {
        submitBtnEl.disabled = state.enviando;
        submitBtnEl.textContent = state.enviando ? "Enviando…" : "Enviarme la guía";
      }
    }

    // Listeners en los campos
    ["nombre", "correo", "empresa", "estado", "whatsapp"].forEach(function (k) {
      const el = inputs[k];
      if (!el) return;
      const evType = k === "estado" ? "change" : "input";
      el.addEventListener(evType, function (ev) {
        const nextF = Object.assign({}, state.f);
        nextF[k] = ev.target.value;
        updateState({ f: nextF });
      });
    });

    if (c1Input) {
      c1Input.addEventListener("change", function () {
        updateState({ c1: !state.c1 });
      });
    }
    if (c2Input) {
      c2Input.addEventListener("change", function () {
        updateState({ c2: !state.c2 });
      });
    }
    if (c3Input) {
      c3Input.addEventListener("change", function () {
        updateState({ c3: !state.c3 });
      });
    }

    // Scroll suave al formulario
    function scrollToForm(ev) {
      if (ev) ev.preventDefault();
      if (!formSectionEl) return;
      const top = formSectionEl.getBoundingClientRect().top + window.scrollY - 8;
      window.scrollTo({ top: top, behavior: ev ? "smooth" : "auto" });
    }

    document.querySelectorAll("[data-scroll-form]").forEach(function (btn) {
      btn.addEventListener("click", function (ev) {
        if (modalEl && modalEl.classList.contains("open")) {
          closeModal();
        }
        scrollToForm(ev);
      });
    });

    // Controlador de Videos de TikTok (Inline 9:16 + Modal de 3 partes con auto-avance)
    const inlineVideo = document.getElementById("inline-tiktok-video");
    const partTabs = Array.from(document.querySelectorAll("[data-tiktok-part]"));
    let currentInlineIdx = 0;

    function selectInlinePart(idx, autoplay) {
      if (!inlineVideo || !partTabs[idx]) return;
      currentInlineIdx = idx;
      partTabs.forEach(function (tab, i) {
        tab.classList.toggle("active", i === idx);
      });
      const src = partTabs[idx].getAttribute("data-src");
      const poster = partTabs[idx].getAttribute("data-poster");
      if (poster) inlineVideo.setAttribute("poster", poster);
      if (src) {
        inlineVideo.src = src;
        inlineVideo.load();
        if (autoplay) {
          inlineVideo.play().catch(function () {});
        }
      }
    }

    partTabs.forEach(function (tab, idx) {
      tab.addEventListener("click", function () {
        selectInlinePart(idx, true);
      });
    });

    if (inlineVideo) {
      inlineVideo.addEventListener("ended", function () {
        if (currentInlineIdx + 1 < partTabs.length) {
          selectInlinePart(currentInlineIdx + 1, true);
        }
      });
    }

    // Modal de TikTok (desde la píldora del Hero)
    const modalEl = document.getElementById("tiktok-video-modal");
    const modalVideo = document.getElementById("modal-tiktok-video");
    const closeModalBtn = document.getElementById("close-tiktok-modal");
    const modalTabs = Array.from(document.querySelectorAll("[data-modal-tiktok-part]"));
    let currentModalIdx = 0;

    function selectModalPart(idx, autoplay) {
      if (!modalVideo || !modalTabs[idx]) return;
      currentModalIdx = idx;
      modalTabs.forEach(function (t, i) {
        t.classList.toggle("active", i === idx);
      });
      const src = modalTabs[idx].getAttribute("data-src");
      if (src) {
        modalVideo.src = src;
        modalVideo.load();
        if (autoplay) {
          modalVideo.play().catch(function () {});
        }
      }
    }

    function openModal(idx) {
      if (!modalEl) return;
      if (inlineVideo) inlineVideo.pause();
      modalEl.classList.add("open");
      selectModalPart(idx || 0, true);
    }

    function closeModal() {
      if (!modalEl) return;
      modalEl.classList.remove("open");
      if (modalVideo) modalVideo.pause();
    }

    document.querySelectorAll("[data-open-tiktok-modal]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const idx = parseInt(btn.getAttribute("data-open-tiktok-modal") || "0", 10);
        openModal(idx);
      });
    });

    modalTabs.forEach(function (t, idx) {
      t.addEventListener("click", function () {
        selectModalPart(idx, true);
      });
    });

    if (modalVideo) {
      modalVideo.addEventListener("ended", function () {
        if (currentModalIdx + 1 < modalTabs.length) {
          selectModalPart(currentModalIdx + 1, true);
        }
      });
    }

    if (closeModalBtn) {
      closeModalBtn.addEventListener("click", closeModal);
    }
    if (modalEl) {
      modalEl.addEventListener("click", function (ev) {
        if (ev.target === modalEl) closeModal();
      });
    }

    // Barra fija inferior móvil (< 760px)
    function handleScroll() {
      if (!stickyBarEl || !formSectionEl) return;
      const r = formSectionEl.getBoundingClientRect();
      const formVisible = r.top < window.innerHeight && r.bottom > 0;
      const show = window.innerWidth < 760 && window.scrollY > window.innerHeight * 0.7 && !formVisible;
      stickyBarEl.classList.toggle("visible", show);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    handleScroll();

    // Soporte de modos de prueba por URL (?estado=errores, ?estado=marcado, ?ver=form)
    const params = new URLSearchParams(window.location.search);
    const modo = params.get("estado");
    if (modo === "errores") {
      state.intento = true;
      state.err = validar(state);
    } else if (modo === "marcado") {
      state.f = {
        nombre: "María",
        correo: "maria@sparkleclean.com",
        empresa: "Sparkle Cleaning LLC",
        estado: "North Carolina",
        whatsapp: "(828) 555-0142"
      };
      state.equipo = "6 a 10";
      state.suenos = ["Quejas de clientes", "Capacitar a las nuevas"];
      state.c1 = true;
      state.c2 = true;
      state.c3 = true;
    }
    renderFormState();

    const ver = params.get("ver");
    if (ver && ver !== "form") {
      setTimeout(function () {
        const target = document.getElementById(ver);
        if (target) window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY - 8);
      }, 300);
    } else if (ver === "form" || modo) {
      setTimeout(function () { scrollToForm(); }, 300);
    }

    // Envío del formulario -> Supabase Edge Function / API + Resend
    formEl.addEventListener("submit", async function (ev) {
      ev.preventDefault();
      const err = validar(state);
      state.intento = true;
      state.err = err;
      renderFormState();

      if (Object.keys(err).length > 0) {
        return;
      }

      state.enviando = true;
      renderFormState();

      const showC2 = state.f.whatsapp.trim().length > 0;
      const utmParams = new URLSearchParams(window.location.search);

      // Etiquetas automáticas para segmentación y triggers de marketing
      const tags = [];
      if (state.equipo) tags.push("equipo:" + state.equipo);
      if (state.f.estado) tags.push("estado:" + state.f.estado);
      state.suenos.forEach(function (s) {
        tags.push("dolor:" + s);
      });

      const leadPayload = {
        nombre: state.f.nombre.trim(),
        correo: state.f.correo.trim().toLowerCase(),
        empresa: state.f.empresa.trim(),
        estado: state.f.estado,
        whatsapp: state.f.whatsapp.trim() || null,
        tamano_equipo: state.equipo || null,
        preocupaciones: state.suenos,
        tags: tags,
        consent_email: !!state.c1,
        consent_sms: !!(showC2 && state.c2),
        consent_privacidad: !!state.c3,
        consent_texts: {
          consent_email: CONSENT_TEXTS.consent_email,
          consent_sms: showC2 && state.c2 ? CONSENT_TEXTS.consent_sms : null,
          consent_privacidad: CONSENT_TEXTS.consent_privacidad
        },
        timestamp: new Date().toISOString(),
        page_url: window.location.href,
        user_agent: navigator.userAgent,
        utm_source: utmParams.get("utm_source") || null,
        utm_medium: utmParams.get("utm_medium") || null,
        utm_campaign: utmParams.get("utm_campaign") || null,
        utm_content: utmParams.get("utm_content") || null,
        utm_term: utmParams.get("utm_term") || null
      };

      // Guardar respaldo local inmediato
      try {
        localStorage.setItem("clear_onboarding_last_lead", JSON.stringify(leadPayload));
        const prev = JSON.parse(localStorage.getItem("clear_onboarding_leads_local") || "[]");
        prev.unshift(leadPayload);
        localStorage.setItem("clear_onboarding_leads_local", JSON.stringify(prev.slice(0, 100)));
      } catch (_) {}

      const endpoint = CFG.LEAD_ENDPOINT || "/api/lead";
      const headers = { "Content-Type": "application/json" };
      if (CFG.SUPABASE_ANON_KEY) {
        headers["Authorization"] = "Bearer " + CFG.SUPABASE_ANON_KEY;
        headers["apikey"] = CFG.SUPABASE_ANON_KEY;
      }

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(leadPayload)
        });

        if (!res.ok) {
          throw new Error("Error en el servidor (" + res.status + ")");
        }
      } catch (networkErr) {
        // Respaldo directo a Supabase REST API si se ejecuta como sitio estático fuera de Netlify
        if (CFG.SUPABASE_URL && CFG.SUPABASE_PUBLISHABLE_KEY) {
          try {
            await fetch(CFG.SUPABASE_URL + "/rest/v1/leads", {
              method: "POST",
              headers: {
                apikey: CFG.SUPABASE_PUBLISHABLE_KEY,
                "Content-Type": "application/json",
                Prefer: "return=minimal"
              },
              body: JSON.stringify({
                nombre: leadPayload.nombre,
                correo: leadPayload.correo,
                empresa: leadPayload.empresa,
                estado: leadPayload.estado,
                whatsapp: leadPayload.whatsapp,
                tamano_equipo: leadPayload.tamano_equipo,
                preocupaciones: leadPayload.preocupaciones,
                tags: leadPayload.tags,
                consent_email: leadPayload.consent_email,
                consent_sms: leadPayload.consent_sms,
                consent_privacidad: leadPayload.consent_privacidad,
                consent_texts: leadPayload.consent_texts,
                user_agent: leadPayload.user_agent,
                page_url: leadPayload.page_url,
                utm_source: leadPayload.utm_source,
                utm_medium: leadPayload.utm_medium,
                utm_campaign: leadPayload.utm_campaign,
                utm_content: leadPayload.utm_content,
                utm_term: leadPayload.utm_term,
                created_at: leadPayload.timestamp
              })
            });
          } catch (_) {}
        }

        if (!CFG.ALLOW_DEMO_FALLBACK) {
          state.enviando = false;
          renderFormState();
          alert("Hubo un problema al enviar tus datos. Por favor intenta de nuevo.");
          return;
        }
        console.info("Modo demostración / Respaldo activado:", networkErr.message);
      }

      // Disparar evento Lead en píxeles antes de redirigir
      trackEvent("Lead", {
        content_name: "Las 10 reglas de oro de un equipo de limpieza",
        state: leadPayload.estado,
        team_size: leadPayload.tamano_equipo || "no_especificado"
      });
      sessionStorage.setItem("clear_onboarding_lead_fired", "1");

      // Redirigir a la página de gracias soportando tanto /guia como raíz del subdominio en GitHub Pages
      const redirectTarget = formEl.getAttribute("data-redirect") || "./gracias/";
      window.location.href = redirectTarget;
    });
  }

  // Inicialización al cargar el DOM
  document.addEventListener("DOMContentLoaded", function () {
    initAnalytics();
    applyGlobalBindings();
    if (document.getElementById("lead-form")) {
      initLandingPage();
    }
    if (document.body.hasAttribute("data-thank-you-page")) {
      initThankYouPage();
    }
  });
})();

