import { Probot, Context } from "probot";
import {
  Handler,
  HandlerModule,
  Repository,
  Extension,
  Result,
} from "../common";
import { constructMetadata } from "../events/metadata";
import { documentationAllowedFileExts } from "../constant";

const check_run_name = `${process.env.APP_NAME} / check_pr_documentation_label`;
const title = "check if the 'documentation' label is present in the PR";

export = {
  name: check_run_name,
  description: title,
  handler: handler as Handler,
} as HandlerModule;

async function handler(
  event: string,
  context: Context<any>,
  app: Probot,
  repo: Repository,
  extension: Extension,
): Promise<Result> {
  const metadata = await constructMetadata(repo, event, context);

  // Log metadata
  app.log.info({ event });
  app.log.info(JSON.stringify(metadata));

  // Check starts
  app.log.info(title);

  try {
    let _status, _summary, _conclusion;

    // 1.1 Mark check_run as in_progress
    _status = "in_progress";
    const response = await extension.octokit.checks.create({
      owner: metadata.owner,
      repo: metadata.repo,
      name: check_run_name,
      head_sha: metadata.pull_request.sha,
      status: _status,
      started_at: new Date().toISOString(),
      output: {
        title: title,
        summary: `
### Summary

Processing
    `,
      },
    });

    const _check_run_id = response.data.id;
    app.log.info(`check_run ${_check_run_id} created`);

    // 1.2 Check if the documentation label is present in the PR
    // 1.2.1 List file changes in the PR
    const files = await extension.octokit.pulls
      .listFiles({
        owner: metadata.owner,
        repo: metadata.repo,
        pull_number: metadata.pull_request.number,
      })
      .then((res) => res.data.map((item) => item.filename));

    // 1.2.2 Check if files that match documentation related file extension. E.g. `*.md`
    if (
      files.filter((file) =>
        documentationAllowedFileExts.includes(file.split(".")[1]),
      ).length > 0
    ) {
      // 1.2.3 Check if 'documentation' label is present
      if (
        metadata.pull_request.labels
          .map((label: any) => label.name)
          .includes("documentation")
      ) {
        // valid format
        app.log.info(`Check passed, label 'documentation' is present, proceed`);
        // Update status
        _status = "completed";
        _conclusion = "success";
        _summary = `
### Summary

Passed
    `;
      } else {
        // invalid format
        app.log.info(
          `Check failed, label 'documentation' is not present, rejected`,
        );

        // Update status
        _status = "completed";
        _conclusion = "failure";
        _summary = `
### Summary

Your PR includes documentation-related changes. However, the 'documentation' label is not present in the PR, please add it to the PR.
    `;
      }
    } else {
      // condition not applicable
      const msg = "Condition not applicable, skipped";
      app.log.info(`${msg}`);
      _status = "completed";
      _conclusion = "skipped";
      _summary = `
### Summary

${msg}
    `;
    }

    // 1.3 Update check_run with summary and mark as completed
    await extension.octokit.checks.update({
      owner: metadata.owner,
      repo: metadata.repo,
      name: check_run_name,
      check_run_id: _check_run_id,
      status: _status,
      conclusion: _conclusion,
      completed_at: new Date().toISOString(),
      output: {
        title: title,
        summary: _summary,
      },
    });

    return { result: "ok!" };
  } catch (err) {
    console.error("Error process the request:", err);
    throw new Error("Failed to process");
  }
}
