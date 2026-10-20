import { describe, expect, it } from 'vitest';
import { formatBDT, formatCompactBDT, formatNumber, formatPercent, groupIndian, initials } from './format';

describe('format', () => {
  it('groups digits the Indian way', () => {
    expect(groupIndian('1234567')).toBe('12,34,567');
    expect(groupIndian('999')).toBe('999');
    expect(groupIndian('1000')).toBe('1,000');
  });

  it('formats paisa as taka', () => {
    expect(formatBDT(12345678)).toBe('৳1,23,456.78');
    expect(formatBDT(5)).toBe('৳0.05');
    expect(formatBDT(-150000)).toBe('-৳1,500.00');
    expect(formatBDT(150000, { decimals: false })).toBe('৳1,500');
  });

  it('formats compact amounts for KPI cards', () => {
    expect(formatCompactBDT(12_500_000_00)).toBe('৳1.25 Cr');
    expect(formatCompactBDT(250_000_00)).toBe('৳2.5 L');
    expect(formatCompactBDT(7_500_00)).toBe('৳7.5k');
    expect(formatCompactBDT(99_00)).toBe('৳99');
  });

  it('formats numbers, percentages and initials', () => {
    expect(formatNumber(1234567)).toBe('12,34,567');
    expect(formatPercent(0.1234)).toBe('+12.3%');
    expect(formatPercent(-0.05)).toBe('-5.0%');
    expect(initials('Akib Jafor')).toBe('AJ');
    expect(initials('Nusrat')).toBe('N');
  });
});
