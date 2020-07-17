import { Message, Role, GuildMember } from "discord.js";
import { Permission } from "../database/entity/Permission";

export function sanitizeForDiscord(string: string): string {
  return string.replace(/(\_|\*|\`|\\)/g, (match) => `\\${match}`);
}

export function generateLink(text: string, link: string): string {
  return `[${text}](${link})`;
}

export interface NamedPermission extends Permission {
  name: string;
}
export async function addNamesToPermissions(
  message: Message,
  _permissions: Permission[]
): Promise<NamedPermission[]> {
  let namedPermissions = [] as NamedPermission[];

  let permissions = <NamedPermission[]>_permissions;

  for (let permission of permissions) {
    let entity = await (permission.isRoleBased
      ? permission.toDiscordRole(message)
      : permission.toDiscordUser(message));

    permission.name = entity instanceof Role ? entity.name : entity.username;

    namedPermissions.push(permission);
  }

  return namedPermissions;
}

export function userHasRole(
  member: GuildMember,
  roleID: string | undefined
): boolean {
  if (!roleID) {
    return false;
  }

  return member.roles.cache.has(roleID);
}
