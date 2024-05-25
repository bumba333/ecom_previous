import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'wallet_transactions'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('wallet_id').unsigned().references('wallets.id').onDelete('CASCADE')
      table.float('amount').notNullable()
      table.enum('type', ['credit', 'debit', 'reversal']).notNullable()
      table.string('description')
      table.boolean('reversed').defaultTo(false)
      table
        .integer('reversed_transaction_id')
        .unsigned()
        .references('id')
        .inTable('wallet_transactions')
      table.integer('reversed_by').unsigned()
      table.foreign('reversed_by').references('id').inTable('users')
      table.string('reversal_reason')
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
