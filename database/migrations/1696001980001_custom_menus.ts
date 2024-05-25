import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'custom_menus'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('menu_name').notNullable()
      table.json('menu_items').notNullable() // Store menu items as JSON
      table.integer('role_id').unsigned().references('id').inTable('roles')
      table.boolean('is_selected_for_top').defaultTo(false).index()
      table.boolean('is_selected_for_categories').index()
      table.boolean('is_selected_for_tags').index()
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
