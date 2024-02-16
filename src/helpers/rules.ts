import * as yaml from "js-yaml";

export type Rule = {
  name: string;
  from: string[];
  to: string;
};

interface SyncConfig {
  sync_rules: Rule[];
}

interface RulesReader {
  readRules(rules: string): Rule[];
}

class RulesReaderImpl implements RulesReader {
  readRules(rules: string): Rule[] {
    const syncConfig = yaml.load(rules) as SyncConfig;
    return syncConfig.sync_rules;
  }
}

export const rulesReader: RulesReader = new RulesReaderImpl();
