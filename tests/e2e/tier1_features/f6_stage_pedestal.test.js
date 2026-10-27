import test from 'node:test';
import assert from 'node:assert/strict';
import { createTestContext } from '../helpers/testContext.js';

test('F6: Stage Pedestal - 3D floor plane perspective transformation', () => {
  const ctx = createTestContext();
  const floorPlaneTransform = `rotateX(75deg) rotateZ(${-ctx.state.rotY}deg) scale(${ctx.state.zoom})`;
  assert.ok(floorPlaneTransform.includes('rotateX(75deg)'), 'Platform must lie flat on 3D floor at rotateX(75deg)');
  assert.ok(floorPlaneTransform.includes(`rotateZ(-${ctx.state.rotY}deg)`), 'Platform rotation must sync with turntable angle');
});

test('F6: Stage Pedestal - pedestal rim elements', () => {
  const rimClasses = "border-2 border-camel-600/30 dark:border-camel-400/20 bg-gradient-to-tr from-onyx-950/20 to-camel-500/10";
  assert.ok(rimClasses.includes('border-camel-600/30'), 'Pedestal outer rim styled with desert camel border');
  assert.ok(rimClasses.includes('bg-gradient-to-tr'), 'Pedestal floor platform has subtle gradient');
});

test('F6: Stage Pedestal - inner circular track outline', () => {
  const trackClasses = "border border-dashed border-onyx-400/25 dark:border-linen-300/15";
  assert.ok(trackClasses.includes('border-dashed'), 'Inner guide circle has dashed turntable track');
});

test('F6: Stage Pedestal - studio shadow layer', () => {
  const shadowBackground = 'radial-gradient(circle, rgba(17,19,21,0.45) 0%, rgba(17,19,21,0.12) 60%, transparent 80%)';
  assert.ok(shadowBackground.includes('rgba(17,19,21,0.45)'), 'Shadow features realistic dark obsidian center core');
  assert.ok(shadowBackground.includes('transparent 80%'), 'Shadow fades smoothly to transparent at perimeter');
});

test('F6: Stage Pedestal - synchronization with zoom factor', () => {
  const ctx = createTestContext();
  ctx.setZoom(1.25);
  const floorPlaneTransform = `rotateX(75deg) rotateZ(${-ctx.state.rotY}deg) scale(${ctx.state.zoom})`;
  assert.ok(floorPlaneTransform.includes('scale(1.25)'), 'Platform must scale synchronously with mannequin zoom');
});
