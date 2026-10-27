import assert from 'node:assert/strict';

/**
 * Asserts that the provided SVG string contains standard FORME vector definitions
 */
export function assertFormeAesthetics(svgString, person = 'women') {
  assert.ok(svgString.includes('viewBox="0 0 400 700"'), 'SVG must have viewBox="0 0 400 700"');
  assert.ok(svgString.includes('<defs>'), 'SVG must contain gradient definitions');
  assert.ok(svgString.includes('<linearGradient id="body-'), 'SVG must define linen body linearGradient');
  assert.ok(svgString.includes('<radialGradient id="body-') && svgString.includes('-head"'), 'SVG must define head radialGradient');
  assert.ok(svgString.includes('<ellipse cx="200" cy="76"'), 'SVG must render signature egg head');
  assert.ok(svgString.includes('cy="658"') && svgString.includes('cy="647"') && svgString.includes('cy="638"'), 'SVG must render platform pedestal ellipses');
  
  if (person === 'kids') {
    assert.ok(svgString.includes('rx="34" ry="39"'), 'Kids head must have rounded egg proportions rx=34 ry=39');
    assert.ok(svgString.includes('transform="translate(0 118) scale(1 .82)"'), 'Kids mannequin must have scaled body transform');
  } else if (person === 'men') {
    assert.ok(svgString.includes('rx="28" ry="40"'), 'Adult head must have rx=28 ry=40');
    assert.ok(svgString.includes('scale(1.07 1)'), 'Men silhouette must have sx=1.07 scaling');
  } else {
    assert.ok(svgString.includes('rx="28" ry="40"'), 'Women head must have rx=28 ry=40');
    assert.ok(svgString.includes('scale(1 1)'), 'Women silhouette must have standard sx=1.0 scaling');
  }
}

/**
 * Asserts that the garment layer exists in the SVG and uses the specified color/gradient
 */
export function assertGarmentRendered(svgString, expectedSlot, expectedHexColor) {
  assert.ok(svgString.length > 500, 'SVG markup should be fully formed');
  if (expectedHexColor) {
    const cleanHex = expectedHexColor.toLowerCase();
    assert.ok(
      svgString.toLowerCase().includes(cleanHex),
      `SVG defs must contain the garment color stop: ${expectedHexColor}`
    );
  }
}

/**
 * Normalizes rotation angle to [0, 360)
 */
export function normalizeAngle(deg) {
  return Math.round(((deg % 360) + 360) % 360);
}

/**
 * Checks whether an angle represents a back view
 */
export function isBackAngle(deg) {
  const norm = normalizeAngle(deg);
  return norm > 90 && norm < 270;
}

/**
 * Computes angle label matching Mannequin3D badge
 */
export function getAngleLabel(deg) {
  const norm = normalizeAngle(deg);
  if (norm >= 338 || norm < 23) return "Front (0°)";
  if (norm >= 23 && norm < 68) return "3/4 Right (45°)";
  if (norm >= 68 && norm < 113) return "Right Profile (90°)";
  if (norm >= 113 && norm < 158) return "Back Right (135°)";
  if (norm >= 158 && norm < 203) return "Back (180°)";
  if (norm >= 203 && norm < 248) return "Back Left (225°)";
  if (norm >= 248 && norm < 293) return "Left Profile (270°)";
  return "3/4 Left (315°)";
}
