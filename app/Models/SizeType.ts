import { DateTime } from 'luxon'
import { BaseModel, HasMany, ManyToMany, column, hasMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import ProductSize from './ProductSize'
import Product from './Product'

export default class SizeType extends BaseModel {
  @column({ isPrimary: true })
  public id: number
  @column()
  public name: string

  @hasMany(() => ProductSize)
  public sizes: HasMany<typeof ProductSize>

  @manyToMany(() => Product, {
    pivotTable: 'product_size_type',
  })
  public products: ManyToMany<typeof Product>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
