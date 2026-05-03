import { ElectionPhase } from '@/data/indianElections';

/**
 * Splits election phases into past and upcoming buckets relative to `today`.
 */
export function partitionPhases(
  phases: ElectionPhase[],
  today: Date = new Date()
): { past: ElectionPhase[]; upcoming: ElectionPhase[] } {
  const past: ElectionPhase[] = [];
  const upcoming: ElectionPhase[] = [];

  for (const phase of phases) {
    const phaseDate = new Date(phase.date);
    if (phaseDate < today) {
      past.push({ ...phase, isPast: true });
    } else {
      upcoming.push({ ...phase, isPast: false });
    }
  }

  return { past, upcoming };
}

/**
 * Returns the next upcoming phase, or null if all phases are in the past.
 */
export function getNextPhase(phases: ElectionPhase[], today: Date = new Date()): ElectionPhase | null {
  const sorted = [...phases].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  return sorted.find((p) => new Date(p.date) >= today) ?? null;
}

/**
 * Returns the number of days until the given ISO date string.
 * Negative if the date is in the past.
 */
export function daysUntil(isoDate: string, today: Date = new Date()): number {
  const target = new Date(isoDate);
  const diffMs = target.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Returns a human-readable urgency label based on days remaining.
 */
export function getDeadlineUrgency(days: number): 'overdue' | 'urgent' | 'soon' | 'comfortable' {
  if (days < 0) return 'overdue';
  if (days <= 3) return 'urgent';
  if (days <= 14) return 'soon';
  return 'comfortable';
}

/**
 * Sanitizes a plain text string by stripping any HTML tags and their
 * inner content for dangerous elements (XSS guard for any user-supplied
 * input that gets rendered into the DOM).
 */
export function sanitizeText(input: string): string {
  // First strip dangerous tag content (script, style, etc.)
  const withoutDangerousContent = input.replace(
    /<(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi,
    ''
  );
  // Then strip remaining HTML tags
  return withoutDangerousContent.replace(/<[^>]*>/g, '').trim();
}
