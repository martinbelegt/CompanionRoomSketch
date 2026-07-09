import {
  MIN_CALIBRATION_DISTANCE_PX,
  SCALE_STATUS,
  SCALE_TOLERANCE_PERCENT,
} from "../constants/measurementConstants";
import { pixelsToMm } from "../utils/unitConversion";

export function getWorldDistance(startPoint, endPoint) {
  if (!startPoint || !endPoint) return null;

  const dx = endPoint.x - startPoint.x;
  const dy = endPoint.y - startPoint.y;

  return Math.sqrt(dx * dx + dy * dy);
}

export const calculatePixelDistance = getWorldDistance;

export function createCalibration({ startPoint, endPoint, realDistanceMm }) {
  const pixelDistance = getWorldDistance(startPoint, endPoint);

  if (
    !Number.isFinite(pixelDistance) ||
    pixelDistance < MIN_CALIBRATION_DISTANCE_PX ||
    !Number.isFinite(realDistanceMm) ||
    realDistanceMm <= 0
  ) {
    return null;
  }

  return {
    mmPerPixel: realDistanceMm / pixelDistance,
    pixelDistance,
    realDistanceMm,
    createdAt: new Date().toISOString(),
    status: SCALE_STATUS.CALIBRATED,
  };
}

export function isCalibrationValid(calibration) {
  return (
    calibration &&
    Number.isFinite(calibration.mmPerPixel) &&
    calibration.mmPerPixel > 0
  );
}

export function measurePixelsWithCalibration(pixelDistance, calibration) {
  if (!isCalibrationValid(calibration)) return null;
  return pixelsToMm(pixelDistance, calibration.mmPerPixel);
}

export function calculateDeviationPercent(expectedMm, measuredMm) {
  if (
    !Number.isFinite(expectedMm) ||
    expectedMm <= 0 ||
    !Number.isFinite(measuredMm)
  ) {
    return null;
  }

  return Math.abs(((measuredMm - expectedMm) / expectedMm) * 100);
}

export function getScaleStatusFromDeviation(deviationPercent) {
  if (!Number.isFinite(deviationPercent)) {
    return SCALE_STATUS.WARNING;
  }

  if (deviationPercent <= SCALE_TOLERANCE_PERCENT.GOOD) {
    return SCALE_STATUS.VERIFIED;
  }

  if (deviationPercent <= SCALE_TOLERANCE_PERCENT.ACCEPTABLE) {
    return SCALE_STATUS.WARNING;
  }

  return SCALE_STATUS.WARNING;
}

export function verifyCalibration({
  calibration,
  startPoint,
  endPoint,
  expectedDistanceMm,
}) {
  if (!isCalibrationValid(calibration)) return null;

  const pixelDistance = getWorldDistance(startPoint, endPoint);
  const measuredMm = measurePixelsWithCalibration(pixelDistance, calibration);
  const deviationPercent = calculateDeviationPercent(
    expectedDistanceMm,
    measuredMm,
  );

  return {
    pixelDistance,
    expectedDistanceMm,
    measuredMm,
    deviationPercent,
    status: getScaleStatusFromDeviation(deviationPercent),
    verifiedAt: new Date().toISOString(),
  };
}
