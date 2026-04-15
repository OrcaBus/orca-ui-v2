/**
 * ════════════════════════════════════════════════════════════════════════════
 * DynamoDB Table Design — System Catalog Service
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Table Name: SystemCatalog
 *
 * ┌────────────────────────────────────────────────────────────────────────┐
 * │ Key Schema                                                            │
 * ├─────────────┬──────────────────────────────────────────────────────────┤
 * │ PK (String) │ Tenant / catalog version.  e.g. "CATALOG_V1"           │
 * │ SK (String) │ Entity type + ID.  e.g. "MAP#umccr-production"     │
 * └─────────────┴──────────────────────────────────────────────────────────┘
 *
 * ┌────────────────────────────────────────────────────────────────────────┐
 * │ GSI-1: StatusIndex (for list/filter)                                  │
 * ├─────────────────┬──────────────────────────────────────────────────────┤
 * │ GSI1PK (String)  │ "STATUS#active"  or "STATUS#draft"                │
 * │ GSI1SK (String)  │ "UPDATED#2026-04-14T00:00:00Z#umccr-production"   │
 * └─────────────────┴──────────────────────────────────────────────────────┘
 *   → Enables: "List all active maps, sorted by last updated"
 *   → Enables: "List all draft maps"
 *   → Enables: "List all archived maps"
 *
 * ════════════════════════════════════════════════════════════════════════════
 * Design Rationale
 * ════════════════════════════════════════════════════════════════════════════
 *
 * SINGLE-DOCUMENT model: Each map is ONE DynamoDB item containing
 * its nodes, groups, edges, and layout embedded as arrays/maps.
 *
 * Why single-document (not normalized)?
 *  1. A map is always loaded as a whole (the ReactFlow canvas needs
 *     all nodes + edges + layout at once). No partial loading use case.
 *  2. Max item size: 400KB. A map with 50 nodes × ~2KB each = ~100KB.
 *     Even with rich event payloads we stay well under the limit.
 *  3. Writes are map-level (save button saves the entire canvas state).
 *     No need for fine-grained item-level mutations.
 *  4. Simpler transactions: Create/update/delete a map = 1 PutItem.
 *
 * When would you split?
 *  - If maps exceed ~300 nodes (approaching 400KB).
 *  - If you need independent versioning of individual nodes.
 *  - Neither applies to this use case.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * Access Patterns
 * ════════════════════════════════════════════════════════════════════════════
 *
 *  #  │ Access Pattern                          │ Key Condition
 *  ───┼─────────────────────────────────────────┼──────────────────────────
 *  1  │ List all maps (summaries)           │ PK = "CATALOG_V1",
 *     │                                         │ SK begins_with "MAP#"
 *     │                                         │ ProjectionExpression on
 *     │                                         │ summary fields only
 *  ───┼─────────────────────────────────────────┼──────────────────────────
 *  2  │ Get full map                        │ PK = "CATALOG_V1",
 *     │                                         │ SK = "MAP#<mapId>"
 *  ───┼─────────────────────────────────────────┼──────────────────────────
 *  3  │ Filter maps by status               │ GSI1PK = "STATUS#active",
 *     │ (sorted by updatedAt)                   │ GSI1SK begins_with "UPDATED#"
 *  ───┼─────────────────────────────────────────┼──────────────────────────
 *  4  │ Create map                          │ PutItem (condition: SK
 *     │                                         │ attribute_not_exists)
 *  ───┼─────────────────────────────────────────┼──────────────────────────
 *  5  │ Update map (full replace)           │ PutItem
 *  ───┼─────────────────────────────────────────┼──────────────────────────
 *  6  │ Update map metadata only            │ UpdateExpression SET
 *     │ (name, description, status, tags)       │ name = :n, status = :s ...
 *     │                                         │ ConditionExpression:
 *     │                                         │ version = :expectedVersion
 *  ───┼─────────────────────────────────────────┼──────────────────────────
 *  7  │ Soft-delete map                     │ UpdateExpression SET
 *     │                                         │ isDeleted = true,
 *     │                                         │ version = version + 1
 *     │                                         │ ConditionExpression:
 *     │                                         │ version = :expectedVersion
 *  ───┼─────────────────────────────────────────┼──────────────────────────
 *  8  │ List history for a map              │ PK = "CATALOG_V1",
 *     │                                         │ SK begins_with
 *     │                                         │ "HISTORY#<mapId>#"
 *  ───┼─────────────────────────────────────────┼──────────────────────────
 *  9  │ Get history snapshot                │ PK = "CATALOG_V1",
 *     │                                         │ SK = "HISTORY#<mapId>#
 *     │                                         │         <historyId>"
 *  ───┼─────────────────────────────────────────┼──────────────────────────
 */

// ─── Enums ────────────────────────────────────────────────────────────────

export type MapNodeType =
  | 'pipeline'
  | 'aws_lambda'
  | 'aws_eks'
  | 'aws_step_function'
  | 'aws_event_bridge'
  | 'aws_batch'
  | 'aws_s3'
  | 'aws_sqs'
  | 'aws_sns'
  | 'external_service'
  | 'ica_pipeline'
  | 'rest_api_service'
  | 'execution_service';

