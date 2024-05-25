// app/Models/Subcategory.ts

import { DateTime } from 'luxon'
import { BaseModel, column, ManyToMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import Category from './Category'
import Product from './Product'

export default class Subcategory extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public slug: string

  @column()
  public status: boolean

  @column({ columnName: 'category_id' })
  public categoryId: number

  @manyToMany(() => Product, {
    pivotTable: 'subcategory_product',
    pivotForeignKey: 'subcategory_id',
    pivotRelatedForeignKey: 'product_id',
  })
  public products: ManyToMany<typeof Product>

  @manyToMany(() => Category, {
    pivotTable: 'category_subcategory', // Name of the pivot table
    pivotForeignKey: 'subcategory_id', // Foreign key in the pivot table referencing subcategories
    pivotRelatedForeignKey: 'category_id', // Foreign key in the pivot table referencing categories
  })
  public categories: ManyToMany<typeof Category>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
