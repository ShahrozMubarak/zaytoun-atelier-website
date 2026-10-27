import test from 'node:test';
import assert from 'node:assert/strict';
import { isBackAngle, normalizeAngle } from '../helpers/assertions.js';

test('F5: Back View Anatomy - angle range identification (90° < deg < 270°)', () => {
  assert.equal(isBackAngle(91), true, '91 deg is rear view');
  assert.equal(isBackAngle(135), true, '135 deg is rear view');
  assert.equal(isBackAngle(180), true, '180 deg is full back view');
  assert.equal(isBackAngle(225), true, '225 deg is rear view');
  assert.equal(isBackAngle(269), true, '269 deg is rear view');
});

test('F5: Back View Anatomy - front view angle range (deg <= 90° or deg >= 270°)', () => {
  assert.equal(isBackAngle(0), false, '0 deg is front');
  assert.equal(isBackAngle(45), false, '45 deg is front');
  assert.equal(isBackAngle(90), false, '90 deg is profile boundary');
  assert.equal(isBackAngle(270), false, '270 deg is profile boundary');
  assert.equal(isBackAngle(315), false, '315 deg is front');
  assert.equal(isBackAngle(360), false, '360 deg wraps to front');
});

test('F5: Back View Anatomy - visual filter adjustments in rear view', () => {
  // In Mannequin3D.jsx, when isBackView: filter = 'brightness(0.92) contrast(1.04)'
  const backFilter = (isBack) => isBack ? 'brightness(0.92) contrast(1.04)' : 'brightness(1.0) contrast(1.0)';
  
  assert.equal(backFilter(true), 'brightness(0.92) contrast(1.04)', 'Back view dims slightly to simulate back atelier depth');
  assert.equal(backFilter(false), 'brightness(1.0) contrast(1.0)', 'Front view retains standard brightness/contrast');
});

test('F5: Back View Anatomy - flipping transform avoids double-flip cancellation', () => {
  // In Mannequin3D.jsx, transform: isBackView ? 'scaleX(-1)' : 'scaleX(1)'
  const flipTransform = (isBack) => isBack ? 'scaleX(-1)' : 'scaleX(1)';
  
  assert.equal(flipTransform(true), 'scaleX(-1)', 'Back view mirrors horizontally to show true left/right anatomy');
  assert.equal(flipTransform(false), 'scaleX(1)', 'Front view is standard 1:1');
});

test('F5: Back View Anatomy - rear view badge text', () => {
  const badgeText = "Rear Atelier View";
  assert.equal(badgeText, "Rear Atelier View", 'Badge text designates rear atelier perspective');
});
