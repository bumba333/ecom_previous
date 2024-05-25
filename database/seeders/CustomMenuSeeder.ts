import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import CustomMenu from 'App/Models/CustomMenu'

export default class extends BaseSeeder {
  public async run() {
    // Create a custom menu with a specific structure and set it as selected for a menu type
    await CustomMenu.createMany([
      {
        menuName: 'My Top Menu 1',
        menuItems: {} /* [
          {
            label: 'Accessories',
            link: '/category/5',
            subcategories: [],
            secondLevelCategory: [
              {
                label: 'Dresses',
                link: '/category/4',
                subcategories: [],
              },
            ],
          },
          {
            label: 'Dresses',
            link: '/category/4',
            subcategories: [],
            secondLevelCategory: [
              {
                label: 'Sneakers',
                link: '/category/3',
                subcategories: [
                  {
                    label: 'Leather',
                    link: '/subcategory/3',
                    $label: 'Leather',
                    $link: '/subcategory/3',
                  },
                  {
                    label: 'Sports',
                    link: '/subcategory/6',
                    $label: 'Sports',
                    $link: '/subcategory/6',
                  },
                ],
              },
            ],
          },
          {
            label: 'Jeans',
            link: '/category/2',
            subcategories: [
              {
                label: 'Denim',
                link: '/subcategory/2',
                $label: 'Denim',
                $link: '/subcategory/2',
              },
              {
                label: 'Formal',
                link: '/subcategory/5',
                $label: 'Formal',
                $link: '/subcategory/5',
              },
            ],
            secondLevelCategory: [],
          },
          {
            label: 'T Shirt',
            link: '/category/1',
            subcategories: [
              {
                label: 'Cotton',
                link: '/subcategory/1',
                $label: 'Cotton',
                $link: '/subcategory/1',
              },
              {
                label: 'Casual',
                link: '/subcategory/4',
                $label: 'Casual',
                $link: '/subcategory/4',
              },
            ],
            secondLevelCategory: [
              {
                label: 'Sneakers',
                link: '/category/3',
                subcategories: [
                  {
                    label: 'Leather',
                    link: '/subcategory/3',
                    $label: 'Leather',
                    $link: '/subcategory/3',
                  },
                  {
                    label: 'Sports',
                    link: '/subcategory/6',
                    $label: 'Sports',
                    $link: '/subcategory/6',
                  },
                ],
              },
            ],
          },
          {
            label: 'Jeans',
            link: '/category/2',
            subcategories: [],
            secondLevelCategory: [
              {
                label: 'Accessories',
                link: '/category/5',
                subcategories: [
                  {
                    label: 'Hats',
                    link: '/subcategory/9',
                    $label: 'Hats',
                    $link: '/subcategory/9',
                  },
                  {
                    label: 'Sunglasses',
                    link: '/subcategory/10',
                    $label: 'Sunglasses',
                    $link: '/subcategory/10',
                  },
                ],
              },
              {
                label: 'Dresses',
                link: '/category/4',
                subcategories: [
                  {
                    label: 'Summer Dresses',
                    link: '/subcategory/7',
                    $label: 'Summer Dresses',
                    $link: '/subcategory/7',
                  },
                  {
                    label: 'Winter Dresses',
                    link: '/subcategory/8',
                    $label: 'Winter Dresses',
                    $link: '/subcategory/8',
                  },
                ],
              },
              {
                label: 'Sneakers',
                link: '/category/3',
                subcategories: [
                  {
                    label: 'Leather',
                    link: '/subcategory/3',
                    $label: 'Leather',
                    $link: '/subcategory/3',
                  },
                  {
                    label: 'Sports',
                    link: '/subcategory/6',
                    $label: 'Sports',
                    $link: '/subcategory/6',
                  },
                ],
              },
            ],
          },
          {
            label: 'Dresses',
            link: '/category/4',
            subcategories: [
              {
                label: 'Summer Dresses',
                link: '/subcategory/7',
                $label: 'Summer Dresses',
                $link: '/subcategory/7',
              },
              {
                label: 'Winter Dresses',
                link: '/subcategory/8',
                $label: 'Winter Dresses',
                $link: '/subcategory/8',
              },
            ],
            secondLevelCategory: [],
          },
          {
            label: 'Sneakers',
            link: '/category/3',
            subcategories: [
              {
                label: 'Leather',
                link: '/subcategory/3',
                $label: 'Leather',
                $link: '/subcategory/3',
              },
              {
                label: 'Sports',
                link: '/subcategory/6',
                $label: 'Sports',
                $link: '/subcategory/6',
              },
            ],
            secondLevelCategory: [],
          },
          {
            label: 'Accessories',
            link: '/category/5',
            subcategories: [
              {
                label: 'Hats',
                link: '/subcategory/9',
                $label: 'Hats',
                $link: '/subcategory/9',
              },
              {
                label: 'Sunglasses',
                link: '/subcategory/10',
                $label: 'Sunglasses',
                $link: '/subcategory/10',
              },
            ],
            secondLevelCategory: [
              {
                label: 'Sneakers',
                link: '/category/3',
                subcategories: [
                  {
                    label: 'Leather',
                    link: '/subcategory/3',
                    $label: 'Leather',
                    $link: '/subcategory/3',
                  },
                  {
                    label: 'Sports',
                    link: '/subcategory/6',
                    $label: 'Sports',
                    $link: '/subcategory/6',
                  },
                ],
              },
              {
                label: 'Jeans',
                link: '/category/2',
                subcategories: [
                  {
                    label: 'Denim',
                    link: '/subcategory/2',
                    $label: 'Denim',
                    $link: '/subcategory/2',
                  },
                  {
                    label: 'Formal',
                    link: '/subcategory/5',
                    $label: 'Formal',
                    $link: '/subcategory/5',
                  },
                ],
              },
            ],
          },
        ] */,
        isSelectedForTop: true, // Set this menu as selected for the top menu
        isSelectedForCategories: false, // Set to false for other menu types
        isSelectedForTags: false, // Set to false for other menu types
      },
      // Add more custom menus as needed
    ])
  }
}
