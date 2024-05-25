import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Wallet from './Wallet'

export default class WalletTransaction extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public walletId: number

  @belongsTo(() => Wallet)
  public wallet: BelongsTo<typeof Wallet>

  @column()
  public amount: number

  @column()
  public type: 'credit' | 'debit' | 'reversal'

  @column()
  public description: string

  @column()
  public reversed: boolean

  @column()
  public reversedTransactionId: number

  @belongsTo(() => WalletTransaction, { foreignKey: 'reversedTransactionId' })
  public reversedTransaction: BelongsTo<typeof WalletTransaction>

  @column()
  public reversedBy: number

  @column()
  public reversalReason: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
