import test from 'node:test';
import assert from 'node:assert/strict';
import { createTestContext } from '../helpers/testContext.js';
import { PRODUCTS } from '../../../src/data/products.js';

test('F16: Add Look to Bag - transfers all equipped pieces to cart', () => {
  const ctx = createTestContext();
  assert.equal(ctx.state.cart.length, 0, 'Cart initially empty');

  ctx.addLookToBag('women', 'M');

  assert.equal(ctx.state.cart.length, 2, 'Two equipped items transferred to cart');
  assert.ok(ctx.state.cart.some(item => item.id === 'forme-02'));
  assert.ok(ctx.state.cart.some(item => item.id === 'forme-03'));
});

test('F16: Add Look to Bag - preserves item attributes and selected size', () => {
  const ctx = createTestContext();
  ctx.addLookToBag('women', 'S');

  const item = ctx.state.cart.find(i => i.id === 'forme-02');
  assert.ok(item);
  assert.equal(item.name, "Pure Mongolian Camel Cashmere Knit");
  assert.equal(item.price, 14200);
  assert.equal(item.selectedSize, 'S');
  assert.equal(item.quantity, 1);
  assert.ok(item.images && item.images.length > 0);
});

test('F16: Add Look to Bag - duplicate add increments quantity', () => {
  const ctx = createTestContext();
  ctx.addLookToBag('women', 'M');
  assert.equal(ctx.state.cart[0].quantity, 1);

  // Add same look again in same size
  ctx.addLookToBag('women', 'M');
  assert.equal(ctx.state.cart.length, 2, 'No duplicate line items');
  assert.equal(ctx.state.cart[0].quantity, 2, 'Quantity incremented to 2');
  assert.equal(ctx.state.cart[1].quantity, 2, 'Quantity incremented to 2');
});

test('F16: Add Look to Bag - triggers cart drawer opening', () => {
  const ctx = createTestContext();
  assert.equal(ctx.state.isCartOpen, false);

  ctx.addLookToBag('women', 'M');
  assert.equal(ctx.state.isCartOpen, true, 'isCartOpen should be set to true');
});

test('F16: Add Look to Bag - empty outfit does not alter cart', () => {
  const ctx = createTestContext();
  ctx.clearOutfit('women');

  ctx.addLookToBag('women', 'M');
  assert.equal(ctx.state.cart.length, 0, 'Cart remains empty when adding empty look');
});

test('F16: Add Look to Bag - different size creates distinct line item', () => {
  const ctx = createTestContext();
  ctx.addLookToBag('women', 'M');
  assert.equal(ctx.state.cart.length, 2);

  // Add in size L
  ctx.addLookToBag('women', 'L');
  assert.equal(ctx.state.cart.length, 4, 'Distinct size creates separate line items');
  const sizeM = ctx.state.cart.filter(i => i.selectedSize === 'M');
  const sizeL = ctx.state.cart.filter(i => i.selectedSize === 'L');
  assert.equal(sizeM.length, 2);
  assert.equal(sizeL.length, 2);
});
