// app/Controllers/Http/Admin/CustomMenuController.ts

import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CustomMenu from 'App/Models/CustomMenu'

export default class CustomMenuController {
  public async index({ response }: HttpContextContract) {
    try {
      // Fetch all custom menus with their associated categories and tags
      const customMenus = await CustomMenu.query().preload('categories').preload('tags')

      return response.ok(customMenus)
    } catch (error) {
      return response.status(500).json({ error: 'Internal server error' })
    }
  }

  public async show({ params, response }: HttpContextContract) {
    try {
      const customMenu = await CustomMenu.query()
        .where('id', params.id)
        .preload('categories', (query) => {
          query.preload('images')
        })
        .preload('tags', (q) => {
          q.preload('images')
        })
        .first()

      if (!customMenu) {
        return response.notFound('Custom menu not found')
      }

      return response.ok(customMenu)
    } catch (error) {
      return response.status(500).json({ error: error })
    }
  }

  public async store({ request, response }: HttpContextContract) {
    try {
      const {
        menuName,
        menuItems,
        categoryIds,
        tagIds,
        selectedTopMenu,
        selectedCategoriesMenu,
        selectedTagMenu,
      } = request.only([
        'menuName',
        'menuItems',
        'categoryIds',
        'tagIds',
        'selectedTopMenu',
        'selectedCategoriesMenu',
        'selectedTagMenu',
      ])
      const customMenu = new CustomMenu()
      customMenu.menuName = menuName
      customMenu.menuItems = JSON.stringify(menuItems) // Convert to JSON string
      if (selectedTopMenu) {
        customMenu.isSelectedForTop = selectedTopMenu
        // Check if there's an existing menu set to top and set it to false
        await CustomMenu.query()
          .where('is_selected_for_top', true)
          .update({ is_selected_for_top: false })
      }
      if (selectedCategoriesMenu) {
        customMenu.isSelectedForCategories = selectedCategoriesMenu
        // Check if there's an existing menu set for categories and set it to false
        await CustomMenu.query()
          .where('is_selected_for_categories', true)
          .update({ is_selected_for_categories: false })
      }
      if (selectedTagMenu) {
        customMenu.isSelectedForTags = selectedTagMenu
        // Check if there's an existing menu set for tags and set it to false
        await CustomMenu.query()
          .where('is_selected_for_tags', true)
          .update({ is_selected_for_tags: false })
      }

      await customMenu.save()

      // Attach categories and tags
      if (categoryIds && categoryIds.length) {
        await customMenu.related('categories').attach(categoryIds)
      }

      if (tagIds && tagIds.length) {
        await customMenu.related('tags').attach(tagIds)
      }

      return response.status(201).json({
        message: 'Custom menu created successfully',
        customMenu,
      })
    } catch (error) {
      return response.status(500).json({ error: error })
    }
  }

  public async update({ request, response, params }: HttpContextContract) {
    try {
      const {
        menuName,
        menuItems,
        categoryIds,
        tagIds,
        selectedTopMenu,
        selectedCategoriesMenu,
        selectedTagMenu,
      } = request.only([
        'menuName',
        'menuItems',
        'categoryIds',
        'tagIds',
        'selectedTopMenu',
        'selectedCategoriesMenu',
        'selectedTagMenu',
      ])

      const customMenuId = params.id
      const customMenu = await CustomMenu.findOrFail(customMenuId)

      // Update custom menu properties
      customMenu.menuName = menuName
      customMenu.menuItems = JSON.stringify(menuItems) // Convert to JSON string

      // Update selected menu options
      if (selectedTopMenu !== undefined) {
        customMenu.isSelectedForTop = selectedTopMenu
      }
      if (selectedCategoriesMenu !== undefined) {
        customMenu.isSelectedForCategories = selectedCategoriesMenu
      }
      if (selectedTagMenu !== undefined) {
        customMenu.isSelectedForTags = selectedTagMenu
      }

      // Save the updated custom menu
      await customMenu.save()

      // Sync categories and tags
      if (categoryIds && categoryIds.length) {
        await customMenu.related('categories').sync(categoryIds)
      } else {
        // If no categories are provided, detach all existing categories
        await customMenu.related('categories').detach()
      }

      if (tagIds && tagIds.length) {
        await customMenu.related('tags').sync(tagIds)
      } else {
        // If no tags are provided, detach all existing tags
        await customMenu.related('tags').detach()
      }

      return response.status(200).json({
        message: 'Custom menu updated successfully',
        customMenu,
      })
    } catch (error) {
      return response.status(500).json({ error: error.message })
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    try {
      const customMenu = await CustomMenu.find(params.id)

      if (!customMenu) {
        return response.notFound('Custom menu not found')
      }

      await customMenu.delete()

      return response.noContent()
    } catch (error) {
      return response.status(500).json({ error: 'Internal server error' })
    }
  }

  public async getSelectedMenus({ response }: HttpContextContract) {
    try {
      // Fetch the selected menus for top, categories, and tags.
      const selectedTopMenu = await CustomMenu.query().where('is_selected_for_top', true).first()

      const selectedCategoriesMenu = await CustomMenu.query()
        .where('is_selected_for_categories', true)
        .preload('categories', (q) => {
          q.preload('images')
        })
        .first()

      const selectedTagMenu = await CustomMenu.query()
        .where('is_selected_for_tags', true)
        .preload('tags', (q) => {
          q.preload('images')
        })
        .first()

      return response.status(200).json({
        selectedTopMenu,
        selectedCategoriesMenu,
        selectedTagMenu,
      })
    } catch (error) {
      return response.status(500).json({ error: error.message })
    }
  }
}
