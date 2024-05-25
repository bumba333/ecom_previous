import { DateTime } from 'luxon'
import { BaseModel, HasMany, ManyToMany, column, hasMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import Product from './Product'
import CustomMenu from './CustomMenu'
import TagImage from './TagImage'

export default class Tag extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public description: string

  @manyToMany(() => Product, {
    pivotTable: 'product_tag',
    pivotForeignKey: 'tag_id',
    pivotRelatedForeignKey: 'product_id',
  })
  public products: ManyToMany<typeof Product>

  @manyToMany(() => CustomMenu)
  public customMenus: ManyToMany<typeof CustomMenu>

  @hasMany(() => TagImage)
  public images: HasMany<typeof TagImage>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
