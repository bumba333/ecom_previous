import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import SizeType from 'App/Models/SizeType'

export default class ProductSize extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public size: string

  @column()
  public sizeTypeId: number

  @belongsTo(() => SizeType)
  public sizeType: BelongsTo<typeof SizeType>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
