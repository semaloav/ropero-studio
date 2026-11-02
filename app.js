const STORAGE_KEY = "ropero-studio:v1";
const FIELD_IDS = ["project", "client", "width", "height", "depth", "doors", "drawers", "layout", "notes"];
const fields = Object.fromEntries(FIELD_IDS.map((id) => [id, document.getElementById(id)]));
const ui = {
  wardrobe: document.getElementById("wardrobe"),
  interior: document.getElementById("interior"),
  doors: document.getElementById("doorsView"),
  savedState: document.getElementById("savedState"),
  closedView: document.getElementById("closedViewBtn"),
  openView: document.getElementById("openViewBtn"),
  threeDView: document.getElementById("threeDViewBtn"),
};
const DEFAULT_FINISH = { color: "#c69a68", name: "Roble natural" };
let finish = { ...DEFAULT_FINISH };

function numberInRange(field) {
  const value = Number(field.value);
  return Math.min(Number(field.max), Math.max(Number(field.min), Number.isFinite(value) ? value : Number(field.min)));
}

function createElement(className) {
  const element = document.createElement("div");
  element.className = className;
  return element;
}

function renderInterior() {
  const sections = Math.min(Number(fields.doors.value), 3);
  const drawerCount = Number(fields.drawers.value);
  const organization = fields.layout.value;
  ui.interior.replaceChildren();
  for (let index = 0; index < sections; index += 1) {
    const compartment = createElement("compartment");
    const shelfCount = organization === "shelves" ? 5 : organization === "hanging" ? 1 : index === 0 ? 4 : 2;
    for (let shelfIndex = 1; shelfIndex <= shelfCount; shelfIndex += 1) {
      const shelf = document.createElement("span");
      shelf.className = "shelf";
      shelf.style.top = `${(shelfIndex / (shelfCount + 1)) * 82}%`;
      compartment.appendChild(shelf);
    }
    if (organization !== "shelves" && index === sections - 1) {
      const rail = document.createElement("span");
      rail.className = "rail";
      compartment.appendChild(rail);
    }
    if (drawerCount > 0 && index === 0) {
      const drawerGroup = createElement("drawers-view");
      for (let drawerIndex = 0; drawerIndex < Math.min(drawerCount, 4); drawerIndex += 1) drawerGroup.appendChild(createElement("drawer"));
      compartment.appendChild(drawerGroup);
    }
    ui.interior.appendChild(compartment);
  }
}

function renderDoors() {
  ui.doors.replaceChildren();
  for (let index = 0; index < Number(fields.doors.value); index += 1) {
    const door = createElement("door");
    const handle = document.createElement("span");
    handle.className = "handle";
    door.appendChild(handle);
    ui.doors.appendChild(door);
  }
}

function getProjectData() {
  return { ...Object.fromEntries(FIELD_IDS.map((id) => [id, fields[id].value])), finish };
}

function saveProject() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(getProjectData()));
    ui.savedState.textContent = "Guardado en este dispositivo";
  } catch {
    ui.savedState.textContent = "No se pudo guardar localmente";
  }
}

function loadProject() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("ropero-studio");
    if (!stored) return;
    const data = JSON.parse(stored);
    FIELD_IDS.forEach((id) => { if (data[id] != null) fields[id].value = data[id]; });
    if (data.finish?.color && data.finish?.name) finish = data.finish;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function render() {
  const width = numberInRange(fields.width);
  const height = numberInRange(fields.height);
  const depth = numberInRange(fields.depth);
  const projectName = fields.project.value.trim() || "Proyecto sin nombre";
  const clientName = fields.client.value.trim() || "Cliente por definir";
  document.documentElement.style.setProperty("--wood", finish.color);
  document.getElementById("projectPreview").textContent = projectName;
  document.getElementById("clientPreview").textContent = clientName;
  document.getElementById("notesPreview").textContent = fields.notes.value.trim() || "Propuesta personalizada según requerimientos del cliente.";
  document.getElementById("widthLabel").textContent = `${width} cm`;
  document.getElementById("heightLabel").textContent = `${height} cm`;
  document.getElementById("measureSummary").textContent = `${width} × ${height} × ${depth} cm`;
  document.getElementById("distributionSummary").textContent = `${fields.doors.value} puertas · ${fields.drawers.value} cajones`;
  document.getElementById("finishSummary").textContent = finish.name;
  document.getElementById("finishName").textContent = finish.name;
  ui.wardrobe.setAttribute("aria-label", `${projectName}: ropero de ${width} por ${height} por ${depth} centímetros, ${fields.doors.value} puertas y ${fields.drawers.value} cajones, acabado ${finish.name}`);
  const proportion = Math.max(0.58, Math.min(1.25, (width / height) * 0.92));
  ui.wardrobe.style.width = `${Math.min(96, 62 * proportion)}%`;
  renderInterior();
  renderDoors();
  saveProject();
}

function selectFinish(button) {
  finish = { color: button.dataset.color, name: button.dataset.name };
  document.querySelectorAll(".swatch").forEach((swatch) => {
    const selected = swatch === button;
    swatch.classList.toggle("active", selected);
    swatch.setAttribute("aria-checked", String(selected));
  });
  render();
}

function setView(mode) {
  const showInterior = mode === "interior";
  const showThreeD = mode === "3d";
  ui.wardrobe.classList.toggle("interior-view", showInterior);
  ui.wardrobe.classList.toggle("three-d-view", showThreeD);
  [[ui.closedView, mode === "exterior"], [ui.openView, showInterior], [ui.threeDView, showThreeD]].forEach(([button, selected]) => {
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}

FIELD_IDS.forEach((id) => fields[id].addEventListener("input", render));
document.querySelectorAll(".swatch").forEach((button) => button.addEventListener("click", () => selectFinish(button)));
ui.closedView.addEventListener("click", () => setView("exterior"));
ui.openView.addEventListener("click", () => setView("interior"));
ui.threeDView.addEventListener("click", () => setView("3d"));
document.getElementById("printBtn").addEventListener("click", () => {
  if (document.getElementById("configForm").reportValidity()) window.print();
});
document.getElementById("newBtn").addEventListener("click", () => {
  if (window.confirm("¿Deseas comenzar una propuesta nueva?")) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("ropero-studio");
    window.location.reload();
  }
});
document.getElementById("datePreview").textContent = new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", year: "numeric" }).format(new Date()).replace(".", "");

loadProject();
document.querySelectorAll(".swatch").forEach((swatch) => {
  const selected = swatch.dataset.name === finish.name;
  swatch.classList.toggle("active", selected);
  swatch.setAttribute("aria-checked", String(selected));
});
render();
