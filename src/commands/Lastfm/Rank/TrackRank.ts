import { Arguments } from "../../../lib/arguments/arguments";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { numberDisplay } from "../../../helpers";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";

export default class TrackRank extends LastFMBaseCommand {
  aliases = ["tra", "tr"];
  description = "Shows what rank the track is at in your top 1000 tracks";
  subcategory = "ranks";
  usage = ["", "artist | track @user"];

  arguments: Arguments = {
    inputs: {
      artist: {
        index: 0,
        splitOn: "|",
      },
      track: {
        index: 1,
        splitOn: "|",
      },
    },
    mentions: standardMentions,
  };

  async run() {
    let track = this.parsedArguments.track as string,
      artist = this.parsedArguments.artist as string;

    let { username, senderUsername, perspective } = await this.parseMentions({
      senderRequired: !track || !artist,
    });

    if (!track || !artist) {
      let nowPlaying = await this.lastFMService.nowPlayingParsed(
        senderUsername
      );

      if (!artist) artist = nowPlaying.artist;
      if (!track) track = nowPlaying.name;
    }

    let topTracks = await this.lastFMService.topTracks({
      username,
      limit: 1000,
    });

    let rank = topTracks.track.findIndex(
      (a) =>
        a.name.toLowerCase() === track.toLowerCase() &&
        a.artist.name.toLowerCase() === artist.toLowerCase()
    );

    if (rank === -1) {
      await this.reply(
        `that track wasn't found in ${perspective.possessive} top 1000 tracks`
      );
    } else {
      await this.reply(
        `${topTracks.track[rank].name.bold()} by ${
          topTracks.track[rank].artist.name
        } is ranked #${numberDisplay(rank + 1).bold()} with ${numberDisplay(
          topTracks.track[rank].playcount,
          "play"
        ).bold()}`
      );
    }
  }
}
