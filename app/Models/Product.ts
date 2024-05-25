import { DateTime } from 'luxon'
import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  ManyToMany,
  manyToMany,
  hasMany,
  HasMany,
  afterFetch,
} from '@ioc:Adonis/Lucid/Orm'
import Category from './Category'
import Subcategory from './SubCategory'
import Brand from './Brand'
import Image from './Image'
import Review from './Review'
import ProductVariation from './ProductVariation'
import Tag from './Tag'
import SizeType from './SizeType'

export default class Product extends BaseModel {
  @column({ isPrimary: true, columnName: 'id' })
  public id: number

  @column()
  public userId: number

  @column()
  public title: string

  @column()
  public isActive: boolean

  @column()
  public description: string

  @column()
  public shortDescription: string

  @column()
  public brandId: number

  @column()
  public totalReviews: number

  @column()
  public averageReviewScore: number

  @column()
  public metaTitle: string

  @column()
  public metaDescription: string

  @column()
  public featured: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => ProductVariation)
  public variations: HasMany<typeof ProductVariation>

  @manyToMany(() => Category, {
    pivotTable: 'category_product',
    pivotForeignKey: 'product_id',
    pivotRelatedForeignKey: 'category_id',
  })
  public categories: ManyToMany<typeof Category>

  @manyToMany(() => Subcategory, {
    pivotTable: 'subcategory_product',
    pivotForeignKey: 'product_id',
    pivotRelatedForeignKey: 'subcategory_id',
  })
  public subcategories: ManyToMany<typeof Subcategory>

  @belongsTo(() => Brand)
  public brand: BelongsTo<typeof Brand>

  @hasMany(() => Image)
  public images: HasMany<typeof Image>

  @hasMany(() => Review)
  public reviews: HasMany<typeof Review>

  @manyToMany(() => Tag, {
    pivotTable: 'product_tag',
    pivotForeignKey: 'product_id',
    pivotRelatedForeignKey: 'tag_id',
  })
  public tags: ManyToMany<typeof Tag>

  @manyToMany(() => Product, {
    pivotTable: 'product_cross_sell',
    pivotForeignKey: 'product_id',
    pivotRelatedForeignKey: 'cross_sell_product_id',
  })
  public crossSell: ManyToMany<typeof Product>

  @manyToMany(() => Product, {
    pivotTable: 'product_up_sell',
    pivotForeignKey: 'product_id',
    pivotRelatedForeignKey: 'up_sell_product_id',
  })
  public upSell: ManyToMany<typeof Product>

  @manyToMany(() => SizeType, {
    pivotTable: 'product_size_type',
  })
  public sizeTypes: ManyToMany<typeof SizeType>

  // Method to calculate the average review score
  public async getAverageReviewScore(
    productId: number
  ): Promise<{ averageScore: number; totalReviews: number } | null> {
    const reviews = await Review.query().where('product_id', productId)

    if (reviews.length === 0) {
      return null // Return 0 if no reviews are available
    }

    const totalScore = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageScore = totalScore / reviews.length

    return { averageScore, totalReviews: reviews.length }
  }

  // Hook to calculate and populate the averageReviewScore after a Product is fetched
  @afterFetch()
  public static async calculateAverageReviewScore(products: Product[]) {
    for (const product of products) {
      const reviewStats = await product.getAverageReviewScore(product.id)
      if (reviewStats) {
        product.averageReviewScore = reviewStats.averageScore
        product.totalReviews = reviewStats.totalReviews
      } else {
        // Set default values if no reviews are available
        product.averageReviewScore = 0
        product.totalReviews = 0
      }
    }
  }
}
