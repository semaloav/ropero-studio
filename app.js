import {
  FINISHES, MODULE_TYPES, STORAGE_KEY, calculateCutlist, calculateDoorWidth, cloneState, createDefaultState,
  createModule, distributeModuleWidths, getInteriorWidth, getUsedModuleWidth, invalidateState,
  loadState, saveState, validateCutlist, validateState,
} from "./model.js";

const STEPS = [
  { id: "project", label: "Proyecto", caption: "Cliente y acabados" },
  { id: "construction", label: "Medidas y construcción", caption: "Parámetros técnicos" },
  { id: "modules", label: "Distribución interior", caption: "Módulos configurables" },
  { id: "presentation", label: "Presentación", caption: "Exterior, interior y 3D" },
  { id: "cutlist", label: "Despiece preliminar", caption: "Revisión técnica" },
];

let state = loadState();
let activeStep = "project";
let activeView = "exterior";
let clientMode = false;

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const byId = (id) => document.getElementById(id);

function getPath(object, path) {
  return path.split(".").reduce((value, key) => value?.[key], object);
}

function setPath(object, path, value) {
  const keys = path.split(".");
  const finalKey = keys.pop();
  const parent = keys.reduce((value, key) => value[key], object);
  parent[finalKey] = value;
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function populateSelects() {
  [byId("exteriorFinish"), byId("interiorFinish")].forEach((select) => {
    Object.entries(FINISHES).forEach(([value, finish]) => select.add(new Option(finish.name, value)));
  });
}

function renderStepNavigation() {
  const makeButton = (step, index, mobile = false) => {
    const button = element("button", `step-button${activeStep === step.id ? " active" : ""}`);
    button.type = "button";
    button.dataset.step = step.id;
    button.setAttribute("aria-current", activeStep === step.id ? "step" : "false");
    button.append(element("span", "step-count", String(index + 1).padStart(2, "0")));
    const copy = element("span", "step-copy");
    copy.append(element("strong", "", step.label));
    if (!mobile) copy.append(element("small", "", step.caption));
    button.append(copy);
    return button;
  };
  byId("desktopSteps").replaceChildren(...STEPS.map((step, index) => {
    const item = element("li"); item.append(makeButton(step, index)); return item;
  }));
  byId("mobileSteps").replaceChildren(...STEPS.map((step, index) => makeButton(step, index, true)));
}

function showStep(stepId) {
  activeStep = stepId;
  $$("[data-step-panel]").forEach((panel) => panel.classList.toggle("active", panel.dataset.stepPanel === stepId));
  renderStepNavigation();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function syncForm() {
  $$('[data-path]').forEach((control) => { control.value = getPath(state, control.dataset.path); });
}

function renderValidation(validation) {
  $$("[data-error-for]").forEach((node) => { node.textContent = validation.errors[node.dataset.errorFor]?.[0] || ""; });
  const valid = validation.valid;
  byId("validityCard").classList.toggle("invalid", !valid);
  byId("validityTitle").textContent = valid ? "Configuración válida" : "Requiere atención";
  byId("validityText").textContent = valid ? "Lista para presentar." : `${Object.keys(validation.errors).length} ajustes pendientes.`;
  byId("confirmBtn").disabled = !valid;
  byId("generateCutlistBtn").disabled = !valid;
}

function renderStatus(validation) {
  const labels = { draft: "En configuración", confirmed: "Propuesta confirmada", "cutlist-draft": "Despiece generado" };
  const badge = byId("statusBadge");
  badge.textContent = state.cutlistStale ? "Cambios pendientes" : labels[state.status];
  badge.className = `status-badge status-${state.status}${state.cutlistStale ? " stale" : ""}`;
  if (state.cutlistStale) badge.textContent = "Despiece desactualizado";
  else if (!validation.valid) badge.textContent = "Configuración incompleta";
  const confirmed = state.status === "confirmed" || state.status === "cutlist-draft";
  byId("confirmationTitle").textContent = confirmed ? "Propuesta confirmada" : "Lista para confirmar";
  byId("confirmationText").textContent = confirmed ? "El modelo quedó aprobado para generar el despiece preliminar." : (validation.valid ? "Revisa la propuesta con tu cliente." : "Corrige los campos señalados antes de confirmar.");
  byId("confirmBtn").textContent = confirmed ? "Confirmada ✓" : "Confirmar propuesta";
  byId("confirmBtn").disabled = !validation.valid || confirmed;
}

function renderModules(validation) {
  const list = byId("moduleList");
  const template = byId("moduleTemplate");
  const cards = state.modules.map((module, index) => {
    const card = template.content.firstElementChild.cloneNode(true);
    card.dataset.moduleId = module.id;
    $(".module-index", card).textContent = `M${String(index + 1).padStart(2, "0")}`;
    $(".module-name", card).value = module.name;
    $(".module-width", card).value = module.width;
    const type = $(".module-type", card);
    Object.entries(MODULE_TYPES).forEach(([value, option]) => type.add(new Option(option.name, value)));
    type.value = module.type;
    $(".module-shelves", card).value = module.shelves;
    $(".module-drawers", card).value = module.drawers;
    $(".module-hint", card).textContent = `Fondo mínimo recomendado: ${MODULE_TYPES[module.type].minDepth} mm`;
    $(".module-width-error", card).textContent = validation.errors[`modules.${module.id}.width`]?.[0] || validation.errors[`modules.${module.id}.type`]?.[0] || "";
    $(".remove-module", card).disabled = state.modules.length === 1;
    return card;
  });
  list.replaceChildren(...cards);
  const available = getInteriorWidth(state);
  const used = getUsedModuleWidth(state);
  const difference = available - used;
  byId("moduleAvailable").textContent = `${available} mm`;
  byId("moduleUsed").textContent = `${used} mm`;
  byId("moduleDifference").textContent = `${difference > 0 ? "+" : ""}${difference} mm`;
  byId("moduleDifference").classList.toggle("metric-invalid", difference !== 0);
  byId("usageBar").style.width = `${Math.min(100, Math.max(0, (used / available) * 100))}%`;
  byId("usageBar").classList.toggle("invalid", used !== available);
  byId("moduleSumError").textContent = validation.errors["modules.sum"]?.[0] || "";
  byId("addModuleBtn").disabled = state.modules.length >= 4;
}

function createShelf(level) {
  const shelf = element("span", "visual-shelf");
  shelf.style.top = `${level}%`;
  return shelf;
}

function createInteriorModule(module) {
  const compartment = element("div", "visual-module");
  compartment.style.flex = String(module.width);
  compartment.dataset.moduleId = module.id;
  const label = element("span", "visual-module-label", `${module.name} · ${module.width} mm`);
  compartment.append(label);
  const usableTop = module.drawers ? 58 : 10;
  for (let index = 1; index <= module.shelves; index += 1) compartment.append(createShelf(usableTop + ((88 - usableTop) * index / (module.shelves + 1))));
  const type = MODULE_TYPES[module.type];
  if (type.rail) {
    const rail = element("span", `visual-rail rail-${type.rail}`);
    compartment.append(rail);
  }
  if (module.drawers > 0) {
    const group = element("div", "visual-drawers");
    for (let index = 0; index < module.drawers; index += 1) group.append(element("span", "visual-drawer"));
    compartment.append(group);
  }
  return compartment;
}

function renderModel() {
  const front = byId("frontModel");
  const isExterior = activeView === "exterior";
  front.replaceChildren();
  front.className = `front-model view-${activeView}`;
  const interior = element("div", "model-interior");
  interior.replaceChildren(...state.modules.map(createInteriorModule));
  front.append(interior);
  const doors = element("div", "model-doors");
  for (let index = 0; index < state.doors.count; index += 1) {
    const door = element("div", "model-door");
    door.style.setProperty("--door-index", index);
    door.append(element("span", "door-handle"));
    doors.append(door);
  }
  front.append(doors, element("div", "model-plinth"));
  doors.hidden = !isExterior && activeView !== "threeD";
  const ratio = state.dimensions.width / state.dimensions.height;
  const maxWidth = Math.min(760, window.innerWidth < 600 ? 300 : 700);
  const modelWidth = Math.min(maxWidth, Math.max(220, 450 * ratio));
  byId("modelFrame").style.width = `${modelWidth}px`;
  byId("modelFrame").className = `model-frame mode-${activeView}`;
  document.documentElement.style.setProperty("--exterior", FINISHES[state.finishes.exterior].color);
  document.documentElement.style.setProperty("--exterior-dark", FINISHES[state.finishes.exterior].dark);
  document.documentElement.style.setProperty("--interior", FINISHES[state.finishes.interior].color);
  byId("widthDimension").textContent = `${state.dimensions.width} mm`;
  byId("heightDimension").textContent = `${state.dimensions.height} mm`;
  byId("moduleMeasures").replaceChildren(...state.modules.map((module) => {
    const span = element("span", "", `${module.width} mm`); span.style.flex = String(module.width); return span;
  }));
  byId("moduleMeasures").hidden = isExterior;
}

function renderPresentation() {
  byId("previewProject").textContent = state.project.name || "Proyecto sin nombre";
  byId("previewClient").textContent = state.project.client || "Cliente por definir";
  byId("previewNotes").textContent = state.project.notes || "Sin observaciones adicionales.";
  byId("summaryDimensions").textContent = `${state.dimensions.width} × ${state.dimensions.height} × ${state.dimensions.depth} mm`;
  byId("summaryConfiguration").textContent = `${state.modules.length} módulos · ${state.doors.count} puertas`;
  byId("summaryFinishes").textContent = `${FINISHES[state.finishes.exterior].name} / ${FINISHES[state.finishes.interior].name}`;
  const door = calculateDoorWidth(state);
  byId("doorFormula").textContent = `Puertas: (${state.dimensions.width} − (${state.doors.count} + 1) × ${state.construction.doorGap}) ÷ ${state.doors.count} = ${door.exact.toFixed(2)} mm → ${door.rounded} mm por hoja`;
  $$(".view-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.view === activeView));
  renderModel();
}

function cutlistRows(pieces, grouped) {
  const moduleName = (id) => state.modules.find((module) => module.id === id)?.name || "General";
  const ordered = grouped ? [...pieces].sort((a, b) => moduleName(a.moduleId).localeCompare(moduleName(b.moduleId))) : pieces;
  const rows = [];
  let group = null;
  ordered.forEach((piece) => {
    const currentGroup = moduleName(piece.moduleId);
    if (grouped && currentGroup !== group) {
      const row = element("tr", "group-row");
      const cell = element("td", "", currentGroup); cell.colSpan = 11; row.append(cell); rows.push(row); group = currentGroup;
    }
    const row = element("tr");
    const values = [piece.code, piece.name, currentGroup, piece.quantity, `${piece.length} mm`, `${piece.width} mm`, `${piece.thickness} mm`, piece.material, piece.grain, piece.edging.join(", ") || "—", piece.note];
    const labels = ["Código", "Pieza", "Módulo", "Cantidad", "Largo", "Ancho", "Espesor", "Material", "Veta", "Canteado", "Observación"];
    values.forEach((value, index) => {
      const cell = element("td", "", value);
      cell.dataset.label = labels[index];
      row.append(cell);
    });
    rows.push(row);
  });
  return rows;
}

function renderCutlist(validation) {
  const unlocked = validation.valid && (state.status === "confirmed" || state.status === "cutlist-draft");
  byId("cutlistGate").hidden = unlocked;
  byId("cutlistContent").hidden = !unlocked;
  byId("printCutlistBtn").disabled = !unlocked;
  if (!unlocked) return;
  const pieces = calculateCutlist(state);
  const technicalValidation = validateCutlist(state, pieces);
  byId("cutlistBody").replaceChildren(...cutlistRows(pieces, byId("groupCutlist").value === "module"));
  byId("pieceCount").textContent = `${pieces.length} tipos de pieza · ${pieces.reduce((sum, piece) => sum + piece.quantity, 0)} piezas`;
  const door = calculateDoorWidth(state);
  byId("printTechnicalSummary").textContent = `Parámetros: ${state.dimensions.width} × ${state.dimensions.height} × ${state.dimensions.depth} mm · Melamina ${state.construction.boardThickness} mm · Fondo ${state.construction.backThickness} mm sobrepuesto · Zócalo ${state.construction.plinthHeight} mm · Retiro de repisas ${state.construction.shelfSetback} mm · Holgura de puertas ${state.construction.doorGap} mm · Puerta exacta ${door.exact.toFixed(2)} mm, redondeada ${door.rounded} mm.`;
  byId("cutlistStatus").textContent = state.status === "cutlist-draft" && !state.cutlistStale ? "Despiece actualizado" : "Pendiente de generar";
  byId("generateCutlistBtn").disabled = !technicalValidation.valid;
}

function render() {
  const validation = validateState(state);
  syncForm();
  renderModules(validation);
  renderPresentation();
  renderValidation(validation);
  renderStatus(validation);
  renderCutlist(validation);
  renderStepNavigation();
  try { saveState(state); byId("saveState").textContent = "Guardado localmente"; } catch { byId("saveState").textContent = "No se pudo guardar"; }
}

function updateFromControl(control) {
  const current = getPath(state, control.dataset.path);
  const value = typeof current === "number" ? Number(control.value) : control.value;
  setPath(state, control.dataset.path, value);
  invalidateState(state);
  render();
}

function updateModule(card, target) {
  const module = state.modules.find((item) => item.id === card.dataset.moduleId);
  if (!module) return;
  if (target.classList.contains("module-name")) module.name = target.value;
  if (target.classList.contains("module-width")) module.width = Number(target.value);
  if (target.classList.contains("module-type")) {
    module.type = target.value;
    const defaults = MODULE_TYPES[module.type];
    module.shelves = defaults.defaultShelves;
    module.drawers = defaults.defaultDrawers;
  }
  if (target.classList.contains("module-shelves")) module.shelves = Number(target.value);
  if (target.classList.contains("module-drawers")) module.drawers = Number(target.value);
  const controlClass = [...target.classList].find((name) => name.startsWith("module-"));
  const moduleId = module.id;
  invalidateState(state);
  render();
  const replacement = document.querySelector(`[data-module-id="${moduleId}"] .${controlClass}`);
  replacement?.focus();
  if (replacement?.setSelectionRange && replacement.type !== "number") replacement.setSelectionRange(replacement.value.length, replacement.value.length);
}

function copyCutlist() {
  const pieces = calculateCutlist(state);
  const headers = ["Código", "Pieza", "Módulo", "Cantidad", "Largo", "Ancho", "Espesor", "Material", "Veta", "Canteado", "Observación"];
  const moduleName = (id) => state.modules.find((module) => module.id === id)?.name || "General";
  const rows = pieces.map((piece) => [piece.code, piece.name, moduleName(piece.moduleId), piece.quantity, piece.length, piece.width, piece.thickness, piece.material, piece.grain, piece.edging.join(", "), piece.note]);
  const text = [headers, ...rows].map((row) => row.join("\t")).join("\n");
  navigator.clipboard.writeText(text).then(() => {
    byId("copyCutlistBtn").textContent = "Tabla copiada ✓";
    setTimeout(() => { byId("copyCutlistBtn").textContent = "Copiar tabla"; }, 1600);
  }).catch(() => window.prompt("Copia la tabla:", text));
}

function toggleClientMode(enabled) {
  clientMode = enabled;
  document.body.classList.toggle("client-mode", enabled);
  byId("clientModeBanner").hidden = !enabled;
  if (enabled) showStep("presentation");
}

function bindEvents() {
  document.addEventListener("click", (event) => {
    const step = event.target.closest("[data-step]");
    if (step) showStep(step.dataset.step);
    const next = event.target.closest("[data-next]");
    if (next) showStep(next.dataset.next);
    const prev = event.target.closest("[data-prev]");
    if (prev) showStep(prev.dataset.prev);
    const view = event.target.closest("[data-view]");
    if (view) { activeView = view.dataset.view; renderPresentation(); }
  });
  $$('[data-path]').forEach((control) => control.addEventListener("input", () => updateFromControl(control)));
  byId("moduleList").addEventListener("input", (event) => updateModule(event.target.closest(".module-card"), event.target));
  byId("moduleList").addEventListener("change", (event) => updateModule(event.target.closest(".module-card"), event.target));
  byId("moduleList").addEventListener("click", (event) => {
    const remove = event.target.closest(".remove-module");
    if (!remove) return;
    state.modules = state.modules.filter((module) => module.id !== remove.closest(".module-card").dataset.moduleId);
    distributeModuleWidths(state); invalidateState(state); render();
  });
  byId("addModuleBtn").addEventListener("click", () => { if (state.modules.length < 4) { state.modules.push(createModule(state)); distributeModuleWidths(state); invalidateState(state); render(); } });
  byId("balanceModulesBtn").addEventListener("click", () => { distributeModuleWidths(state); invalidateState(state); render(); });
  byId("confirmBtn").addEventListener("click", () => { if (validateState(state).valid) { state.status = "confirmed"; state.cutlistStale = false; render(); } });
  byId("generateCutlistBtn").addEventListener("click", () => { if (validateState(state).valid && validateCutlist(state).valid) { state.status = "cutlist-draft"; state.cutlistStale = false; render(); } });
  byId("groupCutlist").addEventListener("change", () => renderCutlist(validateState(state)));
  byId("copyCutlistBtn").addEventListener("click", copyCutlist);
  byId("goPresentationBtn").addEventListener("click", () => showStep("presentation"));
  [byId("printBtn"), byId("printCutlistBtn"), byId("printClientBtn")].forEach((button) => button.addEventListener("click", () => window.print()));
  byId("clientModeBtn").addEventListener("click", () => toggleClientMode(true));
  byId("exitClientModeBtn").addEventListener("click", () => toggleClientMode(false));
  byId("newProjectBtn").addEventListener("click", () => {
    if (window.confirm("¿Crear un proyecto nuevo? Se reemplazará el proyecto guardado en este dispositivo.")) {
      localStorage.removeItem(STORAGE_KEY); state = createDefaultState(); render(); showStep("project");
    }
  });
  window.addEventListener("resize", renderModel);
}

populateSelects();
bindEvents();
render();
showStep(activeStep);

export { state };

