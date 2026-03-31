import { describe, expect, it } from 'vitest';
import { tryPrettyJson } from '../json';

describe('tryPrettyJson', () => {
  it('pretty prints valid JSON strings', () => {
    const result = tryPrettyJson('{"name":"ray","nested":{"count":2}}');
    expect(result).toBe('{\n  "name": "ray",\n  "nested": {\n    "count": 2\n  }\n}');
  });

  it('returns "{}" for empty input', () => {
    expect(tryPrettyJson('   ')).toBe('{}');
  });

  it('returns original string when JSON is invalid', () => {
    expect(tryPrettyJson('{invalid')).toBe('{invalid');
  });
});
