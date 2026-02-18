# Training Quiz UX Fix Plan

## Problem

When a user **fails** a module quiz (< 70%):

1. They see the results screen with their score
2. The "Next Module" button is still shown
3. They click it and navigate to the next module
4. The next module loads, checks if the previous module is completed
5. Since they failed, the previous module is **not** completed
6. They see "Module Locked - Please complete the previous module"
7. Their only option is "Back to Dashboard"

**Result**: Confusing UX — they're allowed to move forward, then blocked, then sent back.

## Root Cause

In `quiz-component.tsx` (lines 223–248), the "Next Module" button is shown whenever `nextModule` exists — **regardless of pass/fail**. The `passed` variable (score >= 70) is only used for the badge display, not for button visibility.

## Fix (UX only — no course or progress data changes)

### 1. Hide "Next Module" when user fails

**File**: `app/dashboard/learning/modules/[moduleId]/quiz-component.tsx`

- Only show the "Next Module" button when `passed` is true (score >= 70)
- When the user fails, show only "Back to Dashboard" (and optionally "Try Again")

### 2. Add "Try Again" button when user fails (optional but recommended)

- When failed, add a "Try Again" button that resets the quiz state (no API calls, no data changes)
- Resets: `showResults = false`, `currentQuestion = 0`, `results = {}`, `selectedAnswers = {}`
- Lets the user retake the quiz immediately without navigating away

### 3. Clarify the failed state messaging

- When failed, the results screen already shows "Keep Learning!" and the score
- Optionally add a short line: "You need 70% to pass. Complete this module before moving on."

## What we will NOT change

- No changes to `completeQuiz` or `completeModule` logic
- No changes to course content, modules, or quizzes
- No changes to `UserProgress` or `UserBadge` data
- Lock logic remains: next module is locked until previous is completed (score >= 70)

## Implementation Summary

| Change | Location | Effect |
|--------|----------|--------|
| Conditionally show "Next Module" | quiz-component.tsx | Only when `passed` |
| Add "Try Again" button | quiz-component.tsx | Reset quiz state when failed |
| Improve failed-state copy | quiz-component.tsx | Optional clarity message |
