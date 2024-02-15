import { Probot, Context } from "probot";
import {
  Handler,
  HandlerModule,
  Repository,
  Extension,
  Result,
} from "../common";
import { constructMetadata } from "../events/metadata";
import { checkerExemptionLabels } from "../constant";

const check_run_name = `${process.env.APP_NAME} / check_pr_tested_label`;

export = {
  name: check_run_name,
  description: "check if the 'tested' label is present in the PR",
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
  app.log.info("Check if 'tested' label is present");

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
        title: "Check if 'tested' label is present",
        summary: `
### Summary

Processing
    `,
      },
    });

    const _check_run_id = response.data.id;
    app.log.info(`check_run ${_check_run_id} created`);

    // 1.2.1 Check if the labels associated with the PR are in the exemption list
    if (
      metadata.pull_request.labels.some((label: any) =>
        checkerExemptionLabels.includes(label.name),
      )
    ) {
      // condition not applicable
      const msg = "Condition not applicable, skipped";
      app.log.info(`${msg}`);
      _status = "completed";
      _conclusion = "skipped";
      _summary = `
### Summary

${msg}
    `;
    } else {
      // 1.2.2 Check if the tested label is present in the PR
      if (
        metadata.pull_request.labels
          .map((label: any) => label.name)
          .includes("tested")
      ) {
        // valid format
        app.log.info(`Check passed, label 'tested' is present, proceed`);

        // Update status
        _status = "completed";
        _conclusion = "success";
        _summary = `
### Summary

Passed
    `;
      } else {
        // invalid format
        app.log.info(`Check failed, label 'tested' is not present, rejected`);

        // Update status
        _status = "completed";
        _conclusion = "failure";
        _summary = `
### Summary

The 'tested' label is not present in the PR, please perform some functional/unit tests before merging it.
    `;
      }
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
        title: "Check if 'tested' label is present",
        summary: _summary,
      },
    });

    return { result: "ok!" };
  } catch (err) {
    console.error("Error process the request:", err);
    throw new Error("Failed to process");
  }
}
