import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, HasMany, belongsTo, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import WalletTransaction from './WalletTransaction'

export default class Wallet extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @column()
  public balance: number

  @column()
  public currency: string

  @column()
  public status: 'active' | 'frozen' | 'closed'

  @hasMany(() => WalletTransaction)
  public transactions: HasMany<typeof WalletTransaction>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
