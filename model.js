export const STORAGE_KEY = "ropero-studio:v2";
export const STORAGE_VERSION = 2;

export const FINISHES = {
  "roble-natural": { name: "Roble natural", color: "#b88755", dark: "#76502f" },
  "lino-claro": { name: "Lino claro", color: "#e5ddd0", dark: "#aea292" },
  nogal: { name: "Nogal", color: "#72503d", dark: "#422d24" },
  grafito: { name: "Grafito", color: "#454a49", dark: "#252928" },
  blanco: { name: "Blanco mate", color: "#eeeae2", dark: "#bdb7ad" },
};

export const MODULE_TYPES = {
  "long-hang": { name: "Colgador largo", minDepth: 500, defaultShelves: 1, defaultDrawers: 0, rail: "high" },
  "short-hang": { name: "Colgador corto con repisa", minDepth: 500, defaultShelves: 2, defaultDrawers: 0, rail: "mid" },
  shelves: { name: "Torre de repisas", minDepth: 350, defaultShelves: 5, defaultDrawers: 0 },
  drawers: { name: "Cajonera con repisas", minDepth: 450, defaultShelves: 2, defaultDrawers: 3 },
  mixed: { name: "Mixto", minDepth: 500, defaultShelves: 3, defaultDrawers: 2, rail: "high" },
};

const today = () => new Date().toISOString().slice(0, 10);

export function createDefaultState() {
  return {
    version: STORAGE_VERSION,
    project: { name: "Ropero principal", client: "Familia Ríos", date: today(), notes: "Interior claro y tiradores discretos." },
    dimensions: { width: 2400, height: 2200, depth: 600 },
    construction: {
      boardThickness: 18, backThickness: 3, plinthHeight: 80, shelfSetback: 20,
      doorGap: 2, doorTopGap: 2, doorBottomGap: 2, backType: "overlay", doorType: "overlay-hinged",
    },
    finishes: { exterior: "roble-natural", interior: "blanco" },
    doors: { count: 3 },
    modules: [
      { id: "module-1", name: "Colgador", width: 776, type: "long-hang", shelves: 1, drawers: 0 },
      { id: "module-2", name: "Cajonera", width: 776, type: "drawers", shelves: 2, drawers: 3 },
      { id: "module-3", name: "Repisas", width: 776, type: "shelves", shelves: 5, drawers: 0 },
    ],
    status: "draft",
    cutlistStale: false,
  };
}

export function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}

export function loadState(storage = globalThis.localStorage) {
  try {
    const parsed = JSON.parse(storage?.getItem(STORAGE_KEY));
    if (parsed?.version === STORAGE_VERSION && parsed.project && parsed.construction && Array.isArray(parsed.modules)) return parsed;
  } catch { /* Los formatos anteriores incompatibles se descartan de forma segura. */ }
  return createDefaultState();
}

