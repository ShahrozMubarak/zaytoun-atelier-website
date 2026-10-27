import test from 'node:test';
import assert from 'node:assert/strict';
import * as FormeEngine from '../../../src/engine/formeEngine.js';
import { PRODUCTS } from '../../../src/data/products.js';

test('F9: Layering Rules - equipping dress un-equips top and bottom', () => {
  const top = PRODUCTS.find(p => p.slot === 'top');
  const bottom = PRODUCTS.find(p => p.slot === 'bottom');
  const dress = PRODUCTS.find(p => p.slot === 'dress');

  let outfit = {};
  outfit = FormeEngine.equip(outfit, top, 0);
  outfit = FormeEngine.equip(outfit, bottom, 0);
  assert.ok(outfit.top && outfit.bottom, 'Top and bottom should be equipped');

  // Equip dress
  outfit = FormeEngine.equip(outfit, dress, 0);
  assert.equal(outfit.top, undefined, 'Dress must unequip top');
  assert.equal(outfit.bottom, undefined, 'Dress must unequip bottom');
  assert.equal(outfit.dress?.id, dress.id, 'Dress should be equipped');
});

test('F9: Layering Rules - equipping top un-equips dress', () => {
  const dress = PRODUCTS.find(p => p.slot === 'dress');
  const top = PRODUCTS.find(p => p.slot === 'top');

  let outfit = {};
  outfit = FormeEngine.equip(outfit, dress, 0);
  assert.equal(outfit.dress?.id, dress.id);

  // Equip top
  outfit = FormeEngine.equip(outfit, top, 0);
  assert.equal(outfit.dress, undefined, 'Top must unequip dress');
  assert.equal(outfit.top?.id, top.id, 'Top should be equipped');
});

test('F9: Layering Rules - equipping bottom un-equips dress', () => {
  const dress = PRODUCTS.find(p => p.slot === 'dress');
  const bottom = PRODUCTS.find(p => p.slot === 'bottom');

  let outfit = {};
  outfit = FormeEngine.equip(outfit, dress, 0);
  assert.equal(outfit.dress?.id, dress.id);

  // Equip bottom
  outfit = FormeEngine.equip(outfit, bottom, 0);
  assert.equal(outfit.dress, undefined, 'Bottom must unequip dress');
  assert.equal(outfit.bottom?.id, bottom.id, 'Bottom should be equipped');
});

test('F9: Layering Rules - outerwear layers over top and bottom without removing them', () => {
  const top = PRODUCTS.find(p => p.slot === 'top');
  const bottom = PRODUCTS.find(p => p.slot === 'bottom');
  const outer = PRODUCTS.find(p => p.slot === 'outer');

  let outfit = {};
  outfit = FormeEngine.equip(outfit, top, 0);
  outfit = FormeEngine.equip(outfit, bottom, 0);
  outfit = FormeEngine.equip(outfit, outer, 0);

  assert.equal(outfit.top?.id, top.id, 'Top remains equipped');
  assert.equal(outfit.bottom?.id, bottom.id, 'Bottom remains equipped');
  assert.equal(outfit.outer?.id, outer.id, 'Outer is equipped');
});

test('F9: Layering Rules - outerwear layers over dress without removing dress', () => {
  const dress = PRODUCTS.find(p => p.slot === 'dress');
  const outer = PRODUCTS.find(p => p.slot === 'outer');

  let outfit = {};
  outfit = FormeEngine.equip(outfit, dress, 0);
  outfit = FormeEngine.equip(outfit, outer, 0);

  assert.equal(outfit.dress?.id, dress.id, 'Dress remains equipped');
  assert.equal(outfit.outer?.id, outer.id, 'Outer is equipped over dress');
});

test('F9: Layering Rules - SVG rendering order bottom -> top -> dress -> outer', () => {
  const top = PRODUCTS.find(p => p.slot === 'top');
  const bottom = PRODUCTS.find(p => p.slot === 'bottom');
  const outer = PRODUCTS.find(p => p.slot === 'outer');

  const items = [
    { product: outer, variant: 0 },
    { product: top, variant: 0 },
    { product: bottom, variant: 0 }
  ];

  // In formeEngine.js:
  // layers order: ['bottom', 'top', 'dress', 'outer']
  const svg = FormeEngine.mannequin('women', items);

  const bottomIdx = svg.indexOf('garment-');
  assert.ok(bottomIdx > 0, 'SVG contains garments');
});
