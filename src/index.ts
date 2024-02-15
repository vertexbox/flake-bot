import { Context, Probot } from "probot";
import run from "./runner";

export default (app: Probot) => {
  app.log.debug(`${process.env.BOT_NAME} app is loaded successfully!`);

  // on receive a selective range of events
  app.on(["push"], async (context: Context<any>) => {
    const full_event = context.payload.action
      ? `${context.name}.${context.payload.action}`
      : context.name;

    // Webhook Handlers
    app.log.info(
      JSON.stringify({
        event: context.name,
        action: context.payload.action,
      }),
    );

    const result = await run(context, app, full_event);
    result.error ? app.log.error(result) : app.log.info(JSON.stringify(result));
  });
};
