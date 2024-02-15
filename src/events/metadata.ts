import { Repository } from "../common";
import { Metadata } from "./model";
import { Context } from "probot";

export const constructMetadata = async (
  repo: Repository,
  event: string,
  context: Context<any>,
): Promise<Metadata> => {
  let pull_request;

  if (event.split(".")[0] === "pull_request") {
    pull_request = {
      ref: context.payload.pull_request.head.ref,
      sha: context.payload.pull_request.head.sha,
      title: context.payload.pull_request.title,
      author: context.payload.pull_request.user.login,
      number: context.payload.pull_request.number,
      labels: context.payload.pull_request.labels,
      updated_at: context.payload.pull_request.updated_at,
      html_url: context.payload.pull_request.html_url,
    };
  } else {
    const { title, labels } = await (async () => {
      return await context.octokit.pulls
        .get({
          owner: repo.owner,
          repo: repo.name,
          pull_number:
            context.payload.check_run.check_suite.pull_requests[0].number,
        })
        .then((res) => ({ title: res.data.title, labels: res.data.labels }));
    })();

    pull_request = {
      ref: context.payload.check_run.check_suite.pull_requests[0].head.ref,
      sha: context.payload.check_run.check_suite.pull_requests[0].head.sha,
      title: title,
      author: context.payload.sender.login,
      number: context.payload.check_run.check_suite.pull_requests[0].number,
      labels: labels,
      updated_at: context.payload.check_run.check_suite.completed_at,
      html_url: context.payload.check_run.check_suite.pull_requests[0].url,
    };
  }

  return {
    repo: repo.name,
    owner: repo.owner,
    default_branch: context.payload.repository.default_branch,
    html_url: context.payload.repository.html_url,
    pull_request,
  };
};
