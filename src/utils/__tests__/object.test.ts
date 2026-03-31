import { describe, expect, it } from 'vitest';
import { cleanObject, getQueryParams, omit } from '../object';

describe('omit', () => {
  it('removes requested keys and keeps others', () => {
    const source = { id: 1, name: 'Case A', status: 'open' };
    expect(omit(source, ['status'])).toEqual({ id: 1, name: 'Case A' });
  });
});

describe('cleanObject', () => {
  it('removes undefined, null and empty string values', () => {
    const source = {
      keepNumber: 0,
      keepFalse: false,
      removeUndefined: undefined,
      removeNull: null,
      removeEmpty: '',
      keepText: 'value',
    };

    expect(cleanObject(source)).toEqual({
      keepNumber: 0,
      keepFalse: false,
      keepText: 'value',
    });
  });
});

describe('getQueryParams', () => {
  it('maps single params into values and repeated params into arrays', () => {
    const searchParams = new URLSearchParams('status=open&status=closed&page=2');
    expect(getQueryParams(searchParams)).toEqual({
      status: ['open', 'closed'],
      page: '2',
    });
  });
});
