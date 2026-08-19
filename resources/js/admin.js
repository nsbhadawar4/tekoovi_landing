/* -------------------------------------------------------------- */
/*  Admin panel behaviour.                                          */
/*                                                                  */
/*  The forms are ordinary server-rendered posts, so this file only  */
/*  covers what genuinely has to happen without a reload: the image  */
/*  cropper and its upload, the section-visibility switches, the     */
/*  editor dialog, delete confirmation and toasts.                   */
/* -------------------------------------------------------------- */

const csrf = () =>
  document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") ?? "";

const routes = () => {
  const el = document.querySelector("[data-admin-routes]");
  return el ? JSON.parse(el.textContent) : {};
};

/** POST/DELETE JSON against the panel's own routes, carrying the CSRF token. */
async function send(url, method = "POST", body) {
  const res = await fetch(url, {
    method,
    headers: {
      "X-CSRF-TOKEN": csrf(),
      "X-Requested-With": "XMLHttpRequest",
      Accept: "application/json",
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    credentials: "same-origin",
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

  const data = await res.json().catch(() => ({}));
  return { res, data };
}

/* ---------------------------- toasts ----------------------------- */

const ICONS = {
  success:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mt-0.5 h-5 w-5 shrink-0 text-emerald-400"><path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/></svg>',
  error:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mt-0.5 h-5 w-5 shrink-0 text-red-400"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>',
};

function notify(type, message) {
  const stack = document.querySelector("[data-toast-stack]");
  if (!stack) return;

  const el = document.createElement("div");
  el.setAttribute("data-toast", "");
  el.className = `pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur ${
    type === "success"
      ? "border-emerald-500/30 bg-emerald-500/10"
      : "border-red-500/30 bg-red-500/10"
  }`;
  el.innerHTML = `${ICONS[type] ?? ICONS.error}<p class="flex-1 text-sm text-ink"></p>
    <button type="button" class="text-ink-3 transition-colors hover:text-ink" aria-label="Dismiss">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
    </button>`;
  el.querySelector("p").textContent = message;

  const dismiss = () => {
    el.classList.remove("is-in");
    window.setTimeout(() => el.remove(), 260);
  };
  el.querySelector("button").addEventListener("click", dismiss);

  stack.appendChild(el);
  requestAnimationFrame(() => el.classList.add("is-in"));
  window.setTimeout(dismiss, 3200);
}

/** Toasts flashed by a redirect are rendered into the page; animate them in. */
function initFlashToasts() {
  document.querySelectorAll("[data-toast]").forEach((el) => {
    requestAnimationFrame(() => el.classList.add("is-in"));
    window.setTimeout(() => {
      el.classList.remove("is-in");
      window.setTimeout(() => el.remove(), 260);
    }, 3600);
  });
}

/* ------------------------- image cropper ------------------------- */

/**
 * Dependency-free cropper — the port of components/ui/image-cropper.tsx.
 *
 * Fits the source into a fixed-aspect frame, lets the operator pan (drag) and
 * zoom (slider / wheel), then exports the visible region at a fixed width.
 *
 *   "cover"   fills the frame (photos: hero banner, cards)
 *   "contain" keeps the whole image visible at zoom 1 and leaves the spare
 *             space transparent — a wide wordmark can never fit a square frame
 *             under cover, which is why logos need this
 */
function openCropper({ src, aspect = 16 / 10, fit = "cover", outputWidth = 1100, onCrop }) {
  const root = document.querySelector("[data-cropper]");
  if (!root) return;

  const frame = root.querySelector("[data-cropper-frame]");
  const zoomInput = root.querySelector("[data-cropper-zoom]");
  const applyBtn = root.querySelector("[data-cropper-apply]");
  const cancelBtn = root.querySelector("[data-cropper-cancel]");
  const closeBtn = root.querySelector("[data-cropper-close]");
  const loading = root.querySelector("[data-cropper-loading]");

  let img = null;
  let nat = null;
  let boxW = 0;
  let zoom = 1;
  let offset = { x: 0, y: 0 };
  let busy = false;

  const boxH = () => boxW / aspect;
  // Scale at zoom 1: cover fills the frame, contain fits the whole image in.
  const baseScale = () =>
    !nat || !boxW
      ? 1
      : fit === "contain"
        ? Math.min(boxW / nat.w, boxH() / nat.h)
        : Math.max(boxW / nat.w, boxH() / nat.h);
  const dispW = () => (nat ? nat.w * baseScale() * zoom : 0);
  const dispH = () => (nat ? nat.h * baseScale() * zoom : 0);

  // An axis smaller than the frame (only possible under "contain") has nothing
  // to pan — it stays centred instead of being dragged off the edge.
  const clamp = (o) => ({
    x: dispW() <= boxW ? (boxW - dispW()) / 2 : Math.min(0, Math.max(boxW - dispW(), o.x)),
    y: dispH() <= boxH() ? (boxH() - dispH()) / 2 : Math.min(0, Math.max(boxH() - dispH(), o.y)),
  });

  const paint = () => {
    frame.style.height = `${boxH()}px`;
    if (!nat) return;
    frame.style.backgroundImage = `url("${src}")`;
    frame.style.backgroundRepeat = "no-repeat";
    frame.style.backgroundSize = `${dispW()}px ${dispH()}px`;
    frame.style.backgroundPosition = `${offset.x}px ${offset.y}px`;
  };

  const centre = () => {
    offset = { x: (boxW - dispW()) / 2, y: (boxH() - dispH()) / 2 };
    paint();
  };

  const measure = () => {
    boxW = frame.clientWidth || 0;
    if (boxW && nat) centre();
    else paint();
  };

  /* --- open --- */
  root.classList.remove("hidden");
  loading.classList.remove("hidden");
  zoom = 1;
  if (zoomInput) zoomInput.value = "1";
  requestAnimationFrame(() => root.querySelector("[data-cropper-panel]")?.classList.add("is-in"));

  img = new Image();
  img.onload = () => {
    nat = { w: img.naturalWidth, h: img.naturalHeight };
    loading.classList.add("hidden");
    measure();
  };
  img.src = src;
  measure();

  /* --- pan --- */
  let drag = null;
  const onDown = (e) => {
    if (!nat) return;
    frame.setPointerCapture(e.pointerId);
    drag = { start: { x: e.clientX, y: e.clientY }, origin: { ...offset } };
  };
  const onMove = (e) => {
    if (!drag) return;
    offset = clamp({
      x: drag.origin.x + (e.clientX - drag.start.x),
      y: drag.origin.y + (e.clientY - drag.start.y),
    });
    paint();
  };
  const onUp = (e) => {
    drag = null;
    if (frame.hasPointerCapture(e.pointerId)) frame.releasePointerCapture(e.pointerId);
  };

  /* --- zoom around the frame centre, so the middle stays put --- */
  const applyZoom = (next) => {
    const z = Math.min(3, Math.max(1, next));
    if (!nat || !boxW) {
      zoom = z;
      return;
    }
    const oldS = baseScale() * zoom;
    const cx = boxW / 2;
    const cy = boxH() / 2;
    const srcX = (cx - offset.x) / oldS;
    const srcY = (cy - offset.y) / oldS;
    zoom = z;
    const newS = baseScale() * z;
    offset = clamp({ x: cx - srcX * newS, y: cy - srcY * newS });
    paint();
    if (zoomInput) zoomInput.value = String(z);
  };

  const onWheel = (e) => {
    e.preventDefault();
    applyZoom(zoom - e.deltaY * 0.0015);
  };
  const onZoomInput = (e) => applyZoom(Number(e.target.value));
  const onResize = () => measure();

  /* --- export --- */
  const crop = () => {
    if (!img || !nat || !boxW || busy) return;

    const outW = outputWidth;
    const outH = Math.round(outputWidth / aspect);
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingQuality = "high";

    // Paint the image exactly where the preview shows it, scaled from frame
    // pixels to output pixels. Drawing by destination (rather than by source
    // rect) keeps working under "contain", where the image is smaller than the
    // frame and part of the canvas stays empty.
    const k = outW / boxW;
    ctx.drawImage(img, offset.x * k, offset.y * k, dispW() * k, dispH() * k);

    // "contain" exports PNG so the padding around a logo stays transparent
    // instead of turning into black JPEG bars.
    const dataUrl =
      fit === "contain" ? canvas.toDataURL("image/png") : canvas.toDataURL("image/jpeg", 0.82);

    busy = true;
    applyBtn.disabled = true;
    applyBtn.querySelector("[data-cropper-apply-label]").textContent = "Uploading…";
    onCrop(dataUrl).finally(() => {
      busy = false;
      applyBtn.disabled = false;
      applyBtn.querySelector("[data-cropper-apply-label]").textContent = "Apply";
      close();
    });
  };

  function close() {
    root.querySelector("[data-cropper-panel]")?.classList.remove("is-in");
    root.classList.add("hidden");
    frame.style.backgroundImage = "";
    frame.removeEventListener("pointerdown", onDown);
    frame.removeEventListener("pointermove", onMove);
    frame.removeEventListener("pointerup", onUp);
    frame.removeEventListener("pointercancel", onUp);
    frame.removeEventListener("wheel", onWheel);
    zoomInput?.removeEventListener("input", onZoomInput);
    applyBtn.removeEventListener("click", crop);
    cancelBtn.removeEventListener("click", close);
    closeBtn.removeEventListener("click", close);
    window.removeEventListener("resize", onResize);
  }

  frame.addEventListener("pointerdown", onDown);
  frame.addEventListener("pointermove", onMove);
  frame.addEventListener("pointerup", onUp);
  frame.addEventListener("pointercancel", onUp);
  frame.addEventListener("wheel", onWheel, { passive: false });
  zoomInput?.addEventListener("input", onZoomInput);
  applyBtn.addEventListener("click", crop);
  cancelBtn.addEventListener("click", close);
  closeBtn.addEventListener("click", close);
  window.addEventListener("resize", onResize);
}

/* -------------------------- image fields ------------------------- */

function initImageFields(scope = document) {
  scope.querySelectorAll("[data-image-field]").forEach((field) => {
    if (field.dataset.wired === "1") return;
    field.dataset.wired = "1";

    const input = field.querySelector("[data-image-input]");
    const file = field.querySelector("[data-image-file]");
    const preview = field.querySelector("[data-image-preview]");
    const empty = field.querySelector("[data-image-empty]");
    const pick = field.querySelector("[data-image-pick]");
    const remove = field.querySelector("[data-image-remove]");
    const error = field.querySelector("[data-image-error]");

    const aspect = Number(field.dataset.aspect || 16 / 10);
    const fit = field.dataset.fit || "cover";
    const outputWidth = Number(field.dataset.outputWidth || 1100);

    const render = () => {
      const value = input.value.trim();
      preview.style.backgroundImage = value ? `url("${value}")` : "";
      empty.classList.toggle("hidden", Boolean(value));
      remove.classList.toggle("hidden", !value);
      pick.textContent = value ? "Change image" : "Upload image";
    };

    pick.addEventListener("click", () => file.click());

    remove.addEventListener("click", () => {
      input.value = "";
      render();
    });

    file.addEventListener("change", (e) => {
      const chosen = e.target.files?.[0];
      e.target.value = ""; // allow re-picking the same file
      if (!chosen) return;
      if (!chosen.type.startsWith("image/")) {
        error.textContent = "Please choose an image file.";
        error.classList.remove("hidden");
        return;
      }
      error.classList.add("hidden");

      const objectUrl = URL.createObjectURL(chosen);
      openCropper({
        src: objectUrl,
        aspect,
        fit,
        outputWidth,
        onCrop: async (dataUrl) => {
          try {
            const { res, data } = await send(routes().mediaStore, "POST", { dataUrl });
            if (!res.ok || !data.url) throw new Error(data.error || "Upload failed");
            input.value = data.url;
            render();
            notify("success", "Image uploaded");
          } catch (e) {
            // The upload failed, but the operator's crop shouldn't be lost —
            // keep the bytes inline so saving still preserves the image.
            input.value = dataUrl;
            render();
            error.textContent = e instanceof Error ? e.message : "Upload failed";
            error.classList.remove("hidden");
            notify("error", error.textContent);
          } finally {
            URL.revokeObjectURL(objectUrl);
          }
        },
      });
    });

    render();
  });
}

/* --------------------- visibility switches ----------------------- */

/**
 * Per-field show/hide switches.
 *
 * The form carries one hidden input holding the comma-joined list of
 * switched-off field names, which is exactly the shape the write path expects.
 */
function initVisibilitySwitches(scope = document) {
  scope.querySelectorAll("[data-visibility-form]").forEach((form) => {
    if (form.dataset.wired === "1") return;
    form.dataset.wired = "1";

    const store = form.querySelector("[data-hidden-fields]");
    if (!store) return;

    const list = () => new Set(store.value.split(",").filter(Boolean));

    form.querySelectorAll("[data-visibility-switch]").forEach((button) => {
      const name = button.dataset.visibilitySwitch;
      const row = button.closest("[data-field-row]");

      const render = (on) => {
        button.setAttribute("aria-checked", String(on));
        button.querySelector("[data-switch-eye]").classList.toggle("hidden", !on);
        button.querySelector("[data-switch-eye-off]").classList.toggle("hidden", on);
        const word = button.querySelector("[data-switch-word]");
        word.textContent = on ? "Shown" : "Hidden";
        word.classList.toggle("text-brand-3", on);
        button.querySelector("[data-switch-track]").classList.toggle("bg-brand", on);
        button.querySelector("[data-switch-track]").classList.toggle("bg-white/15", !on);
        button.querySelector("[data-switch-knob]").classList.toggle("left-[14px]", on);
        button.querySelector("[data-switch-knob]").classList.toggle("left-[3px]", !on);
        row?.classList.toggle("opacity-60", !on);
        row?.querySelector("[data-field-hidden-note]")?.classList.toggle("hidden", on);
        row?.querySelector("[data-field-hint]")?.classList.toggle("hidden", !on);
        button.setAttribute(
          "title",
          on
            ? `Shown on the site — switch off to hide this ${button.dataset.what || "field"}`
            : `Hidden from the site — switch on to show this ${button.dataset.what || "field"}`,
        );
      };

      button.addEventListener("click", () => {
        const hidden = list();
        const on = !hidden.has(name);
        if (on) hidden.add(name);
        else hidden.delete(name);
        store.value = [...hidden].join(",");
        render(!on);
      });

      render(!list().has(name));
    });
  });
}

/** Plain on/off switches for `boolean` fields. */
function initBooleanSwitches(scope = document) {
  scope.querySelectorAll("[data-boolean-switch]").forEach((button) => {
    if (button.dataset.wired === "1") return;
    button.dataset.wired = "1";

    const input = document.getElementById(button.dataset.booleanSwitch);
    if (!input) return;

    const render = () => {
      const on = input.value === "1";
      button.setAttribute("aria-checked", String(on));
      const word = button.querySelector("[data-switch-word]");
      word.textContent = on ? "On" : "Off";
      word.classList.toggle("text-brand-3", on);
      button.querySelector("[data-switch-track]").classList.toggle("bg-brand", on);
      button.querySelector("[data-switch-track]").classList.toggle("bg-white/15", !on);
      button.querySelector("[data-switch-knob]").classList.toggle("left-[14px]", on);
      button.querySelector("[data-switch-knob]").classList.toggle("left-[3px]", !on);
    };

    button.addEventListener("click", () => {
      input.value = input.value === "1" ? "0" : "1";
      render();
    });

    render();
  });
}

/* -------------------- landing-page block switches ---------------- */

/**
 * The toolbar switches that show or hide a whole landing-page block.
 *
 * The switch flips straight away and rolls back if the save doesn't land — a
 * reload here would defeat the point of an inline control.
 */
function initBlockSwitches() {
  document.querySelectorAll("[data-block-switch]").forEach((button) => {
    const key = button.dataset.blockSwitch;

    const render = (on) => {
      button.setAttribute("aria-checked", String(on));
      button.querySelector("[data-switch-eye]").classList.toggle("hidden", !on);
      button.querySelector("[data-switch-eye-off]").classList.toggle("hidden", on);
      const word = button.querySelector("[data-switch-word]");
      word.textContent = on ? "Shown" : "Hidden";
      word.classList.toggle("text-brand-3", on);
      button.querySelector("[data-switch-track]").classList.toggle("bg-brand", on);
      button.querySelector("[data-switch-track]").classList.toggle("bg-white/15", !on);
      button.querySelector("[data-switch-knob]").classList.toggle("left-[14px]", on);
      button.querySelector("[data-switch-knob]").classList.toggle("left-[3px]", !on);
    };

    button.addEventListener("click", async () => {
      const was = button.getAttribute("aria-checked") === "true";
      render(!was);

      try {
        const { res, data } = await send(routes().blocks, "POST", { key, on: !was });
        if (res.status === 401) {
          window.location.href = routes().login;
          return;
        }
        if (!res.ok) {
          render(was);
          notify("error", data.error || "Could not update that section.");
          return;
        }
        notify("success", data.message);
      } catch {
        render(was);
        notify("error", "Could not reach the server.");
      }
    });
  });
}

/* --------------------------- editor dialog ----------------------- */

function initEditor() {
  const dialog = document.querySelector("[data-editor]");
  if (!dialog) return;

  const form = dialog.querySelector("[data-editor-form]");
  const title = dialog.querySelector("[data-editor-title]");
  const methodInput = dialog.querySelector("[data-editor-method]");
  const templates = document.querySelector("[data-editor-templates]");

  const open = (mode, item) => {
    const template = templates.querySelector(
      mode === "new" ? "[data-template-new]" : `[data-template-id="${item}"]`,
    );
    if (!template) return;

    form.action = template.dataset.action;
    methodInput.value = template.dataset.method;
    title.textContent = template.dataset.title;
    dialog.querySelector("[data-editor-fields]").innerHTML = template.innerHTML;

    dialog.classList.remove("hidden");
    initImageFields(dialog);
    initVisibilitySwitches(dialog);
    initBooleanSwitches(dialog);
    dialog.querySelector("input, textarea, select")?.focus();
  };

  const close = () => dialog.classList.add("hidden");

  document.querySelector("[data-editor-add]")?.addEventListener("click", () => open("new"));
  document.querySelectorAll("[data-editor-edit]").forEach((button) =>
    button.addEventListener("click", () => open("edit", button.dataset.editorEdit)),
  );
  dialog.querySelectorAll("[data-editor-close]").forEach((b) => b.addEventListener("click", close));
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !dialog.classList.contains("hidden")) close();
  });

  // The server re-renders the form on a validation error; reopen it so the
  // operator sees what went wrong instead of a closed dialog.
  if (dialog.dataset.openWith) open(dialog.dataset.openWith === "new" ? "new" : "edit", dialog.dataset.openWith);
}

