/* eslint-disable no-debugger */
// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Product from 'App/Models/Product'
import Category from 'App/Models/Category'
import Subcategory from 'App/Models/SubCategory'
import ProductVariation from 'App/Models/ProductVariation'
import csv from 'csv-parser'
import fs from 'fs'
import Inventory from 'App/Models/Inventory'

export default class ProductsController {
  /* public async store({ request, auth }: HttpContextContract) {
    // Get the authenticated user
    const user = auth.user!

    const images = request.files('images', {
      size: '5mb', // Set an appropriate size limit for the images
    })

    // Get the product details from the request
    const {
      id,
      title,
      description,
      shortDescription,
      brandId,
      status,
      featured,
      categories,
      subcategories,
      variations,
    } = request.only([
      'id',
      'title',
      'description',
      'shortDescription',
      'brandId',
      'status',
      'featured',
      'categories',
      'subcategories',
      'variations',
    ])

    // Create the product
    const product = new Product()
    product.title = title
    product.description = description
    product.shortDescription = shortDescription
    product.brandId = brandId
    product.status = status
    product.featured = featured
    product.userId = user.id
    product.id = id
    await product.save()

    // Attach categories to the product
    if (categories && categories.length > 0) {
      const categoryIds = await Category.query()
        .select('id')
        .whereIn('id', categories)
        .exec()
        .then((rows) => rows.map((row) => row.id))
      await product.related('categories').attach(categoryIds)
    }

    // Attach subcategories to the product
    if (subcategories && subcategories.length > 0) {
      const subcategoryIds = await Subcategory.query()
        .select('id')
        .whereIn('id', subcategories)
        .exec()
        .then((rows) => rows.map((row) => row.id))
      await product.related('subcategories').attach(subcategoryIds)
    }
    // Create and associate product variations
    if (variations && variations.length > 0) {
      await Promise.all(
        variations.map(async (variation: any) => {
          const newVariation = new ProductVariation()
          newVariation.productId = product.id // Associate the variation with the product
          newVariation.size = variation.size
          newVariation.color = variation.color
          newVariation.price = variation.price
          newVariation.salePrice = variation.salePrice
          await newVariation.save()
        })
      )
    }
    // Upload and associate the images
    debugger
    if (images && images.length > 0) {
      await Promise.all(
        images.map(async (images: any) => {
          const fileName = `${new Date().getTime()}.${images.extname}`
          await images.move(Application.publicPath('uploads'), { name: fileName })

          const imagesTable = new Image()
          imagesTable.fileName = fileName
          imagesTable.productVariationId = variations.id
          await variations.related('images').save()
          await imagesTable.save()
        })
      )
    }

    return product
  } */

  // CREATE PRODUCT
  // Controller method for handling Step 1: Basic Information API
  public async createProductBasicInformation({ auth, request, response }: HttpContextContract) {
    debugger
    // Get the authenticated user
    const user = auth.user!
    try {
      // Controller method for handling Step 3: Product Basic Information API
      const {
        title,
        description,
        shortDescription,
        brandId,
        featured,
        // Include other basic information fields here as needed
      } = request.only([
        'title',
        'description',
        'shortDescription',
        'brandId',
        'status',
        'featured',
        // Include other basic information fields here as needed
      ])

      // Validate the data (you can use validation rules or schema validation)
      // Example:
      if (!title || !description || !shortDescription || !brandId) {
        return response.status(400).json({ message: 'Incomplete product information provided.' })
      }

      // Save the basic product information to the database
      const product = new Product()
      product.title = title
      product.description = description
      product.shortDescription = shortDescription
      product.brandId = brandId
      product.featured = featured
      product.userId = user.id
      // Save other basic information fields to the product model as needed
      await product.save()

      // Return success response
      return response
        .status(201)
        .json({ message: 'Basic product information created successfully.', productId: product.id })
    } catch (error) {
      // Handle any errors
      console.error('Error creating basic product information:', error)
      return response
        .status(500)
        .json({ message: 'An error occurred while creating basic product information.' })
    }
  }

