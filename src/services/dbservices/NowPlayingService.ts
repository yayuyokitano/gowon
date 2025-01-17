import { NowPlayingConfig } from "../../database/entity/NowPlayingConfig";
import { User } from "../../database/entity/User";
import { sortConfigOptions } from "../../lib/nowplaying/componentMap";
import { BaseService, BaseServiceContext } from "../BaseService";

export const UNUSED_CONFIG = "unused";

export class ConfigService extends BaseService {
  async getConfigForUser(
    ctx: BaseServiceContext,
    user: User
  ): Promise<string[]> {
    this.log(ctx, `Fetching config for user ${user.discordID}`);

    const config = await this.getOrCreateConfig(ctx, user);
    return sortConfigOptions(config.config);
  }

  async getConfigNoUnused(ctx: BaseServiceContext, user: User) {
    return (await this.getConfigForUser(ctx, user)).filter(
      (c) => c !== UNUSED_CONFIG
    );
  }

  async saveConfigForUser(
    ctx: BaseServiceContext,
    user: User,
    config: string[]
  ) {
    this.log(
      ctx,
      `Saving config for user ${user.discordID} (${config.join(", ")})`
    );

    const dbConfig = await this.getOrCreateConfig(ctx, user);

    dbConfig.config = config;

    return await dbConfig.save();
  }

  private async getOrCreateConfig(
    ctx: BaseServiceContext,
    user: User
  ): Promise<NowPlayingConfig> {
    this.log(ctx, `Fetching or creating config for user ${user.discordID}`);

    const existing = await NowPlayingConfig.findOne({ where: { user } });

    if (existing) return existing;

    const newConfig = NowPlayingConfig.create({
      user,
      config: [UNUSED_CONFIG],
    });

    return await newConfig.save();
  }
}
