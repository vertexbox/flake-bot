import "dotenv/config";
import { Octokit } from "octokit";
const { createAppAuth } = require("@octokit/auth-app");
import fs from "fs";
var privateKey = fs.readFileSync("private-key-staging.pem", "utf8").toString();

// Compare: https://docs.github.com/en/rest/reference/users#get-the-authenticated-user
const main = async () => {
  try {
    // authenticate as GitHub App
    const auth = createAppAuth({
      appId: process.env.APP_ID,
      installationId: process.env.INSTALLATION_ID,
      privateKey,
    });
    const installationAuth = await auth({
      type: "installation",
    });
    const octokit = new Octokit({ auth: installationAuth.token });

    // Define the repository owner and name
    const owner = "daeuniverse";
    const repo = "dae-1";

    const summary = `
### Summary

The current PR title is invalid.

A valid PR title should stick to the following format. Please take a look and get it fixed. After wards, I will validate it for you again.

### Format

~~~shell
<type>(<scope>): <subject>

<scope> is optional
~~~

### Example

~~~shell
feat: add hat wobble
^--^  ^------------^
|     |
|     +-> Summary in present tense.
|
+-------> Type: <chore, style, docs, feat, fix, hotfix, patch, refactor, optimize, fixture, or test>.
~~~
    `;

    // list pull_request_review request
    const response = await octokit.rest.checks.update({
      owner,
      repo,
      name: "validate_pr_title",
      check_run_id: 20193079679,
      status: "completed", // Set status as in_progress or completed
      conclusion: "failure", // Set the conclusion (e.g., success, failure, neutral)
      completed_at: new Date().toISOString(), // Set the start time
      output: {
        title: "Validate PR title",
        summary: summary,
      },
    });

    console.log("Check run created:", response.data);
  } catch (err: any) {
    console.log(err);
    throw new Error("Failed to process");
  }
};

main();
