# Statistical Cycle Prediction Engine

**File:** `src/logic/predictionEngine.js`  
**Entry point:** `export function runPrediction(cycleEntries)`

The prediction engine is a pure JavaScript module. It has no React dependencies, makes no network calls, and writes nothing to storage. It accepts an array of `CycleEntry` objects and returns a single `PredictionResult` object. The same result is consumed by the Dashboard (for the phase card, prediction card, timeline, and stats) and the Calendar (for computing which days to show as predicted periods).

---

## Important Disclaimers

- The algorithm is not clinically validated. It has not been tested against a labelled medical dataset.
- It should not be used for contraception or pregnancy planning.
- The estimated ovulatory window is an educational approximation only; it is not a measurement of when ovulation actually occurred.
- Predicted dates are mathematical estimates. Individual cycles vary significantly.

---

## Input Requirements

`runPrediction` accepts an array of `CycleEntry` objects:

```js
{
  id:        string,
  startDate: string,   // ISO date, e.g. "2024-03-01"
  endDate:   string | null,
  notes:     string | null,
  createdAt: string,
  modifiedAt: string
}
```

The engine requires **at least two entries with valid `startDate` values** to compute a cycle length. With zero or one entry, it returns early with `predictedStartDate: null` and an appropriate `dataQuality` label.

---

## Step-by-Step Algorithm

### Step 1 — Parse and sort

All entries are parsed with `date-fns/parseISO` and sorted in ascending chronological order by `startDate`. This ensures later steps always process cycles oldest-to-newest.

### Step 2 — Compute cycle lengths

A cycle length is the integer number of days between consecutive period start dates:

```
cycleLength[i] = startDate[i+1] - startDate[i]   (in calendar days)
```

For example, if entry 1 starts 2024-01-01 and entry 2 starts 2024-01-29, the cycle length is 28 days.

**Invalid lengths excluded:** Any cycle length ≤ 0 (caused by duplicate dates or data entry errors) is silently dropped. A `console.warn` is logged. The remaining valid lengths are used.

### Step 3 — Working set

The algorithm uses at most the **most recent 6 valid cycle lengths**. If fewer than 6 are available, all are used.

```
workingSet = allLengths.slice(-6)   // most recent 6, or all if fewer
```

### Step 4 — Weighted mean

The predicted cycle length is a **linearly weighted mean** that gives more importance to recent cycles. The most recent cycle receives weight N, the next N−1, and so on down to 1:

```
weights = [1, 2, 3, ..., N]   where N = workingSet.length
                               and index 0 = oldest, index N-1 = most recent

weightedMean = Σ(workingSet[i] × weight[i]) / Σ(weight[i])
```

**Example with 3 cycles of 26, 28, 30 days:**
```
weights  = [1, 2, 3]
numerator = 26×1 + 28×2 + 30×3 = 26 + 56 + 90 = 172
denominator = 1 + 2 + 3 = 6
weightedMean = 172 / 6 ≈ 28.7 days
```

The **predicted start date** is:
```
predictedStartDate = mostRecentStartDate + round(weightedMean)
```

### Step 5 — Standard deviation

An unweighted population standard deviation is computed over the working set:

```
mean = Σ(workingSet) / N
variance = Σ((workingSet[i] - mean)²) / N
SD = √variance
```

Note: this is the **population SD** (divisor N), not the sample SD (divisor N−1). This is appropriate because the working set represents all the cycles being considered, not a sample from a larger population.

### Step 6 — Irregular cycle flag

A cycle is flagged as irregular if:
```
workingSet.length ≥ 3  AND  SD > 8
```

The 8-day SD threshold represents a meaningfully wide spread in cycle length. It was chosen as a practical indicator, not derived from clinical literature.

### Step 7 — Uncertainty range

The range communicates how wide the prediction window is. It is only computed when there are at least 3 observed cycle lengths.

**Regular cycles (SD ≤ 8):**
```
spread = round(SD)
rangeEarlyDate = predictedStartDate − spread days
rangeLateDate  = predictedStartDate + spread days
```
Labeled: *"Estimated range — not a validated prediction interval."*

**Irregular cycles (SD > 8):**
The interquartile range (IQR) is used instead of SD because it is more robust to outlier cycle lengths:
```
sortedSet = workingSet sorted ascending
Q1 = median of lower half
Q3 = median of upper half
IQR = Q3 − Q1
spread = round(IQR)   (minimum 1 day)
```
Labeled: *"Wide estimated range — cycles are irregular."*

**Fewer than 3 observed lengths:**
```
rangeEarlyDate = null
rangeLateDate  = null
```
Labeled: *"Low confidence — based on fewer than 3 observed cycles."*

**Important:** The range is **not** a confidence interval. It does not represent a probability that the true start date falls within it. The UI makes this explicit.

### Step 8 — Average period duration

Average period duration is computed only from entries that have a recorded `endDate`:

```
duration[i] = endDate[i] - startDate[i]   (in calendar days)
```

Durations outside 1–14 days are excluded as likely data entry errors. The average is rounded to the nearest whole number. If no entries have an `endDate`, the default of 5 days is used.

