// Geometry utilities for the infinite canvas.
//
// All widgets are stored in "unrotated local space": x, y, width, height describe
// the axis-aligned box before rotation is applied, and `rotation` (degrees) spins
// the box around its own center for rendering (via CSS transform). These helpers
// convert between that stored representation and world-space math so drag, resize
// and rotate interactions feel correct even when a widget is spun off-axis.

export const DEG2RAD = Math.PI / 180;
export const RAD2DEG = 180 / Math.PI;

export function getCenter(box) {
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

export function rotateVector(x, y, angleDeg) {
  const rad = angleDeg * DEG2RAD;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return { x: x * cos - y * sin, y: x * sin + y * cos };
}

export function toLocalFrame(point, center, angleDeg) {
  const rad = -angleDeg * DEG2RAD;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  return { x: dx * cos - dy * sin, y: dx * sin + dy * cos };
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function snap(value, gridSize) {
  if (!gridSize) return value;
  return Math.round(value / gridSize) * gridSize;
}

export function computeResize(originalBox, handle, mouseWorld, options = {}) {
  const { minWidth = 24, minHeight = 24, lockAspect = false, gridSize = 0 } = options;
  const { hx, hy } = handle;
  const center = getCenter(originalBox);
  const rotation = originalBox.rotation || 0;

  const localMouse = toLocalFrame(mouseWorld, center, rotation);
  const anchorLocal = { x: -hx * (originalBox.width / 2), y: -hy * (originalBox.height / 2) };

  let newWidth = originalBox.width;
  let newHeight = originalBox.height;
  let centerOffsetX = 0;
  let centerOffsetY = 0;

  if (hx === 1) {
    newWidth = Math.max(minWidth, localMouse.x - anchorLocal.x);
    centerOffsetX = anchorLocal.x + newWidth / 2;
  } else if (hx === -1) {
    newWidth = Math.max(minWidth, anchorLocal.x - localMouse.x);
    centerOffsetX = anchorLocal.x - newWidth / 2;
  }

  if (hy === 1) {
    newHeight = Math.max(minHeight, localMouse.y - anchorLocal.y);
    centerOffsetY = anchorLocal.y + newHeight / 2;
  } else if (hy === -1) {
    newHeight = Math.max(minHeight, anchorLocal.y - localMouse.y);
    centerOffsetY = anchorLocal.y - newHeight / 2;
  }

  if (lockAspect && hx !== 0 && hy !== 0) {
    const ratio = originalBox.width / originalBox.height;
    if (newWidth / newHeight > ratio) {
      newWidth = newHeight * ratio;
    } else {
      newHeight = newWidth / ratio;
    }
    centerOffsetX = hx * (newWidth / 2 - originalBox.width / 2) * 0 + (hx === 1 ? anchorLocal.x + newWidth / 2 : anchorLocal.x - newWidth / 2);
    centerOffsetY = hy === 1 ? anchorLocal.y + newHeight / 2 : anchorLocal.y - newHeight / 2;
  }

  const worldOffset = rotateVector(centerOffsetX, centerOffsetY, rotation);
  const newCenter = { x: center.x + worldOffset.x, y: center.y + worldOffset.y };

  let newX = newCenter.x - newWidth / 2;
  let newY = newCenter.y - newHeight / 2;

  if (gridSize && rotation === 0) {
    newX = snap(newX, gridSize);
    newY = snap(newY, gridSize);
    newWidth = Math.max(minWidth, snap(newWidth, gridSize));
    newHeight = Math.max(minHeight, snap(newHeight, gridSize));
  }

  return { x: newX, y: newY, width: newWidth, height: newHeight };
}

export function computeRotation(originalBox, mouseWorld) {
  const center = getCenter(originalBox);
  const dx = mouseWorld.x - center.x;
  const dy = mouseWorld.y - center.y;
  let deg = Math.atan2(dy, dx) * RAD2DEG + 90;
  deg = deg % 360;
  if (deg < 0) deg += 360;
  return deg;
}

export function snapRotation(deg, incrementDeg = 15, thresholdDeg = 4) {
  const nearest = Math.round(deg / incrementDeg) * incrementDeg;
  return Math.abs(nearest - deg) <= thresholdDeg ? nearest % 360 : deg;
}

export function getRotatedBounds(box) {
  const rotation = box.rotation || 0;
  if (!rotation) return { ...box };
  const center = getCenter(box);
  const corners = [
    { x: box.x, y: box.y },
    { x: box.x + box.width, y: box.y },
    { x: box.x + box.width, y: box.y + box.height },
    { x: box.x, y: box.y + box.height },
  ].map((p) => {
    const local = { x: p.x - center.x, y: p.y - center.y };
    const rotated = rotateVector(local.x, local.y, rotation);
    return { x: center.x + rotated.x, y: center.y + rotated.y };
  });
  const xs = corners.map((c) => c.x);
  const ys = corners.map((c) => c.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  return { x: minX, y: minY, width: Math.max(...xs) - minX, height: Math.max(...ys) - minY };
}

export function unionBounds(boxes) {
  if (!boxes.length) return { x: 0, y: 0, width: 0, height: 0 };
  const rects = boxes.map(getRotatedBounds);
  const minX = Math.min(...rects.map((r) => r.x));
  const minY = Math.min(...rects.map((r) => r.y));
  const maxX = Math.max(...rects.map((r) => r.x + r.width));
  const maxY = Math.max(...rects.map((r) => r.y + r.height));
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}