/* ----------------------- delete confirmation --------------------- */

function initDeleteDialog() {
  const dialog = document.querySelector("[data-delete-dialog]");
  if (!dialog) return;

  const form = dialog.querySelector("form");
  const label = dialog.querySelector("[data-delete-label]");
  const noun = dialog.querySelector("[data-delete-noun]");

  const close = () => {
    dialog.classList.add("hidden");
    dialog.querySelector("[data-pop]")?.classList.remove("is-in");
  };

  document.querySelectorAll("[data-delete-trigger]").forEach((button) =>
    button.addEventListener("click", () => {
      form.action = button.dataset.deleteTrigger;
      label.textContent = button.dataset.deleteLabel || "this item";
      if (noun) noun.textContent = button.dataset.deleteNoun || "item";
      dialog.classList.remove("hidden");
      requestAnimationFrame(() => dialog.querySelector("[data-pop]")?.classList.add("is-in"));
    }),
  );

  dialog.querySelectorAll("[data-delete-cancel]").forEach((b) => b.addEventListener("click", close));
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !dialog.classList.contains("hidden")) close();
  });
}

/* --------------------------- media actions ----------------------- */

function initMediaActions() {
  const optimize = document.querySelector("[data-optimize-images]");
  optimize?.addEventListener("click", async () => {
    if (optimize.dataset.busy === "1") return;
    optimize.dataset.busy = "1";
    optimize.disabled = true;
    const label = optimize.querySelector("[data-optimize-label]");
    const original = label?.textContent;
    if (label) label.textContent = "Optimising…";

    try {
      const { res, data } = await send(routes().mediaMigrate, "POST");
      if (res.status === 401) {
        window.location.href = routes().login;
        return;
      }
      if (!res.ok) throw new Error(data.error || "Migration failed");
      notify("success", data.message);
    } catch (e) {
      notify("error", e instanceof Error ? e.message : "Migration failed");
    } finally {
      optimize.dataset.busy = "0";
      optimize.disabled = false;
      if (label) label.textContent = original;
    }
  });

  document.querySelectorAll("[data-media-delete]").forEach((button) =>
    button.addEventListener("click", async () => {
      const id = button.dataset.mediaDelete;
      button.disabled = true;

      try {
        const { res, data } = await send(`${routes().media}/${id}`, "DELETE");
        if (res.status === 401) {
          window.location.href = routes().login;
          return;
        }
        if (!res.ok) throw new Error(data.error || "Delete failed");
        button.closest("[data-media-item]")?.remove();
        notify("success", "Image deleted");
      } catch (e) {
        button.disabled = false;
        notify("error", e instanceof Error ? e.message : "Delete failed");
      }
    }),
  );
}

