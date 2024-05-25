import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Product from './Product'

export default class Brand extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public logo: string

  @column()
  public slug: string

  @hasMany(() => Product, {
    foreignKey: 'brand_id',
  })
  public products: HasMany<typeof Product>
}
