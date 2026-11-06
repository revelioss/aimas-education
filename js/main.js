/* =========================================================
   НАСТРОЙКИ САЙТА — правьте только этот блок
   ========================================================= */
const CONFIG = {
  price: "9 500 ₸",
  customPrice: "9 500 ₸",
  instagramHandle: "@aimas.education",
  instagramProfile: "https://www.instagram.com/aimas.education/",
  instagramDm: "https://ig.me/m/aimas.education",
  // WhatsApp Алмаса: цифры без + и пробелов. Заявки уходят на wa.me/<этот номер>.
  whatsapp: "77755231543",
};

const SPREADS = [1, 2, 5, 8, 13, 16, 20, 26, 29, 30];

function $(sel, root = document) { return root.querySelector(sel); }
function $all(sel, root = document) { return [...root.querySelectorAll(sel)]; }

function applyConfig() {
  $all("[data-price]").forEach((el) => { el.textContent = CONFIG.price; });
  $all("[data-custom-price]").forEach((el) => { el.textContent = CONFIG.customPrice; });
  $all("[data-ig-handle]").forEach((el) => { el.textContent = CONFIG.instagramHandle; });
  $all("a[data-ig-profile]").forEach((el) => {
    el.href = CONFIG.instagramProfile;
    el.target = "_blank";
    el.rel = "noopener noreferrer";
  });

  const extras = $("#opt-contacts");
  if (extras) {
    extras.innerHTML = "";
    const wa = String(CONFIG.whatsapp || "").replace(/\D/g, "");
    if (wa) {
      extras.insertAdjacentHTML(
        "beforeend",
        `<a class="btn btn-light" href="https://wa.me/${wa}" target="_blank" rel="noopener noreferrer">WhatsApp</a>`
      );
    }
  }
}

/* Nav */
function setupNav() {
  const nav = $(".nav");
  const toggle = $(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
  $all(".nav-links a").forEach((a) => {
    a.addEventListener("click", () => nav.classList.remove("open"));
  });
}

/* Reveal */
function setupReveal() {
  const nodes = $all(".reveal");
  if (!nodes.length) return;
  if (!("IntersectionObserver" in window)) {
    nodes.forEach((n) => n.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  nodes.forEach((n) => io.observe(n));
}

/* Gallery */
const gallery = {
  mode: "pages",
  index: 0,
  init() {
    this.stage = $("#stage-img");
    this.ru = $("#cap-ru");
    this.en = $("#cap-en");
    this.vocab = $("#cap-vocab");
    this.ask = $("#cap-ask");
    this.count = $("#viewer-count");
    this.thumbs = $("#thumbs");
    this.stageWrap = $("#stage");
    if (!this.stage || !window.BOOK_DATA) return;

    $all(".seg button").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.mode = btn.dataset.mode;
        $all(".seg button").forEach((b) => b.setAttribute("aria-pressed", b === btn ? "true" : "false"));
        this.index = 0;
        this.renderThumbs();
        this.render();
      });
    });
    $(".prev-page")?.addEventListener("click", () => this.step(-1));
    $(".next-page")?.addEventListener("click", () => this.step(1));
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") this.step(-1);
      if (e.key === "ArrowRight") this.step(1);
    });
    this.stage.addEventListener("click", () => this.lightbox());
    this.renderThumbs();
    this.render();
  },
  list() {
    if (this.mode === "spreads") {
      return SPREADS.map((n) => window.BOOK_DATA.pages[n - 1]);
    }
    return window.BOOK_DATA.pages;
  },
  src(page, mode = this.mode) {
    const n = String(page.n).padStart(2, "0");
    const base = document.documentElement.dataset.assets || "";
    return mode === "spreads"
      ? `${base}assets/img/spreads/spread_${n}.webp`
      : `${base}assets/img/pages/page_${n}.webp`;
  },
  step(dir) {
    const list = this.list();
    this.index = (this.index + dir + list.length) % list.length;
    this.render();
  },
  go(i) {
    this.index = i;
    this.render();
  },
  renderThumbs() {
    const list = this.list();
    this.thumbs.innerHTML = list
      .map(
        (p, i) =>
          `<button type="button" data-i="${i}" aria-label="Страница ${p.n}">
             <img src="${this.src(p)}" alt="">
           </button>`
      )
      .join("");
    this.thumbs.querySelectorAll("button").forEach((b) => {
      b.addEventListener("click", () => this.go(Number(b.dataset.i)));
    });
  },
  render() {
    const list = this.list();
    const p = list[this.index];
    if (!p) return;
    this.stageWrap.classList.toggle("is-spread", this.mode === "spreads");
    this.stage.src = this.src(p);
    this.stage.alt = `Страница ${p.n}: ${p.ru}`;
    this.ru.textContent = p.ru;
    this.en.textContent = p.en;
    this.vocab.innerHTML = (p.vocab || [])
      .map(
        (v) =>
          `<li><strong>${v.en}</strong><span class="tr">${v.ru} ${v.transcription_ru || ""}</span></li>`
      )
      .join("");
    if (p.q) {
      this.ask.hidden = false;
      this.ask.textContent = `Вопрос: ${p.q.en} — ${p.q.ru}`;
    } else {
      this.ask.hidden = true;
    }
    this.count.textContent =
      this.mode === "spreads"
        ? `Разворот ${this.index + 1} из ${list.length}`
        : `${p.n} / ${list.length}`;
    this.thumbs.querySelectorAll("button").forEach((b, i) => {
      b.setAttribute("aria-current", i === this.index ? "true" : "false");
    });
    const cur = this.thumbs.querySelector('[aria-current="true"]');
    if (cur) {
      const scroller = this.thumbs;
      const left = cur.offsetLeft - (scroller.clientWidth - cur.clientWidth) / 2;
      scroller.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
    }
  },
  lightbox() {
    const p = this.list()[this.index];
    const lb = $("#lightbox");
    const img = $("#lightbox-img");
    if (!lb || !img || !p) return;
    img.src = this.src(p);
    img.alt = p.ru;
    lb.classList.add("open");
  },
};

