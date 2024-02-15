import { Context, Probot } from "probot";
import { Repository } from "./common";
import { REPOS_IGNORE } from "./constant";

type isDesiredEvent = boolean;

export class APIGateway {
  app: Probot;
  context: Context<any>;
  repo: Repository;
  event: string;
  metadata: Context<any>["payload"];
  accepted: isDesiredEvent;

  constructor(
    app: Probot,
    context: Context<any>,
    repo: Repository,
    event: string,
  ) {
    this.app = app;
    this.context = context;
    this.repo = repo;
    this.event = event;
    this.metadata = context.payload;
    this.accepted = true;
  }

  // Apply filters for a given event
  acceptEvent(): isDesiredEvent {
    const reposIgnore = REPOS_IGNORE.split(",");
    switch (this.event) {
      case "push":
        if (reposIgnore.includes(`${this.repo.owner}/${this.repo.name}`)) {
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
