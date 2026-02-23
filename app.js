let controls=[];const typeLabels={organizational:"Organizational",people:"People",physical:"Physical",technological:"Technological"};const types=["organizational","people","physical","technological"];const listByType=Object.fromEntries(types.map((type)=>[type,document.querySelector(`[data-list="${type}"]`)]));const countByType=Object.fromEntries(types.map((type)=>[type,document.querySelector(`[data-count="${type}"]`)]));const totalByType=Object.fromEntries(types.map((type)=>[type,document.querySelectorAll(`[data-total="${type}"]`)]));const emptyByType=Object.fromEntries(types.map((type)=>[type,document.querySelector(`[data-empty="${type}"]`)]));const sectionByType=Object.fromEntries(types.map((type)=>[type,document.querySelector(`[data-section="${type}"]`)]));const summaryButtons=Array.from(document.querySelectorAll("[data-toggle]"));const summaryByType=Object.fromEntries(summaryButtons.map((button)=>[button.dataset.toggle,button]));const resultsCount=document.getElementById("resultsCount");const activeFilter=document.getElementById("activeFilter");const searchInput=document.getElementById("controlSearch");const clearButton=document.getElementById("clearSearch");function renderControls(){types.forEach((type)=>{if(listByType[type]){listByType[type].innerHTML=""}});controls.forEach((control)=>{if(!listByType[control.type])return;const item=document.createElement("button");item.className="control-item";item.dataset.type=control.type;item.dataset.controlId=control.id;item.dataset.title=control.title;item.dataset.desc=control.desc;item.dataset.hightable=control.hightable || "";item.dataset.isms=control.isms || "";item.dataset.summary=control.summary || "";const searchParts=[ control.id,control.title,control.type,control.desc,control.summary,control.overview,control.core_points,control.in_practice,...(control.evidence_examples || [])].filter(Boolean);item.dataset.search=searchParts.join(" ").toLowerCase();item.setAttribute("role","listitem");item.setAttribute("type","button");item.setAttribute("aria-haspopup","dialog");item.setAttribute("aria-controls","control-modal-panel");item.innerHTML=`<div class="control-meta"><span class="control-id">${control.id}</span><span class="control-type">${typeLabels[control.type]}</span></div><span class="control-title">${control.title}</span><span class="control-desc">${control.desc}</span>`;listByType[control.type].appendChild(item)});const totals=controls.reduce((acc,control)=>{acc[control.type]=(acc[control.type] || 0)+1;return acc},{});types.forEach((type)=>{totalByType[type].forEach((node)=>{node.textContent=totals[type] || 0})})}function applyFilter(value){const query=value.trim().toLowerCase();const items=Array.from(document.querySelectorAll(".control-item"));const matchCounts=Object.fromEntries(types.map((type)=>[type,0]));const collapsedByType=Object.fromEntries(types.map((type)=>[type,sectionByType[type]?.classList.contains("section-collapsed")]));let visibleTotal=0;items.forEach((item)=>{const match=!query || item.dataset.search.includes(query);const collapsed=collapsedByType[item.dataset.type];const shouldShow=match && !collapsed;item.classList.toggle("is-hidden",!shouldShow);if(match){matchCounts[item.dataset.type]+=1}if(shouldShow){visibleTotal+=1}});types.forEach((type)=>{if(countByType[type]){countByType[type].textContent=matchCounts[type]}if(emptyByType[type]){const collapsed=collapsedByType[type];emptyByType[type].style.display=!collapsed && matchCounts[type]===0 ? "block":"none"}if(listByType[type]){listByType[type].setAttribute("aria-hidden",collapsedByType[type] ? "true":"false")}});resultsCount.textContent=`Showing ${visibleTotal} of ${controls.length}`;activeFilter.textContent=query ? `Filter:${query}`:"No active filter"}const modal=document.getElementById("control-modal");const modalPanel=document.getElementById("control-modal-panel");const modalClose=document.getElementById("control-modal-close");const page=document.querySelector("main");const modalId=document.getElementById("modal-id");const modalTitle=document.getElementById("modal-title");const modalType=document.getElementById("modal-type");const modalDesc=document.getElementById("modal-desc");const modalSummary=document.getElementById("modal-summary");const modalSummaryLabel=document.getElementById("modal-summary-label");const modalSummaryWrap=document.getElementById("modal-summary-wrap");const modalDetails=document.getElementById("modal-details");let lastFocused=null;const controlDetailsIndex={};function escapeHtml(value){return String(value).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;")}function buildDetailsHtml(details){const sections=[];if(details.in_practice){sections.push(`<section class="modal-section"><h3>In practice</h3><p>${escapeHtml(details.in_practice)}</p></section>`)}if(Array.isArray(details.evidence_examples)&& details.evidence_examples.length){const items=details.evidence_examples .map((item)=>`<li>${escapeHtml(item)}</li>`).join("");sections.push(`<section class="modal-section"><h3>Evidence examples</h3><ul>${items}</ul></section>`)}const links=[];if(details.isms){links.push(`<li><a href="${escapeHtml(details.isms)}" target="_blank" rel="noopener noreferrer">ISMS.online guidance</a></li>`)}if(details.hightable){links.push(`<li><a href="${escapeHtml(details.hightable)}" target="_blank" rel="noopener noreferrer">HighTable reference</a></li>`)}if(links.length){sections.push(`<section class="modal-section"><h3>Links</h3><ul>${links.join("")}</ul></section>`)}return sections.join("")}async function loadControls(){try{const response=await fetch("controls.json",{cache:"no-store"});if(!response.ok)return;const data=await response.json();const entries=[];if(Array.isArray(data)){data.forEach((entry)=>{if(entry &&(entry.control_id || entry.id)){entries.push(entry)}})}else if(data && typeof data==="object"){Object.entries(data).forEach(([controlId,entry])=>{if(!entry || typeof entry !=="object")return;entries.push({control_id:controlId,...entry})})}else{return}controls=entries .map((entry)=>{const id=entry.control_id || entry.id;if(!id)return null;const control={id,title:entry.title || id,type:entry.type,desc:entry.desc || entry.overview || "",summary:entry.summary || entry.core_points || entry.overview || "",overview:entry.overview,core_points:entry.core_points,in_practice:entry.in_practice,evidence_examples:entry.evidence_examples,isms:entry.isms,hightable:entry.hightable};controlDetailsIndex[id]={control_id:id,...entry,...control};return control}).filter(Boolean);renderControls();applyFilter(searchInput.value || "")}catch(error){}}const controlDetailsReady=loadControls();function setModalTag(type){modalType.textContent=typeLabels[type];modalType.style.setProperty("--tag-color","var(--ink-soft)");modalType.style.setProperty("--tag-bg","rgba(31,43,45,0.04)");modalType.style.setProperty("--tag-border","var(--line)");if(type==="organizational"){modalType.style.setProperty("--tag-color","var(--type-org)");modalType.style.setProperty("--tag-bg","var(--type-org-soft)");modalType.style.setProperty("--tag-border","rgba(31,111,120,0.35)")}else if(type==="people"){modalType.style.setProperty("--tag-color","var(--type-people)");modalType.style.setProperty("--tag-bg","var(--type-people-soft)");modalType.style.setProperty("--tag-border","rgba(216,107,75,0.35)")}else if(type==="physical"){modalType.style.setProperty("--tag-color","var(--type-physical)");modalType.style.setProperty("--tag-bg","var(--type-physical-soft)");modalType.style.setProperty("--tag-border","rgba(157,181,158,0.35)")}else if(type==="technological"){modalType.style.setProperty("--tag-color","var(--ink)");modalType.style.setProperty("--tag-bg","var(--type-tech-soft)");modalType.style.setProperty("--tag-border","rgba(242,193,78,0.35)")}}async function openModalFromCard(card){await controlDetailsReady;const type=card.dataset.type;modalId.textContent=card.dataset.controlId;const detail=controlDetailsIndex[card.dataset.controlId];if(detail){modalTitle.textContent=detail.title || card.dataset.title;modalDesc.textContent=detail.overview || card.dataset.desc || "";if(modalSummaryLabel){modalSummaryLabel.textContent=detail.core_points ? "Core points":"Control summary"}if(modalSummary){modalSummary.textContent=detail.core_points || detail.overview || card.dataset.summary || card.dataset.desc || ""}if(modalSummaryWrap){modalSummaryWrap.hidden=!modalSummary.textContent}if(modalDetails){const detailsHtml=buildDetailsHtml(detail);modalDetails.innerHTML=detailsHtml;modalDetails.hidden=!detailsHtml}}else{modalTitle.textContent=card.dataset.title;modalDesc.textContent=card.dataset.desc || "";if(modalSummaryLabel){modalSummaryLabel.textContent="Control summary"}if(modalSummary){modalSummary.textContent=card.dataset.summary || card.dataset.desc || ""}if(modalSummaryWrap){modalSummaryWrap.hidden=!modalSummary.textContent}if(modalDetails){modalDetails.innerHTML="";modalDetails.hidden=true}}setModalTag(type);lastFocused=document.activeElement;modal.hidden=false;modal.setAttribute("aria-hidden","false");document.body.style.overflow="hidden";if(page){page.setAttribute("aria-hidden","true");if("inert" in page){page.inert=true}}modalClose.focus()}function closeModal(){modal.hidden=true;modal.setAttribute("aria-hidden","true");document.body.style.overflow="";if(page){page.removeAttribute("aria-hidden");if("inert" in page){page.inert=false}}if(lastFocused){lastFocused.focus()}}function trapFocus(event){if(modal.hidden || event.key !=="Tab")return;const focusables=modalPanel.querySelectorAll("button,[href],input,select,textarea,[tabindex]:not([tabindex=\"-1\"])");if(!focusables.length)return;const first=focusables[0];const last=focusables[focusables.length-1];if(event.shiftKey && document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first.focus()}}document.addEventListener("click",(event)=>{const card=event.target.closest(".control-item");if(card){openModalFromCard(card);return}if(event.target===modal){closeModal()}});modalClose.addEventListener("click",closeModal);document.addEventListener("keydown",(event)=>{if(!modal.hidden && event.key==="Escape"){event.preventDefault();closeModal()}trapFocus(event)});function toggleSection(type){const section=sectionByType[type];const button=summaryByType[type];if(!section || !button)return;const collapsed=section.classList.toggle("section-collapsed");button.classList.toggle("is-collapsed",collapsed);button.setAttribute("aria-expanded",collapsed ? "false":"true");applyFilter(searchInput.value)}summaryButtons.forEach((button)=>{button.addEventListener("click",()=>{toggleSection(button.dataset.toggle)})});searchInput.addEventListener("input",(event)=>{applyFilter(event.target.value)});clearButton.addEventListener("click",()=>{searchInput.value="";applyFilter("");searchInput.focus()});document.addEventListener("keydown",(event)=>{if(event.key==="/" && document.activeElement !==searchInput){event.preventDefault();searchInput.focus()}});const backToTop=document.getElementById("backToTop");if(backToTop){const prefersReducedMotion=window.matchMedia("(prefers-reduced-motion:reduce)").matches;const toggleBackToTop=()=>{backToTop.classList.toggle("is-visible",window.scrollY>400)};toggleBackToTop();window.addEventListener("scroll",()=>{window.requestAnimationFrame(toggleBackToTop)});backToTop.addEventListener("click",()=>{if(prefersReducedMotion){window.scrollTo(0,0)}else{window.scrollTo({top:0,behavior:"smooth"})}})}
;(() => {
  const THEME_KEY = "soa_theme";
  const themeBtn = document.getElementById("btnTheme");
  const topBtn = document.getElementById("btnTop");
  const prefersReducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setTheme(theme) {
    const isDark = theme === "dark";
    document.body.classList.toggle("theme-dark", isDark);
    if (themeBtn) {
      themeBtn.setAttribute("aria-pressed", isDark ? "true" : "false");
      themeBtn.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
      themeBtn.setAttribute("title", isDark ? "Switch to light theme" : "Switch to dark theme");
    }
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "dark" || saved === "light") {
      setTheme(saved);
      return;
    }
    const prefersDark =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(prefersDark ? "dark" : "light");
  }

  function updateBackToTop() {
    if (!topBtn) return;
    topBtn.classList.toggle("is-visible", window.scrollY > 320);
  }

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const isDark = document.body.classList.contains("theme-dark");
      setTheme(isDark ? "light" : "dark");
    });
  }

  initTheme();
  updateBackToTop();
  window.addEventListener("scroll", () => {
    window.requestAnimationFrame(updateBackToTop);
  });

  if (topBtn) {
    topBtn.addEventListener("click", () => {
      if (prefersReducedMotion) {
        window.scrollTo(0, 0);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }
})();

;(() => {
  const cornerLogo = document.querySelector(".corner-logo");
  const mobileLogoQuery = window.matchMedia("(max-width: 720px)");
  let lastLogoScroll = window.scrollY;
  let logoRaf = null;

  function setLogoState(state) {
    if (!cornerLogo) return;
    cornerLogo.classList.remove("is-hiding", "is-showing");
    if (state === "hidden") {
      cornerLogo.classList.add("is-hiding");
      cornerLogo.classList.add("is-hidden");
    } else {
      cornerLogo.classList.add("is-showing");
      cornerLogo.classList.remove("is-hidden");
    }
  }

  function updateLogoVisibility() {
    if (!cornerLogo) return;
    if (!mobileLogoQuery.matches) {
      cornerLogo.classList.remove("is-hiding", "is-showing", "is-hidden");
      lastLogoScroll = window.scrollY;
      return;
    }
    const current = window.scrollY;
    const delta = current - lastLogoScroll;
    if (current <= 8) {
      setLogoState("shown");
    } else if (delta > 4) {
      setLogoState("hidden");
    } else if (delta < -4) {
      setLogoState("shown");
    }
    lastLogoScroll = current;
  }

  function onLogoScroll() {
    if (logoRaf) return;
    logoRaf = window.requestAnimationFrame(() => {
      logoRaf = null;
      updateLogoVisibility();
    });
  }

  window.addEventListener("scroll", onLogoScroll, { passive: true });
  window.addEventListener("resize", updateLogoVisibility);
  updateLogoVisibility();
})();
