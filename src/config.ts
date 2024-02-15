import { HandlerModule } from "./common";
import ValidatePRTileHandler from "./handlers/validate_pr_title";
import CheckPRTestedLabel from "./handlers/check_pr_tested_label";
import CheckPRDocumentationLabel from "./handlers/check_pr_documentation_label";

export interface Configuration {
  app_name: string;
}

export const HandlerModules: HandlerModule[] = [
  ValidatePRTileHandler,
  CheckPRTestedLabel,
  CheckPRDocumentationLabel,
];

export const AppConfig: Configuration = {
  app_name: process.env.APP_NAME!,
};