  // Controller method for handling Step 2: Categories and Subcategories API
  public async attachProductCategoriesAndSubcategories({
    auth,
    request,
    response,
  }: HttpContextContract) {
    try {
      // Get the authenticated user
      const user = auth.user!
      // Get the product ID and category/subcategory IDs from the request
      const { productId, categories, subcategories } = request.only([
        'productId',
        'categories',
        'subcategories',
      ])

      // Validate the data
      if (!productId || !categories || !subcategories) {
        return response.status(400).json({ message: 'Incomplete product information provided.' })
      }

      // Retrieve the product from the database
      const product = await Product.findOrFail(productId)

      // Validate that the authenticated user owns the product
      if (product.userId !== user.id) {
        return response
          .status(403)
          .json({ message: 'You are not authorized to modify this product.' })
      }
      // Attach the categories and subcategories to the product
      if (categories && categories.length > 0) {
        const categoryIds = await Category.query()
          .select('id')
          .whereIn('id', categories)
          .exec()
          .then((rows) => rows.map((row) => row.id))
        await product.related('categories').sync(categoryIds)
      }

      if (subcategories && subcategories.length > 0) {
        const subcategoryIds = await Subcategory.query()
          .select('id')
          .whereIn('id', subcategories)
          .exec()
          .then((rows) => rows.map((row) => row.id))
        await product.related('subcategories').sync(subcategoryIds)
      }

      // Return success response
      return response
        .status(200)
        .json({ message: 'Categories and subcategories added successfully.' })
    } catch (error) {
      // Handle any errors
      console.error('Error adding categories and subcategories:', error)
      return response
        .status(500)
        .json({ message: 'An error occurred while adding categories and subcategories.' })
    }
  }
  // Controller method for handling Step 3: Product Variations API
  public async createProductVariations({ auth, request, response }: HttpContextContract) {
    try {
      // Get the product ID and variations from the request
      const { productId, variations } = request.only(['productId', 'variations'])

      // Validate the data
      if (!productId || !variations || variations.length === 0) {
        return response.status(400).json({ message: 'Incomplete product information provided.' })
      }

      // Retrieve the product from the database
      const product = await Product.findOrFail(productId)

      // Validate that the product exists
      if (!product) {
        return response.status(404).json({ message: 'Product not found.' })
      }

      // Validate that the authenticated user owns the product
      if (product.userId !== auth.user!.id) {
        return response
          .status(403)
          .json({ message: 'You are not authorized to modify this product.' })
      }

      // Create and associate product variations
      await Promise.all(
        variations.map(async (variation: any) => {
          const newVariation = new ProductVariation()
          newVariation.productId = product.id // Associate the variation with the product
          newVariation.size = variation.size
          newVariation.color = variation.color
          newVariation.price = variation.price
          newVariation.salePrice = variation.salePrice
          newVariation.status = variation.status || 'in stock' // Default status to 'in stock' if not provided
          await newVariation.save()
        })
      )

      await product.load('variations')

      // Return success response
      return response
        .status(200)
        .json({ message: 'Product variations created successfully.', product: product })
    } catch (error) {
      // Handle any errors
      console.error('Error creating product variations:', error)
      return response
        .status(500)
        .json({ message: 'An error occurred while creating product variations.' })
    }
  }
  // Controller method for handling Step 4: Product Images API is Handled by the ImagesController

