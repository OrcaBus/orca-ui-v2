/**
 * ════════════════════════════════════════════════════════════════════════════
 * DynamoDB Table Design — Workflow Catalog Service
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Table Name: WorkflowCatalog
 *
 * ┌────────────────────────────────────────────────────────────────────────┐
 * │ Key Schema                                                            │
 * ├─────────────┬──────────────────────────────────────────────────────────┤
 * │ PK (String) │ Tenant / catalog version.  e.g. "CATALOG_V1"           │
 * │ SK (String) │ Entity type + ID.  e.g. "DIAGRAM#umccr-production"     │
 * └─────────────┴──────────────────────────────────────────────────────────┘
 *
 * ┌────────────────────────────────────────────────────────────────────────┐
 * │ GSI-1: StatusIndex (for list/filter)                                  │
 * ├─────────────────┬──────────────────────────────────────────────────────┤
 * │ GSI1PK (String)  │ "STATUS#active"  or "STATUS#draft"                │
 * │ GSI1SK (String)  │ "UPDATED#2026-04-14T00:00:00Z#umccr-production"   │
 * └─────────────────┴──────────────────────────────────────────────────────┘
 *   → Enables: "List all active diagrams, sorted by last updated"
 *   → Enables: "List all draft diagrams"
 *   → Enables: "List all archived diagrams"
 *
 * ════════════════════════════════════════════════════════════════════════════
 * Design Rationale
 * ════════════════════════════════════════════════════════════════════════════
 *
 * SINGLE-DOCUMENT model: Each diagram is ONE DynamoDB item containing
 * its nodes, groups, edges, and layout embedded as arrays/maps.
 *
 * Why single-document (not normalized)?
 *  1. A diagram is always loaded as a whole (the ReactFlow canvas needs
 *     all nodes + edges + layout at once). No partial loading use case.
 *  2. Max item size: 400KB. A diagram with 50 nodes × ~2KB each = ~100KB.
 *     Even with rich event payloads we stay well under the limit.
 *  3. Writes are diagram-level (save button saves the entire canvas state).
 *     No need for fine-grained item-level mutations.
 *  4. Simpler transactions: Create/update/delete a diagram = 1 PutItem.
 *
 * When would you split?
 *  - If diagrams exceed ~300 nodes (approaching 400KB).
 *  - If you need independent versioning of individual nodes.
 *  - Neither applies to this use case.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * Access Patterns
 * ════════════════════════════════════════════════════════════════════════════
 *
 *  #  │ Access Pattern                          │ Key Condition
 *  ───┼─────────────────────────────────────────┼──────────────────────────
 *  1  │ List all diagrams (summaries)           │ PK = "CATALOG_V1",
 *     │                                         │ SK begins_with "DIAGRAM#"
 *     │                                         │ ProjectionExpression on
 *     │                                         │ summary fields only
 *  ───┼─────────────────────────────────────────┼──────────────────────────
 *  2  │ Get full diagram                        │ PK = "CATALOG_V1",
 *     │                                         │ SK = "DIAGRAM#<diagramId>"
 *  ───┼─────────────────────────────────────────┼──────────────────────────
 *  3  │ Filter diagrams by status               │ GSI1PK = "STATUS#active",
 *     │ (sorted by updatedAt)                   │ GSI1SK begins_with "UPDATED#"
 *  ───┼─────────────────────────────────────────┼──────────────────────────
 *  4  │ Create diagram                          │ PutItem (condition: SK
 *     │                                         │ attribute_not_exists)
 *  ───┼─────────────────────────────────────────┼──────────────────────────
 *  5  │ Update diagram (full replace)           │ PutItem
 *  ───┼─────────────────────────────────────────┼──────────────────────────
 *  6  │ Update diagram metadata only            │ UpdateExpression SET
 *     │ (name, description, status, tags)       │ name = :n, status = :s ...
 *  ───┼─────────────────────────────────────────┼──────────────────────────
 *  7  │ Delete diagram                          │ DeleteItem
 *  ───┼─────────────────────────────────────────┼──────────────────────────
 */

// ─── Enums ────────────────────────────────────────────────────────────────

