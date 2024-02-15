import { Repository } from "./common";
import { Context, Probot } from "probot";

type isDesiredEvent = boolean;

export class APIGateway {
  app: Probot;
  context: Context<any>;
  repo: Repository;
  event: string;
  metadata: Context<any>["payload"];
  accepted: isDesiredEvent;

  constructor(app: Probot, context: Context<any>, event: string) {
    this.app = app;
    this.context = context;
    this.repo = {
      name: context.payload.repository.name,
      owner: context.payload.organization?.login as string,
    };
    this.event = event;
    this.metadata = context.payload;
    this.accepted = true;
  }

  loadSubscriptions() {}

  // Apply filters for a given event
  acceptEvent(): isDesiredEvent {
    switch (this.event) {
      case "pull_request.opened":
        if (
          ["daeuniverse/dae", "daeuniverse/dae-wing"].includes(
            `${this.repo.owner}/${this.repo.name}`,
          )
        ) {
          this.accepted = false;
        }
        break;
      default:
        break;
    }

    !this.accepted &&
      this.app.log.debug(`undesired event: ${this.event}, dropped.`);

    return this.accepted;
  }
}
