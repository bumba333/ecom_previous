import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Brand from 'App/Models/Brand'

export default class BrandSeeder extends BaseSeeder {
  public async run() {
    // Define mock data for brands
    const brandsData = [
      {
        name: 'Nike',
        logo: '',
        slug: 'nike',
      },
      {
        name: 'Adidas',
        logo: '',
        slug: 'adidas',
      },
      {
        name: 'Puma',
        logo: '',
        slug: 'puma',
      },
      {
        name: 'Reebok',
        logo: '',
        slug: 'reebok',
      },
      {
        name: 'Under Armour',
        logo: '',
        slug: 'under-armour',
      },
    ]

    // Use a loop to create and save each brand entry
    for (const brandData of brandsData) {
      await Brand.create(brandData)
    }
  }
}