  //UPDATE PRODUCT DETAILS
  public async update({ request, response, params }: HttpContextContract) {
    try {
      debugger
      // Retrieve the existing product by ID from the database
      const productId = params.id
      const product = await Product.findOrFail(productId)
      debugger
      // Get the updated product details from the request
      const {
        title,
        description,
        shortDescription,
        brandId,
        featured,
        categories,
        subcategories,
        variations,
      } = request.only([
        'title',
        'description',
        'shortDescription',
        'brandId',
        'featured',
        'categories',
        'subcategories',
        'variations',
      ])

      // Update the product properties
      product.title = title
      product.description = description
      product.shortDescription = shortDescription
      product.brandId = brandId
      product.featured = featured

      // Update the product's relationships (categories, subcategories, and variations)

      // Update categories
      if (categories && categories.length > 0) {
        const categoryIds = await Category.query()
          .select('id')
          .whereIn('id', categories)
          .exec()
          .then((rows) => rows.map((row) => row.id))
        await product.related('categories').sync(categoryIds)
      }

      // Update subcategories
      if (subcategories && subcategories.length > 0) {
        const subcategoryIds = await Subcategory.query()
          .select('id')
          .whereIn('id', subcategories)
          .exec()
          .then((rows) => rows.map((row) => row.id))
        await product.related('subcategories').sync(subcategoryIds)
      }

      // Update variations
      /* if (variations && variations.length > 0) {
        // Iterate over the variations and update or create as needed
        await Promise.all(
          variations.map(async (variation: any) => {
            if (variation.id) {
              // If variation ID is present, update the existing variation
              const existingVariation = await ProductVariation.findBy('id', variation.id)
              if (existingVariation) {
                if (existingVariation.productId !== product.id) {
                  return response
                    .status(400)
                    .json({ message: 'Variation does not belong to the specified product' })
                }
                await existingVariation
                  .merge({
                    size: variation.size,
                    color: variation.color,
                    price: variation.price,
                    salePrice: variation.salePrice,
                  })
                  .save()
              }
              // Update inventory details for the variation
              if (variation.quantity || variation.low_stock_threshold || variation.in_stock) {
                const inventory = await Inventory.query()
                  .where('product_variation_id', variation.id)
                  .first()
                if (inventory) {
                  await inventory
                    .merge({
                      stockQuantity: variation.quantity,
                      lowStockThreshold: variation.low_stock_threshold,
                      inStock: variation.in_stock,
                    })
                    .save()
                }
              }
            } else {
              // If no variation ID, create a new variation
              const newVariation = new ProductVariation()
              newVariation.productId = product.id
              newVariation.size = variation.size
              newVariation.color = variation.color
              newVariation.price = variation.price
              newVariation.salePrice = variation.salePrice
              await newVariation.save()
              // Associate the new variation with the product
              await product.related('variations').create(newVariation)
              // Create inventory details for the new variation
              const inventory = new Inventory()
              inventory.productVariationId = newVariation.id
              inventory.stockQuantity = variation.quantity
              inventory.lowStockThreshold = variation.low_stock_threshold
              inventory.inStock = variation.in_stock
              await inventory.save()
            }
          })
        )
      } */

      if (variations && variations.length > 0) {
        // Iterate over the variations and update or create as needed
        await Promise.all(
          variations.map(async (variation: any) => {
            if (variation.id) {
              // If variation ID is present, update the existing variation
              const existingVariation = await ProductVariation.findOrFail(variation.id)
              if (existingVariation.productId !== product.id) {
                throw new Error('Variation does not belong to the specified product')
              }
              await existingVariation
                .merge({
                  size: variation.size,
                  color: variation.color,
                  price: variation.price,
                  salePrice: variation.salePrice,
                })
                .save()

              // Update inventory details for the variation
              if (variation.quantity || variation.low_stock_threshold || variation.in_stock) {
                const inventory = await Inventory.query()
                  .where('product_variation_id', variation.id)
                  .firstOrFail()
                await inventory
                  .merge({
                    stockQuantity: variation.quantity,
                    lowStockThreshold: variation.low_stock_threshold,
                    inStock: variation.in_stock,
                  })
                  .save()
              }
            } else {
              // If no variation ID, create a new variation
              const newVariation = new ProductVariation()
              newVariation.fill({
                productId: product.id,
                size: variation.size,
                color: variation.color,
                price: variation.price,
                salePrice: variation.salePrice,
              })
              await newVariation.save()

              // Associate the new variation with the product
              await product.related('variations').save(newVariation)

              // Create inventory details for the new variation
              const inventory = new Inventory()
              inventory.fill({
                productVariationId: newVariation.id,
                stockQuantity: variation.quantity,
                lowStockThreshold: variation.low_stock_threshold,
                inStock: variation.in_stock,
              })
              await inventory.save()
            }
          })
        )
      }

      // Merge and save the updated product details
      await product.merge({ title, description, shortDescription, brandId, featured }).save()
      await product.load('categories')
      await product.load('subcategories')
      await product.load('variations', (query) => {
        query.preload('inventory')
      })

      // Return a success response
      return response.status(200).json({ message: 'Product updated successfully', product })
    } catch (error) {
      // Handle any errors that might occur during the update
      return response
        .status(500)
        .json({ message: 'An error occurred while updating the product', error })
    }
  }

  //GEt all products that exist
  public async index({ response }: HttpContextContract) {
    try {
      const products = await Product.all()
      // Load variations
      await Promise.all(
        products.map(async (product) => {
          await product.load('variations')
        })
      )
      // Load inventory of each variation
      await Promise.all(
        products.map(async (product) => {
          await Promise.all(
            product.variations.map(async (variation) => {
              await variation.load('inventory')
            })
          )
        })
      )

      return response.json({
        status: 'success',
        data: products,
      })
    } catch (e) {
      return response.status(500).json({
        status: 'failure',
        message: 'An error occurred',
        error: e,
      })
    }
  }

