// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Hash from '@ioc:Adonis/Core/Hash'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Address from 'App/Models/Address'
import Order from 'App/Models/Order'
import User from 'App/Models/User'
import Database from '@ioc:Adonis/Lucid/Database'
import { v4 as uuid } from 'uuid'
import Mail from '@ioc:Adonis/Addons/Mail'
import PasswordReset from 'App/Models/PasswordReset'
import { DateTime } from 'luxon'

export default class UsersController {
  // USER SIGN UP
  public async signup({ request, response, auth }: HttpContextContract) {
    const data = await request.validate({
      schema: schema.create({
        first_name: schema.string.optional({ trim: true }),
        last_name: schema.string.optional({ trim: true }),
        email: schema.string({ trim: true }, [rules.email(), rules.regex(/^\S+@\S+\.\S+$/)]),
        password: schema.string({ trim: true }, [rules.minLength(8)]),
        /* password: schema.string({ trim: true }, [rules.minLength(8), rules.confirmed()]), */
        contact_number: schema.string({ trim: true }, [rules.mobile()]),
        gender: schema.string.optional({ trim: true }),
        role_id: schema.number(),
        address: schema.string.optional({ trim: true }),
      }),
    })

    try {
      const checkIfEmailExists = await User.findBy('email', data.email)

      if (checkIfEmailExists) {
        return response.status(400).json({
          status: 'failure',
          message: 'Email already exists',
        })
      }

      const user = await User.create({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: data.password,
        gender: data.gender,
        contact_number: data.contact_number,
        roleId: data.role_id,
      })

      const token = await auth.use('api').login(user, {
        expiresIn: '10 days',
      })

      return response.status(201).json({
        status: 'success',
        message: 'Signup successful',
        token: token,
      })
    } catch (e) {
      return response.status(500).json({
        status: 'failure',
        message: 'An error occurred',
        error: e,
      })
      //console.log(e)
    }
  }

  // USER LOG-IN
  public async login({ request, response, auth }: HttpContextContract) {
    const data = await request.validate({
      schema: schema.create({
        email: schema.string({}, [rules.email()]),
        password: schema.string({}, [rules.minLength(8)]),
      }),
    })

    try {
      const token = await auth.use('api').attempt(data.email, data.password, {
        expiresIn: '10 days',
      })

      return response.json({
        status: 'Success',
        data: token,
        user: auth.user,
      })
    } catch (error) {
      return response.status(500).json({
        status: 'failure',
        message: 'An error occurred',
        error: error,
      })
    }
  }

  // USER LOGOUT
  public async logout({ auth, response }: HttpContextContract) {
    try {
      await auth.use('api').logout()
      await auth.logout()
      return response.status(200).json({
        status: 'success',
        message: 'Successfully logged out',
      })
    } catch (error) {
      return response.status(500).json({
        status: 'failure',
        data: error,
      })
    }
  }

  // GET USER PROFILE
  public async profile({ response, auth }: HttpContextContract) {
    try {
      // Get the authenticated user
      const user = auth.user

      if (!user) {
        return response.status(401).json({
          status: 'error',
          message: 'User not authenticated',
        })
      }

      // Fetch additional user profile data as needed
      // For example, you might want to fetch associated data like orders, addresses, etc.
      const orderCount = await Order.query().where('user_id', user.id).count('* as total').first() //Count Orders
      const userOrderCount = orderCount?.totalAmount // userOrderCount contains the count of orders
      const addresses = await Address.query().where('user_id', user.id) // Load addresses if there's a relationship defined

      // Return the user's profile
      return response.status(200).json({
        status: 'success',
        data: {
          user: user,
          userOrderCount: userOrderCount,
          addresses: addresses,
          // Include other profile data here
        },
      })
    } catch (error) {
      console.error(error)

      return response.status(500).json({
        status: 'error',
        message: 'An error occurred while fetching the user profile',
      })
    }
  }

  // UPDATE PROFILE
  public async updateProfile({ request, response, auth }: HttpContextContract) {
    try {
      // Get the authenticated user
      const user = auth.user!

      // Validate the request data
      const data = await request.validate({
        schema: schema.create({
          first_name: schema.string.optional({ trim: true }),
          last_name: schema.string.optional({ trim: true }),
          email: schema.string.optional({ trim: true }, [
            rules.email(),
            rules.regex(/^\S+@\S+\.\S+$/),
          ]),
          contact_number: schema.string.optional({ trim: true }, [rules.mobile()]),
          gender: schema.string.optional({ trim: true }),
        }),
      })

      // Update the user's profile fields
      user.merge(data)
      await user.save()

      return response.status(200).json({
        status: 'success',
        message: 'Profile updated successfully',
      })
    } catch (error) {
      return response.status(500).json({
        status: 'failure',
        message: 'An error occurred while updating the profile',
        error: error.message,
      })
    }
  }

