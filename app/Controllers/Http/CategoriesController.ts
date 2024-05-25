import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Category from 'App/Models/Category'

export default class CategoriesController {
  //Get all categories that exist

  public async index({ response }: HttpContextContract) {
    try {
      const categories = await Category.all()

      return response.json({
        status: 'success',
        data: categories,
      })
    } catch (e) {
      return response.status(500).json({
        status: 'failure',
        message: 'An error occurred',
        error: e,
      })
    }
  }

  //Get categories created by authenticated user
  public async myCategories({ response, auth }: HttpContextContract) {
    try {
      const categories = await Category.findBy('user_id', auth.user!.id)
      if (!categories) {
        return response.status(404).json({
          status: 'failure',
          message: 'Authenticated user has no categories',
        })
      }

      return response.json({
        status: 'success',
        data: categories,
      })
    } catch (e) {
      return response.status(500).json({
        status: 'failure',
        message: 'An error occurred',
        error: e,
      })
    }
  }

  public async get({ response, params }: HttpContextContract) {
    const id = params.id

    try {
      const category = await Category.find(id)

      if (!category) {
        return response.status(404).json({
          status: 'failure',
          message: 'category with specified id does not exist',
        })
      }
      // Load related subcategories
      await category.load('subcategories')

      // Load related products and images
      await category.load('products')
      await category.load('images')
      return response.json({
        status: 'success',
        data: category,
      })
    } catch (e) {
      return response.status(500).json({
        status: 'failure',
        message: 'An error occurred',
        error: e,
      })
    }
  }

  public async delete({ response, params }: HttpContextContract) {
    const id = params.id

    try {
      const category = await Category.find(id)

      if (!category) {
        return response.status(404).json({
          status: 'failure',
          message: 'Category with specified id does not exist',
        })
      }

      await category.delete()

      return response.status(200).json({
        status: 'success',
        message: 'Category deleted',
      })
    } catch (e) {
      return response.status(500).json({
        status: 'failure',
        message: 'An error occurred',
        error: e,
      })
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const { name, slug, description } = request.only(['name', 'slug', 'description'])

    const category = new Category()
    category.name = name
    category.slug = slug
    category.description = description

    await category.save()

    return response.status(201).json({
      message: 'Category created successfully',
      category,
    })
  }

  public async update({ request, response, params }: HttpContextContract) {
    const { id } = params
    const { name, slug, description } = request.only(['name', 'slug', 'description'])

    const category = await Category.findOrFail(id)

    category.name = name || category.name
    category.slug = slug || category.slug
    category.description = description

    await category.save()

    return response.status(200).json({
      message: 'Category updated successfully',
      category,
    })
  }

  public async attachChildCategory({ request, response }: HttpContextContract) {
    try {
      // Get the parent category's ID from the request
      const parentId = request.input('parentCategoryId')
      const childCategoryId = request.input('childCategoryId')

      // Find the parent category and child category models
      const parentCategory = await Category.find(parentId)
      const childCategory = await Category.find(childCategoryId)

      // Ensure both categories exist
      if (!parentCategory || !childCategory) {
        return response.status(404).json({
          status: 'failure',
          message: 'Parent or child category not found',
        })
      }

      // Attach the child category to the parent category
      /*  await parentCategory.related('childCategories').firstOrCreate(childCategory) */

      // Update the child category's parentCategoryId to associate it with the parent category
      childCategory.parentCategoryId = parentCategory.id
      await childCategory.save()

      return response.status(200).json({
        status: 'success',
        message: 'Child category attached to the parent category',
      })
    } catch (error) {
      return response.status(500).json({
        status: 'error',
        message: 'An error occurred while attaching the child category to the parent category',
        error: error.message,
      })
    }
  }

  public async getChildCategories({ params, response }: HttpContextContract) {
    try {
      // Assuming you pass the parentCategoryId in the route params
      const { parentCategoryId } = params

      // Find the parent category by its ID
      const parentCategory = await Category.findOrFail(parentCategoryId)

      // Find all child categories that have the parentCategoryId matching the parent category's ID
      const childCategories = await Category.query().where('parentCategoryId', parentCategory.id)

      return response.status(200).json({
        message: 'Child categories retrieved successfully',
        childCategories,
      })
    } catch (error) {
      console.error('Error retrieving child categories:', error)
      return response.status(500).json({
        message: 'An error occurred while retrieving child categories.',
        error: error.message,
      })
    }
  }

  public async detachChildCategory({ request, response }: HttpContextContract) {
    try {
      // Get the parent category's ID from the request
      const parentId = request.input('parentCategoryId')
      const childCategoryId = request.input('childCategoryId')

      // Find the parent category and child category models
      const parentCategory = await Category.find(parentId)
      const childCategory = await Category.find(childCategoryId)

      // Ensure both categories exist
      if (!parentCategory || !childCategory) {
        return response.status(404).json({
          status: 'failure',
          message: 'Parent or child category not found',
        })
      }

      // Detach the child category from the parent category by setting the parentCategoryId to null
      childCategory.parentCategoryId = null
      await childCategory.save()

      return response.status(200).json({
        status: 'success',
        message: 'Child category detached from the parent category',
      })
    } catch (error) {
      return response.status(500).json({
        status: 'error',
        message: 'An error occurred while detaching the child category from the parent category',
        error: error.message,
      })
    }
  }
}
