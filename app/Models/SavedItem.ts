import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import ProductVariation from './ProductVariation'

export default class SavedItem extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public productVariationId: number

  @column()
  public quantity: number

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @belongsTo(() => ProductVariation)
  public productVariation: BelongsTo<typeof ProductVariation>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
