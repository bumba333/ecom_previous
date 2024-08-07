import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Slider from 'App/Models/Slider'
import SliderImage from 'App/Models/SliderImage'
import { GCS_BUCKET_NAME, GCS_BUCKET_FOLDER, GCS_BUCKET_KEY_FILE_NAME } from 'Config/constants'

export default class SliderController {
  public async index({ response }: HttpContextContract) {
    try {
      // Fetch all sliders
      const sliders = await Slider.all()
      sliders.forEach((element) => {
        element.load('images')
      })
      return response.status(200).json({ sliders })
    } catch (error) {
      return response.status(500).json({ error: 'Internal server error' })
    }
  }

  public async show({ params, response }: HttpContextContract) {
    try {
      // Find a slider by its ID
      const slider = await Slider.find(params.id)

      if (!slider) {
        return response.notFound('Slider not found')
      }
      await slider.load('images')
      return response.status(200).json({ slider })
    } catch (error) {
      return response.status(500).json({ error: 'Internal server error' })
    }
  }

  public async store({ request, response }: HttpContextContract) {
    try {
      // Parse request data
      const { isActive, title, description, linkType, linkId } = request.only([
        'isActive',
        'title',
        'description',
        'linkType',
        'linkId',
      ])
      // Create a new slider entry with image URLs
      const slider = new Slider()

      // Set remaining slider properties
      slider.isActive = isActive
      slider.title = title
      slider.description = description
      slider.linkType = linkType
      slider.linkId = linkId

      // Save the slider to the database
      await slider.save()

      return response.status(201).json({
        status: 'Slider created successfully',
        slider: slider,
      })
    } catch (error) {
      return response.status(500).json({
        status: 'Error',
        message: 'An error occurred while creating the slider.',
        error: error.message,
      })
    }
  }

  public async uploadImage({ params, request, response }: HttpContextContract) {
    const { Storage } = require('@google-cloud/storage')
    try {
      // Initialize Google Cloud Storage
      const storage = new Storage({
        keyFilename: GCS_BUCKET_KEY_FILE_NAME, // Replace with the path to your service account key JSON file
      })
      const bucketName = GCS_BUCKET_NAME // Replace with your GCS bucket name

      // Handle image uploads
      const imageFiles = request.files('images')
      const sliderId = params.id
      const slider = await Slider.findOrFail(sliderId)
      if (!slider) {
        return response.status(404).json({
          status: 'failure',
          message: 'Slider with specified id does not exist',
        })
      }
      if (imageFiles && imageFiles.length > 0) {
        await Promise.all(
          imageFiles.map(async (image) => {
            const fileName = `${new Date().getTime()}-${image.clientName}`
            const destination = `${GCS_BUCKET_FOLDER}/slider_images/${fileName}`
            try {
              // Upload image to Google Cloud Storage
              await storage.bucket(bucketName).upload(image.tmpPath, {
                destination,
                contentType: image.type,
              })
              await SliderImage.create({
                fileName: fileName,
                sliderId: sliderId,
                imageUrl: `https://storage.googleapis.com/${bucketName}/${destination}`,
              })
            } catch (error) {
              console.error('Error uploading file:', error)
            }
          })
        )
      }
      await slider.load('images')
      return response.status(201).json({
        status: 'Slider Image uploaded successfully',
        slider: slider,
      })
    } catch (error) {
      return response.status(500).json({
        status: 'Error',
        message: 'An error occurred while creating the slider.',
        error: error.message,
      })
    }
  }

  public async updateImage({ params, request, response }: HttpContextContract) {
    const { Storage } = require('@google-cloud/storage')
    const trx = await Database.transaction() // Start a database transaction
    try {
      // Initialize Google Cloud Storage
      const storage = new Storage({
        keyFilename: GCS_BUCKET_KEY_FILE_NAME, // Replace with the path to your service account key JSON file
      })
      const bucketName = GCS_BUCKET_NAME // Replace with your GCS bucket name

      // Handle image uploads
      const imageFiles = request.files('images')
      const sliderId = params.id
      const slider = await Slider.findOrFail(sliderId, trx) // Load the slider within the transaction

      if (!slider) {
        return response.status(404).json({
          status: 'failure',
          message: 'Slider with specified id does not exist',
        })
      }

      // Delete existing images associated with the slider
      await slider.related('images').query().delete()

      if (imageFiles && imageFiles.length > 0) {
        await Promise.all(
          imageFiles.map(async (image) => {
            const fileName = `${new Date().getTime()}-${image.clientName}`
            const destination = `slider_images/${fileName}`
            try {
              // Upload image to Google Cloud Storage
              await storage.bucket(bucketName).upload(image.tmpPath, {
                destination,
                contentType: image.type,
              })
              await SliderImage.create(
                {
                  fileName: fileName,
                  sliderId: sliderId,
                  imageUrl: `https://storage.googleapis.com/${bucketName}/${destination}`,
                },
                trx // Attach the transaction context to the database operation
              )
            } catch (error) {
              console.error('Error uploading file:', error)
              await trx.rollback() // Rollback the transaction on error
            }
          })
        )
      }

      // Commit the transaction
      await trx.commit()

      // Reload the slider with updated images
      await slider.load('images')

      return response.status(200).json({
        status: 'Slider Images updated successfully',
        slider: slider,
      })
    } catch (error) {
      return response.status(500).json({
        status: 'Error',
        message: 'An error occurred while updating the slider images.',
        error: error.message,
      })
    }
  }

