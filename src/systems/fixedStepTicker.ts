export interface FixedStepTicker {
  readonly stepSeconds: number;
  readonly maxStepsPerAdvance: number;
  accumulatorSeconds: number;
  pendingOfflineSeconds: number;
}

export function createFixedStepTicker(
  stepSeconds: number,
  maxStepsPerAdvance: number
): FixedStepTicker {
  if (!Number.isFinite(stepSeconds) || stepSeconds <= 0) {
    throw new RangeError(`Invalid step: ${stepSeconds}`);
  }
  if (!Number.isInteger(maxStepsPerAdvance) || maxStepsPerAdvance <= 0) {
    throw new RangeError(`Invalid max steps per advance: ${maxStepsPerAdvance}`);
  }
  return { stepSeconds, maxStepsPerAdvance, accumulatorSeconds: 0, pendingOfflineSeconds: 0 };
}

// Runs `step` once per whole fixed step of elapsed time, at most
// maxStepsPerAdvance times. Anything beyond the cap (e.g. a tab left in the
// background) is set aside for offline progress instead of freezing the frame.
export function advanceTicker(
  ticker: FixedStepTicker,
  deltaSeconds: number,
  step: (stepSeconds: number) => void
): number {
  if (!Number.isFinite(deltaSeconds) || deltaSeconds < 0) return 0;

  ticker.accumulatorSeconds += deltaSeconds;
  const dueSteps = Math.floor(ticker.accumulatorSeconds / ticker.stepSeconds);
  const stepsToRun = Math.min(dueSteps, ticker.maxStepsPerAdvance);

  const skippedSeconds = (dueSteps - stepsToRun) * ticker.stepSeconds;
  ticker.pendingOfflineSeconds += skippedSeconds;
  ticker.accumulatorSeconds -= dueSteps * ticker.stepSeconds;

  for (let i = 0; i < stepsToRun; i++) step(ticker.stepSeconds);
  return stepsToRun;
}

export function takePendingOfflineSeconds(ticker: FixedStepTicker): number {
  const pending = ticker.pendingOfflineSeconds;
  ticker.pendingOfflineSeconds = 0;
  return pending;
}
