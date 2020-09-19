import { MessageEmbed } from "discord.js";
import { Arguments } from "../../lib/arguments/arguments";
import { Validation } from "../../lib/validation/ValidationChecker";
import { validators } from "../../lib/validation/validators";
import { LastFMBaseCommand } from "./LastFMBaseCommand";

export default class Recent extends LastFMBaseCommand {
  description = "Shows your recent tracks";

  usage = ["", "amount"];

  arguments: Arguments = {
    inputs: {
      amount: { index: 0, regex: /-?[0-9]+/g, default: 5, number: true },
    },
    mentions: {
      user: {
        index: 0,
        description: "The user to lookup",
        nonDiscordMentionParsing: this.ndmp,
      },
    },
  };

  validation: Validation = {
    amount: new validators.Range({ min: 1, max: 15 }),
  };

  async run() {
    let amount = this.parsedArguments.amount as number;

    let { username, perspective } = await this.parseMentionedUsername();

    let recentTracks = await this.lastFMService.recentTracks({
      username,
      limit: amount,
    });

    let embed = new MessageEmbed()
      .setTitle(`${perspective.upper.possessive} recent tracks`)
      .setDescription(
        recentTracks.track
          .map(
            (t) =>
              `${t.name} by ${t.artist["#text"].bold()} ${
                t.album ? `from ${t.album["#text"].italic()}` : ""
              }`
          )
          .join("\n")
      );

    await this.send(embed);
  }
}
