// Lightweight client-side tracing validation.
// Evaluates user strokes against the target Arabic letter's pixel footprint.
// Uses section-based coverage to prevent single-area scribbling.

export interface TraceThresholds {
  /** Minimum total stroke length (in canvas px) to count as a real attempt. */
  minStrokeLength: number;
  /** Fraction of target cells that must be covered by user strokes. */
  coverageThreshold: number;
  /** Fraction of user points that must fall near the target region. */
  proximityThreshold: number;
  /** Grid resolution used to downsample the canvas for cell-based metrics. */
  gridN: number;
  /** Dilation radius (in cells) applied to the target footprint for proximity. */
  proximityDilation: number;
  /** Brush radius (in cells) used to mark user coverage. */
  brushDilation: number;
  /** Minimum per-section coverage ratio for a section to count as "covered". */
  sectionCoverageThreshold: number;
  /** Fraction of letter sections that must be covered to allow completion. */
  sectionRequiredRatio: number;
  /** Fraction of each disconnected letter component that must be covered. */
  componentCoverageThreshold: number;
}

// Configurable in one place.
export const THRESHOLDS: TraceThresholds = {
  minStrokeLength: 70,
  coverageThreshold: 0.60,
  proximityThreshold: 0.55,
  gridN: 48,
  proximityDilation: 3,
  brushDilation: 2,
  sectionCoverageThreshold: 0.30,
  sectionRequiredRatio: 0.80,
  componentCoverageThreshold: 0.30,
};

export interface TargetMask {
  width: number;
  height: number;
  gridN: number;
  cellW: number;
  cellH: number;
  targetCells: Uint8Array; // 1 if cell contains letter pixel
  dilated: Uint8Array; // target cells dilated by proximityDilation
  targetCount: number;
  targetBounds: { minX: number; minY: number; maxX: number; maxY: number };
  // Section-based tracking
  sections: SectionInfo[];
  sectionCellMaps: number[][]; // sectionIndex -> array of cell indices in that section
  componentCellMaps: number[][]; // disconnected glyph components, including dots
}

export interface SectionInfo {
  index: number;
  cellCount: number; // number of target cells in this section
  bounds: { gx0: number; gy0: number; gx1: number; gy1: number };
}

function cellIndex(gx: number, gy: number, gridN: number) {
  return gy * gridN + gx;
}

function buildPixelComponentCellMaps(
  targetPixels: Uint8Array,
  width: number,
  height: number,
  cellW: number,
  cellH: number,
  gridN: number,
): number[][] {
  const visited = new Uint8Array(targetPixels.length);
  const components: number[][] = [];

  for (let start = 0; start < targetPixels.length; start++) {
    if (!targetPixels[start] || visited[start]) continue;
    const queue = [start];
    const componentCells = new Set<number>();
    visited[start] = 1;

    while (queue.length > 0) {
      const current = queue.pop()!;
      const x = current % width;
      const y = Math.floor(current / width);
      const gx = Math.min(gridN - 1, Math.floor(x / cellW));
      const gy = Math.min(gridN - 1, Math.floor(y / cellH));
      componentCells.add(cellIndex(gx, gy, gridN));

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          const neighbor = ny * width + nx;
          if (targetPixels[neighbor] && !visited[neighbor]) {
            visited[neighbor] = 1;
            queue.push(neighbor);
          }
        }
      }
    }

    components.push([...componentCells]);
  }

  return components;
}

function dilate(cells: Uint8Array, gridN: number, radius: number): Uint8Array {
  if (radius <= 0) return cells.slice();
  const out = new Uint8Array(cells.length);
  for (let y = 0; y < gridN; y++) {
    for (let x = 0; x < gridN; x++) {
      if (!cells[cellIndex(x, y, gridN)]) continue;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= gridN || ny >= gridN) continue;
          out[cellIndex(nx, ny, gridN)] = 1;
        }
      }
    }
  }
  return out;
}

