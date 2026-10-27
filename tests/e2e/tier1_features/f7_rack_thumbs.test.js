import test from 'node:test';
import assert from 'node:assert/strict';
import * as FormeEngine from '../../../src/engine/formeEngine.js';
import { PRODUCTS } from '../../../src/data/products.js';

test('F7: Try-On Rack - top thumbnail SVG with correct viewBox', () => {
  const topProduct = PRODUCTS.find(p => p.slot === 'top');
  assert.ok(topProduct, 'Top product should exist');

  const thumbSvg = FormeEngine.thumb(topProduct, 0);
  assert.ok(thumbSvg.startsWith('<svg'), 'Thumbnail must be an SVG element');
  assert.ok(thumbSvg.includes('viewBox="90 115 220 210"'), 'Top thumbnail must have viewBox="90 115 220 210"');
  assert.ok(thumbSvg.includes('aria-hidden="true"'), 'Thumbnail should have aria-hidden="true"');
});

test('F7: Try-On Rack - bottom thumbnail SVG with correct viewBox', () => {
  const bottomProduct = PRODUCTS.find(p => p.slot === 'bottom' && p.style !== 'shorts');
  assert.ok(bottomProduct, 'Bottom product should exist');

  const thumbSvg = FormeEngine.thumb(bottomProduct, 0);
  assert.ok(thumbSvg.includes('viewBox="120 270 160 345"'), 'Bottom trouser thumbnail must have viewBox="120 270 160 345"');
});

test('F7: Try-On Rack - outer coat/blazer thumbnail SVG with correct viewBox', () => {
  const coatProduct = PRODUCTS.find(p => p.slot === 'outer' && p.style === 'coat');
  assert.ok(coatProduct, 'Coat product should exist');
  const coatSvg = FormeEngine.thumb(coatProduct, 0);
  assert.ok(coatSvg.includes('viewBox="80 110 240 370"'), 'Coat thumbnail must have viewBox="80 110 240 370"');

  const blazerProduct = PRODUCTS.find(p => p.slot === 'outer' && p.style === 'blazer');
  assert.ok(blazerProduct, 'Blazer product should exist');
  const blazerSvg = FormeEngine.thumb(blazerProduct, 0);
  assert.ok(blazerSvg.includes('viewBox="80 110 240 270"'), 'Blazer thumbnail must have viewBox="80 110 240 270"');
});

test('F7: Try-On Rack - dress and shorts thumbnail viewBox', () => {
  const dressProduct = PRODUCTS.find(p => p.slot === 'dress');
  assert.ok(dressProduct, 'Dress product should exist');
  const dressSvg = FormeEngine.thumb(dressProduct, 0);
  assert.ok(dressSvg.includes('viewBox="110 120 180 415"'), 'Dress thumbnail must have viewBox="110 120 180 415"');

  const shortsProduct = PRODUCTS.find(p => p.style === 'shorts');
  assert.ok(shortsProduct, 'Shorts product should exist');
  const shortsSvg = FormeEngine.thumb(shortsProduct, 0);
  assert.ok(shortsSvg.includes('viewBox="125 270 150 160"'), 'Shorts thumbnail must have viewBox="125 270 150 160"');
});

test('F7: Try-On Rack - color swatches array validity', () => {
  for (const product of PRODUCTS) {
    assert.ok(Array.isArray(product.colors), `${product.id} must have colors array`);
    assert.ok(product.colors.length >= 1 && product.colors.length <= 12, `${product.id} must have 1-12 colors`);
    for (const color of product.colors) {
      assert.ok(FormeEngine.hex(color.hex), `${product.id} color ${color.name} must have valid hex`);
    }
  }
});

test('F7: Try-On Rack - thumbnail uses selected variant color', () => {
  const coat = PRODUCTS.find(p => p.id === 'forme-01');
  assert.ok(coat && coat.colors.length > 1);

  // Variant 0: Olive Green #364634
  const svg0 = FormeEngine.thumb(coat, 0);
  assert.ok(svg0.includes('#364634'), 'Variant 0 thumbnail must render #364634');

  // Variant 1: Desert Camel #C69F6F
  const svg1 = FormeEngine.thumb(coat, 1);
  assert.ok(svg1.includes('#c69f6f') || svg1.includes('#C69F6F'), 'Variant 1 thumbnail must render #C69F6F');
});
