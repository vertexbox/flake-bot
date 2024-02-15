import { HandlerModule } from "./common";
import DistpatchWorkflowHandler from "./handlers/dispatch_workflow";

export interface Configuration {
  app_name: string;
}

export const HandlerModules: HandlerModule[] = [DistpatchWorkflowHandler];

export const AppConfig: Configuration = {
  app_name: process.env.APP_NAME!,
};
