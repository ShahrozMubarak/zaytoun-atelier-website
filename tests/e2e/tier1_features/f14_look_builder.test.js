import test from 'node:test';
import assert from 'node:assert/strict';
import { createTestContext } from '../helpers/testContext.js';
import { PRODUCTS } from '../../../src/data/products.js';

test('F14: Look Builder - empty state detection', () => {
  const ctx = createTestContext();
  ctx.clearOutfit('women');

  const items = ctx.getEquippedItems('women');
  assert.equal(items.length, 0, 'No equipped items');
  const emptyMessage = items.length === 0 ? "Empty Form" : `${items.length} Piece Ensemble`;
  assert.equal(emptyMessage, "Empty Form");
});

test('F14: Look Builder - lists all equipped items with metadata', () => {
  const ctx = createTestContext();
  const items = ctx.getEquippedItems('women');
  assert.equal(items.length, 2, 'Default women outfit has 2 pieces (top, bottom)');

  const top = items.find(i => i.slot === 'top');
  assert.ok(top);
  assert.equal(top.product.name, "Pure Mongolian Camel Cashmere Knit");
  assert.equal(top.product.price, 14200);

  const bottom = items.find(i => i.slot === 'bottom');
  assert.ok(bottom);
  assert.equal(bottom.product.name, "Camel Pleated Wide-Leg Palazzo Trouser");
  assert.equal(bottom.product.price, 11500);
});

test('F14: Look Builder - color swatch badge displayed for each piece', () => {
  const ctx = createTestContext();
  const items = ctx.getEquippedItems('women');
  for (const item of items) {
    const activeColor = item.product.colors[item.variant]?.hex || item.product.color;
    assert.ok(activeColor, 'Item has active color');
    assert.ok(activeColor.startsWith('#'), 'Active color is valid hex');
  }
});

test('F14: Look Builder - removing single piece via tile button', () => {
  const ctx = createTestContext();
  const top = PRODUCTS.find(p => p.id === 'forme-02');
  assert.ok(ctx.state.outfits.women.top);

  // Unequip top
  ctx.toggleEquip(top);
  assert.equal(ctx.state.outfits.women.top, undefined, 'Top is removed from look');
  assert.ok(ctx.state.outfits.women.bottom, 'Bottom remains');
});

test('F14: Look Builder - Clear Look button clears active silhouette', () => {
  const ctx = createTestContext();
  assert.ok(ctx.getEquippedItems('women').length > 0);

  ctx.clearOutfit('women');
  assert.equal(ctx.getEquippedItems('women').length, 0, 'Outfit is cleared');
});

test('F14: Look Builder - Reset to Signature Look restores default ensemble', () => {
  const ctx = createTestContext();
  ctx.clearOutfit('women');
  assert.equal(ctx.getEquippedItems('women').length, 0);

  ctx.resetOutfit('women');
  assert.equal(ctx.state.outfits.women.top?.id, 'forme-02');
  assert.equal(ctx.state.outfits.women.bottom?.id, 'forme-03');
});
