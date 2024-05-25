import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'

export default class UserSeeder extends BaseSeeder {
  public async run() {
    await User.create({
      first_name: 'John',
      last_name: 'Doe',
      email: 'johndoe@gmail.com',
      password: 'password',
      contact_number: '9876543210',
      roleId: 1,
      gender: 'male',
    })

    await User.create({
      first_name: 'Alice',
      last_name: 'Smith',
      email: 'alicesmith@gmail.com',
      password: 'password',
      contact_number: '9876543211',
      roleId: 2,
      gender: 'female',
    })

    await User.create({
      first_name: 'Bob',
      last_name: 'Johnson',
      email: 'bobjohnson@gmail.com',
      password: 'password',
      contact_number: '9876543212',
      roleId: 2,
      gender: 'male',
    })

    await User.create({
      first_name: 'Eva',
      last_name: 'Anderson',
      email: 'evaanderson@gmail.com',
      password: 'password',
      contact_number: '9876543213',
      roleId: 3,
      gender: 'female',
    })

    await User.create({
      first_name: 'David',
      last_name: 'Wilson',
      email: 'davidwilson@gmail.com',
      password: 'password',
      contact_number: '9876543214',
      roleId: 3,
      gender: 'male',
    })
  }
}
