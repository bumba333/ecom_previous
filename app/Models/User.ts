import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import {
  column,
  beforeSave,
  BaseModel,
  hasMany,
  HasMany,
  hasOne,
  HasOne,
  belongsTo,
  BelongsTo,
  manyToMany,
  ManyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import Product from './Product'
import Cart from './Cart'
import Address from './Address'
import Role from './Role'
import Order from './Order'
import PasswordReset from './PasswordReset'
import crypto from 'crypto'
import Coupon from './Coupon'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public first_name: string

  @column()
  public last_name: string

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public rememberMeToken: string

  @column()
  public contact_number: string

  @column()
  public gender: string

  @belongsTo(() => Role)
  public role: BelongsTo<typeof Role>

  @column()
  public roleId: number

  @hasMany(() => Address) // Define a hasMany relationship with Address
  public addresses: HasMany<typeof Address>

  @hasMany(() => Order) // Define a hasMany relationship with Orders
  public orders: HasMany<typeof Order>

  @hasOne(() => Cart)
  public cart: HasOne<typeof Cart>

  @hasMany(() => Product)
  public products: HasMany<typeof Product>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }

  @hasMany(() => PasswordReset) // Define a hasMany relationship with PasswordReset
  public passwordResets: HasMany<typeof PasswordReset>

  // Define a method to create a password reset token
  public async createPasswordResetToken() {
    const token = crypto.randomBytes(16).toString('hex') // Generate a random token
    const expiresAt = DateTime.now().plus({ hours: 1 }) // Set the token expiration to 1 hour from now

    // Create a new PasswordReset record directly
    await PasswordReset.create({
      token,
      expiresAt,
    })

    return token
  }

  @manyToMany(() => Coupon, {
    pivotTable: 'coupon_user',
  })
  public coupons: ManyToMany<typeof Coupon>
}
