import test from 'node:test';
import assert from 'node:assert/strict';
import { createTestContext } from '../helpers/testContext.js';

test('F4: Turntable Auto-Rotate - toggle state', () => {
  const ctx = createTestContext();
  assert.equal(ctx.state.autoRotate, false, 'Auto-rotate should be false by default');

  ctx.toggleAutoRotate();
  assert.equal(ctx.state.autoRotate, true, 'Toggling turns autoRotate on');

  ctx.toggleAutoRotate();
  assert.equal(ctx.state.autoRotate, false, 'Toggling again turns autoRotate off');
});

test('F4: Turntable Auto-Rotate - rotational velocity 24 deg/sec', () => {
  const ctx = createTestContext();
  ctx.toggleAutoRotate(); // enable
  const initialRot = ctx.state.rotY;

  // Advance turntable by 2 seconds
  ctx.advanceTurntable(2);
  const expected = (initialRot + 2 * 24) % 360;
  assert.equal(ctx.state.rotY, expected, 'rotY must advance by 24 deg per second');
});

test('F4: Turntable Auto-Rotate - smooth 360° wrapping', () => {
  const ctx = createTestContext();
  ctx.toggleAutoRotate();
  ctx.state.rotY = 350;

  // Advance by 1 second (24 deg) -> (350 + 24) % 360 = 374 % 360 = 14
  ctx.advanceTurntable(1);
  assert.equal(ctx.state.rotY, 14, 'Rotation should smoothly wrap around 360 degrees');
});

test('F4: Turntable Auto-Rotate - manual drag cancels auto-rotate', () => {
  const ctx = createTestContext();
  ctx.toggleAutoRotate();
  assert.equal(ctx.state.autoRotate, true);

  // Drag interaction simulates pointer down
  ctx.state.autoRotate = false; // Mannequin3D handlePointerDown sets setAutoRotate(false)
  ctx.rotate(50, 0);

  assert.equal(ctx.state.autoRotate, false, 'Pointer drag must cancel auto-rotate');
});

test('F4: Turntable Auto-Rotate - preset angle selection pauses turntable', () => {
  const ctx = createTestContext();
  ctx.toggleAutoRotate();
  assert.equal(ctx.state.autoRotate, true);

  ctx.setPresetAngle(180);
  assert.equal(ctx.state.autoRotate, false, 'Selecting preset angle must cancel auto-rotate');
  assert.equal(ctx.state.rotY, 180, 'rotY set to preset');
});

test('F4: Turntable Auto-Rotate - pedestal floor track synchronization', () => {
  const ctx = createTestContext();
  ctx.toggleAutoRotate();
  ctx.advanceTurntable(1.5); // 25 + 36 = 61 deg

  const basePlatformTransform = `rotateX(75deg) rotateZ(${-ctx.state.rotY}deg) scale(${ctx.state.zoom})`;
  assert.ok(basePlatformTransform.includes('rotateZ(-61deg)'), 'Base platform rotateZ must synchronize with -rotY');
});
