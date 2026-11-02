import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateCutlist, calculateDoorWidth, cloneState, createDefaultState, distributeModuleWidths,
  getInteriorWidth, invalidateState, validateCutlist, validateState,
} from "./model.js";

test("el proyecto de referencia 2400 × 2200 × 600 con tres módulos es válido", () => {
  const state = createDefaultState();
  assert.deepEqual(state.dimensions, { width: 2400, height: 2200, depth: 600 });
  assert.equal(state.construction.boardThickness, 18);
  assert.equal(state.modules.length, 3);
  assert.equal(validateState(state).valid, true);
  assert.equal(getInteriorWidth(state), 2328);
  assert.deepEqual(state.modules.map((module) => module.width), [776, 776, 776]);
  const pieces = calculateCutlist(state);
  assert.deepEqual([pieces.find((piece) => piece.code === "TAP-01").length, pieces.find((piece) => piece.code === "TAP-01").width], [2364, 600]);
  assert.deepEqual([pieces.find((piece) => piece.code === "BAS-01").length, pieces.find((piece) => piece.code === "BAS-01").width], [2364, 600]);
  assert.deepEqual([pieces.find((piece) => piece.code === "DIV-01").length, pieces.find((piece) => piece.code === "DIV-01").width], [2084, 600]);
  assert.deepEqual([pieces.find((piece) => piece.code === "REP-01").length, pieces.find((piece) => piece.code === "REP-01").width], [776, 580]);
});

test("los módulos se reparten exactamente en el ancho interior", () => {
  const state = createDefaultState();
  state.dimensions.width = 2501;
  distributeModuleWidths(state);
  assert.equal(state.modules.reduce((sum, module) => sum + module.width, 0), getInteriorWidth(state));
});

test("una suma incorrecta bloquea la validación", () => {
  const state = createDefaultState();
  state.modules[0].width -= 1;
  const result = validateState(state);
  assert.equal(result.valid, false);
  assert.ok(result.errors["modules.sum"]);
});

test("las divisiones y repisas se derivan de los módulos", () => {
  const state = createDefaultState();
  const pieces = calculateCutlist(state);
  assert.equal(pieces.find((piece) => piece.code === "DIV-01").quantity, 2);
  state.modules.forEach((module, index) => {
    assert.equal(pieces.find((piece) => piece.code === `REP-${String(index + 1).padStart(2, "0")}`).quantity, module.shelves);
  });
});

test("el despiece no produce medidas negativas ni cero", () => {
  const state = createDefaultState();
  const pieces = calculateCutlist(state);
  assert.ok(pieces.every((piece) => piece.length > 0 && piece.width > 0 && piece.thickness > 0));
  assert.equal(validateCutlist(state, pieces).valid, true);
});

test("cambiar una medida invalida una propuesta confirmada", () => {
  const state = createDefaultState();
  state.status = "confirmed";
  state.dimensions.width = 2500;
  invalidateState(state);
  assert.equal(state.status, "draft");
  assert.equal(state.cutlistStale, true);
});

test("puertas y frentes usan las holguras configuradas", () => {
  const state = createDefaultState();
  state.construction.doorGap = 4;
  const pieces = calculateCutlist(state);
  const door = pieces.find((piece) => piece.code === "PUE-01");
  assert.equal(door.width, Math.round((2400 - (4 * 4)) / 3));
  const drawer = pieces.find((piece) => piece.code === "FRC-02");
  assert.ok(drawer.note.includes("solo frente visible"));
});

test("la fórmula de puertas descuenta holguras laterales e interiores y expone el redondeo", () => {
  const state = createDefaultState();
  const door = calculateDoorWidth(state);
  assert.equal(door.available, 2392);
  assert.equal(door.exact, 2392 / 3);
  assert.equal(door.rounded, 797);
});

test("un módulo de colgar avisa cuando el fondo es insuficiente", () => {
  const state = createDefaultState();
  state.dimensions.depth = 400;
  const result = validateState(state);
  assert.equal(result.valid, false);
  assert.ok(Object.keys(result.errors).some((key) => key.endsWith(".type")));
});

test("el estado se puede clonar sin compartir módulos", () => {
  const state = createDefaultState();
  const copy = cloneState(state);
  copy.modules[0].width = 10;
  assert.notEqual(copy.modules[0].width, state.modules[0].width);
});

