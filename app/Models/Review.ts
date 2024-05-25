// app/Models/Review.js
import { BaseModel, belongsTo, BelongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Product from './Product'
import { DateTime } from 'luxon'

export default class Review extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number // This is the foreign key for the user association

  @column()
  public productId: number // This is the foreign key to the Product model

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @belongsTo(() => Product)
  public product: BelongsTo<typeof Product>

  @column()
  public title: string

  @column()
  public content: string

  @column()
  public rating: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime
}