function setupLightbox() {
  const lb = $("#lightbox");
  if (!lb) return;
  const close = () => lb.classList.remove("open");
  $("#lightbox-close")?.addEventListener("click", close);
  lb.addEventListener("click", (e) => {
    if (e.target === lb) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

/* Video: if the mp4 is missing or fails, use Ken Burns on the poster image */
function setupVideo(id, fallbackSelector) {
  const video = document.getElementById(id);
  if (!video) return;
  const fallback = fallbackSelector ? $(fallbackSelector) : video.parentElement.querySelector(".kenburns");
  const succeed = () => {
    video.hidden = false;
    if (fallback) fallback.hidden = true;
    video.play?.().catch(() => {});
  };
  const fail = () => {
    video.hidden = true;
    if (fallback) fallback.hidden = false;
  };
  video.addEventListener("canplay", succeed);
  video.addEventListener("error", fail);
  const source = video.querySelector("source");
  if (source) source.addEventListener("error", fail);
}

function setupFaq() {
  $all(".faq-item button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const was = item.hasAttribute("open");
      $all(".faq-item").forEach((i) => i.removeAttribute("open"));
      if (!was) item.setAttribute("open", "");
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  applyConfig();
  setupNav();
  setupReveal();
  gallery.init();
  setupLightbox();
  setupVideo("video-friends", "#fallback-friends");
  setupVideo("video-chars", "#fallback-chars");
  setupFaq();
  setupOrderForm();
  setupReadyBookOrder();
});


function waDigits() {
  return String(CONFIG.whatsapp || "").replace(/\D/g, "");
}

function waHref(text) {
  return `https://wa.me/${waDigits()}?text=${encodeURIComponent(text)}`;
}

function formatKzPhone(raw) {
  let d = String(raw || "").replace(/\D/g, "");
  if (d.startsWith("8")) d = "7" + d.slice(1);
  if (!d.startsWith("7")) d = "7" + d;
  d = d.slice(0, 11);
  let out = "+7";
  if (d.length > 1) out += " (" + d.slice(1, Math.min(4, d.length));
  if (d.length >= 4) out += ")";
  if (d.length > 4) out += " " + d.slice(4, 7);
  if (d.length > 7) out += "-" + d.slice(7, 9);
  if (d.length > 9) out += "-" + d.slice(9, 11);
  return out;
}

function isValidKzPhone(value) {
  return /^\+7 \(7\d{2}\) \d{3}-\d{2}-\d{2}$/.test(value);
}

function setFieldError(field, message) {
  const wrap = field.closest(".field");
  if (!wrap) return;
  const err = wrap.querySelector(".err");
  if (message) {
    wrap.classList.add("invalid");
    if (err) err.textContent = message;
    field.setAttribute("aria-invalid", "true");
  } else {
    wrap.classList.remove("invalid");
    field.removeAttribute("aria-invalid");
  }
}

function openWhatsApp(text) {
  const url = waHref(text);
  window.open(url, "_blank", "noopener,noreferrer");
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch]));
}

