import { DateTime } from 'luxon'
import { BaseModel, ManyToMany, column, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import User from './User'

export default class Coupon extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public code: string

  @column()
  public discountType: string // e.g., 'percentage' or 'fixed'

  @column()
  public discountValue: number

  @column()
  public isForSpecificUser: boolean // Flag to specify if the coupon is user-specific

  @column()
  public usageLimit: number

  @column()
  public usedCount: number

  @column()
  public minOrderAmount: number

  // Define the many-to-many relationship with users
  @manyToMany(() => User, {
    pivotTable: 'coupon_users',
  })
  public users: ManyToMany<typeof User>

  @column.dateTime()
  public expiresAt: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
