import test from 'node:test';
import assert from 'node:assert/strict';
import * as FormeEngine from '../../../src/engine/formeEngine.js';
import { COLOR_PALETTE_INFO, PRODUCTS } from '../../../src/data/products.js';

test('F11: Color Fidelity - Olive Green #364634 linearGradient defs', () => {
  const defs = FormeEngine.defs('test-olive', '#364634');
  assert.ok(defs.includes('#364634'), 'Defs must contain #364634 base color');
  assert.ok(defs.includes('stop-color='), 'Defs must contain gradient stops');
  assert.ok(defs.includes('pattern id="test-olive-rib"'), 'Defs must contain rib weave texture pattern');
});

test('F11: Color Fidelity - Desert Camel #C69F6F linearGradient defs', () => {
  const defs = FormeEngine.defs('test-camel', '#C69F6F');
  assert.ok(defs.includes('#c69f6f') || defs.includes('#C69F6F'), 'Defs must contain #C69F6F');
});

test('F11: Color Fidelity - Obsidian Black #111315 linearGradient defs', () => {
  const defs = FormeEngine.defs('test-black', '#111315');
  assert.ok(defs.includes('#111315'), 'Defs must contain #111315');
});

test('F11: Color Fidelity - Linen White #FAF8F5 linearGradient defs', () => {
  const defs = FormeEngine.defs('test-white', '#FAF8F5');
  assert.ok(defs.includes('#faf8f5') || defs.includes('#FAF8F5'), 'Defs must contain #FAF8F5');
});

test('F11: Color Fidelity - tint function computes shade bounds [0, 255]', () => {
  // #111315 tinted darker -50 should clamp to 0
  const darker = FormeEngine.tint('#111315', -50);
  assert.ok(FormeEngine.hex(darker), 'Darker tint must remain valid hex');

  // #faf8f5 tinted lighter +50 should clamp to 255 (ff)
  const lighter = FormeEngine.tint('#FAF8F5', 50);
  assert.ok(FormeEngine.hex(lighter), 'Lighter tint must remain valid hex');
});

test('F11: Color Fidelity - hex validator rejects malformed hex', () => {
  assert.equal(FormeEngine.hex('#364634'), true);
  assert.equal(FormeEngine.hex('#C69F6F'), true);
  assert.equal(FormeEngine.hex('#111315'), true);
  assert.equal(FormeEngine.hex('#FAF8F5'), true);
  assert.equal(FormeEngine.hex('364634'), false, 'Missing hash prefix');
  assert.equal(FormeEngine.hex('#zzz'), false, 'Non-hex chars');
  assert.equal(FormeEngine.hex('#12345'), false, '5 digits');
  assert.equal(FormeEngine.hex(null), false, 'Null');
});
