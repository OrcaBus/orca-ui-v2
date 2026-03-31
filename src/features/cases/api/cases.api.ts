/**
 * Cases feature API layer. Currently uses mock data; replace with real API calls when integrating backend.
 */
import {
  mockCases,
  mockLibraries,
  mockWorkflowRuns,
  mockFiles,
  type Case,
  type Library,
  type WorkflowRun,
  type File,
} from '../../../data/mockData';

export type { Case, Library, WorkflowRun, File };

export function getCases(): Case[] {
  return mockCases;
}

export function getCaseById(id: string): Case | undefined {
  return mockCases.find((c) => c.id === id);
}

export function getLibraries(): Library[] {
  return mockLibraries;
}

export function getWorkflowRuns(): WorkflowRun[] {
  return mockWorkflowRuns;
}

export function getFiles(): File[] {
  return mockFiles;
}
