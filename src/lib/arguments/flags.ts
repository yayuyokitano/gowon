import escapeStringRegexp from "escape-string-regexp";
import { SimpleMap } from "../../helpers/types";

export interface Flag {
  description: string;
  longnames: readonly string[];
  shortnames: readonly string[];
}

interface Flags {
  [name: string]: Flag;
}

type FlagsMap<FlagsType extends Flags> = {
  [K in keyof FlagsType]?: boolean;
};

export class FlagParser<FlagsType extends Flags> {
  public parseAndRemoveFlags(
    string: string,
    flags?: Flags
  ): { string: string; flags: FlagsMap<FlagsType> } {
    const flagsToParse = Object.assign(flags || {}, {
      debug: debugFlag,
    }) as Flags;

    let cleanedString = `${string}`;
    const flagsMap: SimpleMap<boolean> = {};

    for (const [flagName, flag] of Object.entries(flagsToParse)) {
      if (this.stringHasFlag(cleanedString, flag)) {
        flagsMap[flagName] = true;
        cleanedString = this.removeFlagFromString(cleanedString, flag);
      } else {
        flagsMap[flagName] = false;
      }
    }

    return { flags: flagsMap as FlagsMap<FlagsType>, string: cleanedString };
  }

  private stringHasFlag(string: string, flag: Flag): boolean {
    const regex = this.generateFlagRegex(flag);

    if (!regex) return false;

    const matches = Array.from(string.matchAll(regex));

    return matches.length > 0;
  }

  private removeFlagFromString(string: string, flag: Flag): string {
    const regex = this.generateFlagRegex(flag);

    if (!regex) return string;

    return string.replace(regex, "");
  }

  private generateFlagRegex(flag: Flag): RegExp | undefined {
    let regexStrings = [] as string[];

    if (flag.shortnames.length) {
      regexStrings.push(`-(${this.escapeRegexes(flag.shortnames).join("|")})`);
    }
    if (flag.longnames.length) {
      regexStrings.push(`--(${this.escapeRegexes(flag.longnames).join("|")})`);
    }

    if (!regexStrings.length) return;

    return new RegExp(`(\\s|^)${regexStrings.join("|")}(\\s|$)`, "gi");
  }

  private escapeRegexes(strings: readonly string[]) {
    return strings.map(escapeStringRegexp);
  }
}

const debugFlag = {
  description: "Developer only",
  longnames: ["debug"],
  shortnames: [],
};

export const FLAGS = {
  noRedirect: {
    description: "Skip Last.fm's redirect",
    longnames: ["noredirect", "no-redirect"],
    shortnames: ["nr"],
  },
} as const;
