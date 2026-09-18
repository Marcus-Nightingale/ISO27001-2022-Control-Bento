const TYPES = ["organizational", "people", "physical", "technological"];
const TYPE_LABELS = {
    organizational: "Organizational",
    people: "People",
    physical: "Physical",
    technological: "Technological",
};
const TYPE_TAGS = {
    organizational: "tag-iso",
    people: "tag-tool",
    physical: "tag-security",
    technological: "tag-web",
};

let controls = [];
const activeTypes = new Set(TYPES);

const lists = Object.fromEntries(TYPES.map((type) => [type, document.querySelector(`[data-list="${type}"]`)]));
const counts = Object.fromEntries(TYPES.map((type) => [type, document.querySelector(`[data-count="${type}"]`)]));
const sections = Object.fromEntries(TYPES.map((type) => [type, document.querySelector(`[data-section="${type}"]`)]));
const searchInput = document.getElementById("control-search");
const clearButton = document.getElementById("clear-search");
const resultsCount = document.getElementById("results-count");
const emptyNote = document.getElementById("empty-note");
const modal = document.getElementById("modal");
const modalPanel = document.getElementById("modal-panel");
const modalClose = document.getElementById("modal-close");

async function loadData() {
    try {
        const response = await fetch("controls.json", { cache: "no-store" });
        if (response.ok) return await response.json();
    } catch (error) {
        // file:// blocks fetch — fall through to the embedded snapshot.
    }
    if (window.CONTROL_DATA && typeof window.CONTROL_DATA === "object") return window.CONTROL_DATA;
    return {};
}

function normalize(data) {
    const out = [];
    Object.entries(data).forEach(([id, entry]) => {
        if (!entry || typeof entry !== "object" || !entry.type) return;
        out.push({
            id,
            title: entry.title || id,
            type: entry.type,
            desc: entry.desc || entry.overview || "",
            overview: entry.overview || "",
            core: entry.core_points || "",
            practice: entry.in_practice || "",
            evidence: entry.evidence_examples || [],
            isms: entry.isms || "",
            hightable: entry.hightable || "",
            search: [id, entry.title, entry.type, entry.desc, entry.summary, entry.overview, entry.core_points, entry.in_practice, ...(entry.evidence_examples || [])]
                .filter(Boolean)
                .join(" ")
                .toLowerCase(),
        });
    });
    return out.sort((a, b) => {
        const pa = a.id.split(".").map(Number);
        const pb = b.id.split(".").map(Number);
        for (let i = 0; i < Math.max(pa.length, pb.length); i += 1) {
            const diff = (pa[i] || 0) - (pb[i] || 0);
            if (diff !== 0) return diff;
        }
        return 0;
    });
}

function render() {
    const query = (searchInput.value || "").trim().toLowerCase();
    let shown = 0;
    TYPES.forEach((type) => {
        const list = lists[type];
        list.innerHTML = "";
        let count = 0;
        controls.forEach((control) => {
            if (control.type !== type || !activeTypes.has(type)) return;
            if (query && !control.search.includes(query)) return;
            const card = document.createElement("button");
            card.type = "button";
            card.className = "control-card";
            card.setAttribute("role", "listitem");
            card.innerHTML = `<span class="control-id"></span><span class="control-title"></span><span class="control-desc"></span>`;
            card.querySelector(".control-id").textContent = control.id;
            card.querySelector(".control-title").textContent = control.title;
            card.querySelector(".control-desc").textContent = control.desc;
            card.addEventListener("click", () => openModal(control));
            list.appendChild(card);
            count += 1;
            shown += 1;
        });
        counts[type].textContent = count;
        sections[type].style.display = count === 0 ? "none" : "";
    });
    resultsCount.textContent = `Showing ${shown} of ${controls.length}`;
    emptyNote.hidden = shown !== 0;
}

