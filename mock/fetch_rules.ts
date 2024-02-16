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
    const repo = "flake-bot";

    // fetch rules from remote
    // https://octokit.github.io/rest.js/v18#repos-get-content
    const rules = await octokit.rest.repos
      .getContent({
        owner,
        repo,
        path: ".github/rules.yaml",
        ref: "refs/heads/master",
      })
      .then((res: any) => ({
        content: Buffer.from(res.data.content, "base64").toString("utf-8"),
      }));

    console.log("Success!");
    console.log(rules.content);
  } catch (err: any) {
    console.log(err);
    throw new Error("Failed to process");
  }
};

main();
