// app/Models/OrderItem.ts
import { BaseModel, belongsTo, BelongsTo, column, computed } from '@ioc:Adonis/Lucid/Orm'
import Order from './Order'
import Product from './Product'
import ProductVariation from './ProductVariation'

export default class OrderItem extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public orderId: number // This is the foreign key for the order association

  @column()
  public productId: number // This is the foreign key to the Product model

  @belongsTo(() => Order)
  public order: BelongsTo<typeof Order>

  @belongsTo(() => Product)
  public product: BelongsTo<typeof Product>

  @column()
  public productVariationId: number // This is the foreign key to the Product Variation Model

  @belongsTo(() => ProductVariation)
  public productVariation: BelongsTo<typeof ProductVariation>

  // Add other fields for order item (e.g., quantity, price, etc.)
  @column()
  public quantity: number

  @computed()
  public get price(): number {
    return this.quantity * this.productVariation.salePrice
  }
}
