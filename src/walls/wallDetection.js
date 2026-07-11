const MAX_ANALYSIS_SIZE = 1200;
const DARK_THRESHOLD = 125;
const COLOR_DISTANCE_LIMIT = 38;
const MIN_LINE_LENGTH = 60;
const MAX_RUN_GAP = 3;
const MERGE_DISTANCE = 10;
const OVERLAP_MARGIN = 14;

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
}

function isDarkNeutralPixel(data, index) {
  const red = data[index];
  const green = data[index + 1];
  const blue = data[index + 2];
  const alpha = data[index + 3];

  if (alpha < 80) return false;

  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const luminance = red * 0.299 + green * 0.587 + blue * 0.114;

  return luminance < DARK_THRESHOLD && max - min < COLOR_DISTANCE_LIMIT;
}

function rangesOverlap(a, b, margin = 0) {
  return Math.max(a.start, b.start) <= Math.min(a.end, b.end) + margin;
}

function mergeRuns(runs, orientation) {
  const merged = [];
  const sortedRuns = [...runs].sort(
    (a, b) => a.axis - b.axis || a.start - b.start,
  );

  for (const run of sortedRuns) {
    const match = merged.find(
      (item) =>
        Math.abs(item.axis - run.axis) <= MERGE_DISTANCE &&
        rangesOverlap(item, run, OVERLAP_MARGIN),
    );

    if (!match) {
      merged.push({
        ...run,
        count: 1,
      });
      continue;
    }

    const nextCount = match.count + 1;

    match.axis = (match.axis * match.count + run.axis) / nextCount;
    match.start = Math.min(match.start, run.start);
    match.end = Math.max(match.end, run.end);
    match.count = nextCount;
  }

  return merged
    .filter((run) => run.end - run.start >= MIN_LINE_LENGTH)
    .map((run) => ({
      orientation,
      axis: run.axis,
      start: run.start,
      end: run.end,
      confidence: Math.min(1, run.count / 8),
    }));
}

function findHorizontalRuns({ data, width, height }) {
  const runs = [];
  const minLineLength = Math.max(MIN_LINE_LENGTH, width * 0.035);

  for (let y = 0; y < height; y += 1) {
    let start = null;
    let lastDark = null;
    let darkCount = 0;

    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const isDark = isDarkNeutralPixel(data, index);

      if (isDark) {
        if (start == null) start = x;
        lastDark = x;
        darkCount += 1;
      }

      const gapTooLarge =
        start != null && lastDark != null && x - lastDark > MAX_RUN_GAP;
      const isEnd = x === width - 1;

      if ((gapTooLarge || isEnd) && start != null && lastDark != null) {
        const length = lastDark - start;
        const density = darkCount / Math.max(1, length);

        if (length >= minLineLength && density > 0.55) {
          runs.push({
            axis: y,
            start,
            end: lastDark,
          });
        }

        start = isDark ? x : null;
        lastDark = isDark ? x : null;
        darkCount = isDark ? 1 : 0;
      }
    }
  }

  return mergeRuns(runs, "horizontal");
}

function findVerticalRuns({ data, width, height }) {
  const runs = [];
  const minLineLength = Math.max(MIN_LINE_LENGTH, height * 0.035);

  for (let x = 0; x < width; x += 1) {
    let start = null;
    let lastDark = null;
    let darkCount = 0;

    for (let y = 0; y < height; y += 1) {
      const index = (y * width + x) * 4;
      const isDark = isDarkNeutralPixel(data, index);

      if (isDark) {
        if (start == null) start = y;
        lastDark = y;
        darkCount += 1;
      }

      const gapTooLarge =
        start != null && lastDark != null && y - lastDark > MAX_RUN_GAP;
      const isEnd = y === height - 1;

      if ((gapTooLarge || isEnd) && start != null && lastDark != null) {
        const length = lastDark - start;
        const density = darkCount / Math.max(1, length);

        if (length >= minLineLength && density > 0.55) {
          runs.push({
            axis: x,
            start,
            end: lastDark,
          });
        }

        start = isDark ? y : null;
        lastDark = isDark ? y : null;
        darkCount = isDark ? 1 : 0;
      }
    }
  }

  return mergeRuns(runs, "vertical");
}

function toWorldSuggestion(run, background, analysisScale) {
  const backgroundScale = background.scale ?? 1;
  const sourceToImage = 1 / analysisScale;
  const x = background.x ?? 0;
  const y = background.y ?? 0;
  const toWorld = (value) => value * sourceToImage * backgroundScale;

  if (run.orientation === "horizontal") {
    return {
      id: crypto.randomUUID(),
      orientation: run.orientation,
      confidence: run.confidence,
      startPoint: {
        x: x + toWorld(run.start),
        y: y + toWorld(run.axis),
      },
      endPoint: {
        x: x + toWorld(run.end),
        y: y + toWorld(run.axis),
      },
    };
  }

  return {
    id: crypto.randomUUID(),
    orientation: run.orientation,
    confidence: run.confidence,
    startPoint: {
      x: x + toWorld(run.axis),
      y: y + toWorld(run.start),
    },
    endPoint: {
      x: x + toWorld(run.axis),
      y: y + toWorld(run.end),
    },
  };
}

export async function detectWallSuggestions(background) {
  if (!background?.source) return [];

  const image = await loadImage(background.source);
  const imageScale = Math.min(
    1,
    MAX_ANALYSIS_SIZE / Math.max(image.width, image.height),
  );
  const width = Math.max(1, Math.round(image.width * imageScale));
  const height = Math.max(1, Math.round(image.height * imageScale));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) return [];

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  const imageData = context.getImageData(0, 0, width, height);
  const horizontalRuns = findHorizontalRuns({
    data: imageData.data,
    width,
    height,
  });
  const verticalRuns = findVerticalRuns({
    data: imageData.data,
    width,
    height,
  });

  return [...horizontalRuns, ...verticalRuns]
    .map((run) => toWorldSuggestion(run, background, imageScale))
    .slice(0, 240);
}
