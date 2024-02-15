import * as dotenv from "dotenv";
import { Octokit } from "octokit";
const { createAppAuth } = require("@octokit/auth-app");
import fs from "fs";

dotenv.config();
const privateKey = fs.readFileSync("private-key.pem", "utf8").toString();

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

    // define the repository owner and name
    const owner = "yqlbu";
    const repo = "dotfiles.nix";

    // dispatch github workflow
    await octokit.rest.actions.createWorkflowDispatch({
      owner,
      repo,
      workflow_id: "sync-upstream.yml",
      ref: "refs/heads/ci",
      inputs: {
        input: "kitty",
      },
    });

    console.log("Success!");
  } catch (err: any) {
    console.log(err);
    throw new Error("Failed to process");
  }
};

main();
