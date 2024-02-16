import * as fs from "fs";
import * as yaml from "js-yaml";

interface SyncRule {
  name: string;
  from: string[];
  to: string;
}

type SyncConfig = {
  sync_rules: SyncRule[];
};

const readYAMLFile = (filePath: string): SyncConfig => {
  const fileContents = fs.readFileSync(filePath, "utf8");
  return yaml.load(fileContents) as SyncConfig;
};

const main = () => {
  const filePath = "rules.yaml";
  try {
    const cfg = readYAMLFile(filePath);
    console.log("sync_rules:");
    cfg.sync_rules.forEach((rule) => {
      console.log(`name: ${rule.name}`);
      console.log("from:", rule.from);
      console.log(`to: ${rule.to}`);
      console.log();
    });
  } catch (error) {
    console.error("Error reading YAML file:", error);
  }
};

main();
