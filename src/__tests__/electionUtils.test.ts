import {
  partitionPhases,
  getNextPhase,
  daysUntil,
  getDeadlineUrgency,
  sanitizeText,
} from '@/lib/electionUtils';
import type { ElectionPhase } from '@/data/indianElections';

const PHASES: ElectionPhase[] = [
  { id: 'p1', title: 'Registration Deadline', date: '2020-01-01', description: 'Past phase', isPast: true },
  { id: 'p2', title: 'Polling Day', date: '2099-12-31', description: 'Future phase', isPast: false },
  { id: 'p3', title: 'Counting Day', date: '2099-12-31', description: 'Another future phase', isPast: false },
];

const TODAY = new Date('2026-05-01');

describe('partitionPhases', () => {
  it('places past-dated phases in the past bucket', () => {
    const { past } = partitionPhases(PHASES, TODAY);
    expect(past).toHaveLength(1);
    expect(past[0].id).toBe('p1');
  });

  it('places future-dated phases in the upcoming bucket', () => {
    const { upcoming } = partitionPhases(PHASES, TODAY);
    expect(upcoming).toHaveLength(2);
  });

  it('marks past phases with isPast=true', () => {
    const { past } = partitionPhases(PHASES, TODAY);
    expect(past[0].isPast).toBe(true);
  });

  it('marks upcoming phases with isPast=false', () => {
    const { upcoming } = partitionPhases(PHASES, TODAY);
    expect(upcoming[0].isPast).toBe(false);
  });

  it('returns empty buckets for an empty array', () => {
    const { past, upcoming } = partitionPhases([], TODAY);
    expect(past).toHaveLength(0);
    expect(upcoming).toHaveLength(0);
  });
});

describe('getNextPhase', () => {
  it('returns the nearest future phase', () => {
    const next = getNextPhase(PHASES, TODAY);
    expect(next).not.toBeNull();
    expect(next!.id).toBe('p2');
  });

  it('returns null when all phases are in the past', () => {
    const allPast: ElectionPhase[] = [
      { id: 'x1', title: 'Old Phase', date: '2000-01-01', description: '', isPast: true },
    ];
    expect(getNextPhase(allPast, TODAY)).toBeNull();
  });

  describe('default parameters', () => {
    it('uses current date if today is not provided', () => {
      const phases = [{ id: '1', title: 'Test', date: '2020-01-01', description: '' }];
      // partitionPhases
      const result = partitionPhases(phases);
      expect(result.past.length).toBe(1);
      
      // getNextPhase
      const next = getNextPhase(phases);
      expect(next).toBeNull();
      
      // daysUntil
      const days = daysUntil('2020-01-01');
      expect(days).toBeLessThan(0);
    });
  });
});

describe('daysUntil', () => {
  it('returns a positive number for a future date', () => {
    const result = daysUntil('2026-05-15', TODAY);
    expect(result).toBe(14);
  });

  it('returns 0 for today', () => {
    expect(daysUntil('2026-05-01', TODAY)).toBe(0);
  });

  it('returns a negative number for a past date', () => {
    const result = daysUntil('2026-04-01', TODAY);
    expect(result).toBeLessThan(0);
  });
});

describe('getDeadlineUrgency', () => {
  it('classifies negative days as overdue', () => {
    expect(getDeadlineUrgency(-1)).toBe('overdue');
  });

  it('classifies 0 days as urgent', () => {
    expect(getDeadlineUrgency(0)).toBe('urgent');
  });

  it('classifies 3 days as urgent', () => {
    expect(getDeadlineUrgency(3)).toBe('urgent');
  });

  it('classifies 7 days as soon', () => {
    expect(getDeadlineUrgency(7)).toBe('soon');
  });

  it('classifies 30 days as comfortable', () => {
    expect(getDeadlineUrgency(30)).toBe('comfortable');
  });
});

describe('sanitizeText', () => {
  it('strips HTML tags', () => {
    expect(sanitizeText('<script>alert("xss")</script>Hello')).toBe('Hello');
  });

  it('trims whitespace', () => {
    expect(sanitizeText('  Hello  ')).toBe('Hello');
  });

  it('leaves plain text unchanged', () => {
    expect(sanitizeText('No HTML here')).toBe('No HTML here');
  });

  it('handles empty string', () => {
    expect(sanitizeText('')).toBe('');
  });
});
