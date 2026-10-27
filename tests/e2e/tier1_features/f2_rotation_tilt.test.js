import test from 'node:test';
import assert from 'node:assert/strict';
import { createTestContext } from '../helpers/testContext.js';
import { getAngleLabel, normalizeAngle } from '../helpers/assertions.js';

test('F2: 3D Rotation & Tilt - initial camera angles', () => {
  const ctx = createTestContext();
  assert.equal(ctx.state.rotY, 25, 'Default rotY should be 25 deg (slight 3/4 front-right)');
  assert.equal(ctx.state.rotX, 3, 'Default rotX should be 3 deg (slight eye-level tilt)');
  assert.equal(ctx.state.zoom, 1.0, 'Default zoom should be 1.0');
});

test('F2: 3D Rotation & Tilt - pointer drag orbit math', () => {
  const ctx = createTestContext();
  // Simulate dragging +100px horizontally, +50px vertically
  ctx.rotate(100, 50);
  // dx * 0.55 = 55 -> 25 + 55 = 80
  assert.equal(ctx.state.rotY, 80, 'rotY should update by dx * 0.55');
  // dy * (0.55 * 0.4) = 50 * 0.22 = 11 -> 3 + 11 = 14
  assert.equal(ctx.state.rotX, 14, 'rotX should update by dy * (0.55 * 0.4)');
});

test('F2: 3D Rotation & Tilt - vertical tilt clamping [-20°, +20°]', () => {
  const ctx = createTestContext();
  // Drag upward by large distance (e.g. -500px)
  ctx.rotate(0, -500);
  assert.equal(ctx.state.rotX, -20, 'rotX must be clamped at -20 deg minimum');

  // Drag downward by large distance (e.g. +500px)
  ctx.rotate(0, 1000);
  assert.equal(ctx.state.rotX, 20, 'rotX must be clamped at +20 deg maximum');
});

test('F2: 3D Rotation & Tilt - preset angle buttons', () => {
  const ctx = createTestContext();
  const presets = [0, 45, 90, 180, 315];

  for (const angle of presets) {
    ctx.setPresetAngle(angle);
    assert.equal(ctx.state.rotY, angle, `rotY should snap to preset angle ${angle}`);
    assert.equal(ctx.state.rotX, 3, 'rotX should reset to eye-level 3 deg');
    assert.equal(ctx.state.autoRotate, false, 'Selecting preset should disable autoRotate');
  }
});

test('F2: 3D Rotation & Tilt - angle label generator accuracy', () => {
  assert.equal(getAngleLabel(0), 'Front (0°)', '0 deg is Front');
  assert.equal(getAngleLabel(45), '3/4 Right (45°)', '45 deg is 3/4 Right');
  assert.equal(getAngleLabel(90), 'Right Profile (90°)', '90 deg is Right Profile');
  assert.equal(getAngleLabel(135), 'Back Right (135°)', '135 deg is Back Right');
  assert.equal(getAngleLabel(180), 'Back (180°)', '180 deg is Back');
  assert.equal(getAngleLabel(225), 'Back Left (225°)', '225 deg is Back Left');
  assert.equal(getAngleLabel(270), 'Left Profile (270°)', '270 deg is Left Profile');
  assert.equal(getAngleLabel(315), '3/4 Left (315°)', '315 deg is 3/4 Left');
});

test('F2: 3D Rotation & Tilt - camera reset restores defaults', () => {
  const ctx = createTestContext();
  ctx.rotate(180, 40);
  ctx.setZoom(1.3);
  ctx.toggleAutoRotate();

  ctx.resetCamera();
  assert.equal(ctx.state.rotY, 25, 'Reset must restore rotY = 25');
  assert.equal(ctx.state.rotX, 3, 'Reset must restore rotX = 3');
  assert.equal(ctx.state.zoom, 1.0, 'Reset must restore zoom = 1.0');
  assert.equal(ctx.state.autoRotate, false, 'Reset must disable autoRotate');
});
