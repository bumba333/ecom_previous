// app/Models/Order.ts

import { BaseModel, belongsTo, BelongsTo, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import OrderItem from './OrderItem'
import Coupon from './Coupon'
import { DateTime } from 'luxon'

export default class Order extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @hasMany(() => OrderItem)
  public orderItems: HasMany<typeof OrderItem>

  @column()
  public paymentStatus: 'pending' | 'paid' | 'canceled'

  // Other fields for the order (e.g., totalAmount, status, etc.)
  @column()
  public totalAmount: number

  @column()
  public couponCode: string

  @column()
  public discountAmount: number

  @column()
  public deliveryStatus: string

  @column()
  public couponId: number

  @belongsTo(() => Coupon)
  public coupon: BelongsTo<typeof Coupon>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
