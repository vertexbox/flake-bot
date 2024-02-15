import { Context, Probot } from "probot";
import run from "./runner";
import { APIGateway } from "./gateway";

export default (app: Probot) => {
  app.log(`${process.env.BOT_NAME} app is loaded successfully!`);

  // on receive a selective range of events
  app.on(
    [
      "pull_request.opened",
      "pull_request.reopened",
      "pull_request.synchronize",
      "pull_request.edited",
      "pull_request.labeled",
      "pull_request.unlabeled",
      "check_run.rerequested",
    ],
    async (context: Context<any>) => {
      const full_event = context.payload.action
        ? `${context.name}.${context.payload.action}`
        : context.name;

      // API Gateway
      const gateway = new APIGateway(app, context, full_event);
      const proceed = gateway.acceptEvent();

      if (proceed) {
        // Webhook Handlers
        app.log.info(
          JSON.stringify({
            event: context.name,
            action: context.payload.action,
          }),
        );

        const result = await run(context, app, full_event);
        result.error ? app.log.error(result) : app.log.info(result);
      }
    },
  );
};
