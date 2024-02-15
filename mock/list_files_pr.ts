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
    const repo = "dae";

    // list pull_request_review request
    const response = await octokit.rest.pulls.listFiles({
      owner,
      repo,
      pull_number: 426,
    });

    console.log("PR fetched:", response.data);
  } catch (err: any) {
    console.log(err);
    throw new Error("Failed to process");
  }
};

main();