export function buildTargetMask(imageData: ImageData, gridN: number, dilation: number): TargetMask {
  const { width, height, data } = imageData;
  const cellW = width / gridN;
  const cellH = height / gridN;
  const targetCells = new Uint8Array(gridN * gridN);
  const targetPixels = new Uint8Array(width * height);
  let minX = gridN,
    minY = gridN,
    maxX = 0,
    maxY = 0;
  let targetCount = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 40) {
        targetPixels[y * width + x] = 1;
        const gx = Math.min(gridN - 1, Math.floor(x / cellW));
        const gy = Math.min(gridN - 1, Math.floor(y / cellH));
        const idx = cellIndex(gx, gy, gridN);
        if (!targetCells[idx]) {
          targetCells[idx] = 1;
          targetCount++;
          if (gx < minX) minX = gx;
          if (gy < minY) minY = gy;
          if (gx > maxX) maxX = gx;
          if (gy > maxY) maxY = gy;
        }
      }
    }
  }

  const dilated = dilate(targetCells, gridN, dilation);
  const componentCellMaps = buildPixelComponentCellMaps(targetPixels, width, height, cellW, cellH, gridN);

  // --- Section-based division ---
  // Divide the letter's bounding box into a 3x3 grid of sections.
  // Only sections that contain target cells are "required" sections.
  // This forces the student to trace across the entire letter shape.
  const SECTION_DIV = 3;
  const bw = maxX - minX + 1;
  const bh = maxY - minY + 1;
  const sw = Math.max(1, Math.ceil(bw / SECTION_DIV));
  const sh = Math.max(1, Math.ceil(bh / SECTION_DIV));

  const sections: SectionInfo[] = [];
  const sectionCellMaps: number[][] = [];

  for (let sy = 0; sy < SECTION_DIV; sy++) {
    for (let sx = 0; sx < SECTION_DIV; sx++) {
      const gx0 = minX + sx * sw;
      const gy0 = minY + sy * sh;
      const gx1 = Math.min(gridN - 1, gx0 + sw - 1);
      const gy1 = Math.min(gridN - 1, gy0 + sh - 1);

      const cells: number[] = [];
      for (let gy = gy0; gy <= gy1; gy++) {
        for (let gx = gx0; gx <= gx1; gx++) {
          const idx = cellIndex(gx, gy, gridN);
          if (targetCells[idx]) {
            cells.push(idx);
          }
        }
      }

      if (cells.length > 0) {
        const sectionIdx = sections.length;
        sections.push({
          index: sectionIdx,
          cellCount: cells.length,
          bounds: { gx0, gy0, gx1, gy1 },
        });
        sectionCellMaps.push(cells);
      }
    }
  }

  return {
    width,
    height,
    gridN,
    cellW,
    cellH,
    targetCells,
    dilated,
    targetCount,
    targetBounds: { minX, minY, maxX, maxY },
    sections,
    sectionCellMaps,
    componentCellMaps,
  };
}

export interface StrokePoint {
  x: number;
  y: number;
}

export interface ValidationResult {
  pass: boolean;
  coverage: number;
  proximity: number;
  strokeLength: number;
  reason: string;
  sectionsCovered: number;
  totalSections: number;
}

/** Build user coverage cells from points near the letter, ignoring off-target strokes. */
function buildUserCells(
  points: StrokePoint[],
  mask: TargetMask,
  thresholds: TraceThresholds,
): { userCells: Uint8Array; nearCount: number } {
  const { gridN, cellW, cellH, dilated } = mask;
  const userCells = new Uint8Array(gridN * gridN);
  let nearCount = 0;
  for (const p of points) {
    const gx = Math.min(gridN - 1, Math.max(0, Math.floor(p.x / cellW)));
    const gy = Math.min(gridN - 1, Math.max(0, Math.floor(p.y / cellH)));
    if (dilated[cellIndex(gx, gy, gridN)]) {
      nearCount++;
      for (let dy = -thresholds.brushDilation; dy <= thresholds.brushDilation; dy++) {
        for (let dx = -thresholds.brushDilation; dx <= thresholds.brushDilation; dx++) {
          const nx = gx + dx;
          const ny = gy + dy;
          if (nx < 0 || ny < 0 || nx >= gridN || ny >= gridN) continue;
          userCells[cellIndex(nx, ny, gridN)] = 1;
        }
      }
    }
  }
  return { userCells, nearCount };
}

/** Compute per-section coverage ratios. */
function computeSectionCoverage(userCells: Uint8Array, mask: TargetMask): number[] {
  return mask.sectionCellMaps.map((cells) => {
    let covered = 0;
    for (const idx of cells) {
      if (userCells[idx]) covered++;
    }
    return cells.length > 0 ? covered / cells.length : 0;
  });
}

function buildComponentUserCells(points: StrokePoint[], mask: TargetMask): Uint8Array {
  const componentUserCells = new Uint8Array(mask.gridN * mask.gridN);
  const tolerance = 1;

  for (const point of points) {
    const gx = Math.min(mask.gridN - 1, Math.max(0, Math.floor(point.x / mask.cellW)));
    const gy = Math.min(mask.gridN - 1, Math.max(0, Math.floor(point.y / mask.cellH)));
    for (let dy = -tolerance; dy <= tolerance; dy++) {
      for (let dx = -tolerance; dx <= tolerance; dx++) {
        const nx = gx + dx;
        const ny = gy + dy;
        if (nx < 0 || ny < 0 || nx >= mask.gridN || ny >= mask.gridN) continue;
        componentUserCells[cellIndex(nx, ny, mask.gridN)] = 1;
      }
    }
  }

  return componentUserCells;
}

