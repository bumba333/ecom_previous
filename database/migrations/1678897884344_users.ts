import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UsersSchema extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('first_name').nullable()
      table.string('last_name').nullable()
      table.string('email', 255).notNullable()
      table.string('password', 180).notNullable()
      table.string('remember_me_token').nullable()
      table.string('gender').nullable()
      table.string('contact_number').notNullable() //assumed phone numbers will be stored with country codes
      table.integer('role_id').unsigned().references('id').inTable('roles').onDelete('CASCADE')
      //table.text('address').defaultTo('abcd') //handled in separate model

      // table.timestamps(true)
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).nullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