  //Get my products (authenticated user (admin))
  public async myProducts({ response, auth }: HttpContextContract) {
    try {
      // Get the authenticated user
      const user = auth.user!
      const products = await Product.query().where('user_id', user.id)
      // console.log(products)
      if (!products) {
        return response.status(404).json({
          status: 'failure',
          message: 'Authenticated user has no products',
        })
      }

      return response.json({
        status: 'success',
        data: products,
      })
    } catch (e) {
      return response.status(500).json({
        status: 'failure',
        message: 'An error occurred',
        error: e,
      })
    }
  }

  //GET PRODUCT BY  USER ID
  public async getProductByUserId({ params, response }: HttpContextContract) {
    try {
      const products = await Product.query().where('user_id', params.id)
      // console.log(products)
      if (!products) {
        return response.status(404).json({
          status: 'failure',
          message: 'User has no products',
        })
      }

      return response.json({
        status: 'success',
        data: products,
      })
    } catch (e) {
      return response.status(500).json({
        status: 'failure',
        message: 'An error occurred',
        error: e,
      })
    }
  }

  //GET PRODUCT BY  PRODUCT ID
  public async get({ response, params }: HttpContextContract) {
    const id = params.id

    try {
      const product = await Product.find(id)
      if (!product) {
        return response.status(404).json({
          status: 'failure',
          message: 'Product with specified id does not exist',
        })
      }

      // Fetch variations, categories, subcategories, and tags
      const variations = await product.related('variations').query()
      const categories = await product.related('categories').query()
      const subCategories = await product.related('subcategories').query()
      const tags = await product.related('tags').query()
      debugger
      // Fetch images for each variation
      const variationImages = await Promise.all(
        variations.map(async (variation) => {
          const images = await variation.related('images').query()
          const inventory = await variation.related('inventory').query()
          return { variation, images, inventory }
        })
      )

      /* // Fetch Inventory details
      const variatonInventory = await Promise.all(
        variations.map(async (variation) => {
          const inventory = await variation.related('inventory').query()
          return { variation, inventory }
        })
      ) */

      const result = await product.getAverageReviewScore(product.id)
      if (result) {
        product.averageReviewScore = result.averageScore
        product.totalReviews = result.totalReviews
      } else {
        product.averageReviewScore = 0
        product.totalReviews = 0
      }

      return response.json({
        status: 'success',
        data: product,
        variations: variationImages, // Include images for each variation
        categories,
        subCategories,
        tags,
      })
    } catch (e) {
      return response.status(500).json({
        status: 'failure',
        message: 'An error occurred',
        error: e,
      })
    }
  }

  //DELETE PRODUCTS
  public async destroy({ params }: HttpContextContract) {
    // Find the product by ID
    const product = await Product.findOrFail(params.id)

    // Detach all categories and subcategories
    await product.related('categories').detach()
    await product.related('subcategories').detach()
    await product.related('tags').detach()

    // Delete the product
    await product.delete()

    return { message: 'Product deleted successfully' }
  }

  //SEARCH PRODUCTS
  public async search({ request }: HttpContextContract) {
    const {
      q,
      category,
      subcategory,
      brand,
      tags,
      page,
      limit,
      priceMin,
      priceMax,
      ratings,
      discounts,
      color,
      size,
    } = request.qs()

    // Start with a basic query
    let query = Product.query().where('is_active', true)

    // Select only the columns you need
    query.select(['id', 'title', 'description', 'short_description', 'brand_id', 'is_active'])

    if (q) {
      query.where((qb) => {
        qb.where('title', 'like', `%${q}%`)
          .orWhere('description', 'like', `%${q}%`)
          .orWhere('short_description', 'like', `%${q}%`)
      })
    }

    if (category) {
      query.whereHas('categories', (query) => {
        query.where('id', category)
      })
    }

    if (subcategory) {
      query.whereHas('subcategories', (query) => {
        query.where('subcategories.id', subcategory)
      })
    }

    if (brand) {
      query.whereHas('brand', (query) => {
        query.where('id', brand)
      })
    }

    if (tags) {
      query.whereHas('tags', (query) => {
        query.where('tags.id', tags)
      })
    }

    if (ratings) {
      // Convert the ratings input to a float
      const ratingValue = parseFloat(ratings)
      query.where((qb) => {
        qb.whereHas('reviews', (reviewQuery) => {
          reviewQuery.where('rating', '>=', ratingValue)
        })
      })
    }

    // Define a function to filter eligible variations
    const filterVariations = (variationsQuery) => {
      if (size) {
        variationsQuery.where('size', size)
      }
      if (color) {
        variationsQuery.where('color', color)
      }
      if (discounts) {
        variationsQuery.where('price', '!=', 'salePrice')
      }
      if (priceMin) {
        variationsQuery.where('sale_price', '>=', priceMin)
      }
      if (priceMax) {
        variationsQuery.where('sale_price', '<=', priceMax)
      }
    }

    // Load products with eligible variations
    let products

    if (size || color || discounts || priceMin || priceMax) {
      products = await query.whereHas('variations', filterVariations).paginate(page, limit)
    } else {
      // If no specific variations are eligible, load all variations for the products
      products = await query.paginate(page, limit)
    }

    // Iterate over the products
    for (const product of products) {
      // Load categories, subcategories, and brand relationships
      await product.load('categories')
      await product.load('subcategories')
      await product.load('brand')
      await product.load('tags')

      // Load eligible variations and their images
      const eligibleVariations = await product
        .related('variations')
        .query()
        .where(filterVariations)
        .preload('images')
      product.variations = eligibleVariations
    }

    return products
  }

