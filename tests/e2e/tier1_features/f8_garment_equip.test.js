import test from 'node:test';
import assert from 'node:assert/strict';
import { createTestContext } from '../helpers/testContext.js';
import { PRODUCTS } from '../../../src/data/products.js';

test('F8: Garment Equip - clicking unequipped item equips it', () => {
  const ctx = createTestContext();
  ctx.clearOutfit('women');

  const top = PRODUCTS.find(p => p.id === 'forme-02');
  ctx.toggleEquip(top, 0);

  assert.equal(ctx.state.outfits.women.top?.id, 'forme-02', 'Top should be equipped');
  assert.equal(ctx.state.outfits.women.top?.variant, 0, 'Variant index should be 0');
});

test('F8: Garment Equip - clicking equipped item unequips it', () => {
  const ctx = createTestContext();
  const top = PRODUCTS.find(p => p.id === 'forme-02');

  // Currently equipped in default outfit
  assert.equal(ctx.state.outfits.women.top?.id, 'forme-02');

  // Click again to unequip
  ctx.toggleEquip(top, 0);
  assert.equal(ctx.state.outfits.women.top, undefined, 'Top should be unequipped');
});

test('F8: Garment Equip - equipping bottom retains equipped top', () => {
  const ctx = createTestContext();
  ctx.clearOutfit('women');

  const top = PRODUCTS.find(p => p.id === 'forme-02');
  const bottom = PRODUCTS.find(p => p.id === 'forme-03');

  ctx.toggleEquip(top, 0);
  ctx.toggleEquip(bottom, 0);

  assert.equal(ctx.state.outfits.women.top?.id, 'forme-02', 'Top remains equipped');
  assert.equal(ctx.state.outfits.women.bottom?.id, 'forme-03', 'Bottom is equipped');
});

test('F8: Garment Equip - equipping slot replaces previous item in same slot', () => {
  const ctx = createTestContext();
  ctx.clearOutfit('women');

  const top1 = PRODUCTS.find(p => p.id === 'forme-02');
  const top2 = PRODUCTS.find(p => p.id === 'forme-05');

  ctx.toggleEquip(top1, 0);
  assert.equal(ctx.state.outfits.women.top?.id, 'forme-02');

  ctx.toggleEquip(top2, 0);
  assert.equal(ctx.state.outfits.women.top?.id, 'forme-05', 'Top should be replaced with new item');
});

test('F8: Garment Equip - color swatch click updates variant without unequipping', () => {
  const ctx = createTestContext();
  ctx.clearOutfit('women');
  const top = PRODUCTS.find(p => p.id === 'forme-02');

  // Initial equip variant 0
  ctx.toggleEquip(top, 0);
  assert.equal(ctx.state.outfits.women.top?.variant, 0);

  // User clicks color swatch variant 1 (forceRecolor or new variant)
  ctx.toggleEquip(top, 1, true);
  assert.equal(ctx.state.outfits.women.top?.id, 'forme-02', 'Item remains equipped');
  assert.equal(ctx.state.outfits.women.top?.variant, 1, 'Variant is updated to 1');
});

test('F8: Garment Equip - clearOutfit clears all pieces for demographic', () => {
  const ctx = createTestContext();
  assert.ok(Object.keys(ctx.state.outfits.women).length > 0, 'Women outfit initially has items');

  ctx.clearOutfit('women');
  assert.deepEqual(ctx.state.outfits.women, {}, 'Women outfit should be completely empty');
});
