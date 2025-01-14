import { BaseCommand } from "../../lib/command/BaseCommand";
import { Validation } from "../../lib/validation/ValidationChecker";
import { validators } from "../../lib/validation/validators";
import { ScriptsRegistry } from "../../services/ScriptsRegistry";

const args = {
  inputs: {
    script: { index: 0 },
  },
} as const;

export default class RunScript extends BaseCommand<typeof args> {
  idSeed = "hot issue hyeongshin";
  description = "Run a script";
  subcategory = "developer";
  secretCommand = true;
  devCommand = true;

  arguments = args;

  validation: Validation = {
    script: new validators.Required({}),
  };

  scriptsRegistry = new ScriptsRegistry();

  async run() {
    await this.scriptsRegistry.init();

    const script = this.parsedArguments.script!;

    this.scriptsRegistry.runScript(script, this);

    await this.reply(`Running script ${script.code()}`);
  }
}
