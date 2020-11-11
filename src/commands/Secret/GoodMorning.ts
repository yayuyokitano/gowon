import { BaseCommand } from "../../lib/command/BaseCommand";
import { Emoji } from "../../lib/Emoji";

export default class GoodMorning extends BaseCommand {
  aliases = ["gm"];
  description = "You probably mistyped `fm` " + Emoji.gronning;
  secretCommand = true;

  async run() {
    await this.reply("good morning!" + Emoji.kapp);
  }
}