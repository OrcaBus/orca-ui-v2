import { env } from '@/utils/env';

const REGION = env.VITE_REGION as string;
const OAUTH_DOMAIN = `${env.VITE_OAUTH_DOMAIN as string}.auth.${REGION}.amazoncognito.com`;

const config = {
  region: REGION,
  apiEndpoint: {
    metadata: env.VITE_METADATA_URL as string,
    workflow: env.VITE_WORKFLOW_URL as string,
    sequenceRun: env.VITE_SEQUENCE_RUN_URL as string,
    file: env.VITE_FILE_URL as string,
    sscheck: env.VITE_SSCHECK_URL as string,
    htsget: env.VITE_HTSGET_URL as string,
    case: env.VITE_CASE_URL as string,
  },
  cognito: {
    REGION: REGION,
    USER_POOL_ID: env.VITE_COG_USER_POOL_ID as string,
    APP_CLIENT_ID: env.VITE_COG_APP_CLIENT_ID as string,
    OAUTH: {
      domain: OAUTH_DOMAIN,
      scopes: ['email', 'openid', 'aws.cognito.signin.user.admin', 'profile'],
      redirectSignIn: [env.VITE_OAUTH_REDIRECT_IN as string],
      redirectSignOut: [env.VITE_OAUTH_REDIRECT_OUT as string],
      responseType: 'code' as const,
    },
  },
};

export default config;

export { REGION };
