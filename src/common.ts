import { Probot, ProbotOctokit, Context } from "probot";

export { Handler, HandlerModule, Repository, Extension, Result };

interface Handler {
  (
    event: string,
    context: Context<any>,
    app: Probot,
    repo: Repository,
    extension: Extension,
  ): Promise<Result>;
}

interface HandlerModule {
  event: string;
  name: string;
  description: string;
  handler: Handler;
}

type Extension = {
  octokit: InstanceType<typeof ProbotOctokit>;
  sync: Sync;
};

type Sync = {
  source: string;
  target: SyncTarget;
};

type SyncTarget = Repository;

type Repository = {
  owner: string;
  name: string;
};

type Result = {
  result: string;
  error?: string;
};
