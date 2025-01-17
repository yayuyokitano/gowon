import { Arguments } from "../../../lib/arguments/arguments";
import { generatePeriod, generateHumanPeriod } from "../../../helpers/date";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { displayNumber } from "../../../lib/views/displays";

const args = {
  inputs: {
    timePeriod: {
      custom: (messageString: string) => generatePeriod(messageString),
      index: -1,
    },
    humanReadableTimePeriod: {
      custom: (messageString: string) => generateHumanPeriod(messageString),
      index: -1,
    },
  },
  mentions: standardMentions,
} as const;

export default class TrackCount extends LastFMBaseCommand<typeof args> {
  idSeed = "secret number soodam";

  aliases = ["tc"];
  description = "Shows you how many tracks you've scrobbled";
  subcategory = "library stats";
  usage = ["", "time period @user"];

  arguments: Arguments = args;

  async run() {
    let timePeriod = this.parsedArguments.timePeriod!,
      humanReadableTimePeriod = this.parsedArguments.humanReadableTimePeriod!;

    let { requestable, perspective } = await this.parseMentions();

    let scrobbles = await this.lastFMService.trackCount(
      this.ctx,
      requestable,
      timePeriod
    );

    await this.traditionalReply(
      `${perspective.plusToHave} scrobbled ${displayNumber(
        scrobbles,
        "track"
      ).strong()} ${humanReadableTimePeriod}`
    );
  }
}
