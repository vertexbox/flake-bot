import { Context, Probot } from "probot";
import { Repository, Result, HandlerModule, Extension } from "./common";
import { HandlerModules } from "./config";
import { rulesReader, Rule } from "./helpers/rules";
import {
  RULESET_REMOTE_OWNER,
  RULESET_REMOTE_REPO,
  RULESET_REMOTE_PATH,
  RULESET_REMOTE_REF,
} from "./constant";

export default async (
  context: Context<any>,
  app: Probot,
  event: string,
): Promise<Result> => {
  const modules: HandlerModule[] = HandlerModules;
  const repoFullname = context.payload.repository.full_name;
  const owner = repoFullname.split("/")[0];
  const name = repoFullname.split("/")[1];

  const repo: Repository = {
    owner,
    name,
  };

  try {
    // fetch rules from remote
    // https://octokit.github.io/rest.js/v18#repos-get-content
    const res = await context.octokit.rest.repos
      .getContent({
        owner: RULESET_REMOTE_OWNER,
        repo: RULESET_REMOTE_REPO,
        path: RULESET_REMOTE_PATH,
        ref: RULESET_REMOTE_REF,
      })
      .then((res: any) => ({
        content: Buffer.from(res.data.content, "base64").toString("utf-8"),
      }));
    const rules = rulesReader.readRules(res.content);

    await Promise.all(
      rules.map(async (rule: Rule) => {
        if (rule.from.includes(repoFullname)) {
          // continue
          let syncSource;
          if (rule.name === "dotfiles_nixos") {
            syncSource = name.split(".")[0];
          } else if (rule.name === "secrets_nixos") {
            syncSource = "secrets";
          } else {
            syncSource = name;
          }

          const extension: Extension = {
            octokit: context.octokit,
            sync: {
              source: syncSource,
              target: {
                owner: rule.to.split("/")[0],
                name: rule.to.split("/")[1],
              },
            },
          };
          app.log.debug("rule set matched, proceeded");
          await Promise.all(
            modules.map((module: HandlerModule) =>
              module.handler(event, context, app, repo, extension),
            ),
          );
        } else {
          // abort
          app.log.debug(`undesired event: ${event}, aborted.`);
        }
      }),
    );

    return { result: "ok" };
  } catch (err) {
    console.error("Error process the request:", err);
    throw new Error("Failed to process");
  }
};
