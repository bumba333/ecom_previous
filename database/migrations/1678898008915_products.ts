import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Products extends BaseSchema {
  protected products = 'products'
  protected categories = 'categories'
  protected subcategories = 'subcategories'
  protected category_product = 'category_product'
  protected subcategory_product = 'subcategory_product'

  public async up() {
    this.schema.createTable(this.categories, (table) => {
      table.increments('id')
      table.string('name', 255).notNullable()
      table.text('description')
      table.text('short_description')
      table.boolean('status').defaultTo(true)
      table.string('slug', 255).notNullable().unique()
      table.string('imageFileName').nullable()
      table.string('imageDescription').nullable()
      table
        .integer('parent_category_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('categories')
        .onDelete('SET NULL')
        .onUpdate('CASCADE')
      table.timestamps()
    })

    this.schema.createTable(this.subcategories, (table) => {
      table.increments('id')
      table.string('name', 255).notNullable()
      table
        .integer('category_id')
        .unsigned()
        .references('id')
        .inTable('categories')
        .onDelete('cascade')
        .notNullable()
      table.unique(['name', 'category_id'])
      table.timestamps()
    })

    this.schema.createTable(this.products, (table) => {
      table.increments('id')
      table.integer('user_id', 25).unsigned().references('id').inTable('users').onDelete('CASCADE')
      //Product Details
      table.string('title').notNullable().unique()
      table.boolean('is_active').defaultTo(false)
      table.text('description').notNullable() //Product descriptions can be long. not advisable to use string(varvhar)
      table.text('short_description').notNullable()
      table
        .integer('brand_id')
        .unsigned()
        .references('id')
        .inTable('brands')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
      table.enu('status', ['in stock', 'out of stock', 'pre-order']).defaultTo('in stock')
      table.string('meta_title')
      table.text('meta_description')
      table.boolean('featured').defaultTo(false)

      // table.timestamps(true)
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).nullable()
    })

    this.schema.createTable(this.category_product, (table) => {
      table
        .integer('category_id')
        .unsigned()
        .references('id')
        .inTable('categories')
        .onDelete('cascade')
      table
        .integer('product_id')
        .unsigned()
        .references('id')
        .inTable('products')
        .onDelete('cascade')
      table.primary(['category_id', 'product_id'])
      table.timestamps()
    })
    this.schema.createTable(this.subcategory_product, (table) => {
      table.increments()
      table
        .integer('subcategory_id')
        .unsigned()
        .references('id')
        .inTable('subcategories')
        .onDelete('CASCADE')
      table
        .integer('product_id')
        .unsigned()
        .references('id')
        .inTable('products')
        .onDelete('CASCADE')
      // Add a unique constraint for the combination of product_id and subcategory_id
      table.unique(['subcategory_id', 'product_id'])
      table.timestamps()
    })
  }

  public async down() {
    this.schema.dropTable(this.products)
    this.schema.dropTable(this.categories)
    this.schema.dropTable(this.subcategories)
    this.schema.dropTable(this.category_product)
    this.schema.dropTable(this.subcategory_product)
  }
}
