import { describe, expect, it } from 'vitest';
import { formatSpaceCase, getFilenameFromKey, getUsername } from '../string';

describe('getUsername', () => {
  it('extracts and formats username from dotted email local part', () => {
    expect(getUsername('test.name@example.com')).toBe('Test Name');
  });
});

describe('formatSpaceCase', () => {
  it('inserts spaces before capitals and title-cases output', () => {
    expect(formatSpaceCase('workflowRunId')).toBe('Workflow Run Id');
  });
});

describe('getFilenameFromKey', () => {
  it('returns filename from a slash-delimited key', () => {
    expect(getFilenameFromKey('path/to/file.txt')).toBe('file.txt');
  });

  it('returns an empty string for trailing slash keys', () => {
    expect(getFilenameFromKey('path/to/')).toBe('');
  });
});
