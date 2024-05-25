import { DateTime } from 'luxon'
import {
  BaseModel,
  BelongsTo,
  HasMany,
  HasOne,
  belongsTo,
  column,
  hasMany,
  hasOne,
} from '@ioc:Adonis/Lucid/Orm'
import Image from './Image'
import Product from './Product'
import Inventory from './Inventory'
import ProductSize from './ProductSize'

export default class ProductVariation extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public productId: number

  @belongsTo(() => Product)
  public product: BelongsTo<typeof Product>

  @column()
  public size: string

  @column()
  public color: string

  @column()
  public price: number

  @column()
  public salePrice: number

  @column() public status: 'in stock' | 'out of stock' | 'pre-order'

  // Other specific fields for the variation

  @hasMany(() => Image)
  public images: HasMany<typeof Image>

  @hasOne(() => Inventory)
  public inventory: HasOne<typeof Inventory>

  public async getImageUrls(): Promise<string[]> {
    const images = this.images
    return images.map((image) => image.url)
  }
  @column()
  public productSizeId: number

  @belongsTo(() => ProductSize)
  public productSize: BelongsTo<typeof ProductSize>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
