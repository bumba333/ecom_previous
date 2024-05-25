import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Category from 'App/Models/Category'
import SubCategory from 'App/Models/SubCategory'

export default class SubCategoriesController {
  //Get all subCategories that exist

  public async index({ response }: HttpContextContract) {
    try {
      const subCategory = await SubCategory.query().preload('categories')
      return response.json({
        status: 'success',
        data: subCategory,
      })
    } catch (e) {
      return response.status(500).json({
        status: 'failure',
        message: 'An error occurred',
        error: e,
      })
    }
  }

  //Get Sub-Category List by Category ID
  public async findByCategoryId({ params, response }: HttpContextContract) {
    try {
      const categoryId = params.category_id // Get the category ID from the route parameters

      // Check if the category with the specified ID exists
      const category = await Category.find(categoryId)

      if (!category) {
        return response.status(404).json({
          status: 'failure',
          message: 'Category not found',
        })
      }

      // Query the SubCategory model to find subcategories with the specified category ID
      const subCategories = await SubCategory.query().where('category_id', categoryId)

      return response.json({
        status: 'success',
        data: subCategories,
      })
    } catch (e) {
      return response.status(500).json({
        status: 'failure',
        message: 'An error occurred',
        error: e,
      })
    }
  }

  //Get subCategory created by authenticated user
  public async mySubCategories({ response, auth }: HttpContextContract) {
    try {
      const subCategories = SubCategory.findBy('user_id', auth.user!.id)
      if (!subCategories) {
        return response.status(404).json({
          status: 'failure',
          message: 'Authenticated user has no categories',
        })
      }

      return response.json({
        status: 'success',
        data: subCategories,
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
      const subCategory = await SubCategory.find(id)

      if (!subCategory) {
        return response.status(404).json({
          status: 'failure',
          message: 'subCategory with specified id does not exist',
        })
      }

      return response.json({
        status: 'success',
        data: subCategory,
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
    const subcategoryId = params.id

    const subcategory = await SubCategory.findOrFail(subcategoryId)
    await subcategory.delete()

    return response.status(200).json({
      message: 'Subcategory deleted successfully',
    })
  }

  public async store({ request, response }: HttpContextContract) {
    const { name, categoryId } = request.only(['name', 'categoryId'])

    const subcategory = new SubCategory()
    subcategory.name = name
    subcategory.categoryId = categoryId

    await subcategory.save()
    // Attach the subcategory to the category using the relationship method
    await subcategory.related('categories').attach([categoryId])
    return response.status(201).json({
      message: 'Subcategory created successfully',
      subcategory,
    })
  }

  public async update({ request, response, params }: HttpContextContract) {
    const { name, categoryId } = request.only(['name', 'categoryId'])
    const subcategoryId = params.id

    const subcategory = await SubCategory.findOrFail(subcategoryId)
    // Check if the new category ID is different from the current one
    if (subcategory.categoryId !== categoryId) {
      // Detach the subcategory from the current category
      await subcategory.related('categories').detach([subcategory.categoryId])
      subcategory.categoryId = categoryId
      // Attach the subcategory to the new category
      await subcategory.related('categories').attach([categoryId])
    }
    // Update other subcategory properties
    subcategory.name = name // Update the name if needed
    await subcategory.save()
    return response.status(200).json({
      message: 'Subcategory updated successfully',
      subcategory,
    })
  }
}
