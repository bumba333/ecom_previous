import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  public async up() {
    this.schema.createTable('tags', (table) => {
      table.increments('id')
      table.string('name').notNullable().unique()
      table.string('description')
      table.timestamps(true, true)
    })

    this.schema.createTable('product_tag', (table) => {
      table.increments('id')
      table
        .integer('product_id')
        .unsigned()
        .references('id')
        .inTable('products')
        .onDelete('CASCADE')
      table.integer('tag_id').unsigned().references('id').inTable('tags').onDelete('CASCADE')
      table.unique(['tag_id', 'product_id'])
      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable('tags')
    this.schema.dropTable('product_tags')
  }
}