  //ATTACH CROSS-SELL
  public async attachCrossSell({ params, request, response }) {
    const product = await Product.find(params.id)
    if (!product) {
      return response.status(404).json({ message: 'Product not found' })
    }

    const { crossSellIds } = request.only(['crossSellIds'])
    await product.related('crossSell').attach(crossSellIds)

    return response.status(200).json({ message: 'Cross-sell products attached successfully' })
  }

  //ATTACH UPSELL
  public async attachUpSell({ params, request, response }) {
    const product = await Product.find(params.id)
    if (!product) {
      return response.status(404).json({ message: 'Product not found' })
    }

    const { upSellIds } = request.only(['upSellIds'])
    await product.related('upSell').attach(upSellIds)

    return response.status(200).json({ message: 'Upsell products attached successfully' })
  }

  //GET CROSS-SELL
  public async getCrossSellProducts({ params, response }) {
    const product = await Product.find(params.id)
    if (!product) {
      return response.status(404).json({ message: 'Product not found' })
    }

    const crossSellProducts = await product.related('crossSell').query()
    return response.status(200).json({ crossSellProducts })
  }

  //GET UP-SELL
  public async getUpSellProducts({ params, response }) {
    const product = await Product.find(params.id)
    if (!product) {
      return response.status(404).json({ message: 'Product not found' })
    }

    const upSellProducts = await product.related('upSell').query()
    return response.status(200).json({ upSellProducts })
  }

  //BULK PRODCUT UPLOAD
  public async bulkUpload({ auth, request, response }: HttpContextContract) {
    const user = auth!.user
    return new Promise((resolve, reject) => {
      try {
        // Parse the CSV file uploaded in the request
        const file = request.file('csv')
        if (!file) {
          return response.status(400).json({ error: 'CSV file is required' })
        }

        const products: Partial<Product>[] = []
        debugger
        if (file.tmpPath) {
          fs.createReadStream(file.tmpPath)
            .pipe(csv())
            .on('data', (row) => {
              // Map CSV columns to Product model fields
              products.push({
                userId: user?.id,
                title: row.title,
                description: row.description,
                shortDescription: row.shortDescription,
                metaDescription: row.metaDescription,
                metaTitle: row.metaTitle,
                featured: row.featured,
                // Map other fields accordingly
              })
            })
            .on('end', async () => {
              // Bulk insert the products into the database
              await Product.createMany(products)

              resolve('Data uploaded successfully')
            })
            .on('error', (error) => {
              reject(error)
            })
        }
      } catch (error) {
        return response.status(500).json({ error: error })
      }
    })
  }

  //SET PRODUCT STATUS ON/OFF (TOGGLE)
  public async toggleProductStatus({ params, response }) {
    debugger
    const product = await Product.find(params.productId)
    if (!product) {
      return response.status(404).json({ message: 'Product not found' })
    }
    await product.load('variations', (query) => {
      query.preload('inventory')
    })

    // Check if variation and inventory exist
    if (product.variations.length === 0) {
      return response.status(400).json({ message: 'Product variations are required' })
    } else {
      for (const variation of product.variations) {
        if (!variation.inventory) {
          return response
            .status(400)
            .json({ message: 'Inventory details are required for all variations' })
        }
      }
    }

    product.isActive = !product.isActive
    await product.save()

    return response.status(200).json({
      message: `Product ${product.isActive ? 'enabled' : 'disabled'} successfully`,
    })
  }
}
