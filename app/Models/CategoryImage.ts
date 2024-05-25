// app/Models/CategoryImage.ts

import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Category from './Category'
import { DateTime } from 'luxon'

export default class CategoryImage extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public fileName: string

  @column()
  public categoryId: number

  @column()
  public imageUrl: string

  @belongsTo(() => Category)
  public category: BelongsTo<typeof Category>

  // You can add other fields or methods as needed
  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
