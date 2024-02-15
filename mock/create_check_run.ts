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

    // list pull_request_review request
    const response = await octokit.rest.checks.create({
      owner,
      repo,
      name: "validate_pr_title",
      head_sha: "9322e118530895be389e4dca5178cd698768960c", // Replace with the commit SHA or branch
      status: "in_progress", // Set status as in_progress or completed
      started_at: new Date().toISOString(), // Set the start time
      output: {
        title: "Validate PR title",
        summary: "Processing",
      },
    });

    console.log("Check run created:", response.data);
  } catch (err: any) {
    console.log(err);
    throw new Error("Failed to process");
  }
};

main();