/* ------------------------- section navigation -------------------- */

function initSectionNav() {
  const toggle = document.querySelector("[data-section-nav-toggle]");
  const sheet = document.querySelector("[data-section-nav-sheet]");
  const chevron = toggle?.querySelector("[data-section-nav-chevron]");
  if (!toggle || !sheet) return;

  toggle.addEventListener("click", () => {
    const open = sheet.classList.toggle("hidden") === false;
    toggle.setAttribute("aria-expanded", String(open));
    chevron?.classList.toggle("rotate-180", open);
    if (open) requestAnimationFrame(() => sheet.classList.add("is-in"));
    else sheet.classList.remove("is-in");
  });
}

/* ------------------------- password reveal ----------------------- */

function initPasswordToggles() {
  document.querySelectorAll("[data-password-toggle]").forEach((button) => {
    const field = document.getElementById(button.getAttribute("aria-controls"));
    if (!field) return;

    const show = button.querySelector('[data-password-icon="show"]');
    const hide = button.querySelector('[data-password-icon="hide"]');

    button.addEventListener("click", () => {
      const revealed = field.type === "text";

      field.type = revealed ? "password" : "text";
      button.setAttribute("aria-pressed", String(!revealed));
      button.setAttribute("aria-label", revealed ? "Show password" : "Hide password");
      show?.classList.toggle("hidden", !revealed);
      hide?.classList.toggle("hidden", revealed);

      // Swapping the type drops the caret, so put it back at the end.
      field.focus();
      field.setSelectionRange(field.value.length, field.value.length);
    });
  });
}

/* ----------------------------- boot ------------------------------ */

function boot() {
  initFlashToasts();
  initImageFields();
  initVisibilitySwitches();
  initBooleanSwitches();
  initBlockSwitches();
  initEditor();
  initDeleteDialog();
  initMediaActions();
  initSectionNav();
  initPasswordToggles();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
