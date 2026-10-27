import test from 'node:test';
import assert from 'node:assert/strict';
import * as FormeEngine from '../../../src/engine/formeEngine.js';
import { createTestContext } from '../helpers/testContext.js';
import { PRODUCTS } from '../../../src/data/products.js';

test('F15: PKR Pricing - empty outfit price is 0 PKR', () => {
  const ctx = createTestContext();
  ctx.clearOutfit('women');
  assert.equal(ctx.getEnsembleTotal('women'), 0, 'Empty outfit costs 0');
});

test('F15: PKR Pricing - single piece computes exact item price', () => {
  const ctx = createTestContext();
  ctx.clearOutfit('women');
  const dress = PRODUCTS.find(p => p.id === 'forme-04'); // 15900
  ctx.toggleEquip(dress, 0);

  assert.equal(ctx.getEnsembleTotal('women'), 15900, 'Single dress costs 15900 PKR');
});

test('F15: PKR Pricing - multi-piece ensemble computes accurate sum', () => {
  const ctx = createTestContext();
  ctx.clearOutfit('women');

  const top = PRODUCTS.find(p => p.id === 'forme-02'); // 14200
  const bottom = PRODUCTS.find(p => p.id === 'forme-03'); // 11500
  const outer = PRODUCTS.find(p => p.id === 'forme-01'); // 18500

  ctx.toggleEquip(top, 0);
  ctx.toggleEquip(bottom, 0);
  ctx.toggleEquip(outer, 0);

  const expectedTotal = 14200 + 11500 + 18500; // 44200
  assert.equal(ctx.getEnsembleTotal('women'), expectedTotal, 'Sum matches 44200 PKR');
});

test('F15: PKR Pricing - replacing garment immediately updates total', () => {
  const ctx = createTestContext();
  ctx.clearOutfit('women');
  const top1 = PRODUCTS.find(p => p.id === 'forme-02'); // 14200
  const top2 = PRODUCTS.find(p => p.id === 'forme-05'); // 12800

  ctx.toggleEquip(top1, 0);
  assert.equal(ctx.getEnsembleTotal('women'), 14200);

  // Replace with top2
  ctx.toggleEquip(top2, 0);
  assert.equal(ctx.getEnsembleTotal('women'), 12800, 'Price updates to new top');
});

test('F15: PKR Pricing - money formatting currency helper', () => {
  const formatted = FormeEngine.money(33300);
  assert.ok(formatted.startsWith('Rs.'), 'Formatted string has Rs. prefix');
  assert.ok(formatted.includes('33,300'), 'Formatted string includes thousands separator');
});

test('F15: PKR Pricing - unequipping deducts price from total', () => {
  const ctx = createTestContext();
  const initialTotal = ctx.getEnsembleTotal('women'); // 14200 + 11500 = 25700
  assert.equal(initialTotal, 25700);

  const bottom = PRODUCTS.find(p => p.id === 'forme-03'); // 11500
  ctx.toggleEquip(bottom, 0); // Unequip bottom

  assert.equal(ctx.getEnsembleTotal('women'), 14200, 'Deducts 11500 PKR from total');
});
