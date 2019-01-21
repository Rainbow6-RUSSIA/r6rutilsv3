import { Listener } from 'discord-akairo';
import { GuildMember } from 'discord.js';
import { User } from '../../../models/User';

export default class MemberRemove extends Listener {
    public constructor() {
        super('memberRemove', {
            emitter: 'client',
            event: 'guildMemberRemove',
        });
    }
    public async exec(member: GuildMember) {
        const UInst = await User.findByPk(member.id);
        if (!UInst) { return; }

        if (UInst.lobby.guildId === member.guild.id) {
            UInst.set({
                lobby: null,
            });

            console.log('[BOT] Kicking from lobby', member.user.tag, member.id);
        }

        if (!this.client.guilds.array().some((g) => !g.available || g.members.has(member.id))) {

            UInst.set({
                inactive: true,
            });

            console.log('[BOT] Inactivating', member.user.tag, member.id);
        }

        UInst.save();
    }
}
