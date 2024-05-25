import { DateTime } from 'luxon'
import {
  BaseModel,
  column,
  belongsTo,
  BelongsTo,
  HasMany,
  hasMany,
  ManyToMany,
  manyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import Product from './Product'
import Subcategory from './SubCategory'
import CategoryImage from './CategoryImage'
import CustomMenu from './CustomMenu'

export default class Category extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public slug: string

  @column()
  public description: string

  @column()
  public status: boolean

  @column()
  public imageFileName: string | null

  @column()
  public imageDescription: string | null

  @column()
  public parentCategoryId: number | null

  @hasMany(() => CategoryImage)
  public images: HasMany<typeof CategoryImage>

  @belongsTo(() => Category, {
    foreignKey: 'category_id',
    onQuery: (query) => {
      query.whereNotNull('category_id')
    },
  })
  public parentCategory: BelongsTo<typeof Category>

  /* @hasMany(() => Category, {
    foreignKey: 'category_id',
    onQuery: (query) => {
      query.whereNull('category_id')
    },
  })
  public childCategories: HasMany<typeof Category> */

  @manyToMany(() => Subcategory, {
    pivotTable: 'category_subcategory', // Name of the pivot table
    pivotForeignKey: 'category_id', // Foreign key in the pivot table referencing categories
    pivotRelatedForeignKey: 'subcategory_id', // Foreign key in the pivot table referencing subcategories
  })
  public subcategories: ManyToMany<typeof Subcategory>

  @manyToMany(() => Product, {
    pivotTable: 'category_product',
    pivotForeignKey: 'category_id',
    pivotRelatedForeignKey: 'product_id',
  })
  public products: ManyToMany<typeof Product>

  @manyToMany(() => CustomMenu)
  public customMenus: ManyToMany<typeof CustomMenu>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
