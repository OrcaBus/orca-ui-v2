import { tryPrettyJson } from '@/utils/json';
import type {
  EdgeDef,
  WorkflowConfig,
  WorkflowFormData,
  WorkflowNodeData,
  WorkflowParentLink,
} from '../types/workflow-catalog.types';

export function parseWorkflowConfigJson(raw: string): WorkflowConfig | null {
  const trimmed = raw.trim();
  if (!trimmed) return {};

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return null;
  }

  if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
    return null;
  }

  const entries = Object.entries(parsed);
  if (entries.some(([key, value]) => !key.trim() || typeof value !== 'string')) {
    return null;
  }

  return Object.fromEntries(entries.map(([key, value]) => [key.trim(), value]));
}

export function configToJson(config: WorkflowConfig): string {
  return tryPrettyJson(JSON.stringify(config));
}

export function getParentLinksForWorkflow(
  workflowId: string,
  catalogEdges: EdgeDef[]
): WorkflowParentLink[] {
  return catalogEdges
    .filter((edge) => edge.target === workflowId)
    .map((edge) => ({ workflowId: edge.source, edgeType: edge.edgeType }));
}

export function buildParentEdges(
  targetId: string,
  parentLinks: WorkflowParentLink[],
  existingEdges: EdgeDef[] = []
): EdgeDef[] {
  return parentLinks.map((parentLink) => {
    const existingEdge = existingEdges.find(
      (edge) =>
        edge.source === parentLink.workflowId &&
        edge.target === targetId &&
        edge.edgeType === parentLink.edgeType
    );

    return {
      id: `e-${parentLink.workflowId}-${targetId}`,
      source: parentLink.workflowId,
      target: targetId,
      edgeType: parentLink.edgeType,
      ...(existingEdge?.label ? { label: existingEdge.label } : {}),
    };
  });
}

export function workflowNodeToFormData(
  workflowId: string,
  workflow: WorkflowNodeData,
  catalogEdges: EdgeDef[]
): WorkflowFormData {
  return {
    name: workflow.label,
    version: workflow.version,
    engine: workflow.engine,
    groupId: workflow.groupIds[0] ?? '',
    parentLinks: getParentLinksForWorkflow(workflowId, catalogEdges),
    description: workflow.description,
    configJson: configToJson(workflow.tags),
  };
}
