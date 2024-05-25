import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, HasMany, belongsTo, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import CartItem from './CartItem'
import Coupon from './Coupon'

export default class Cart extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public totalAmount: number

  @column()
  public couponCode: string | null

  @column()
  public discountedAmount: number

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @hasMany(() => CartItem, {
    foreignKey: 'cartId',
  })
  public items: HasMany<typeof CartItem>

  @belongsTo(() => Coupon, {
    localKey: 'couponCode', // This should match the column name in your carts table
    foreignKey: 'code', // This should match the column name in your coupons table
  })
  public appliedCoupon: BelongsTo<typeof Coupon>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
