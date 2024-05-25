import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Product from './Product'
import Tag from './Tag'

export default class ProductTag extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @belongsTo(() => Product)
  public product: BelongsTo<typeof Product>

  @belongsTo(() => Tag)
  public tag: BelongsTo<typeof Tag>

  @column()
  public productId: number

  @column()
  public tagId: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
