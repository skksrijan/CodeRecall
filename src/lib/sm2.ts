export interface SM2State {
  quality: number; // 0-5
  repetitions: number;
  previousInterval: number; // days
  easeFactor: number;
}

export interface SM2Result {
  repetitions: number;
  interval: number; // days
  easeFactor: number;
  nextReviewDate: Date;
}

export function calculateSM2({
  quality,
  repetitions,
  previousInterval,
  easeFactor,
}: SM2State): SM2Result {
  let newRepetitions: number;
  let newInterval: number;
  let newEaseFactor: number;

  if (quality < 3) {
    // Forgotten / lapsed
    newRepetitions = 0;
    newInterval = 1;
  } else {
    // Remembered
    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(previousInterval * easeFactor);
    }
    newRepetitions = repetitions + 1;
  }

  // Update ease factor
  newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  
  // Floor ease factor at 1.3
  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3;
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  return {
    repetitions: newRepetitions,
    interval: newInterval,
    easeFactor: newEaseFactor,
    nextReviewDate,
  };
}
