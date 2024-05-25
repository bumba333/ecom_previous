import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'addresses'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.string('address1', 255).notNullable()
      table.string('address2', 255)
      table.string('city', 100).notNullable()
      table.string('state', 100).notNullable()
      table.string('postal_code', 10).notNullable()
      table.string('address_type').notNullable()
      // Add a unique constraint to ensure each user can have only one unique address_type
      /* table.unique(['user_id', 'address_type']) */
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
