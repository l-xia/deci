/**
 * Represents a time entry for tracking work on a specific task
 * Time entries include a description of what was being worked on
 */
export interface TimeEntry {
  /** Unique identifier for this time entry */
  id: string;
  /** ID of the card this entry is associated with (null if unassigned) */
  cardId: string | null;
  /** Description of what was being worked on during this time entry */
  description: string;
  /** ISO timestamp when the timer started */
  startedAt: string;
  /** ISO timestamp when the timer ended (undefined if still running) */
  endedAt?: string;
  /** Total seconds for this time entry */
  seconds: number;
}

/**
 * State for the global timer
 * Only one timer can be active at a time
 */
export interface GlobalTimerState {
  /** Whether the timer is currently running */
  isRunning: boolean;
  /** The current time entry being tracked (null if timer not started) */
  currentEntry: TimeEntry | null;
  /** Index of the card in dailyDeck currently selected for timing */
  selectedCardIndex: number | null;
  /** Current task description being entered/tracked */
  currentDescription: string;
  /** Timestamp when the current timer session started */
  startTime: Date | null;
  /** Accumulated seconds for the current timer session */
  accumulatedSeconds: number;
  /** Base seconds accumulated from previous pause/resume cycles */
  baseSeconds: number;
}