function openModal(control) {
    document.getElementById("modal-id").textContent = control.id;
    document.getElementById("modal-title").textContent = control.title;
    const tag = document.getElementById("modal-type");
    tag.textContent = TYPE_LABELS[control.type];
    tag.className = `tag ${TYPE_TAGS[control.type]}`;
    document.getElementById("modal-overview").textContent = control.overview || control.desc;
    document.getElementById("modal-core").textContent = control.core;
    document.getElementById("modal-practice").textContent = control.practice;
    const evidence = document.getElementById("modal-evidence");
    evidence.innerHTML = "";
    control.evidence.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        evidence.appendChild(li);
    });
    const isms = document.getElementById("modal-isms");
    const hightable = document.getElementById("modal-hightable");
    isms.style.display = control.isms ? "" : "none";
    hightable.style.display = control.hightable ? "" : "none";
    if (control.isms) isms.href = control.isms;
    if (control.hightable) hightable.href = control.hightable;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    modalPanel.focus();
    if (window.UISound) window.UISound.play("open");
}

function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
    if (window.UISound) window.UISound.play("close");
}

modalClose.addEventListener("click", closeModal);
modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
});
window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) closeModal();
});

searchInput.addEventListener("input", render);
clearButton.addEventListener("click", () => {
    searchInput.value = "";
    render();
    searchInput.focus();
});

function syncFilterButtons() {
    document.querySelectorAll("[data-filter]").forEach((button) => {
        const on = activeTypes.has(button.dataset.filter);
        button.classList.toggle("is-on", on);
        button.setAttribute("aria-pressed", String(on));
    });
    spyLinks.forEach((link) => {
        const section = spySections[link.getAttribute("href").slice(1)];
        link.classList.toggle("is-off", section !== undefined && !activeTypes.has(section));
    });
}

document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
        const type = button.dataset.filter;
        if (activeTypes.has(type)) {
            if (activeTypes.size === 1) return;
            activeTypes.delete(type);
        } else {
            activeTypes.add(type);
        }
        syncFilterButtons();
        if (window.UISound) window.UISound.play("select");
        render();
    });
});

const themeToggle = document.getElementById("theme-toggle");
const themeColor = document.getElementById("theme-color");

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    try {
        window.localStorage.setItem("mnightingale:theme", theme);
    } catch (error) {
        // Storage unavailable — theme just won't persist.
    }
    if (themeToggle) themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
    if (themeColor) themeColor.setAttribute("content", theme === "dark" ? "#10151b" : "#eef0f2");
}

if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", String(document.documentElement.dataset.theme === "dark"));
    themeToggle.addEventListener("click", () => {
        const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
        applyTheme(next);
        if (window.UISound) window.UISound.play(next === "dark" ? "toggle-off" : "toggle-on");
    });
}