  public async uploadImageCLDNRY({ params, request, response }: HttpContextContract) {
    try {
      // Handle image uploads
      const imageFiles = request.files('images')
      const sliderId = params.id
      const slider = await Slider.findOrFail(sliderId)

      if (!slider) {
        return response.status(404).json({
          status: 'failure',
          message: 'Slider with specified id does not exist',
        })
      }

      if (imageFiles && imageFiles.length > 0) {
        await Promise.all(
          imageFiles.map(async (image) => {
            // Generate a unique file name to avoid overwriting
            const fileName = `${new Date().getTime()}-${image.clientName}`

            try {
              // Upload the image to Cloudinary
              const result = await cloudinary.v2.uploader.upload(image.tmpPath, {
                public_id: fileName,
                folder: 'slider_images',
              })

              // Create a new SliderImage record in the database and link it to the slider
              await SliderImage.create({
                fileName: fileName,
                sliderId: sliderId,
                imageUrl: result.secure_url,
              })
            } catch (error) {
              console.error('Error uploading file:', error)
              throw error // Rethrow the error to handle it in the catch block
            }
          })
        )
      }

      // Load associated images for the slider
      await slider.load('images')

      return response.status(201).json({
        status: 'Slider Image uploaded successfully',
        slider: slider,
      })
    } catch (error) {
      return response.status(500).json({
        status: 'Error',
        message: 'An error occurred while uploading the slider image.',
        error: error.message,
      })
    }
  }

  public async updateImageCLDNRY({ params, request, response }: HttpContextContract) {
    const trx = await Database.transaction() // Start a database transaction
    try {
      // Handle image uploads
      const imageFiles = request.files('images')
      const sliderId = params.id
      const slider = await Slider.findOrFail(sliderId, trx) // Load the slider within the transaction

      if (!slider) {
        return response.status(404).json({
          status: 'failure',
          message: 'Slider with specified id does not exist',
        })
      }

      // Delete existing images associated with the slider
      await slider.related('images').query().delete()

      if (imageFiles && imageFiles.length > 0) {
        await Promise.all(
          imageFiles.map(async (image) => {
            // Generate a unique file name to avoid overwriting
            const fileName = `${new Date().getTime()}-${image.clientName}`
            const publicId = `slider_images/${fileName}`

            try {
              // Upload the new image to Cloudinary
              const result = await cloudinary.v2.uploader.upload(image.tmpPath, {
                public_id: publicId,
                folder: 'slider_images',
              })

              // Create a new SliderImage record in the database and link it to the slider
              await SliderImage.create(
                {
                  fileName: fileName,
                  sliderId: sliderId,
                  imageUrl: result.secure_url,
                },
                trx // Attach the transaction context to the database operation
              )
            } catch (error) {
              console.error('Error uploading file:', error)
              await trx.rollback() // Rollback the transaction on error
              throw error // Rethrow the error to handle it in the catch block
            }
          })
        )
      }

      // Commit the transaction
      await trx.commit()

      // Reload the slider with updated images
      await slider.load('images')

      return response.status(200).json({
        status: 'Slider Images updated successfully',
        slider: slider,
      })
    } catch (error) {
      await trx.rollback() // Rollback the transaction on error
      return response.status(500).json({
        status: 'Error',
        message: 'An error occurred while updating the slider images.',
        error: error.message,
      })
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    const { isActive, title, description, linkType, linkId } = request.only([
      'isActive',
      'title',
      'description',
      'linkType',
      'linkId',
    ])

    try {
      // Find the slider by its ID
      const slider = await Slider.findOrFail(params.id)

      // Update slider properties
      slider.isActive = isActive
      slider.title = title
      slider.description = description
      slider.linkType = linkType
      slider.linkId = linkId

      // Save the updated slider to the database
      await slider.save()

      return response.status(200).json({
        status: 'Slider updated successfully',
        slider: slider,
      })
    } catch (error) {
      return response.status(500).json({
        status: 'Error',
        message: 'An error occurred while updating the slider.',
        error: error.message,
      })
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    try {
      // Find a slider by its ID and delete it
      const slider = await Slider.find(params.id)

      if (!slider) {
        return response.notFound('Slider not found')
      }

      await slider.delete()

      return response.noContent()
    } catch (error) {
      return response.status(500).json({ error: 'Internal server error' })
    }
  }

  public async getSliders({ response }: HttpContextContract) {
    try {
      // Fetch the list of sliders for the home page.
      const sliders = await Slider.query().where('is_active', true).preload('images')

      return response.status(200).json(sliders)
    } catch (error) {
      return response.status(500).json({ error: error.message })
    }
  }
}
