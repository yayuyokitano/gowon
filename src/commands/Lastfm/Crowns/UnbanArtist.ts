import { Arguments } from "../../../lib/arguments/arguments";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { CrownsChildCommand } from "./CrownsChildCommand";

const args = {
  inputs: {
    artist: { index: { start: 0 } },
  },
} as const;

export class UnbanArtist extends CrownsChildCommand<typeof args> {
  idSeed = "elris sohee";

  description = "Unbans an artist from the crowns game";
  usage = "artist";
  arguments: Arguments = args;

  validation: Validation = {
    artist: new validators.Required({}),
  };

  async run() {
    let artist = this.parsedArguments.artist!;

    let artistCrownBan = await this.crownsService.artistCrownUnban(
      this.ctx,
      artist
    );

    await this.crownsService.killCrown(this.ctx, artistCrownBan.artistName);

    await this.traditionalReply(
      `succesfully unbanned ${artistCrownBan.artistName.strong()} from the crowns game.`
    );
  }
}
