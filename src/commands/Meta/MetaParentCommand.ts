import { CommandManager } from "../../lib/command/CommandManager";
import Issue from "./Issue";
import { MetaBaseParentCommand } from "./MetaBaseCommand";
import { TopCommands } from "./TopCommands";

export default class MetaParentCommamnd extends MetaBaseParentCommand {
  friendlyName = "meta";
  prefixes = ["meta"];
  devCommand = true;

  children: CommandManager = new CommandManager({
    topcommands: () => new TopCommands(),
    feedback: () => new Issue(),
  });
}
