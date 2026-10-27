import test from 'node:test';
import assert from 'node:assert/strict';
import * as FormeEngine from '../../../src/engine/formeEngine.js';
import { assertFormeAesthetics } from '../helpers/assertions.js';
import { PRODUCTS } from '../../../src/data/products.js';

test('F1: FORME Aesthetic Model - root SVG viewBox and aria-label', () => {
  const svg = FormeEngine.mannequin('women', []);
  assert.ok(svg.startsWith('<svg'), 'Markup must start with <svg tag');
  assert.ok(svg.includes('viewBox="0 0 400 700"'), 'SVG must define viewBox="0 0 400 700"');
  assert.ok(svg.includes('aria-label="women mannequin outfit preview"'), 'SVG must include accessibility aria-label');
  assert.ok(svg.endsWith('</svg>'), 'Markup must terminate with </svg>');
});

test('F1: FORME Aesthetic Model - gradient definitions in <defs>', () => {
  const svg = FormeEngine.mannequin('women', []);
  assert.ok(svg.includes('<defs>'), 'SVG must include <defs> section');
  assert.ok(svg.includes('<linearGradient id="body-'), 'SVG must define linearGradient for linen body');
  assert.ok(svg.includes('#aaa693'), 'Body gradient must contain linen stop #aaa693');
  assert.ok(svg.includes('#f0ecde'), 'Body gradient must contain linen highlight #f0ecde');
  assert.ok(svg.includes('<radialGradient id="body-') && svg.includes('-head"'), 'Head must have radial gradient');
  assert.ok(svg.includes('<radialGradient id="body-') && svg.includes('-shadow"'), 'Shadow must have radial gradient');
});

test('F1: FORME Aesthetic Model - signature egg head proportions', () => {
  const svgWomen = FormeEngine.mannequin('women', []);
  assert.ok(svgWomen.includes('<ellipse cx="200" cy="76" rx="28" ry="40"'), 'Adult mannequin must have egg head rx=28 ry=40 centered at cx=200 cy=76');
  assert.ok(svgWomen.includes('M178 102Q199 117 220 101'), 'Head must include jawline chin curve');

  const svgKids = FormeEngine.mannequin('kids', []);
  assert.ok(svgKids.includes('rx="34" ry="39"'), 'Kids mannequin must have rounder egg head rx=34 ry=39');
});

test('F1: FORME Aesthetic Model - unified platform pedestal base', () => {
  const svg = FormeEngine.mannequin('women', []);
  assert.ok(svg.includes('<ellipse cx="200" cy="658" rx="105" ry="17"'), 'Base must render ground shadow ellipse at cy=658');
  assert.ok(svg.includes('<ellipse cx="200" cy="647" rx="72" ry="11"'), 'Base must render lower pedestal platform ellipse at cy=647');
  assert.ok(svg.includes('M128 638V647Q200 670 272 647V638Z'), 'Base must render cylinder side wall path');
  assert.ok(svg.includes('<ellipse cx="200" cy="638" rx="72" ry="11"'), 'Base must render top pedestal disk at cy=638');
});

test('F1: FORME Aesthetic Model - crisp lines and vector body paths', () => {
  const svg = FormeEngine.mannequin('women', []);
  assert.ok(svg.includes('stroke="#a9a591"'), 'Mannequin contours must use crisp stroke #a9a591');
  assert.ok(svg.includes('stroke-width=".8"'), 'Mannequin contours must use fine stroke-width .8');
  // Left arm, right arm, legs, torso paths
  assert.ok(svg.includes('M150 142Q133 141 130 168L116 246'), 'Left arm contour path must exist');
  assert.ok(svg.includes('M250 142Q267 141 270 168L284 246'), 'Right arm contour path must exist');
  assert.ok(svg.includes('M159 284Q145 316 156 383'), 'Legs and hips contour path must exist');
  assert.ok(svg.includes('M185 101L184 121Q181 129 151 139'), 'Torso and neck contour path must exist');
});

test('F1: FORME Aesthetic Model - empty model renders clean linen body', () => {
  const svg = FormeEngine.mannequin('women', []);
  assertFormeAesthetics(svg, 'women');
  assert.ok(!svg.includes('id="garment-'), 'Empty mannequin should not contain garment defs');
});
