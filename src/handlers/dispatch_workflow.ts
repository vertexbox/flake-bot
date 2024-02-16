import { Probot, Context } from "probot";
import {
  Handler,
  HandlerModule,
  Repository,
  Extension,
  Result,
} from "../common";
import { SYNC_WORKFLOW_NAME } from "../constant";

export = {
  name: "dispatch_workflow",
  description: "dispatch a workflow remotely",
  handler: handler as Handler,
} as HandlerModule;

async function handler(
  event: string,
  context: Context<any>,
  app: Probot,
  repo: Repository,
  extension: Extension,
): Promise<Result> {
  const payload = context.payload;
  // Log metadata
  const metadata = {
    ref: payload.ref,
    branch: payload.ref.split("/")[-1],
    default_branch: payload.repository.default_branch,
    html_url: payload.repository.html_url,
    sha: payload.after,
    repo: repo.name,
    owner: repo.owner,
  };
  app.log.info(JSON.stringify({ repo, event }));
  app.log.info(JSON.stringify(metadata));

  // Check starts
  app.log.info("Dispatch workflow remotely");

  try {
    // 1.2 Dispatch github workflow
    await extension.octokit.rest.actions.createWorkflowDispatch({
      owner: extension.sync.target.owner,
      repo: extension.sync.target.name,
      workflow_id: SYNC_WORKFLOW_NAME,
      ref: `refs/heads/${metadata.default_branch}`,
      inputs: {
        input: extension.sync.source,
      },
    });

    return { result: "ok!" };
  } catch (err) {
    console.error("Error process the request:", err);
    throw new Error("Failed to process");
  }
}
