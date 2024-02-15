import { Context, Probot } from "probot";
import { Repository, Result, HandlerModule } from "./common";
import { HandlerModules } from "./config";
import { APIGateway } from "./gateway";

export default async (
  context: Context<any>,
  app: Probot,
  event: string,
): Promise<Result> => {
  const modules: HandlerModule[] = HandlerModules;
  const extension = {
    octokit: context.octokit,
  };
  const repo: Repository = {
    owner: context.payload.repository.full_name.split("/")[0],
    name: context.payload.repository.full_name.split("/")[1],
  };

  try {
    // API Gateway
    const gateway = new APIGateway(app, context, repo, event);
    const proceed = gateway.acceptEvent();

    if (proceed) {
      await Promise.all(
        modules.map((module: HandlerModule) =>
          module.handler(event, context, app, repo, extension),
        ),
      );
    }

    return { result: "ok" };
  } catch (err) {
    console.error("Error process the request:", err);
    throw new Error("Failed to process");
  }
};
