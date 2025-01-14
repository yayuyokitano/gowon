import { BaseService, BaseServiceContext } from "../BaseService";
import { DisabledCommand } from "../../database/entity/DisabledCommand";
import {
  CommandNotDisabledError,
  CommandAlreadyDisabledError,
  MismatchedPermissionsError,
  RecordNotFoundError,
  DuplicateRecordError,
  LogicError,
} from "../../errors";
import { Permission } from "../../database/entity/Permission";
import { Can } from "../../lib/permissions/Can";
import { QueryFailedError } from "typeorm";
import { ChannelBlacklist } from "../../database/entity/ChannelBlacklist";
import { CacheScopedKey } from "../../database/cache/ShallowCache";
import { ServiceRegistry } from "../ServicesRegistry";
import { GowonService } from "../GowonService";

type AdminServiceContext = BaseServiceContext;

export class AdminService extends BaseService<AdminServiceContext> {
  get gowonService() {
    return ServiceRegistry.get(GowonService);
  }

  get can(): Can {
    return ServiceRegistry.get(Can);
  }

  customContext = {
    adminService: AdminService,
  };

  async disableCommand(
    ctx: AdminServiceContext,
    commandID: string,
    commandFriendlyName: string,
    dev = false
  ): Promise<DisabledCommand> {
    const serverID = this.guild(ctx).id;

    const disabledCommand = await DisabledCommand.findOne({
      where: { commandID, serverID },
    });

    if (disabledCommand) throw new CommandAlreadyDisabledError();

    this.log(
      ctx,
      "disabling `" + commandFriendlyName + "` for server " + serverID
    );

    const newDisabledCommand = DisabledCommand.create({
      commandID,
      serverID,
      commandFriendlyName,
      devPermission: dev,
    });

    await newDisabledCommand.save();

    return newDisabledCommand;
  }

  async enableCommand(
    ctx: AdminServiceContext,
    commandID: string
  ): Promise<DisabledCommand> {
    const enablerID = this.author(ctx).id;
    const serverID = this.guild(ctx).id;

    const disabledCommand = await DisabledCommand.findOne({
      where: { commandID, serverID },
    });

    if (!disabledCommand) throw new CommandNotDisabledError();

    if (disabledCommand.devPermission && !ctx.client.isDeveloper(enablerID)) {
      throw new LogicError(
        "You need to be a developer to reenable this command!"
      );
    }

    this.log(ctx, "enabling " + commandID + " for server " + serverID);

    await disabledCommand.remove();

    return disabledCommand;
  }

  async isCommandDisabled(
    ctx: AdminServiceContext,
    commandID: string
  ): Promise<{ isDisabled: boolean; dev: boolean }> {
    const serverID = this.guild(ctx).id;

    this.log(ctx, "checking if " + commandID + " is disabled in " + serverID);

    const dc = await DisabledCommand.findOne({
      where: { serverID, commandID },
    });

    return dc
      ? { isDisabled: true, dev: dc.devPermission }
      : { isDisabled: false, dev: false };
  }

  async listDisabled(ctx: AdminServiceContext): Promise<DisabledCommand[]> {
    return await DisabledCommand.find({ serverID: this.guild(ctx).id });
  }

  private async setPermissions(
    ctx: AdminServiceContext,
    entityID: string,
    commandID: string,
    isBlacklist: boolean,
    isRoleBased: boolean,
    commandFriendlyName: string
  ): Promise<Permission> {
    const serverID = this.guild(ctx).id;

    const permissions = await Permission.find({
      where: { serverID, commandID },
      take: 1,
    });

    const permissionsMismatched =
      isBlacklist !== (permissions[0]?.isBlacklist ?? isBlacklist);

    if (permissionsMismatched)
      throw new MismatchedPermissionsError(permissions[0].isBlacklist);

    let newPermissions: Permission;

    try {
      this.log(
        ctx,
        `Creating new permission for entity ${entityID} and command ${commandID} in ${serverID}`
      );

      newPermissions = Permission.create({
        entityID,
        serverID,
        commandID,
        isBlacklist,
        isRoleBased,
        commandFriendlyName,
      });
      await newPermissions.save();
    } catch (e) {
      if (
        e instanceof QueryFailedError &&
        e.message.includes("duplicate key value violates unique constraint")
      ) {
        throw new DuplicateRecordError("permission");
      } else throw e;
    }

    return newPermissions;
  }

