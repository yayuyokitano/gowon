import { User } from "discord.js";
import {
  Message,
  MessageEmbed,
  MessageReaction,
  ReactionCollector,
} from "discord.js";
import { EmojiRaw } from "../../Emoji";
import { GowonClient } from "../../GowonClient";
import { ReactionCollectorFilter } from "../../../helpers/discord";

export class ConfirmationEmbed {
  private readonly reactionEmoji = EmojiRaw.checkmark;
  public sentMessage: Message | undefined;

  constructor(
    private originalMessage: Message,
    private embed: MessageEmbed,
    private gowonClient: GowonClient,
    private userID?: string
  ) {}

  private get filter(): ReactionCollectorFilter {
    return (reaction: MessageReaction, user: User) => {
      return (
        user.id === (this.userID || this.originalMessage.author.id) &&
        (reaction.emoji.id ?? reaction.emoji.name) === this.reactionEmoji
      );
    };
  }

  public async awaitConfirmation(timeout = 30000): Promise<boolean> {
    return new Promise(async (resolve) => {
      const sentEmbed = await this.originalMessage.channel.send({
        embeds: [this.embed],
      });

      this.sentMessage = sentEmbed;

      await sentEmbed.react(this.reactionEmoji);

      const collector = new ReactionCollector(sentEmbed, {
        filter: this.filter,
        time: timeout,
      });

      collector.on("collect", async () => {
        collector.stop("collected");

        return resolve(true);
      });

      collector.on("error", () => {
        collector.stop();

        return resolve(false);
      });

      collector.on("end", async (_c: any, reason: string) => {
        if (reason === "collected") {
          return resolve(true);
        } else if (reason === "time") {
          await sentEmbed.edit({
            embeds: [
              this.embed.setFooter(
                (
                  (this.embed.footer?.text || "") +
                  `\n\n🕒 This confirmation has timed out.`
                ).trim()
              ),
            ],
          });
          this.sentMessage!.reactions.resolve(this.reactionEmoji)!.users.remove(
            this.gowonClient.client.user?.id
          );
        }

        return resolve(false);
      });
    });
  }
}