const toTop = document.getElementById("to-top");
function renderToTop() {
    if (toTop) toTop.classList.toggle("is-visible", window.scrollY > 600);
}
window.addEventListener("scroll", renderToTop, { passive: true });
renderToTop();
if (toTop) {
    toTop.addEventListener("click", () => {
        if (window.UISound) window.UISound.play("back");
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) window.scrollTo(0, 0);
        else window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

loadData().then((data) => {
    controls = normalize(data);
    document.getElementById("stat-total").textContent = controls.length;
    render();
});

// --- Nav mascot gaze tracking (same 3x3 grid zones as mnightingale.dev) ---
const mascotLink = document.querySelector(".nav-mascot");
const mascotFrame = document.getElementById("mascot-frame");

if (mascotLink && mascotFrame) {
    const DIRECTIONS = ["up-left", "up", "up-right", "left", "center", "right", "down-left", "down", "down-right"];
    const DEAD_X = 90;
    const DEAD_Y = 60;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    let sector = DIRECTIONS.indexOf("center");
    let pointer = null;

    function cell(index) {
        mascotFrame.style.backgroundPosition = `${(index % 3) * 50}% ${Math.floor(index / 3) * 50}%`;
    }

    function aimMascot() {
        if (!pointer) return;
        const box = mascotLink.getBoundingClientRect();
        const dx = pointer.x - (box.left + box.width / 2);
        const dy = pointer.y - (box.top + box.height / 2);
        const x = dx > DEAD_X ? "right" : dx < -DEAD_X ? "left" : "";
        const y = dy > DEAD_Y ? "down" : dy < -DEAD_Y ? "up" : "";
        const index = DIRECTIONS.indexOf(y + (y && x ? "-" : "") + x || "center");
        if (index === sector) return;
        sector = index;
        cell(index);
    }

    if (finePointer && !reduceMotion) {
        window.addEventListener(
            "pointermove",
            (event) => {
                pointer = { x: event.clientX, y: event.clientY };
                aimMascot();
            },
            { passive: true },
        );
        window.addEventListener("scroll", aimMascot, { passive: true });
    }

    cell(DIRECTIONS.indexOf("center"));
}

// --- Nav scroll-spy: highlight the section in view ---
const spyLinks = document.querySelectorAll(".nav-links a");
const spySections = {
    "#section-organizational": "organizational",
    "#section-people": "people",
    "#section-physical": "physical",
    "#section-technological": "technological",
};
const spyTargets = Object.keys(spySections)
    .map((selector) => document.querySelector(selector))
    .filter(Boolean);

let spyTicking = false;

function renderSpy() {
    spyTicking = false;
    const middle = window.scrollY + window.innerHeight * 0.4;
    let current = null;
    spyTargets.forEach((section) => {
        if (!activeTypes.has(spySections[`#${section.id}`])) return;
        if (section.offsetTop <= middle) current = section;
    });
    spyLinks.forEach((link) => {
        link.classList.toggle("is-active", current !== null && link.getAttribute("href") === `#${current.id}`);
    });
}

function requestSpy() {
    if (spyTicking) return;
    spyTicking = true;
    requestAnimationFrame(renderSpy);
}

window.addEventListener("scroll", requestSpy, { passive: true });
window.addEventListener("resize", requestSpy);
requestSpy();

// --- Sticky mini search: appears past the search card, draggable + minimisable ---
const searchCard = document.querySelector(".search-card");
const miniSearch = document.getElementById("mini-search");
const miniInput = document.getElementById("mini-search-input");
const miniMin = document.getElementById("mini-search-min");
const miniBar = document.getElementById("mini-search-bar");

if (searchCard && miniSearch && miniInput) {
    let miniTicking = false;
    let miniPos = null;

    function renderMini() {
        miniTicking = false;
        const past = searchCard.getBoundingClientRect().bottom < 80;
        miniSearch.classList.toggle("is-visible", past);
    }

    function requestMini() {
        if (miniTicking) return;
        miniTicking = true;
        requestAnimationFrame(renderMini);
    }

    window.addEventListener("scroll", requestMini, { passive: true });
    window.addEventListener("resize", requestMini);
    requestMini();

    searchInput.addEventListener("input", () => {
        if (miniInput.value !== searchInput.value) miniInput.value = searchInput.value;
    });
    miniInput.addEventListener("input", () => {
        searchInput.value = miniInput.value;
        render();
    });

    miniMin.addEventListener("click", () => {
        const min = miniSearch.classList.toggle("is-min");
        miniMin.setAttribute("aria-label", min ? "Expand search" : "Minimise search");
    });

    const dragHandle = document.getElementById("mini-search-drag");
    dragHandle.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        const rect = miniSearch.getBoundingClientRect();
        if (!miniPos) {
            miniPos = { left: rect.left, top: rect.top };
            miniSearch.style.left = `${rect.left}px`;
            miniSearch.style.top = `${rect.top}px`;
            miniSearch.style.right = "auto";
            miniSearch.style.transform = "none";
        }
        const grabX = event.clientX - miniPos.left;
        const grabY = event.clientY - miniPos.top;
        dragHandle.setPointerCapture(event.pointerId);
        const move = (moveEvent) => {
            const maxLeft = window.innerWidth - rect.width - 8;
            const maxTop = window.innerHeight - rect.height - 8;
            miniPos.left = Math.min(Math.max(moveEvent.clientX - grabX, 8), Math.max(maxLeft, 8));
            miniPos.top = Math.min(Math.max(moveEvent.clientY - grabY, 8), Math.max(maxTop, 8));
            miniSearch.style.left = `${miniPos.left}px`;
            miniSearch.style.top = `${miniPos.top}px`;
        };
        const up = () => {
            dragHandle.removeEventListener("pointermove", move);
            dragHandle.removeEventListener("pointerup", up);
            dragHandle.removeEventListener("pointercancel", up);
        };
        dragHandle.addEventListener("pointermove", move);
        dragHandle.addEventListener("pointerup", up);
        dragHandle.addEventListener("pointercancel", up);
    });
}