  async blacklist(
    ctx: AdminServiceContext,
    entityID: string,
    commandID: string,
    isRoleBased: boolean,
    commandFriendlyName: string
  ): Promise<Permission> {
    return await this.setPermissions(
      ctx,
      entityID,
      commandID,
      true,
      isRoleBased,
      commandFriendlyName
    );
  }

  async whitelist(
    ctx: AdminServiceContext,
    entityID: string,
    commandID: string,
    isRoleBased: boolean,
    commandFriendlyName: string
  ): Promise<Permission> {
    return await this.setPermissions(
      ctx,
      entityID,
      commandID,
      false,
      isRoleBased,
      commandFriendlyName
    );
  }

  async whiteOrBlacklist(
    ctx: AdminServiceContext,
    entityID: string,
    commandID: string,
    isRoleBased: boolean,
    isBlacklist: boolean,
    commandFriendlyName: string
  ): Promise<Permission> {
    return await this.setPermissions(
      ctx,
      entityID,
      commandID,
      isBlacklist,
      isRoleBased,
      commandFriendlyName
    );
  }

  async delist(
    ctx: AdminServiceContext,
    entityID: string,
    commandID: string
  ): Promise<Permission> {
    const serverID = this.guild(ctx).id;

    const permission = await Permission.findOne({
      where: { entityID, serverID, commandID },
    });

    if (!permission) throw new RecordNotFoundError("permission");

    this.log(
      ctx,
      `Removing permission for entity ${entityID} and command ${commandID} in ${serverID}`
    );

    await permission.remove();

    return permission;
  }

  async listPermissions(ctx: AdminServiceContext): Promise<Permission[]> {
    const serverID = this.guild(ctx).id;

    this.log(ctx, `Listing permissions in ${serverID}`);
    return await Permission.find({ where: { serverID } });
  }

  async listPermissionsForCommand(
    ctx: AdminServiceContext,
    commandID: string
  ): Promise<Permission[]> {
    const serverID = this.guild(ctx).id;

    this.log(
      ctx,
      `Listing permissions in ${serverID} for command ${commandID}`
    );
    return await Permission.find({ where: { serverID, commandID } });
  }

  async listPermissionsForEntity(
    ctx: AdminServiceContext,
    entityID: string
  ): Promise<Permission[]> {
    const serverID = this.guild(ctx).id;

    this.log(ctx, `Listing permissions in ${serverID} for entity ${entityID}`);
    return await Permission.find({ where: { serverID, entityID } });
  }

  async blacklistCommandFromChannel(
    ctx: AdminServiceContext,
    commandID: string,
    channelID: string
  ): Promise<ChannelBlacklist> {
    const serverID = this.guild(ctx).id;

    this.log(
      ctx,
      `blacklisting ${commandID} in #${channelID} in the server ${serverID}`
    );
    let existingChannelBlacklist = await ChannelBlacklist.findOne({
      serverID,
      commandID,
      channelID,
    });

    if (existingChannelBlacklist)
      throw new DuplicateRecordError("channel blacklist");

    let channelBlacklist = ChannelBlacklist.create({
      serverID,
      commandID,
      channelID,
    });

    await channelBlacklist.save();

    let channelBlacklists = [
      ...(await this.gowonService.getChannelBlacklists(serverID)),
      channelBlacklist,
    ];

    await this.gowonService.shallowCache.remember(
      CacheScopedKey.ChannelBlacklists,
      channelBlacklists,
      serverID
    );

    return channelBlacklist;
  }

  async unblacklistCommandFromChannel(
    ctx: AdminServiceContext,
    commandID: string,
    channelID: string
  ): Promise<ChannelBlacklist> {
    const serverID = this.guild(ctx).id;

    this.log(
      ctx,
      `unblacklisting ${commandID} in #${channelID} in the server ${serverID}`
    );

    let channelBlacklist = await ChannelBlacklist.findOne({
      serverID,
      commandID,
      channelID,
    });

    if (!channelBlacklist) throw new RecordNotFoundError("channel blacklist");

    let channelBlacklists = (
      await this.gowonService.getChannelBlacklists(serverID)
    ).filter((cr) => cr.id !== channelBlacklist!.id);

    await channelBlacklist.remove();

    this.gowonService.shallowCache.remember(
      CacheScopedKey.ChannelBlacklists,
      channelBlacklists,
      serverID
    );

    return channelBlacklist;
  }
}
