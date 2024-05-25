import Cart from 'App/Models/Cart'
import CartItem from 'App/Models/CartItem'
import ProductVariation from 'App/Models/ProductVariation'

export default class CartService {
  public async getOrCreateCart(userId: number): Promise<Cart> {
    let cart = await Cart.query().where('user_id', userId).first()

    if (!cart) {
      cart = await Cart.create({ userId })
    }

    return cart
  }

  public async findCartItem(
    cart: Cart,
    productId: number,
    productVariationId: number
  ): Promise<CartItem | null> {
    return cart
      .related('items')
      .query()
      .where('product_id', productId)
      .where('product_variation_id', productVariationId)
      .first()
  }

  public async createCartItem(
    cart: Cart,
    productId: number,
    productVariationId: number,
    quantity: number
  ): Promise<void> {
    const cartItem = new CartItem()
    cartItem.productId = productId
    cartItem.productVariationId = productVariationId
    cartItem.quantity = quantity
    await cartItem.related('cart').associate(cart)
    await cartItem.save()
  }

  public async calculateAndUpdateTotalAmount(cart: Cart): Promise<void> {
    const cartItems = await cart.related('items').query().preload('productVariation')

    let totalAmount = 0

    for (const cartItem of cartItems) {
      const productVariation = cartItem.productVariation as ProductVariation
      totalAmount += cartItem.quantity * productVariation.salePrice
    }
    cart.totalAmount = totalAmount
    await cart.save()
  }
}
