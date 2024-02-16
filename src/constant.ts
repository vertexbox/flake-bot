export const REPOS_IGNORE = process.env.REPOS_IGNORE as string;
export const SYNC_WORKFLOW_NAME =
  (process.env.SYNC_WORKFLOW_NAME as string) ?? "sync-upstream.yml";

export const RULESET_REMOTE_OWNER = process.env.RULESET_REMOTE_OWNER as string;
export const RULESET_REMOTE_REPO = process.env.RULESET_REMOTE_REPO as string;
export const RULESET_REMOTE_PATH = process.env.RULESET_REMOTE_PATH as string;
export const RULESET_REMOTE_REF = process.env.RULESET_REMOTE_REF as string;
