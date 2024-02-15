import { Repository, Result, HandlerModule } from "./common";
import { HandlerModules } from "./config";
import { Context, Probot } from "probot";

export default async (
  context: Context<any>,
  app: Probot,
  event: string,
): Promise<Result> => {
  const modules: HandlerModule[] = HandlerModules;
  const extension = {
    octokit: context.octokit,
  };
  const repo: Repository = {
    name: context.payload.repository.name,
    owner: context.payload.organization?.login as string,
  };

  try {
    await Promise.all(
      modules.map(
        async (module: HandlerModule) =>
          await context.octokit.checks.create({
            owner: repo.owner,
            repo: repo.name,
            name: module.name,
            head_sha:
              event.split(".")[0] === "pull_request"
                ? context.payload.pull_request.head.sha
                : context.payload.check_run.check_suite.pull_requests[0].head
                    .sha,
            status: "queued",
            started_at: new Date().toISOString(),
          }),
      ),
    );

    await Promise.all(
      modules.map((module: HandlerModule) =>
        module.handler(event, context, app, repo, extension),
      ),
    );
    return { result: "ok" };
  } catch (err) {
    console.error("Error process the request:", err);
    throw new Error("Failed to process");
  }
};
