// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ProductVariation from 'App/Models/ProductVariation'
import Image from 'App/Models/Image'
import Category from 'App/Models/Category'
import CategoryImage from 'App/Models/CategoryImage'
import TagImage from 'App/Models/TagImage'
import Tag from 'App/Models/Tag'
import { GCS_BUCKET_FOLDER, GCS_BUCKET_NAME, GCS_BUCKET_KEY_FILE_NAME } from 'Config/constants'

export default class ImagesController {
  //UPLOAD IMAGES
  public async uploadImages({ params, request, response }: HttpContextContract) {
    //const fs = require('fs/promises')
    const { Storage } = require('@google-cloud/storage')
    const storage = new Storage({
      keyFilename: GCS_BUCKET_KEY_FILE_NAME, // Replace with the path to your service account key JSON file
    })

    const bucketName = GCS_BUCKET_NAME // Replace with your GCS bucket name

    try {
      const imageFiles = request.files('images')
      const productVariationId = params.id
      const productVariation = await ProductVariation.findOrFail(productVariationId)

      if (!productVariation) {
        return response.status(404).json({
          status: 'failure',
          message: 'Product variation with specified id does not exist',
        })
      }

      if (imageFiles && imageFiles.length > 0) {
        await Promise.all(
          imageFiles.map(async (image) => {
            // Generate a unique file name to avoid overwriting
            const fileName = `${new Date().getTime()}-${image.clientName}`
            const destination = `${GCS_BUCKET_FOLDER}/product_images/${fileName}` // Adjust the path as needed

            // Read the stream and save it to a temporary file
            /* const relativePath = `public/uploads/${fileName}` */
            // Move the image to the destination folder (public/uploads)
            /* await image.move(Application.publicPath('uploads'), { name: fileName }) */
            // Upload the image to Google Cloud Storage using Drive
            try {
              // Get the temporary file path
              /* const tmpFilePath = image.tmpPath */
              // Read the file content as a Buffer
              /* const fileBuffer = await fs.readFile(tmpFilePath) */
              // Upload the image to Google Cloud Storage
              await storage.bucket(bucketName).upload(image.tmpPath, {
                destination: destination,
                contentType: image.type,
              })
              // Create a new Image record in the database and link it to the product variation
              await Image.create({
                fileName: fileName,
                productVariationId: productVariationId,
                url: `https://storage.googleapis.com/${bucketName}/${destination}`, // Get the public URL of the uploaded file from Drive
              })
              /* await Drive.put(destination, image., {
                ContentType: image.type,
                bucket: bucketName,
                predefinedAcl: 'publicRead', // Ensure it's 'public-read' or 'publicRead'
              })
              debugger
              // Create a new Image record in the database and link it to the product variation
              await Image.create({
                fileName: fileName,
                productVariationId: productVariationId,
                url: await Drive.getUrl(destination), // Get the public URL of the uploaded file from Drive
              }) */
            } catch (error) {
              console.error('Error uploading file:', error)
            }
          })
        )
      }
      // Load associated images for the product variation
      await productVariation.load('images')

      // Now you can access the images
      //const images = productVariation.images

      /*       // If you want to get the image URLs
      const imageUrls = images.map((image) => image.url) */

      return response.status(201).json({
        status: 'Images uploaded successfully',
        productVariation: productVariation,
      })
    } catch (error) {
      // Handle any errors that might occur during the file upload or database operations
      return response.status(500).json({
        status: 'Error',
        message: 'An error occurred while uploading images.',
        error: error.message,
      })
    }
  }