  // CHANGE PASSWORD
  public async changePassword({ request, response, auth }: HttpContextContract) {
    try {
      // Get the authenticated user
      const user = auth.user!

      // Validate the request data
      const data = await request.validate({
        schema: schema.create({
          current_password: schema.string({}, [rules.minLength(8)]),
          new_password: schema.string({}, [rules.minLength(8)]),
          new_password_confirmation: schema.string({}, [
            rules.minLength(8),
            rules.confirmed('new_password'),
          ]),
        }),
      })

      // Check if the current password matches
      const isPasswordValid = await Hash.verify(user.password, data.current_password)

      if (!isPasswordValid) {
        return response.status(400).json({
          status: 'failure',
          message: 'Current password is incorrect',
        })
      }

      // Update the user's password
      user.password = data.new_password
      await user.save()

      return response.status(200).json({
        status: 'success',
        message: 'Password changed successfully',
      })
    } catch (error) {
      return response.status(500).json({
        status: 'failure',
        message: 'An error occurred while changing the password',
        error: error.message,
      })
    }
  }

  // FORGOT PASSWORD
  public async forgotPassword({ request, response }: HttpContextContract) {
    try {
      // Validate the request data
      const email = request.input('email')
      const user = await User.findBy('email', email)

      if (!user) {
        return response.status(400).json({
          status: 'failure',
          message: 'User with this email does not exist',
        })
      }
      // Generate a secure token and store it in the database
      const token = uuid()
      // Set the expiration time (e.g., 1 hour from now)
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 1)

      await Database.table('password_resets').insert({
        email: email,
        token: token,
        created_at: new Date(),
        expires_at: expiresAt,
      })
      // Send a password reset email with the token as a query parameter
      await Mail.send((message) => {
        message
          .to(email)
          .subject('Password Reset Request')
          .htmlView('emails/password_reset', {
            resetLink: 'https://example.com/reset-password?token=' + token,
          })
      })

      return response.status(200).json({
        status: 'success',
        message: 'Password reset email sent',
      })
    } catch (error) {
      return response.status(500).json({
        status: 'failure',
        message: 'An error occurred while processing the request',
        error: error,
      })
    }
  }

  //RESET PASSWORD

  // Method to initiate the password reset process (send reset email)
  public async sendPasswordResetLink({ request, response }: HttpContextContract) {
    const { email } = request.only(['email'])
    const user = await User.findBy('email', email)

    if (!user) {
      return response.status(404).json({ message: 'User not found' })
    }

    // Generate and store a password reset token
    //const token = await user.createPasswordResetToken()

    // Send the password reset email (you can use a mailing library like Mailgun)
    // Include the token in the reset link
    // Send the reset link to the user's email

    return response.status(200).json({ message: 'Password reset link sent' })
  }

  // Method to reset the user's password
  public async resetPassword({ request, response }: HttpContextContract) {
    const { token, password } = request.only(['token', 'password'])

    // Find the password reset token
    const passwordReset = await PasswordReset.findBy('token', token)

    if (!passwordReset) {
      return response.status(404).json({ message: 'Invalid or expired token' })
    }

    // Check if the token has expired
    if (passwordReset.expiresAt < DateTime.now()) {
      return response.status(400).json({ message: 'Token has expired' })
    }

    // Find the user associated with the token
    const user = await User.findOrFail(passwordReset.userId)

    // Update the user's password
    user.password = password
    await user.save()

    // Delete the used password reset token
    await passwordReset.delete()

    return response.status(200).json({ message: 'Password reset successful' })
  }

  //LIST USER
  public async listUsers({ response }) {
    try {
      // Fetch all users from the database
      const users = await User.all()

      // Return the list of users
      return response.status(200).json(users)
    } catch (error) {
      return response.status(500).json({ message: 'An error occurred while fetching users' })
    }
  }

  //LIST USER BY ROLE
  public async listUsersByRole({ params, response }) {
    try {
      const roleId = params.roleId // Access the roleId from route parameters

      // Fetch users with a specific role_id from the database
      const users = await User.query().where('role_id', roleId)

      // Return the list of users with the specified role
      return response.status(200).json(users)
    } catch (error) {
      return response.status(500).json({ message: 'An error occurred while fetching users' })
    }
  }

  // SHOW PARTICULAR USER
  public async showUser({ params, response }) {
    try {
      // Retrieve the user by their ID from the database
      const user = await User.find(params.id)

      // Check if the user exists
      if (!user) {
        return response.status(404).json({ message: 'User not found' })
      }

      // Return the user's details
      return response.status(200).json(user)
    } catch (error) {
      return response.status(500).json({ message: 'An error occurred while fetching user details' })
    }
  }

  // UPDATE USER ROLE
  public async updateUserRole({ params, request, response }) {
    try {
      // Retrieve the user by their ID from the database
      const user = await User.find(params.id)

      // Check if the user exists
      if (!user) {
        return response.status(404).json({ message: 'User not found' })
      }

      // Get the new role ID from the request body
      const { roleId } = request.only(['roleId'])

      // Update the user's role
      user.roleId = roleId
      await user.save()

      // Return a success response
      return response.status(200).json({ message: 'User role updated successfully' })
    } catch (error) {
      return response.status(500).json({ message: 'An error occurred while updating user role' })
    }
  }

  // DELETE USER
  public async deleteUser({ params, response }) {
    try {
      // Retrieve the user by their ID from the database
      const user = await User.find(params.id)

      // Check if the user exists
      if (!user) {
        return response.status(404).json({ message: 'User not found' })
      }

      // Delete the user
      await user.delete()

      // Return a success response
      return response.status(200).json({ message: 'User deleted successfully' })
    } catch (error) {
      return response.status(500).json({ message: 'An error occurred while deleting the user' })
    }
  }
}