// --- Ambient ASCII corner (bottom-right, theme-aware) ---
const cornerCanvas = document.getElementById("corner-ascii");

if (cornerCanvas) {
    const cornerReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cctx = cornerCanvas.getContext("2d");
    const glyphs = "  ..::--==++**##@@";
    const SIZE = 460;
    const cdpr = Math.min(window.devicePixelRatio || 1, 2);
    cornerCanvas.width = SIZE * cdpr;
    cornerCanvas.height = SIZE * cdpr;
    cctx.setTransform(cdpr, 0, 0, cdpr, 0, 0);
    let cornerLast = 0;
    let cornerFrame = 0;

    function cornerSmooth(e0, e1, v) {
        const t = Math.min(Math.max((v - e0) / (e1 - e0), 0), 1);
        return t * t * (3 - 2 * t);
    }

    function drawCorner(time) {
        cctx.clearRect(0, 0, SIZE, SIZE);
        const dark = document.documentElement.dataset.theme === "dark";
        const cell = 17;
        cctx.font = `${cell * 0.82}px ui-monospace, Menlo, Consolas, monospace`;
        cctx.textAlign = "center";
        cctx.textBaseline = "middle";
        for (let y = cell * 0.5; y < SIZE; y += cell) {
            for (let x = cell * 0.5; x < SIZE; x += cell) {
                const nx = x / SIZE;
                const ny = y / SIZE;
                const bend = Math.sin(nx * 7.2 - time * 0.42) * 0.12;
                const value =
                    Math.sin((ny + bend) * 17 - time * 0.9 + 1.6) * 0.58 +
                    Math.cos(nx * 10.5 + ny * 4.5 + time * 0.38 - 0.56) * 0.28 +
                    Math.sin(nx * 27 - ny * 19 + time * 0.22 + 0.32) * 0.16;
                const normalized = Math.min(Math.max((value + 1.05) / 2.1, 0), 1);
                const glyph = glyphs[Math.min(Math.floor(normalized * glyphs.length), glyphs.length - 1)];
                if (glyph === " ") continue;
                const placement = 0.08 + cornerSmooth(0.56, 0.94, nx) * 0.92;
                const blueSplash = Math.max(0, Math.sin(nx * 8.5 - time * 0.34 + ny * 2.2) * 0.5 + Math.sin(ny * 11 + time * 0.25) * 0.3 - 0.12);
                const mix = Math.min(blueSplash * 3.2, 1);
                const red = Math.round((dark ? 122 : 91) - mix * (dark ? 62 : 54));
                const green = Math.round((dark ? 142 : 101) + mix * (dark ? 78 : 75));
                const blue = Math.round((dark ? 168 : 111) + mix * (dark ? 87 : 136));
                const alpha = Math.min(placement * (0.11 + normalized * 0.34) * 1.5, 1);
                cctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
                cctx.fillText(glyph, x, y);
            }
        }
    }

    function animateCorner(now) {
        if (now - cornerLast >= 60) {
            drawCorner(now * 0.001);
            cornerLast = now;
        }
        cornerFrame = requestAnimationFrame(animateCorner);
    }

    if (cornerReduceMotion) {
        drawCorner(1.7);
    } else {
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) cancelAnimationFrame(cornerFrame);
            else {
                cancelAnimationFrame(cornerFrame);
                cornerFrame = requestAnimationFrame(animateCorner);
            }
        });
        cornerFrame = requestAnimationFrame(animateCorner);
    }
}