export type MapEdgeType =
  | 'trigger'
  | 'trigger_input'
  | 'input_dependency'
  | 'event_publish'
  | 'event_subscribe'
  | 'state_change'
  | 'execution_request'
  | 'rest_call';

export type MapStatus = 'active' | 'draft' | 'archived';

export type GroupType = 'infrastructure' | 'ingestion' | 'analysis' | 'flows' | 'service';

export type HistoryChangeType =
  | 'created'
  | 'metadata_updated'
  | 'content_saved'
  | 'content_patched'
  | 'node_added'
  | 'node_updated'
  | 'node_deleted'
  | 'group_added'
  | 'group_updated'
  | 'group_deleted'
  | 'edge_added'
  | 'edge_updated'
  | 'edge_deleted'
  | 'soft_deleted'
  | 'restored';

// ─── Embedded Sub-Documents ───────────────────────────────────────────────

export interface MapNode {
  /** Unique within the map. Used as ReactFlow node id. */
  nodeId: string;
  nodeType: MapNodeType;
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

export interface MapGroup {
  groupId: string;
  name: string;
  description?: string;
  type: GroupType;
  color: string;
  /** Node IDs belonging to this group. */
  nodeIds: string[];
}

export interface MapEdge {
  edgeId: string;
  source: string;
  target: string;
  edgeType: MapEdgeType;
  label?: string;
}

// ─── DynamoDB Item ────────────────────────────────────────────────────────

export interface DynamoDBMapItem {
  /** Partition key: "CATALOG_V1" */
  PK: string;
  /** Sort key: "MAP#<mapId>" */
  SK: string;

  /** GSI-1 partition key: "STATUS#<status>" */
  GSI1PK: string;
  /** GSI-1 sort key: "UPDATED#<ISO8601>#<mapId>" */
  GSI1SK: string;

  entityType: 'MAP';

  // ── Summary fields (projected in list queries) ──
  mapId: string;
  name: string;
  description: string;
  status: MapStatus;
  createdBy: string;
  createdAt: string; // ISO 8601
  updatedBy: string;
  updatedAt: string; // ISO 8601
  tags: Record<string, string>;
  /** Auto-incremented on each write. Used for optimistic concurrency (ETag / If-Match). */
  version: number;
  /** Soft-delete flag. Excluded from list queries by default. */
  isDeleted: boolean;
  /** Denormalized counts for list queries (avoids projecting full arrays into GSI). */
  nodeCount: number;
  edgeCount: number;

  // ── Full map content ──
  nodes: MapNode[];
  groups: MapGroup[];
  edges: MapEdge[];
  /** Engine name → hex color for consistent UI rendering. */
  engineColors: Record<string, string>;
}

// ─── Derived Types (API responses) ────────────────────────────────────────

/** Lightweight shape returned by GET /maps (list endpoint). */
export interface MapSummary {
  mapId: string;
  name: string;
  description: string;
  status: MapStatus;
  version: number;
  isDeleted: boolean;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  nodeCount: number;
  edgeCount: number;
  tags: Record<string, string>;
}

/** Full shape returned by GET /maps/:id. */
export interface MapFull {
  mapId: string;
  name: string;
  description: string;
  status: MapStatus;
  version: number;
  isDeleted: boolean;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  tags: Record<string, string>;
  nodes: MapNode[];
  groups: MapGroup[];
  edges: MapEdge[];
  engineColors: Record<string, string>;
}

// ─── History Item ─────────────────────────────────────────────────────────

/** Audit trail entry stored alongside maps in the same table. */
export interface MapHistoryEntry {
  historyId: string;
  mapId: string;
  version: number;
  changeType: HistoryChangeType;
  changedBy: string;
  changedAt: string; // ISO 8601
  summary: string;
}

/**
 * DynamoDB item for history entries.
 * SK pattern: "HISTORY#<mapId>#<historyId>"
 * Enables range queries: SK begins_with "HISTORY#<mapId>#"
 */
export interface DynamoDBHistoryItem {
  PK: string; // "CATALOG_V1"
  SK: string; // "HISTORY#<mapId>#<historyId>"
  entityType: 'HISTORY';
  historyId: string;
  mapId: string;
  version: number;
  changeType: HistoryChangeType;
  changedBy: string;
  changedAt: string;
  summary: string;
  /** Optional: full map snapshot at this point for restore capability. */
  snapshot?: Omit<DynamoDBMapItem, 'PK' | 'SK' | 'GSI1PK' | 'GSI1SK' | 'entityType'>;
}

// ─── CDK Table Definition (reference) ─────────────────────────────────────

/**
 * AWS CDK definition (for reference):
 *
 * ```typescript
 * const table = new dynamodb.Table(this, 'SystemCatalog', {
 *   tableName: 'SystemCatalog',
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
 *     'mapId', 'name', 'description', 'status',
 *     'version', 'isDeleted',
 *     'createdBy', 'createdAt', 'updatedBy', 'updatedAt',
 *     'tags', 'nodeCount', 'edgeCount',
 *   ],
 * });
 * ```
 */
