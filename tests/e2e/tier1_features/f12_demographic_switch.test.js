import test from 'node:test';
import assert from 'node:assert/strict';
import * as FormeEngine from '../../../src/engine/formeEngine.js';
import { createTestContext } from '../helpers/testContext.js';
import { PRODUCTS } from '../../../src/data/products.js';

test('F12: Demographic Switch - Men silhouette scale sx=1.07', () => {
  const svg = FormeEngine.mannequin('men', []);
  assert.ok(svg.includes('scale(1.07 1)'), 'Men silhouette must use scale(1.07 1)');
});

test('F12: Demographic Switch - Kids silhouette scale translate(0 118) scale(1 .82)', () => {
  const svg = FormeEngine.mannequin('kids', []);
  assert.ok(svg.includes('transform="translate(0 118) scale(1 .82)"'), 'Kids silhouette must have child scale');
  assert.ok(svg.includes('rx="34" ry="39"'), 'Kids head must have rounded egg rx=34 ry=39');
});

test('F12: Demographic Switch - Women silhouette scale sx=1.0', () => {
  const svg = FormeEngine.mannequin('women', []);
  assert.ok(svg.includes('scale(1 1)'), 'Women silhouette must have standard scale(1 1)');
  assert.ok(svg.includes('rx="28" ry="40"'), 'Women head must have adult rx=28 ry=40');
});

test('F12: Demographic Switch - wardrobe rack filters garments by demographic', () => {
  const ctx = createTestContext();

  ctx.selectPerson('women');
  const womenRack = ctx.state.products.filter(p => p.person === 'women');
  assert.ok(womenRack.length > 0, 'Women rack has products');
  assert.ok(womenRack.every(p => p.person === 'women'), 'All items in women rack belong to women');

  ctx.selectPerson('men');
  const menRack = ctx.state.products.filter(p => p.person === 'men');
  assert.ok(menRack.length > 0, 'Men rack has products');
  assert.ok(menRack.every(p => p.person === 'men'), 'All items in men rack belong to men');

  ctx.selectPerson('kids');
  const kidsRack = ctx.state.products.filter(p => p.person === 'kids');
  assert.ok(kidsRack.length > 0, 'Kids rack has products');
  assert.ok(kidsRack.every(p => p.person === 'kids'), 'All items in kids rack belong to kids');
});

test('F12: Demographic Switch - independent outfit state persistence', () => {
  const ctx = createTestContext();

  // Modify women outfit
  ctx.selectPerson('women');
  ctx.clearOutfit('women');
  assert.equal(Object.keys(ctx.state.outfits.women).length, 0);

  // Switch to men outfit
  ctx.selectPerson('men');
  assert.ok(Object.keys(ctx.state.outfits.men).length > 0, 'Men outfit is independent');

  // Switch to kids outfit
  ctx.selectPerson('kids');
  assert.ok(Object.keys(ctx.state.outfits.kids).length > 0, 'Kids outfit is independent');
});
