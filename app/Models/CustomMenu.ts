import { DateTime } from 'luxon'
import {
  BaseModel,
  BelongsTo,
  ManyToMany,
  belongsTo,
  column,
  manyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import Category from './Category'
import Tag from './Tag'
import Role from './Role'

export default class CustomMenu extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public menuName: string

  @column()
  public menuItems: any // Assuming you want to store JSON data

  @column()
  public roleId: number = 1 // Assuming you have a relationship with admin users

  @column()
  public isSelectedForTop: boolean

  @column()
  public isSelectedForCategories: boolean

  @column()
  public isSelectedForTags: boolean

  @manyToMany(() => Category, {
    pivotTable: 'custom_menu_categories', // Pivot table name
  })
  public categories: ManyToMany<typeof Category>

  @manyToMany(() => Tag, {
    pivotTable: 'custom_menu_tags', // Pivot table name
  })
  public tags: ManyToMany<typeof Tag>

  @belongsTo(() => Role, {
    foreignKey: 'role_id', // The foreign key column in the custom_menus table
  })
  public role: BelongsTo<typeof Role>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
