import { Probot, Context } from "probot";
import {
  Handler,
  HandlerModule,
  Repository,
  Extension,
  Result,
} from "../common";
import { WORKFLOW_DISPATCH_REPO, WORKFLOW_DISPATCH_OWNER } from "../constant";

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
    // 1.1 Extract sync source from metadata
    const syncSource = repo.name.split("-")[1];
    // 1.2 Dispatch github workflow
    await extension.octokit.rest.actions.createWorkflowDispatch({
      owner: WORKFLOW_DISPATCH_OWNER,
      repo: WORKFLOW_DISPATCH_REPO,
      workflow_id: "sync-upstream.yml",
      ref: "refs/heads/master",
      inputs: {
        input: syncSource,
      },
    });

    return { result: "ok!" };
  } catch (err) {
    console.error("Error process the request:", err);
    throw new Error("Failed to process");
  }
}