/** Compute a 0–1 tracing coverage ratio for live progress display.
 *  Uses section-weighted coverage so scribbling one area can't inflate progress.
 *  Only strokes near the letter shape contribute. */
export function computeCoverage(points: StrokePoint[], mask: TargetMask, thresholds: TraceThresholds = THRESHOLDS): number {
  if (points.length < 2 || mask.targetCount === 0) return 0;
  let strokeLength = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    strokeLength += Math.sqrt(dx * dx + dy * dy);
  }
  if (strokeLength < thresholds.minStrokeLength * 0.15) return 0;
  if (mask.sections.length === 0) return 0;

  const { userCells, nearCount } = buildUserCells(points, mask, thresholds);
  if (nearCount / points.length < 0.25) return 0;

  const sectionCoverages = computeSectionCoverage(userCells, mask);

  // Progress = average of per-section coverage ratios.
  // This means a student must cover ALL sections to reach high progress.
  // Scribbling one section to 100% only gives 100%/numSections.
  let sum = 0;
  for (const sc of sectionCoverages) sum += sc;
  return Math.min(1, sum / mask.sections.length);
}

export function validateStrokes(
  points: StrokePoint[],
  mask: TargetMask,
  thresholds: TraceThresholds = THRESHOLDS,
): ValidationResult {
  if (points.length < 2) {
    return { pass: false, coverage: 0, proximity: 0, strokeLength: 0, reason: 'not-enough-points', sectionsCovered: 0, totalSections: mask.sections.length };
  }

  let strokeLength = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    strokeLength += Math.sqrt(dx * dx + dy * dy);
  }

  if (strokeLength < thresholds.minStrokeLength) {
    return { pass: false, coverage: 0, proximity: strokeLength > 0 ? 0.1 : 0, strokeLength, reason: 'keep-tracing', sectionsCovered: 0, totalSections: mask.sections.length };
  }

  if (mask.targetCount === 0) {
    return { pass: false, coverage: 0, proximity: 0, strokeLength, reason: 'no-target', sectionsCovered: 0, totalSections: 0 };
  }

  const { userCells, nearCount } = buildUserCells(points, mask, thresholds);
  const proximity = nearCount / points.length;

  // Overall pixel coverage
  let covered = 0;
  for (let i = 0; i < mask.targetCells.length; i++) {
    if (mask.targetCells[i] && userCells[i]) covered++;
  }
  const coverage = covered / mask.targetCount;

  // Per-section coverage
  const sectionCoverages = computeSectionCoverage(userCells, mask);
  const componentUserCells = buildComponentUserCells(points, mask);
  const componentsCovered = mask.componentCellMaps.every((cells) => {
    let covered = 0;
    for (const idx of cells) {
      if (componentUserCells[idx]) covered++;
    }
    return cells.length > 0 && covered / cells.length >= thresholds.componentCoverageThreshold;
  });
  let sectionsCovered = 0;
  for (const sc of sectionCoverages) {
    if (sc >= thresholds.sectionCoverageThreshold) sectionsCovered++;
  }
  const totalSections = mask.sections.length;
  const sectionRatio = totalSections > 0 ? sectionsCovered / totalSections : 1;

  // Section-weighted progress (same formula as computeCoverage)
  let sectionSum = 0;
  for (const sc of sectionCoverages) sectionSum += sc;
  const sectionProgress = mask.sections.length > 0 ? sectionSum / mask.sections.length : 0;

  let pass = true;
  let reason = 'ok';

  // Condition 1: overall coverage >= threshold
  if (coverage < thresholds.coverageThreshold) {
    pass = false;
    reason = 'keep-tracing';
  }

  // Condition 2: enough sections must be covered
  if (sectionRatio < thresholds.sectionRequiredRatio) {
    pass = false;
    reason = 'missing-sections';
  }

  // Every disconnected glyph component must be traced, including dots.
  if (!componentsCovered) {
    pass = false;
    reason = 'missing-sections';
  }

  // Condition 3: proximity must be high enough (not drawing randomly)
  if (proximity < thresholds.proximityThreshold) {
    pass = false;
    reason = 'off-target';
  }

  return {
    pass,
    coverage: sectionProgress, // report section-weighted progress for consistency with live display
    proximity,
    strokeLength,
    reason,
    sectionsCovered,
    totalSections,
  };
}
