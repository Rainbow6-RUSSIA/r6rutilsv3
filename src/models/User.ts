import { BelongsToMany, Column, DataType, Default, Model, PrimaryKey, Table, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { ACCESS, PLATFORM, RANKS, VERIFICATION_LEVEL, IHistoryRecord } from '../utils/types'
import { Guild } from './Guild';
import { GuildBlacklist } from './GuildBlacklist';

import { Snowflake } from 'discord.js'

@Table({
    timestamps: true,
    // scheme:
})
export class User extends Model<User> {
    @PrimaryKey
    @Column(DataType.STRING)
    public id: Snowflake; // discord snowflake

    @Column(DataType.UUID)
    public genome: string;

    @Column(DataType.ARRAY(DataType.JSONB))
    public genomeHistory: IHistoryRecord[];

    @Column(DataType.STRING(15))
    public nickname: string;

    @Column(DataType.ARRAY(DataType.JSONB))
    public nicknameHistory: IHistoryRecord[];

    @Column
    public inactive: boolean;

    // @Column(DataType.ARRAY(DataType.STRING))
    // public blacklist: string[]; // genome blacklist
    @BelongsToMany(() => Guild, () => GuildBlacklist)
    public bannedAt: Guild[];

    @Column(DataType.INTEGER)
    public rank: RANKS;

    @Default(0)
    @Column(DataType.INTEGER)
    public verificationLevel: VERIFICATION_LEVEL;

    @Column(DataType.INTEGER)
    public requiredVerification: VERIFICATION_LEVEL;

    @Column(DataType.STRING)
    public platform: PLATFORM;

    @Column(DataType.INTEGER)
    public access: ACCESS;

    public pushGenome = (genome: string): void => {
        let old = this.getDataValue('genomeHistory') as IHistoryRecord[];
        if (!old.some(r => r.record === genome)) {
            this.setDataValue('genomeHistory', old.push({
                record: genome,
                timestamp: Date.now()
            }))
        }
    }

    public pushNickname = (nickname: string): void => {
        let old = this.getDataValue('nicknameHistory') as IHistoryRecord[];
        if (!old.some(r => r.record === nickname)) {
            this.setDataValue('genomeHistory', old.push({
                record: nickname,
                timestamp: Date.now()
            }))
        }
    }
}