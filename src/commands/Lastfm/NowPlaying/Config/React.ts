import { LogicError } from "../../../../errors";
import { Arguments } from "../../../../lib/arguments/arguments";
import {
  EmojiMention,
  EmojiParser,
} from "../../../../lib/arguments/custom/EmojiParser";
import { extractEmojiName } from "../../../../lib/Emoji";
import { LineConsolidator } from "../../../../lib/LineConsolidator";
import { SettingsService } from "../../../../lib/settings/SettingsManager";
import { ConfirmationEmbed } from "../../../../lib/views/embeds/ConfirmationEmbed";
import { ServiceRegistry } from "../../../../services/ServicesRegistry";
import { NowPlayingConfigChildCommand } from "./NowPlayingConfigChildCommand";

const args = {
  inputs: {
    clear: { index: { start: 0 } },
    emojis: {
      index: { start: 0 },
      custom(messageString: string) {
        return new EmojiParser(messageString).parseAll();
      },
      default: [],
    },
  },
} as const;

export class React extends NowPlayingConfigChildCommand<typeof args> {
  idSeed = "shasha seoyeon";

  aliases = ["reacts", "reactions"];
  description =
    "Set what emojis Gowon should react with when you `!fm`\nUse `react clear` to clear your reacts";
  usage = ["", "emoji1 emoji2 ...emoji5", "clear"];

  arguments: Arguments = args;

  settingsService = ServiceRegistry.get(SettingsService);

  async run() {
    const emojis = this.parsedArguments.emojis!;
    const clear = this.parsedArguments.clear;

    if (clear?.toLowerCase() === "clear") {
      return this.handleClear();
    } else if (emojis.length) {
      await this.saveReacts(emojis);
    } else {
      const reactions = JSON.parse(
        this.settingsService.get("reacts", {
          userID: this.author.id,
        }) || "[]"
      ) as string[];

      const embed = this.newEmbed()
        .setAuthor(...this.generateEmbedAuthor("Reacts"))
        .setDescription(
          `Choose which reactions Gowon should react with when you \`${this.prefix}fm\`.\nSet them with \`${this.prefix}reacts emoji1 emoji2 ...emoji5\` and use \`${this.prefix}reacts clear\` to clear them!` +
            (reactions.length
              ? `\n\n**You have the following reactions set**:\n${reactions
                  .map((r) => this.gowonClient.displayEmoji(r))
                  .join(" ")}`
              : "")
        );

      await this.send(embed);
    }
  }

  private async handleClear() {
    const embed = this.newEmbed()
      .setAuthor(...this.generateEmbedAuthor("Reacts"))
      .setDescription("Are you sure you want to clear your reacts?");

    const confirmationEmbed = new ConfirmationEmbed(
      this.message,
      embed,
      this.gowonClient
    );

    if (await confirmationEmbed.awaitConfirmation()) {
      await this.settingsService.set(this.ctx, "reacts", {
        userID: this.author.id,
      });
      confirmationEmbed.sentMessage!.edit({
        embeds: [embed.setDescription("Successfully cleared your reactions!")],
      });
    }
  }

  private async saveReacts(emojis: EmojiMention[]) {
    let emojisToSave = [] as EmojiMention[];
    let emojisIgnored = [] as EmojiMention[];

    for (const emoji of emojis) {
      if (emoji.type === "unicode") {
        emojisToSave.push(emoji);
      } else {
        const resolved = this.gowonClient.client.emojis.resolve(
          emoji.resolvable
        );

        (resolved ? emojisToSave : emojisIgnored).push(emoji);
      }
    }

    emojisToSave = this.uniquify(emojisToSave);
    emojisIgnored = this.uniquify(emojisIgnored);

    if (emojisToSave.length > 5) {
      throw new LogicError("You can't have more than 5 reactions!");
    } else if (emojisToSave.length) {
      this.settingsService.set(
        this.ctx,
        "reacts",
        { userID: this.author.id },
        JSON.stringify(emojisToSave.map((e) => e.resolvable))
      );
    }

    const lineConsolidator = new LineConsolidator();
    lineConsolidator.addLines(
      {
        shouldDisplay: !!emojisToSave.length,
        string: `**Gowon will react with the following emojis**:\n${emojisToSave
          .map((e) => e.raw)
          .join(" ")}`,
      },
      {
        shouldDisplay: !!emojisToSave.length && !!emojisIgnored.length,
        string: "",
      },
      {
        shouldDisplay: !!emojisIgnored.length,
        string: `**Ignored the following emojis**:\n${emojisIgnored
          .map((e) => extractEmojiName(e.raw))
          .join(" ")}`,
      }
    );

    const embed = this.newEmbed()
      .setAuthor(...this.generateEmbedAuthor("Reacts"))
      .setDescription(lineConsolidator.consolidate());

    if (emojisIgnored.length) {
      embed.setFooter(
        "Gowon needs to share a server with an emoji to be able to react with it\nRecently-added emojis may take a little while for Gowon to be able to recognize"
      );
    }

    await this.send(embed);
  }

  private uniquify(emojis: EmojiMention[]): EmojiMention[] {
    return emojis.filter((value, index, self) => {
      return self.map((e) => e.resolvable).indexOf(value.resolvable) === index;
    });
  }
}
