import { Probot, Context } from "probot";
import {
  Handler,
  HandlerModule,
  Repository,
  Extension,
  Result,
} from "../common";
import { constructMetadata } from "../events/metadata";
import { defaultLables } from "../constant";

const overwriteLabels = (input: string[]): string[] => {
  return input.map((item) => {
    if (item == "feat") item = "feature";
    if (item == "docs" || item == "doc") item = "documentation";
    return item;
  });
};

const parseLabels = (input: string): string[] => {
  const re = /^(?<type>\w+(\/\w+)*)(\((?<scope>.+)\))?:/;
  const { type } = input.match(re)?.groups!;
  const labels = type.split("/");

  return labels.length > 1
    ? overwriteLabels(
        labels.map(
          (label: string) =>
            defaultLables.filter((x: string) => label === x)[0],
        ),
      )
    : overwriteLabels(defaultLables.filter((x: string) => type === x));
};

const validateTitle = (input: string): boolean => {
  if (input.includes(":")) {
    return parseLabels(input).length > 0 ? true : false;
  } else {
    return false;
  }
};

const check_run_name = `${process.env.APP_NAME} / validate_pr_title`;

export = {
  name: check_run_name,
  description: "check if pr title is in valid format",
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
  app.log.info("Validate PR title");

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
        title: "Validate PR title",
        summary: `
### Summary

Processing
    `,
      },
    });

    const _check_run_id = response.data.id;
    app.log.info(`check_run ${_check_run_id} created`);

    // 1.2 Check if pr title is in valid format
    if (validateTitle(metadata.pull_request.title)) {
      // valid format
      app.log.info(
        `Check passed, the PR title - ${metadata.pull_request.title} is valid, proceed`,
      );

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
        `Check failed, the PR title "${metadata.pull_request.title}" is not valid, rejected`,
      );

      // Update status
      _status = "completed";
      _conclusion = "failure";
      _summary = `
### Summary

The current PR title is invalid.

A valid PR title should stick to the following format. Please take a look and get it fixed. After wards, I will validate it for you again.

### Format

~~~shell
<type>(<scope>): <subject>

<scope> is optional
~~~

### Examples

Single type

~~~
feat: add hat wobble
^--^  ^------------^
|     |
|     +-> Summary in present tense.
|
+-------> Type: <${defaultLables}>.
~~~

Multiple types

~~~
patch/optimize(ebpf): refine hat wobble
^------------^ ^__^   ^---------------^
|              |      |
|              |      +-> Summary in present tense.
|              |
|              +-> Scope of the proposed changes.
|
+-------> Type: <${defaultLables}>.
~~~
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
        title: "Validate PR title",
        summary: _summary,
      },
    });

    return { result: "ok!" };
  } catch (err) {
    console.error("Error process the request:", err);
    throw new Error("Failed to process");
  }
}
