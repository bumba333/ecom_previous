import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Product from './Product'
import ProductVariation from './ProductVariation'

export default class Inventory extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public productId: number // For linking to the Product model

  @column()
  public productVariationId: number // For linking to the ProductVariation model

  @column()
  public stockQuantity: number // Current stock quantity

  @column()
  public lowStockThreshold: number // A threshold indicating when stock is considered low

  @column()
  public inStock: boolean // A flag indicating if the item is in stock

  @column()
  public totalSold: number // Track the total number of items sold for this variation

  @belongsTo(() => Product)
  public product: BelongsTo<typeof Product>

  @belongsTo(() => ProductVariation)
  public variation: BelongsTo<typeof ProductVariation>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
