import { describe, expect, it } from 'vitest';
import {
  createDataTablePersistedSettings,
  getDataTableSettingsStorageKey,
  getVisibleColumnKeysFromPersistedSettings,
  normalizeDataTablePersistedSettings,
  type Column,
} from '../DataTable';

type Row = Record<string, string>;

const workflowRunColumns: Column<Row>[] = [
  { key: 'name', header: 'Workflow Run Name' },
  { key: 'portalRunId', header: 'Portal Run ID' },
  { key: 'workflowType', header: 'Workflow Type' },
  { key: 'status', header: 'Status' },
  { key: 'lastModified', header: 'Last Modified' },
  { key: 'actions', header: 'Actions' },
];

const fileColumns: Column<Row>[] = [
  { key: 'key', header: 'File Name' },
  { key: 'actions', header: 'Actions' },
  { key: 'bucket', header: 'Bucket Name' },
  { key: 'size', header: 'Size' },
  { key: 'lastModifiedDate', header: 'Last Modified' },
];

describe('DataTable column visibility helpers', () => {
  it('builds a namespaced local storage key from the table settings key', () => {
    expect(getDataTableSettingsStorageKey('lab.libraries')).toBe(
      'orcabus:data-table:lab.libraries:settings'
    );
  });

  it('stores all column keys and hidden column keys in a JSON-safe shape', () => {
    const settings = createDataTablePersistedSettings(fileColumns, new Set(['key', 'size']));

    expect(settings.columnKeys).toEqual(['key', 'actions', 'bucket', 'size', 'lastModifiedDate']);
    expect(settings.hiddenColumnKeys).toEqual(['actions', 'bucket', 'lastModifiedDate']);
    expect(settings.hiddenColumnKeys).not.toBeInstanceOf(Set);
    expect('visibleColumnKeys' in settings).toBe(false);
    expect('columnKeySignature' in settings).toBe(false);
    expect('expiresAtMs' in settings).toBe(false);
  });

  it('preserves hidden keys when the same table kind opens with the same columns', () => {
    const savedSettings = createDataTablePersistedSettings(
      workflowRunColumns,
      new Set(['name', 'portalRunId', 'workflowType', 'status', 'lastModified'])
    );
    const normalized = normalizeDataTablePersistedSettings(savedSettings, workflowRunColumns);

    expect(normalized).toEqual(savedSettings);
    expect(
      Array.from(getVisibleColumnKeysFromPersistedSettings(normalized, workflowRunColumns))
    ).toEqual(['name', 'portalRunId', 'workflowType', 'status', 'lastModified']);
  });

  it('renews current column keys but keeps hidden keys that still exist', () => {
    const savedSettings = {
      columnKeys: ['name', 'actions', 'obsolete'],
      hiddenColumnKeys: ['actions', 'obsolete'],
    };
    const nextColumns: Column<Row>[] = [
      { key: 'name', header: 'Workflow Run Name' },
      { key: 'portalRunId', header: 'Portal Run ID' },
      { key: 'actions', header: 'Actions' },
      { key: 'status', header: 'Status' },
    ];
    const normalized = normalizeDataTablePersistedSettings(savedSettings, nextColumns);

    expect(normalized).toEqual({
      columnKeys: ['name', 'portalRunId', 'actions', 'status'],
      hiddenColumnKeys: ['actions'],
    });
    expect(Array.from(getVisibleColumnKeysFromPersistedSettings(normalized, nextColumns))).toEqual([
      'name',
      'portalRunId',
      'status',
    ]);
  });

  it('shows new or renamed columns by default', () => {
    const previousSettings = {
      columnKeys: ['key', 'actions', 'bucket'],
      hiddenColumnKeys: ['actions'],
    };
    const nextColumns: Column<Row>[] = [
      { key: 'key', header: 'File Name' },
      { key: 'size', header: 'Size' },
      { key: 'etag', header: 'ETag' },
      { key: 'actions', header: 'Actions' },
    ];
    const normalized = normalizeDataTablePersistedSettings(previousSettings, nextColumns);

    expect(normalized).toEqual({
      columnKeys: ['key', 'size', 'etag', 'actions'],
      hiddenColumnKeys: ['actions'],
    });
    expect(Array.from(getVisibleColumnKeysFromPersistedSettings(normalized, nextColumns))).toEqual([
      'key',
      'size',
      'etag',
    ]);
  });

  it('resets malformed or old saved shapes to all current columns visible', () => {
    const oldSignatureSettings = {
      columnKeySignature: 'name\u001factions',
      visibleColumnKeys: ['name'],
    };
    const normalized = normalizeDataTablePersistedSettings(
      oldSignatureSettings,
      workflowRunColumns
    );

    expect(normalized).toEqual({
      columnKeys: ['name', 'portalRunId', 'workflowType', 'status', 'lastModified', 'actions'],
      hiddenColumnKeys: [],
    });
    expect(
      Array.from(getVisibleColumnKeysFromPersistedSettings(normalized, workflowRunColumns))
    ).toEqual(['name', 'portalRunId', 'workflowType', 'status', 'lastModified', 'actions']);
  });

  it('strips legacy extra settings while preserving valid hidden keys', () => {
    const settings = {
      columnKeys: ['key', 'actions', 'bucket', 'size', 'lastModifiedDate'],
      hiddenColumnKeys: ['actions'],
      expiresAtMs: 3500,
    };
    const normalized = normalizeDataTablePersistedSettings(settings, fileColumns);

    expect(normalized).toEqual({
      columnKeys: ['key', 'actions', 'bucket', 'size', 'lastModifiedDate'],
      hiddenColumnKeys: ['actions'],
    });
    expect(Array.from(getVisibleColumnKeysFromPersistedSettings(normalized, fileColumns))).toEqual([
      'key',
      'bucket',
      'size',
      'lastModifiedDate',
    ]);
  });
});
