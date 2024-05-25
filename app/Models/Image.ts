import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import ProductVariation from './ProductVariation'

export default class Image extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public fileName: string

  @column()
  public description: string

  @column()
  public url: string

  @column()
  public productVariationId: number

  @column()
  public featured: boolean

  @belongsTo(() => ProductVariation)
  public productVariation: BelongsTo<typeof ProductVariation>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
