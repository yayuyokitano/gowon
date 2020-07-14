import { Message } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { numberDisplay } from "../../../helpers";

export default class AlbumRank extends LastFMBaseCommand {
  aliases = ["alra", "lra"];
  description = "Shows what rank the album is at in your top 1000 albums";
  arguments: Arguments = {
    mentions: {
      user: {
        index: 0,
        description: "The user to lookup",
        nonDiscordMentionParsing: this.ndmp,
      },
    },
    inputs: {
      artist: {
        index: 0,
        splitOn: "|",
      },
      album: {
        index: 1,
        splitOn: "|",
      },
    },
  };

  async run(message: Message) {
    let album = this.parsedArguments.album as string,
      artist = this.parsedArguments.artist as string;

    let {
      username,
      senderUsername,
      perspective,
    } = await this.parseMentionedUsername(message);

    if (!album || !artist) {
      let nowPlaying = await this.lastFMService.nowPlayingParsed(
        senderUsername
      );

      if (!album) album = nowPlaying.album;
      if (!artist) artist = nowPlaying.artist;
    }

    let topAlbums = await this.lastFMService.topAlbums(username, 1000);

    let rank = topAlbums.album.findIndex(
      (a) =>
        a.name.toLowerCase() === album.toLowerCase() &&
        a.artist.name.toLowerCase() === artist.toLowerCase()
    );

    if (rank === -1) {
      await message.reply(
        `that album wasn't found in ${perspective.possessive} top 1000 albums`
      );
    } else {
      await message.reply(
        `${topAlbums.album[rank].name.bold()} by ${
          topAlbums.album[rank].artist.name
        } is ranked #${numberDisplay(rank + 1).bold()} with ${numberDisplay(
          topAlbums.album[rank].playcount,
          "play"
        ).bold()}`
      );
    }
  }
}
