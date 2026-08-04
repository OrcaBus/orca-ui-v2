import config from '@/app/config';
import type { components, operations, paths } from '@/api/types/deploy-status.openapi.d.ts';
import { ApiClient, createQueryHook } from '@/api/client';

export type DeployStatusStack = components['schemas']['StackResponseDict'];
type RawDeployStatusStackSummary =
  | components['schemas']['StackSummaryResponseWithCfnOutputDict']
  | components['schemas']['StackSummaryResponseWithoutCfnOutputDict'];
type RawDeployStatusEvent =
  | components['schemas']['EventResponseWithCfnOutputDict']
  | components['schemas']['EventResponseWithoutCfnOutputDict'];

export type DeployStatusStackSummary = RawDeployStatusStackSummary & {
  gitCommitId?: string;
};
export type DeployStatusEvent = RawDeployStatusEvent & {
  gitCommitId?: string;
};

export type DeployStatusStackListResponse =
  operations['list_stacks_api_v1_deployStatus_listStacks_get']['responses']['200']['content']['application/json'];
export type DeployStatusStackSummaryResponse =
  operations['get_all_stacks_summary_api_v1_deployStatus_getAllStacksSummary_get']['responses']['200']['content']['application/json'];
export type DeployStatusEventListResponse =
  operations['list_events_for_stack_api_v1_deployStatus__stack_id__events_get']['responses']['200']['content']['application/json'];

const deployStatusApi = new ApiClient<paths>({
  baseUrl: config.apiEndpoint.deployStatus,
});

export const useDeployStatusStacks = createQueryHook(
  deployStatusApi,
  '/api/v1/deployStatus/listStacks'
);
export const useDeployStatusStackSummaries = createQueryHook(
  deployStatusApi,
  '/api/v1/deployStatus/getAllStacksSummary'
);
export const useDeployStatusStackEvents = createQueryHook(
  deployStatusApi,
  '/api/v1/deployStatus/{stack_id}/events'
);