export type DiagramNodeType =
  | 'workflow'
  | 'aws_lambda'
  | 'aws_eks'
  | 'aws_step_function'
  | 'aws_event_bridge'
  | 'aws_batch'
  | 'aws_s3'
  | 'aws_sqs'
  | 'aws_sns'
  | 'external_service';

export type DiagramEdgeType = 'trigger' | 'trigger_input' | 'input_dependency';

export type DiagramStatus = 'active' | 'draft' | 'archived';

export type GroupType = 'analysis' | 'flows' | 'service';

// ─── Embedded Sub-Documents ───────────────────────────────────────────────

export interface DiagramNode {
  /** Unique within the diagram. Used as ReactFlow node id. */
  nodeId: string;
  nodeType: DiagramNodeType;
  label: string;
  version: string;
  engine: string;
  description: string;
  /** Group IDs this node belongs to (many-to-many). */
  groupIds: string[];
  inputEvents: EventDef[];
  outputEvents: EventDef[];
  /** Arbitrary key-value pairs. */
  tags: Record<string, string>;
  /** Canvas position in pixels. */
  position: { x: number; y: number };
}

export interface EventDef {
  name: string;
  topic?: string;
  condition?: string;
  payload: Record<string, unknown>;
}

export interface DiagramGroup {
  groupId: string;
  name: string;
  type: GroupType;
  color: string;
  /** Node IDs belonging to this group. */
  nodeIds: string[];
}

export interface DiagramEdge {
  edgeId: string;
  source: string;
  target: string;
  edgeType: DiagramEdgeType;
  label?: string;
}

// ─── DynamoDB Item ────────────────────────────────────────────────────────

export interface DynamoDBDiagramItem {
  /** Partition key: "CATALOG_V1" */
  PK: string;
  /** Sort key: "DIAGRAM#<diagramId>" */
  SK: string;

  /** GSI-1 partition key: "STATUS#<status>" */
  GSI1PK: string;
  /** GSI-1 sort key: "UPDATED#<ISO8601>#<diagramId>" */
  GSI1SK: string;

  entityType: 'DIAGRAM';

  // ── Summary fields (projected in list queries) ──
  diagramId: string;
  name: string;
  description: string;
  status: DiagramStatus;
  createdBy: string;
  createdAt: string; // ISO 8601
  updatedBy: string;
  updatedAt: string; // ISO 8601
  tags: Record<string, string>;
  /** Denormalized counts for list queries (avoids projecting full arrays into GSI). */
  nodeCount: number;
  edgeCount: number;

  // ── Full diagram content ──
  nodes: DiagramNode[];
  groups: DiagramGroup[];
  edges: DiagramEdge[];
}

// ─── Derived Types (API responses) ────────────────────────────────────────

/** Lightweight shape returned by GET /diagrams (list endpoint). */
export interface DiagramSummary {
  diagramId: string;
  name: string;
  description: string;
  status: DiagramStatus;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  nodeCount: number;
  edgeCount: number;
  tags: Record<string, string>;
}

/** Full shape returned by GET /diagrams/:id. */
export interface DiagramFull {
  diagramId: string;
  name: string;
  description: string;
  status: DiagramStatus;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  tags: Record<string, string>;
  nodes: DiagramNode[];
  groups: DiagramGroup[];
  edges: DiagramEdge[];
}

// ─── CDK Table Definition (reference) ─────────────────────────────────────

/**
 * AWS CDK definition (for reference):
 *
 * ```typescript
 * const table = new dynamodb.Table(this, 'WorkflowCatalog', {
 *   tableName: 'WorkflowCatalog',
 *   partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
 *   sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
 *   billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
 *   pointInTimeRecovery: true,
 *   removalPolicy: RemovalPolicy.RETAIN,
 * });
 *
 * table.addGlobalSecondaryIndex({
 *   indexName: 'StatusIndex',
 *   partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },
 *   sortKey: { name: 'GSI1SK', type: dynamodb.AttributeType.STRING },
 *   projectionType: dynamodb.ProjectionType.INCLUDE,
 *   nonKeyAttributes: [
 *     'diagramId', 'name', 'description', 'status',
 *     'createdBy', 'createdAt', 'updatedBy', 'updatedAt',
 *     'tags', 'nodeCount', 'edgeCount',
 *   ],
 * });
 * ```
 */