### Step 9 — Current cycle day

```
currentCycleDay = (today - mostRecentStartDate) + 1
```

This is only computed when `today >= mostRecentStartDate`. If the most recent period start is in the future (a data entry error), `currentCycleDay` is `null`.

### Step 10 — Phase estimation

Phase estimation requires `currentCycleDay` and `weightedMeanCycleLength` to be non-null. The mid-cycle point is derived from the user's own average cycle length — **not a fixed day 14**:

```
midCycle = round(weightedMeanCycleLength / 2)
ovulatoryLow  = midCycle - 2
ovulatoryHigh = midCycle + 2
```

Phase assignment:

| Condition | Phase |
|---|---|
| `currentCycleDay ≤ avgPeriodDuration` | `menstrual` |
| `currentCycleDay < ovulatoryLow` | `follicular` |
| `ovulatoryLow ≤ currentCycleDay ≤ ovulatoryHigh` | `ovulatory_estimated` |
| otherwise | `luteal` |
| `weightedMeanCycleLength` is null | `unknown` |

**Fallback to `unknown`:** If the current cycle day is more than `round(mean) + round(SD) + 5` days past the most recent start date (cycle running significantly longer than predicted), the phase is set to `unknown` to avoid confidently labeling a potentially late or missed period.

**`ovulatory_estimated` is an educational approximation.** It indicates a broad mid-cycle window, not a measurement of ovulation. The UI always shows the mandatory disclaimer when this phase is active.

---

## Data Quality Levels

`dataQuality` is set based on the number of observed cycle lengths (not entries):

| Observed lengths | `dataQuality` | UI behaviour |
|---|---|---|
| 0 | `no_data` | "Log at least 2 periods to see predictions." No date shown. |
| 1 | `single_cycle` | "Log at least one more period to generate a prediction." No date shown. |
| 2 | `limited` | Predicted date shown. No range. Low-confidence label. |
| 3+ | `sufficient` | Predicted date and range shown. Regular/irregular label. |

**Note:** Two period entries produce only one cycle length, so `dataQuality` is `single_cycle`, not `limited`. Three entries produce two lengths (`limited`). Four entries produce three lengths (`sufficient`). This is stricter than it may appear from entry count alone.

---

## Output Object

```js
PredictionResult {
  predictedStartDate:      Date | null,
  rangeEarlyDate:          Date | null,
  rangeLateDate:           Date | null,
  weightedMeanCycleLength: number | null,   // e.g. 28.3 (days, 1 decimal)
  stdDevCycleLength:       number | null,   // e.g. 3.1 (days, 1 decimal)
  averagePeriodDuration:   number | null,   // integer days
  currentPhase:            'menstrual' | 'follicular' | 'ovulatory_estimated' | 'luteal' | 'unknown',
  currentCycleDay:         number | null,
  dataQuality:             'sufficient' | 'limited' | 'single_cycle' | 'no_data',
  isIrregular:             boolean,
  cyclesUsed:              number,
  disclaimer:              string           // always a non-empty string
}
```

---

## How Results Reach the UI

### `usePrediction` hook

**File:** `src/hooks/usePrediction.js`

```js
export function usePrediction(cycleEntries) {
  return useMemo(() => runPrediction(cycleEntries), [cycleEntries])
}
```

`useMemo` ensures `runPrediction` only re-executes when `cycleEntries` changes. The result is a stable reference as long as the entries array is unchanged.

### Dashboard

`DashboardPage` calls both `useCycleData()` and `usePrediction(entries)`. The result is passed directly to the four dashboard components as a `result` prop. None of the components call `runPrediction` themselves.

### Calendar

`CalendarPage` also calls `usePrediction(entries)` independently. It uses `rangeEarlyDate`, `rangeLateDate`, and `averagePeriodDuration` to compute an array of `Date` objects representing the predicted period window:

```js
const windowStart = rangeEarlyDate ?? predictedStartDate
const windowEnd   = (rangeLateDate ?? predictedStartDate) + avgDuration days
predictedDates = eachDayOfInterval({ start: windowStart, end: windowEnd })
```

This array is passed to `MonthCalendar`, which checks each calendar day against it to render an outlined dot indicator.

---

## Algorithm Limitations

| Limitation | Detail |
|---|---|
| Small sample size | With fewer than 6 recorded cycles, the weighted mean is based on limited data. Predictions improve with more history. |
| Outlier sensitivity | A single very long or very short cycle shifts the weighted mean toward itself (because it is the most recent). The irregular flag and IQR range mitigate this somewhat. |
| No hormonal or physiological data | The algorithm uses only timing. It cannot account for stress, illness, weight changes, or hormonal factors that affect cycle length. |
| Not validated | The 8-day SD threshold and the linear weighting scheme have not been validated against clinical data. They are defensible but not evidence-based. |
| Phase estimation is approximate | Cycle phases are estimated from average lengths, not measured. The ovulatory window in particular varies significantly between individuals and even between cycles. |
| No forward correction | If the period arrives earlier or later than predicted, the algorithm does not self-correct mid-cycle. It recalculates on the next call to `usePrediction` when new data is saved. |
