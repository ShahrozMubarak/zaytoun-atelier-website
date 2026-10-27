import test from 'node:test';
import assert from 'node:assert/strict';
import * as FormeEngine from '../../../src/engine/formeEngine.js';
import { PRODUCTS } from '../../../src/data/products.js';
import { createTestContext } from '../helpers/testContext.js';

test('F10: 2D Flat Mode - passes { product, variant } to FormeEngine.mannequin', () => {
  const top = PRODUCTS.find(p => p.id === 'forme-02');
  const bottom = PRODUCTS.find(p => p.id === 'forme-03');

  const items = [
    { product: top, variant: 0 },
    { product: bottom, variant: 0 }
  ];

  const svg = FormeEngine.mannequin('women', items);
  assert.ok(svg.includes('garment-'), '2D mannequin SVG must include garment defs');
  assert.ok(svg.includes(top.colors[0].hex.toLowerCase()) || svg.includes(top.colors[0].hex), '2D mannequin must render top garment color');
});

test('F10: 2D Flat Mode - rendered SVG displays draped clothes in 2D technical view', () => {
  const coat = PRODUCTS.find(p => p.id === 'forme-01');
  const items = [{ product: coat, variant: 0 }];

  const svg = FormeEngine.mannequin('women', items);
  assert.ok(svg.includes('garment-'), 'Garment layer is present');
  assert.ok(svg.includes('#364634'), 'Heritage trench coat olive green color is rendered');
});

test('F10: 2D Flat Mode - preserves underlying FORME mannequin structure', () => {
  const items = [];
  const svg = FormeEngine.mannequin('women', items);
  assert.ok(svg.includes('viewBox="0 0 400 700"'));
  assert.ok(svg.includes('cy="658"'), 'Pedestal is rendered in 2D vector view');
  assert.ok(svg.includes('cy="76"'), 'Egg head is rendered in 2D vector view');
});

test('F10: 2D Flat Mode - switching between 3D and 2D preserves equipped items', () => {
  const ctx = createTestContext();
  assert.equal(ctx.state.modelMode, '3d');

  // Verify equipped items in 3D
  const items3d = ctx.getEquippedItems();
  assert.ok(items3d.length > 0, 'Items equipped in 3D');

  // Switch to 2D
  ctx.state.modelMode = '2d';
  const items2d = ctx.getEquippedItems();
  assert.deepEqual(items2d, items3d, 'Equipped items must be identical between 3D and 2D modes');
});

test('F10: 2D Flat Mode - switching back to 3D retains state', () => {
  const ctx = createTestContext();
  ctx.state.modelMode = '2d';
  // Equip an additional piece in 2D
  const coat = PRODUCTS.find(p => p.id === 'forme-01');
  ctx.toggleEquip(coat, 0);

  // Switch back to 3D
  ctx.state.modelMode = '3d';
  const items = ctx.getEquippedItems();
  const hasCoat = items.some(i => i.product.id === 'forme-01');
  assert.ok(hasCoat, 'Coat equipped while in 2D mode persists when switching to 3D');
});
