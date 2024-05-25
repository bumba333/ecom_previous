import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Tag from './Tag'

export default class TagImage extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public tagId: number

  @column()
  public fileName: string

  @column()
  public description: string

  @column()
  public imageUrl: string

  @belongsTo(() => Tag)
  public tag: BelongsTo<typeof Tag>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