function ensureSuccessModal() {
  let modal = $("#success-modal");
  if (modal) return modal;
  modal = document.createElement("div");
  modal.id = "success-modal";
  modal.className = "success-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-labelledby", "success-title");
  modal.innerHTML = `
    <div class="success-card">
      <h3 id="success-title">Спасибо! Заявка отправлена</h3>
      <p class="success-lead">Мы свяжемся с вами в WhatsApp, чтобы уточнить детали заказа и оплату.</p>
      <p class="success-sum" data-custom-price>${CONFIG.customPrice}</p>
      <ul class="success-summary" id="success-summary"></ul>
      <div class="success-actions">
        <button type="button" class="success-close" id="success-close">Закрыть</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeSuccessModal();
  });
  $("#success-close", modal).addEventListener("click", closeSuccessModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) closeSuccessModal();
  });
  return modal;
}

function showSuccessModal(summaryLines, amount) {
  const modal = ensureSuccessModal();
  const list = $("#success-summary", modal);
  list.innerHTML = summaryLines
    .map((row) => `<li><b>${escapeHtml(row.label)}:</b> ${escapeHtml(row.value)}</li>`)
    .join("");
  $all("[data-custom-price]", modal).forEach((el) => {
    el.textContent = amount || CONFIG.customPrice;
  });
  modal.classList.add("open");
}

function closeSuccessModal() {
  $("#success-modal")?.classList.remove("open");
}

function customOrderMessage(data) {
  const lines = [
    "Здравствуйте! Заказ книги на заказ.",
    "",
    `Имя ребёнка: ${data.child}`,
    `Язык: ${data.language}`,
    `Сценарий: ${data.script}`,
    `Количество страниц: ${data.pages}`,
    `Телефон: ${data.phone}`,
  ];
  if (data.notes) lines.push(`Комментарий: ${data.notes}`);
  lines.push("", `Сумма: ${CONFIG.customPrice}`);
  return lines.join("\n");
}

function setupOrderForm() {
  const form = $("#order-form");
  if (!form) return;
  const phone = $("#order-phone");
  const otherWrap = $("#lang-other-wrap");
  const otherInput = $("#order-lang-other");

  const syncOther = () => {
    const other = form.querySelector('input[name="language"]:checked')?.value === "Другой";
    otherWrap.style.display = other ? "block" : "none";
    if (otherInput) otherInput.required = other;
    if (!other) setFieldError(otherInput, "");
  };
  $all('input[name="language"]', form).forEach((r) => r.addEventListener("change", syncOther));
  syncOther();

  phone.addEventListener("input", () => {
    const formatted = formatKzPhone(phone.value);
    phone.value = formatted;
    if (isValidKzPhone(formatted)) setFieldError(phone, "");
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const child = $("#order-child");
    const script = $("#order-script");
    const pages = $("#order-pages");
    const notes = $("#order-notes");
    const langChecked = form.querySelector('input[name="language"]:checked');
    let ok = true;

    if (!child.value.trim()) {
      setFieldError(child, "Укажите имя ребёнка");
      ok = false;
    } else setFieldError(child, "");

    if (!langChecked) {
      setFieldError(form.querySelector(".lang-opts"), "Выберите язык");
      ok = false;
    } else {
      setFieldError(form.querySelector(".lang-opts"), "");
      if (langChecked.value === "Другой" && !otherInput.value.trim()) {
        setFieldError(otherInput, "Напишите, какой язык изучаем");
        ok = false;
      } else if (otherInput) setFieldError(otherInput, "");
    }

    if (!script.value.trim()) {
      setFieldError(script, "Расскажите, какую историю вы хотите");
      ok = false;
    } else setFieldError(script, "");

    if (!pages.value) {
      setFieldError(pages, "Выберите количество страниц");
      ok = false;
    } else setFieldError(pages, "");

    if (!isValidKzPhone(phone.value)) {
      setFieldError(phone, "Введите номер в формате +7 (7XX) XXX-XX-XX");
      ok = false;
    } else setFieldError(phone, "");

    if (!ok) {
      form.querySelector(".field.invalid")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const language = langChecked.value === "Другой"
      ? `Другой (${otherInput.value.trim()})`
      : langChecked.value;
    const data = {
      child: child.value.trim(),
      language,
      script: script.value.trim(),
      pages: pages.value,
      phone: phone.value,
      notes: notes.value.trim(),
    };
    openWhatsApp(customOrderMessage(data));
    showSuccessModal(
      [
        { label: "Имя ребёнка", value: data.child },
        { label: "Язык", value: data.language },
        { label: "Сценарий", value: data.script },
        { label: "Страниц", value: data.pages },
        { label: "Телефон", value: data.phone },
        ...(data.notes ? [{ label: "Комментарий", value: data.notes }] : []),
      ],
      CONFIG.customPrice
    );
  });
}

function setupReadyBookOrder() {
  $all("[data-order-ready]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const text = [
        "Здравствуйте! Хочу заказать готовую книгу.",
        "",
        "Книга: Animals and Friendship / Тимоша ищет друзей",
        `Сумма: ${CONFIG.price}`,
      ].join("\n");
      openWhatsApp(text);
      showSuccessModal(
        [
          { label: "Книга", value: "Animals and Friendship" },
          { label: "Сумма", value: CONFIG.price },
        ],
        CONFIG.price
      );
    });
  });
}
