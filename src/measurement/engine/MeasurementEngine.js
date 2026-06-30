import {
  calculatePixelDistance,
  isCalibrationValid,
  measurePixelsWithCalibration,
} from "./ScaleEngine";

export function measureDistance({ startPoint, endPoint, calibration }) {
  if (!isCalibrationValid(calibration)) {
    return null;
  }

  const pixelDistance = calculatePixelDistance(startPoint, endPoint);

  if (!Number.isFinite(pixelDistance)) {
    return null;
  }

  const distanceMm = measurePixelsWithCalibration(pixelDistance, calibration);

  if (!Number.isFinite(distanceMm)) {
    return null;
  }

  return {
    pixelDistance,
    distanceMm,
  };
}

export function measureFurniture({ furniture, calibration }) {
  if (!furniture || !isCalibrationValid(calibration)) {
    return null;
  }

  const widthMm = measurePixelsWithCalibration(furniture.width, calibration);
  const depthMm = measurePixelsWithCalibration(furniture.height, calibration);

  if (!Number.isFinite(widthMm) || !Number.isFinite(depthMm)) {
    return null;
  }

  return {
    widthMm,
    depthMm,
  };
}

export function getFurnitureCenter(furniture) {
  if (!furniture) return null;

  return {
    x: furniture.x + furniture.width / 2,
    y: furniture.y + furniture.height / 2,
  };
}

export function measureBetweenFurniture({
  furnitureA,
  furnitureB,
  calibration,
}) {
  if (!furnitureA || !furnitureB || !isCalibrationValid(calibration)) {
    return null;
  }

  const centerA = getFurnitureCenter(furnitureA);
  const centerB = getFurnitureCenter(furnitureB);

  return measureDistance({
    startPoint: centerA,
    endPoint: centerB,
    calibration,
  });
}

export function measureRect({ rect, calibration }) {
  if (!rect || !isCalibrationValid(calibration)) {
    return null;
  }

  const widthMm = measurePixelsWithCalibration(rect.width, calibration);
  const heightMm = measurePixelsWithCalibration(rect.height, calibration);

  if (!Number.isFinite(widthMm) || !Number.isFinite(heightMm)) {
    return null;
  }

  return {
    widthMm,
    heightMm,
  };
}

export function createDimensionLine({ startPoint, endPoint, calibration, id }) {
  const measurement = measureDistance({
    startPoint,
    endPoint,
    calibration,
  });

  if (!measurement) {
    return null;
  }

  return {
    id: id ?? `dimension-${Date.now()}`,
    type: "dimension-line",
    startPoint,
    endPoint,
    pixelDistance: measurement.pixelDistance,
    distanceMm: measurement.distanceMm,
    createdAt: new Date().toISOString(),
  };
}
