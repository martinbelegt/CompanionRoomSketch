import {
  DEFAULT_DECIMALS,
  DISPLAY_UNITS,
  MM_PER_CM,
  MM_PER_METER,
} from "../constants/measurementConstants";

export function pixelsToMm(pixelDistance, mmPerPixel) {
  if (!Number.isFinite(pixelDistance) || !Number.isFinite(mmPerPixel)) {
    return null;
  }

  return pixelDistance * mmPerPixel;
}

export function mmToPixels(mm, mmPerPixel) {
  if (
    !Number.isFinite(mm) ||
    !Number.isFinite(mmPerPixel) ||
    mmPerPixel === 0
  ) {
    return null;
  }

  return mm / mmPerPixel;
}

export function cmToMm(cm) {
  if (!Number.isFinite(cm)) return null;
  return cm * MM_PER_CM;
}

export function mmToCm(mm) {
  if (!Number.isFinite(mm)) return null;
  return mm / MM_PER_CM;
}

export function metersToMm(meters) {
  if (!Number.isFinite(meters)) return null;
  return meters * MM_PER_METER;
}

export function mmToMeters(mm) {
  if (!Number.isFinite(mm)) return null;
  return mm / MM_PER_METER;
}

export function formatDistance(mm, unit = DISPLAY_UNITS.CM, decimals) {
  if (!Number.isFinite(mm)) return "—";

  if (unit === DISPLAY_UNITS.MM) {
    const value = mm;
    const usedDecimals = decimals ?? DEFAULT_DECIMALS.mm;
    return `${value.toFixed(usedDecimals)} mm`;
  }

  if (unit === DISPLAY_UNITS.METER) {
    const value = mmToMeters(mm);
    const usedDecimals = decimals ?? DEFAULT_DECIMALS.m;
    return `${value.toFixed(usedDecimals)} m`;
  }

  const value = mmToCm(mm);
  const usedDecimals = decimals ?? DEFAULT_DECIMALS.cm;
  return `${value.toFixed(usedDecimals)} cm`;
}

export function formatDistanceAuto(mm) {
  if (!Number.isFinite(mm)) return "—";

  if (Math.abs(mm) >= MM_PER_METER) {
    return formatDistance(mm, DISPLAY_UNITS.METER);
  }

  if (Math.abs(mm) < MM_PER_CM) {
    return formatDistance(mm, DISPLAY_UNITS.MM);
  }

  return formatDistance(mm, DISPLAY_UNITS.CM);
}
