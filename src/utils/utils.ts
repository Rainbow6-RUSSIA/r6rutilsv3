import { EmojiResolvable, Message, MessageOptions, MessageReaction, ReactionEmoji, Snowflake, User, UserResolvable } from 'discord.js';
import { IStats } from 'r6api';
import bot from '../bot';
import { Guild } from '../models/Guild';
import { User as U } from '../models/User';
import { ENV, IUbiBound, ONLINE_TRACKER } from './types';

interface IPromptOptions {
    [prop: string]: any;
    lifetime?: number;
    aftertime?: number;
    emojis?: string[];
    messageOpt?: MessageOptions;
}

class Utils {

}

// export async function discordPrompt(message: Message, prompt: string, target: User, options: IPromptOptions): Promise<boolean | null> {
//     const opts = {
//         lifetime: 5 * 60 * 1000,
//         aftertime: 5 * 1000,
//         emojis: ['✅', '❎'], ...options};
//     const p = await message.reply(prompt, opts.messageOpt) as Message;
//     // console.log(opts.emojis)
//     await p.react(opts.emojis[0]);
//     await p.react(opts.emojis[1]);

//     const reactionFilter = (reaction, user) => opts.emojis.includes(reaction.emoji.name) && user.id === target.id;
//     const res = await p.awaitReactions(reactionFilter, { maxEmojis: 1, time: opts.lifetime });
//     p.delete({timeout: opts.aftertime});
//     if (!res.array().length) { return null; } else if (res.first().emoji.name !== opts.emojis[0]) { return false; } else { return true; }
// }

export async function combinedPrompt(prompt: Message, options, emojis: string[] | EmojiResolvable[], responses: string[]): Promise<number> {
  for (const e of emojis) {
    await prompt.react(e);
  }
  const emojiFilter = (reaction: MessageReaction, user: User) => emojis.includes(reaction.emoji.identifier) && user.id === options.author.id;
  const textFilter = (m: Message) => m.author.id === options.author.id && (m.content.includes('1') || m.content.includes('2'));
  const race = await Promise.race([prompt.awaitReactions(emojiFilter, { max: 1 }), prompt.channel.awaitMessages(textFilter, { max: 1 })]);
  const result = race.first();
  return 0;
}

export function buildRankEmbed(bound: IUbiBound, s: IStats) {
    const stats = s.general;
    return {
        description: 'Общая статистика',
        url: `${ONLINE_TRACKER}${bound.genome}`,
        thumbnail: {
          url: `https://ubisoft-avatars.akamaized.net/${bound.genome}/default_146_146.png`,
        },
        author: {
          name: bound.nickname,
        },
        fields: [
          {
            name: 'Выигрыши/Поражения',
            value: `**В:** ${stats.won || 0} **П:** ${stats.lost || 0}\n**В%:** ${(100 * (stats.won / (stats.won + stats.lost) || 0)).toFixed(2)}%`,
            inline: true,
          },
          {
            name: 'Убийства/Смерти',
            value: `**У:** ${stats.kills || 0} **С:** ${stats.deaths || 0}\n**У/С:** ${(stats.kills / (stats.deaths || 1)).toFixed(2)}`,
            inline: true,
          },
        ],
      };
}

export async function syncRank() {
  const UInsts = await U.findAll({
    where: {inactive: false},
    limit: parseInt(ENV.PACK_SIZE),
    order: ['updatedAt', 'ASC'],
  });
}

export async function syncMember(guild: Guild, user: U, currentRoles?: string[]) {
    const discordGuild = bot.guilds.get(guild.id);
    if (!discordGuild.available) { return; }
    if (!currentRoles) {
      currentRoles = discordGuild.members.get(user.id).roles.keyArray();
    }
}
