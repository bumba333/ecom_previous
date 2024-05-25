import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, computed } from '@ioc:Adonis/Lucid/Orm'
import Product from './Product'
import Cart from './Cart'
import ProductVariation from './ProductVariation'

export default class CartItem extends BaseModel {
  [x: string]: any
  @column({ isPrimary: true })
  public id: number

  @column()
  public cartId: number

  @column()
  public productId: number

  @column()
  public quantity: number

  @belongsTo(() => Cart)
  public cart: BelongsTo<typeof Cart>

  @belongsTo(() => Product)
  public product: BelongsTo<typeof Product>

  @column()
  public productVariationId: number

  @belongsTo(() => ProductVariation)
  public productVariation: BelongsTo<typeof ProductVariation>

  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  debugger
  // Computed property to calculate the subtotal for the cart item
  @computed()
  public get subtotal(): number {
    if (this.productVariation && this.productVariation.salePrice) {
      return this.quantity * this.productVariation.salePrice
    }
    return 0
  }

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
