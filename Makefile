.PHONY: *

# Default from OrcaBus API
# https://github.com/umccr/orcabus#running-api-locally

# Set default values if not already set (default to dev)
VITE_METADATA_URL ?= https://metadata.dev.umccr.org
VITE_WORKFLOW_URL ?= https://workflow.dev.umccr.org
VITE_SEQUENCE_RUN_URL ?= https://sequence.dev.umccr.org
VITE_FILE_URL ?= https://file.dev.umccr.org
VITE_SSCHECK_URL ?= https://sscheck-orcabus.dev.umccr.org
VITE_HTSGET_URL ?= https://htsget-file.dev.umccr.org
VITE_CASE_URL ?= https://case.dev.umccr.org

# Export the variables
export VITE_METADATA_URL
export VITE_WORKFLOW_URL
export VITE_FILE_URL
export VITE_SSCHECK_URL
export VITE_SEQUENCE_RUN_URL
export VITE_HTSGET_URL
export VITE_CASE_URL

generate-openapi-types:
	@echo "Generating Metadata OpenAPI types from ${VITE_METADATA_URL}..."
	@pnpm exec openapi-typescript ${VITE_METADATA_URL}/schema/openapi.json -o ./src/api/types/metadata.openapi.d.ts
	@echo "Generating Sequence Run OpenAPI types from ${VITE_SEQUENCE_RUN_URL}..."
	@pnpm exec openapi-typescript ${VITE_SEQUENCE_RUN_URL}/schema/openapi.json -o ./src/api/types/sequence-run.openapi.d.ts
	@echo "Generating Workflow OpenAPI types from ${VITE_WORKFLOW_URL}..."
	@pnpm exec openapi-typescript ${VITE_WORKFLOW_URL}/schema/openapi.json -o ./src/api/types/workflow.openapi.d.ts
	@echo "Generating File OpenAPI types from ${VITE_FILE_URL}..."
	@pnpm exec openapi-typescript ${VITE_FILE_URL}/schema/openapi.json -o ./src/api/types/file.openapi.d.ts
	@echo "Generating Case OpenAPI types from ${VITE_CASE_URL}..."
	@pnpm exec openapi-typescript ${VITE_CASE_URL}/schema/openapi.json -o ./src/api/types/case.openapi.d.ts

start: generate-openapi-types
	@pnpm run start

deploy-dev:
	@pnpm build
	@aws s3 cp ./build s3://orcaui-v2-cloudfront-843407916570/v2/ --recursive
	@aws lambda invoke \
    --function-name CodeBuildEnvConfigLambdaBeta \
    response.json

storybook:
	@pnpm run storybook

install:
	@pnpm install
	@pre-commit install

lint:
	@pnpm lint

lint-fix:
	@pnpm lint:fix

format:
	@pnpm format

format-check:
	@pnpm format:check

