import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Brands extends BaseSchema {
  protected tableName = 'brands'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').unique().notNullable()
      table.string('logo').notNullable()
      table.string('slug').unique().notNullable()
      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