export function saveState(state, storage = globalThis.localStorage) {
  storage?.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getInteriorWidth(state) {
  const { width } = state.dimensions;
  const t = state.construction.boardThickness;
  return Math.round(width - (2 * t) - (Math.max(0, state.modules.length - 1) * t));
}

export function getUsedModuleWidth(state) {
  return state.modules.reduce((sum, module) => sum + Number(module.width || 0), 0);
}

// Puertas batientes sobrepuestas (V1): se descuentan las holguras de ambos
// laterales y las holguras entre hojas. La medida exacta se conserva para
// hacer visible el redondeo aplicado al milímetro en el despiece.
export function calculateDoorWidth(state) {
  const available = state.dimensions.width - ((state.doors.count + 1) * state.construction.doorGap);
  const exact = available / state.doors.count;
  return { available, exact, rounded: Math.round(exact) };
}

export function distributeModuleWidths(state) {
  const available = getInteriorWidth(state);
  const count = state.modules.length;
  const base = Math.floor(available / count);
  const remainder = available - (base * count);
  state.modules.forEach((module, index) => { module.width = base + (index === count - 1 ? remainder : 0); });
}

export function createModule(state) {
  const serial = Math.max(0, ...state.modules.map((module) => Number(module.id.split("-")[1]) || 0)) + 1;
  return { id: `module-${serial}`, name: `Módulo ${state.modules.length + 1}`, width: 100, type: "shelves", shelves: 4, drawers: 0 };
}

export function validateState(state) {
  const errors = {};
  const add = (path, message) => { (errors[path] ||= []).push(message); };
  const { width, height, depth } = state.dimensions;
  const c = state.construction;
  if (!state.project.name.trim()) add("project.name", "Ingresa un nombre para el proyecto.");
  if (!state.project.client.trim()) add("project.client", "Ingresa el nombre del cliente.");
  if (width < 800 || width > 5000) add("dimensions.width", "Usa un ancho entre 800 y 5000 mm.");
  if (height < 1200 || height > 3200) add("dimensions.height", "Usa un alto entre 1200 y 3200 mm.");
  if (depth < 350 || depth > 1000) add("dimensions.depth", "Usa un fondo entre 350 y 1000 mm.");
  if (c.boardThickness <= 0 || c.boardThickness * 2 >= Math.min(width, height, depth)) add("construction.boardThickness", "El espesor debe ser menor que las dimensiones del mueble.");
  if (c.plinthHeight < 0 || c.plinthHeight >= height - (2 * c.boardThickness)) add("construction.plinthHeight", "El zócalo debe caber bajo el espacio interior.");
  if (state.modules.length < 1 || state.modules.length > 4) add("modules", "Configura entre uno y cuatro módulos.");
  state.modules.forEach((module) => {
    if (Number(module.width) <= 0) add(`modules.${module.id}.width`, "El ancho debe ser mayor que cero.");
    const requiredDepth = MODULE_TYPES[module.type]?.minDepth || 350;
    if (depth < requiredDepth) add(`modules.${module.id}.type`, `Este módulo requiere al menos ${requiredDepth} mm de fondo.`);
    if (module.shelves < 0 || module.shelves > 10) add(`modules.${module.id}.shelves`, "Usa entre 0 y 10 repisas.");
    if (module.drawers < 0 || module.drawers > 6) add(`modules.${module.id}.drawers`, "Usa entre 0 y 6 cajones.");
  });
  const available = getInteriorWidth(state);
  const used = getUsedModuleWidth(state);
  if (used !== available) add("modules.sum", `La suma debe ser exactamente ${available} mm; actualmente es ${used} mm.`);
  const doorWidth = calculateDoorWidth(state).exact;
  if (doorWidth < 250 || doorWidth > 900) add("doors.count", `Cada puerta quedaría de ${Math.round(doorWidth)} mm; usa una cantidad que deje entre 250 y 900 mm por puerta.`);
  if (depth - c.shelfSetback <= 0) add("construction.shelfSetback", "El retiro debe ser menor que el fondo.");
  return { valid: Object.keys(errors).length === 0, errors };
}

const normalizedPiece = (piece) => {
  const sides = [Math.round(piece.length), Math.round(piece.width)].sort((a, b) => b - a);
  return { ...piece, length: sides[0], width: sides[1] };
};

export function calculateCutlist(state) {
  const t = state.construction.boardThickness;
  const { width, height, depth } = state.dimensions;
  const interiorFinish = FINISHES[state.finishes.interior].name;
  const exteriorFinish = FINISHES[state.finishes.exterior].name;
  const materialInterior = `Melamina ${interiorFinish}`;
  const materialExterior = `Melamina ${exteriorFinish}`;
  const usefulHeight = height - (2 * t) - state.construction.plinthHeight;
  const pieces = [];
  const add = (piece) => pieces.push(normalizedPiece(piece));
  // Todas las fórmulas de piezas de la V1 están centralizadas aquí.
  // El normalizador ordena la medida mayor como largo y redondea al milímetro.
  add({ code: "LAT-01", name: "Lateral", quantity: 2, length: height, width: depth, thickness: t, material: materialExterior, grain: "Vertical", edging: ["frontal"], moduleId: null, note: "Laterales completos" });
  add({ code: "TAP-01", name: "Tapa", quantity: 1, length: width - (2 * t), width: depth, thickness: t, material: materialExterior, grain: "Horizontal", edging: ["frontal"], moduleId: null, note: "Entre laterales" });
  add({ code: "BAS-01", name: "Base", quantity: 1, length: width - (2 * t), width: depth, thickness: t, material: materialInterior, grain: "Horizontal", edging: ["frontal"], moduleId: null, note: "Entre laterales" });
  if (state.construction.plinthHeight > 0) add({ code: "ZOC-01", name: "Zócalo frontal", quantity: 1, length: width - (2 * t), width: state.construction.plinthHeight, thickness: t, material: materialExterior, grain: "Horizontal", edging: ["superior"], moduleId: null, note: "Entre laterales" });
  if (state.modules.length > 1) add({ code: "DIV-01", name: "División vertical", quantity: state.modules.length - 1, length: usefulHeight, width: depth, thickness: t, material: materialInterior, grain: "Vertical", edging: ["frontal"], moduleId: null, note: "Entre tapa y base, sobre zócalo" });
  state.modules.forEach((module, index) => {
    if (module.shelves > 0) add({ code: `REP-${String(index + 1).padStart(2, "0")}`, name: "Repisa", quantity: module.shelves, length: module.width, width: depth - state.construction.shelfSetback, thickness: t, material: materialInterior, grain: "Horizontal", edging: ["frontal"], moduleId: module.id, note: `${module.name}; retiro frontal ${state.construction.shelfSetback} mm` });
    if (module.drawers > 0) {
      const drawerZone = Math.min(600, usefulHeight * 0.38);
      const faceHeight = (drawerZone - (state.construction.doorGap * (module.drawers + 1))) / module.drawers;
      add({ code: `FRC-${String(index + 1).padStart(2, "0")}`, name: "Frente de cajón", quantity: module.drawers, length: module.width - (2 * state.construction.doorGap), width: faceHeight, thickness: t, material: materialExterior, grain: "Horizontal", edging: ["4 cantos"], moduleId: module.id, note: `${module.name}; solo frente visible` });
    }
  });
  add({ code: "FON-01", name: "Fondo sobrepuesto", quantity: 1, length: height, width, thickness: state.construction.backThickness, material: `Fondo ${interiorFinish}`, grain: "Vertical", edging: [], moduleId: null, note: "Sobrepuesto al perímetro posterior" });
  const doorCalculation = calculateDoorWidth(state);
  const doorWidth = doorCalculation.exact;
  const doorHeight = height - state.construction.doorTopGap - state.construction.doorBottomGap;
  add({ code: "PUE-01", name: "Puerta", quantity: state.doors.count, length: doorHeight, width: doorWidth, thickness: t, material: materialExterior, grain: "Vertical", edging: ["4 cantos"], moduleId: null, note: `Ancho exacto ${doorCalculation.exact.toFixed(2)} mm; redondeado a ${doorCalculation.rounded} mm. Holguras verticales ${state.construction.doorTopGap}/${state.construction.doorBottomGap} mm` });
  return pieces;
}

export function validateCutlist(state, pieces = calculateCutlist(state)) {
  const errors = [];
  pieces.forEach((piece) => {
    if (piece.length <= 0 || piece.width <= 0) errors.push(`${piece.code} tiene una medida no positiva.`);
    if (piece.name === "Repisa") {
      const module = state.modules.find((item) => item.id === piece.moduleId);
      if (!module || piece.length > Math.max(module.width, state.dimensions.depth - state.construction.shelfSetback)) errors.push(`${piece.code} excede su módulo.`);
    }
  });
  return { valid: errors.length === 0, errors };
}

export function invalidateState(state) {
  if (state.status !== "draft") state.cutlistStale = true;
  state.status = "draft";
}

