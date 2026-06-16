import { describe, it, expect } from 'vitest';
import { unwrapResponseBody } from './leapify';

describe('unwrapResponseBody', () => {
  it('returns null when data key is null (not registered)', () => {
    expect(unwrapResponseBody({ data: null })).toBe(null);
  });

  it('returns data value when data key is present', () => {
    const reg = { slug: 'class-a', eventId: 'e1', submittedAt: 1234567890 };
    expect(unwrapResponseBody({ data: reg })).toEqual(reg);
  });

  it('returns body as-is when no data key (non-envelope response)', () => {
    const raw = { slug: 'class-a' };
    expect(unwrapResponseBody(raw)).toEqual(raw);
  });

  it('returns undefined when data key is undefined', () => {
    expect(unwrapResponseBody({ data: undefined })).toBe(undefined);
  });

  it('returns primitive body as-is', () => {
    expect(unwrapResponseBody('ok')).toBe('ok');
    expect(unwrapResponseBody(42)).toBe(42);
  });

  it('returns null body as-is', () => {
    expect(unwrapResponseBody(null)).toBe(null);
  });
});