  public async uploadProductVariationImages({ params, request, response }: HttpContextContract) {
    try {
      const imageFiles = request.files('images')
      const productVariationId = params.id
      const productVariation = await ProductVariation.findOrFail(productVariationId)
      const { Storage } = require('@google-cloud/storage')
      const storage = new Storage({
        keyFilename: GCS_BUCKET_KEY_FILE_NAME, // Replace with the path to your service account key JSON file
      })
      const bucketName = GCS_BUCKET_NAME // Replace with your GCS bucket name

      if (!productVariation) {
        return response.status(404).json({
          status: 'failure',
          message: 'Product variation with specified id does not exist',
        })
      }

      if (imageFiles && imageFiles.length > 0) {
        await Promise.all(
          imageFiles.map(async (image) => {
            // Generate a unique file name to avoid overwriting
            const fileName = `${new Date().getTime()}-${image.clientName}`
            const destination = `${GCS_BUCKET_FOLDER}/product_images/${fileName}` // Adjust the path as needed

            try {
              // Upload the image to Google Cloud Storage
              await storage.bucket(bucketName).upload(image.tmpPath, {
                destination: destination,
                contentType: image.type, // Use "type" instead of "Type"
              })

              // Create a new Image record in the database and link it to the product variation
              await Image.create({
                fileName: fileName, // Use "fileName" instead of "filename"
                productVariationId: productVariationId,
                url: `https://storage.googleapis.com/${bucketName}/${destination}`,
              })
            } catch (error) {
              console.error('Error uploading file:', error)
              throw error // Rethrow the error to handle it in the catch block
            }
          })
        )
      }

      // Load associated images for the product variation
      await productVariation.load('images')

      return response.status(201).json({
        status: 'Images uploaded successfully',
        productVariation: productVariation.toJSON(), // Convert model to JSON for response
      })
    } catch (error) {
      // Handle any errors that might occur during the file upload or database operations
      console.error('Error uploading images:', error)
      return response.status(500).json({
        status: 'Error',
        message: 'An error occurred while uploading images.',
        error: error.message,
      })
    }
  }

  //UPDATE IMAGE DETAILS
  public async updateImages({ params, request, response }) {
    try {
      const { id } = params
      const image = await Image.findOrFail(id)

      if (!image) {
        return response.status(404).json({
          status: 'failure',
          message: 'Image with specified id does not exist',
        })
      }

      // Parse the updated image details from the request body
      const { fileName, description } = request.only(['fileName', 'description'])

      // Update the image details
      image.fileName = fileName || image.fileName
      image.description = description || image.description

      // Save the updated image record
      await image.save()

      return response.status(200).json({
        status: 'Image updated successfully',
        image: image,
      })
    } catch (error) {
      return response.status(500).json({
        status: 'Error',
        message: 'An error occurred while updating the image.',
        error: error.message,
      })
    }
  }

  public async deleteImages({ params, response }) {
    const { Storage } = require('@google-cloud/storage')
    try {
      const { id } = params
      const image = await Image.findOrFail(id)

      if (!image) {
        return response.status(404).json({
          status: 'failure',
          message: 'Image with specified id does not exist',
        })
      }

      // Delete the image file from Google Cloud Storage
      const storage = new Storage({
        keyFilename: GCS_BUCKET_KEY_FILE_NAME, // Replace with the path to your service account key JSON file
      })
      const bucketName = 'your-bucket-name' // Replace with your GCS bucket name
      await storage.bucket(bucketName).file(image.fileName).delete()

      // Delete the image record from the database
      await image.delete()

      return response.status(200).json({
        status: 'Image deleted successfully',
      })
    } catch (error) {
      return response.status(500).json({
        status: 'Error',
        message: 'An error occurred while deleting the image.',
        error: error.message,
      })
    }
  }

  public async uploadCategoryImages({ params, request, response }: HttpContextContract) {
    try {
      const { Storage } = require('@google-cloud/storage')
      const storage = new Storage({
        keyFilename: GCS_BUCKET_KEY_FILE_NAME, // Replace with the path to your service account key JSON file
      })

      const bucketName = GCS_BUCKET_NAME // Replace with your GCS bucket name

      const imageFiles = request.files('images')
      const categoryId = params.id
      const category = await Category.findOrFail(categoryId)
      if (!category) {
        return response.status(404).json({
          status: 'failure',
          message: 'Category with specified id does not exist',
        })
      }

      if (imageFiles && imageFiles.length > 0) {
        await Promise.all(
          imageFiles.map(async (image) => {
            const fileName = `${new Date().getTime()}-${image.clientName}`
            const destination = `${GCS_BUCKET_FOLDER}/category_images/${fileName}`

            try {
              await storage.bucket(bucketName).upload(image.tmpPath, {
                destination: destination,
                contentType: image.type,
              })

              await CategoryImage.create({
                fileName: fileName,
                categoryId: categoryId,
                imageUrl: `https://storage.googleapis.com/${bucketName}/${destination}`,
              })
            } catch (error) {
              console.error('Error uploading file:', error)
            }
          })
        )
      }

      await category.load('images')

      return response.status(201).json({
        status: 'Images uploaded successfully',
        category: category,
      })
    } catch (error) {
      return response.status(500).json({
        status: 'Error',
        message: 'An error occurred while uploading images.',
        error: error.message,
      })
    }
  }

