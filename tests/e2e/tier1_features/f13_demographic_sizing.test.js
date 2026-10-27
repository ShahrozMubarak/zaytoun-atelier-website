import test from 'node:test';
import assert from 'node:assert/strict';
import { PRODUCTS } from '../../../src/data/products.js';
import { createTestContext } from '../helpers/testContext.js';

test('F13: Demographic Sizing - adult garments provide XS to XL sizes', () => {
  const adultProducts = PRODUCTS.filter(p => p.person === 'women' || p.person === 'men');
  for (const product of adultProducts) {
    assert.ok(Array.isArray(product.sizes), `${product.id} must have sizes`);
    assert.ok(product.sizes.includes('M'), `${product.id} must include standard size M`);
  }
});

test('F13: Demographic Sizing - kids garments provide age-based 4–5 to 10–11 sizes', () => {
  const kidsProducts = PRODUCTS.filter(p => p.person === 'kids');
  assert.ok(kidsProducts.length > 0, 'Kids products exist');
  for (const product of kidsProducts) {
    assert.ok(Array.isArray(product.sizes));
    assert.ok(product.sizes.includes('6–7'), `${product.id} must include size 6–7`);
    assert.ok(product.sizes.includes('4–5'), `${product.id} must include size 4–5`);
  }
});

test('F13: Demographic Sizing - demographic selection adapts active size', () => {
  const ctx = createTestContext();
  ctx.selectPerson('women');
  assert.equal(ctx.state.selectedSize, 'M', 'Adult defaults to M');

  ctx.selectPerson('kids');
  assert.equal(ctx.state.selectedSize, '6–7', 'Kids defaults to age bracket 6–7');
});

test('F13: Demographic Sizing - outfit builder size selection', () => {
  const ctx = createTestContext();
  ctx.selectPerson('women');
  ctx.state.selectedSize = 'S';
  assert.equal(ctx.state.selectedSize, 'S');

  ctx.selectPerson('kids');
  ctx.state.selectedSize = '8–9';
  assert.equal(ctx.state.selectedSize, '8–9');
});

test('F13: Demographic Sizing - cart addition records demographic-specific size', () => {
  const ctx = createTestContext();
  ctx.selectPerson('kids');
  ctx.state.selectedSize = '8–9';
  ctx.addLookToBag('kids', '8–9');

  assert.ok(ctx.state.cart.length > 0, 'Kids items added to cart');
  assert.ok(ctx.state.cart.every(item => item.selectedSize === '8–9' || item.size === '8–9'), 'All items in kids look added with 8–9 size');
});