  public async updateCategoryImages({ params, request, response }: HttpContextContract) {
    try {
      const { id } = params
      const image = await Image.findOrFail(id)

      if (!image) {
        return response.status(404).json({
          status: 'failure',
          message: 'Image with specified id does not exist',
        })
      }

      const { fileName, description } = request.only(['fileName', 'description'])

      image.fileName = fileName || image.fileName
      image.description = description || image.description

      await image.save()

      return response.status(200).json({
        status: 'Image updated successfully',
        image: image,
      })
    } catch (error) {
      return response.status(500).json({
        status: 'Error',
        message: 'An error occurred while updating the image.',
        error: error.message,
      })
    }
  }

  public async deleteCategoryImages({ params, response }: HttpContextContract) {
    const { Storage } = require('@google-cloud/storage')
    try {
      const { id } = params
      const image = await Image.findOrFail(id)

      if (!image) {
        return response.status(404).json({
          status: 'failure',
          message: 'Image with specified id does not exist',
        })
      }

      const storage = new Storage({
        keyFilename: GCS_BUCKET_KEY_FILE_NAME,
      })

      const bucketName = 'your-bucket-name'

      await storage.bucket(bucketName).file(image.fileName).delete()
      await image.delete()

      return response.status(200).json({
        status: 'Image deleted successfully',
      })
    } catch (error) {
      return response.status(500).json({
        status: 'Error',
        message: 'An error occurred while deleting the image.',
        error: error.message,
      })
    }
  }

  public async uploadTagImages({ params, request, response }: HttpContextContract) {
    try {
      const { Storage } = require('@google-cloud/storage')
      const storage = new Storage({
        keyFilename: GCS_BUCKET_KEY_FILE_NAME,
      })

      const bucketName = GCS_BUCKET_NAME

      const imageFiles = request.files('images')
      const tagId = params.id
      const tag = await Tag.findOrFail(tagId)

      if (!tag) {
        return response.status(404).json({
          status: 'failure',
          message: 'Tag with specified id does not exist',
        })
      }

      if (imageFiles && imageFiles.length > 0) {
        await Promise.all(
          imageFiles.map(async (image) => {
            const fileName = `${new Date().getTime()}-${image.clientName}`
            const destination = `${GCS_BUCKET_FOLDER}/tag_images/${fileName}`

            try {
              await storage.bucket(bucketName).upload(image.tmpPath, {
                destination: destination,
                contentType: image.type,
              })

              await TagImage.create({
                fileName: fileName,
                tagId: tagId,
                imageUrl: `https://storage.googleapis.com/${bucketName}/${destination}`,
              })
            } catch (error) {
              console.error('Error uploading file:', error)
            }
          })
        )
      }

      await tag.load('images')

      return response.status(201).json({
        status: 'Images uploaded successfully',
        tag: tag,
      })
    } catch (error) {
      return response.status(500).json({
        status: 'Error',
        message: 'An error occurred while uploading images.',
        error: error.message,
      })
    }
  }

  public async updateTagImages({ params, request, response }: HttpContextContract) {
    try {
      const { id } = params
      const image = await TagImage.findOrFail(id)

      if (!image) {
        return response.status(404).json({
          status: 'failure',
          message: 'Image with specified id does not exist',
        })
      }

      const { fileName, description } = request.only(['fileName', 'description'])

      image.fileName = fileName || image.fileName
      image.description = description || image.description

      await image.save()

      return response.status(200).json({
        status: 'Image updated successfully',
        image: image,
      })
    } catch (error) {
      return response.status(500).json({
        status: 'Error',
        message: 'An error occurred while updating the image.',
        error: error.message,
      })
    }
  }

  public async deleteTagImages({ params, response }: HttpContextContract) {
    const { Storage } = require('@google-cloud/storage')

    try {
      const { id } = params
      const image = await TagImage.findOrFail(id)

      if (!image) {
        return response.status(404).json({
          status: 'failure',
          message: 'Image with specified id does not exist',
        })
      }

      const storage = new Storage({
        keyFilename: GCS_BUCKET_KEY_FILE_NAME,
      })

      const bucketName = GCS_BUCKET_NAME

      await storage.bucket(bucketName).file(image.fileName).delete()
      await image.delete()

      return response.status(200).json({
        status: 'Image deleted successfully',
      })
    } catch (error) {
      return response.status(500).json({
        status: 'Error',
        message: 'An error occurred while deleting the image.',
        error: error.message,
      })
    }
  }
}
