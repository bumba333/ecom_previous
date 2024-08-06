/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

//USER ROUTES
Route.group(() => {
  Route.post('/signup', 'UsersController.signup')
  Route.post('/login', 'UsersController.login')
  Route.get('/logout', 'UsersController.logout')
  Route.get('/profile', 'UsersController.profile').middleware('auth')
  Route.patch('/profile', 'UsersController.updateProfile').middleware('auth')
  Route.get('/users', 'UsersController.listUsers').middleware(['auth', 'checkRole:admin'])
  Route.get('/users/byRole/:roleId', 'UsersController.listUsersByRole').middleware([
    'auth',
    'checkRole:admin',
  ])
  Route.get('/users/:id', 'UsersController.showUser').middleware(['auth', 'checkRole:admin'])
  Route.patch('/users/:id/update-role', 'UsersController.updateUserRole').middleware([
    'auth',
    'checkRole:admin',
  ])
  Route.delete('/users/:id', 'UsersController.deleteUser').middleware(['auth', 'checkRole:admin'])
  Route.post('/forgot-password', 'UsersController.forgotPassword')
  Route.post('/change-password', 'UsersController.changePassword')
  Route.post('/password-reset', 'UsersController.sendPasswordResetLink') // Send reset link
  Route.post('/password-reset/reset', 'UsersController.resetPassword') // Reset password
}).prefix('/api/v1/auth')

//PRODUCT ROUTES
Route.group(() => {
  Route.get('/', 'ProductsController.index')
  Route.get('/mine', 'ProductsController.myProducts').middleware('auth')
  Route.get('/:id', 'ProductsController.get')
  Route.get('/user/:id', 'ProductsController.getProductByUserId').middleware([
    'auth',
    'checkRole:admin',
  ])
  Route.delete('/:id', 'ProductsController.destroy').middleware(['auth', 'checkRole:admin'])

  Route.post('/basic-information', 'ProductsController.createProductBasicInformation').middleware([
    'auth',
    'checkRole:admin, vendor',
  ])
  Route.post(
    '/categories-and-subcategories',
    'ProductsController.attachProductCategoriesAndSubcategories'
  ).middleware(['auth', 'checkRole:admin, vendor'])
  Route.post('/variations', 'ProductsController.createProductVariations').middleware([
    'auth',
    'checkRole:admin, vendor',
  ])
  Route.post(
    '/variations/images/:id',
    'ImagesController.uploadProductVariationImagesCLDNRY'
  ).middleware(['auth', 'checkRole:admin, vendor'])
  Route.put('/:id', 'ProductsController.update').middleware(['auth', 'checkRole:admin, vendor'])
  Route.post('/search', 'ProductsController.search')
  Route.post('/uploadImages', 'ProductsController.uploadImages').middleware([
    'auth',
    'checkRole:admin, vendor',
  ])
  Route.post('/:id/cross-sell', 'ProductsController.attachCrossSell').middleware([
    'auth',
    'checkRole:admin, vendor',
  ])
  Route.post('/:id/up-sell', 'ProductsController.attachUpSell').middleware([
    'auth',
    'checkRole:admin, vendor',
  ])
  Route.get('/:id/cross-sell', 'ProductsController.getCrossSellProducts')
  Route.get('/:id/up-sell', 'ProductsController.getUpSellProducts')
  // Routes for managing product variations
  Route.post('/:productId/variations', 'ProductVariationsController.create').middleware([
    'auth',
    'checkRole:admin, vendor',
  ])
  Route.put('/:productId/variations/:variationId', 'ProductVariationsController.update').middleware(
    ['auth', 'checkRole:admin, vendor']
  )
  Route.post('/bulk-upload', 'ProductsController.bulkUpload').middleware([
    'auth',
    'checkRole:admin, vendor',
  ])
  Route.delete('/variations/:variationId', 'ProductVariationsController.delete').middleware([
    'auth',
    'checkRole:admin',
  ])
  Route.post('toggleProductStatus/:productId', 'ProductsController.toggleProductStatus').middleware(
    ['auth', 'checkRole:admin, vendor']
  )
}).prefix('/api/v1/products')

//IMAGES ROUTES
Route.group(() => {
  Route.post(
    '/products/upload/image/variation/:id',
    'ImagesController.uploadImagesCLDNRY'
  ).middleware('auth')
  Route.post('/products/update/image/:id', 'ImagesController.updateImagesCLDNRY').middleware('auth')
  Route.post('/products/delete/image/:id', 'ImagesController.deleteImagesCLDNRY').middleware('auth')
  // Upload category images
  Route.post(
    '/categories/:id/images/upload',
    'ImagesController.uploadCategoryImagesCLDNRY'
  ).middleware('auth')

  // Update category image details
  Route.put('/category-images/:id', 'ImagesController.updateCategoryImagesCLDNRY').middleware(
    'auth'
  )

  // Delete category image
  Route.delete('/category-images/:id', 'ImagesController.deleteCategoryImagesCLDNRY').middleware(
    'auth'
  )

  Route.post('tags/:id/images', 'ImagesController.uploadTagImagesCLDNRY').middleware('auth')
  Route.put('tag-images/:id', 'ImagesController.updateTagImagesCLDNRY').middleware('auth')
  Route.delete('tag-images/:id', 'ImagesController.deleteTagImagesCLDNRY').middleware('auth')
}).prefix('/api/v1')

//BRANDS ROUTES
Route.group(() => {
  Route.get('/', 'BrandsController.index')
  Route.get('/:id', 'BrandsController.show')
  Route.delete('/:id', 'BrandsController.destroy').middleware(['auth', 'checkRole:admin'])
  Route.post('/store', 'BrandsController.store').middleware(['auth', 'checkRole:admin,vendor'])
  Route.patch('/:id', 'BrandsController.update').middleware(['auth', 'checkRole:admin,vendor'])
}).prefix('/api/v1/brands')

//CATEGORY ROUTES
Route.group(() => {
  Route.get('/', 'CategoriesController.index')
  Route.get('/mine', 'CategoriesController.myCategories').middleware('auth')
  Route.get('/:id', 'CategoriesController.get')
  Route.delete('/:id', 'CategoriesController.delete').middleware(['auth', 'checkRole:admin'])
  Route.post('/store', 'CategoriesController.store').middleware(['auth', 'checkRole:admin'])
  Route.patch('/:id', 'CategoriesController.update').middleware(['auth', 'checkRole:admin'])
  Route.post('/attach-child-category', 'CategoriesController.attachChildCategory').middleware([
    'auth',
    'checkRole:admin',
  ])
  Route.get('/:parentCategoryId/child-categories', 'CategoriesController.getChildCategories')
  Route.post('categories/detach-child-category', 'CategoriesController.detachChildCategory')
}).prefix('/api/v1/categories')

//SUB-CATEGORIES ROUTES
Route.group(() => {
  Route.get('/', 'SubCategoriesController.index')
  Route.get('/mine', 'SubCategoriesController.mysubCategories').middleware('auth')
  Route.get('/:id', 'SubCategoriesController.get')
  Route.get('/by-category/:category_id', 'SubCategoriesController.findByCategoryId')
  Route.delete('/:id', 'SubCategoriesController.delete').middleware(['auth', 'checkRole:admin'])
  Route.post('/store', 'SubCategoriesController.store').middleware(['auth', 'checkRole:admin'])
  Route.patch('/:id', 'SubCategoriesController.update').middleware(['auth', 'checkRole:admin'])
}).prefix('/api/v1/subCategories')

//CART ROUTES
Route.group(() => {
  Route.post('store', 'CartsController.addToCart').middleware('auth')
  Route.get('/', 'CartsController.getCart').middleware('auth')
  Route.post('update', 'CartsController.updateItemQuantity').middleware('auth')
  Route.post('removeItem', 'CartsController.removeItem').middleware('auth')
}).prefix('/api/v1/cart')

//ORDER ROUTES
Route.group(() => {
  // Create a new order
  Route.post('orders', 'OrdersController.store')

  // Retrieve and display the details of a specific order
  Route.get('orders/:id', 'OrdersController.getOrderDetails')

  // List a user's past orders
  Route.get('user/orders', 'OrdersController.listUserOrders')

  //List all orders for admin
  Route.get('/admin/orders', 'OrdersController.listAllOrders').middleware([
    'auth',
    'checkRole:admin',
  ])

  // Cancel an order
  Route.put('orders/cancel/:id', 'OrdersController.cancelOrder')

  // Filter and retrieve orders based on criteria
  Route.get('orders', 'OrdersController.filterOrders')

  // Generate a PDF report of orders
  Route.get('orders/report', 'OrdersController.generatePdfReport')

  // Update the status of an order
  Route.put('orders/:id', 'OrdersController.updateOrderStatus')
})
  .middleware('auth')
  .prefix('/api/v1/')

//REVIEWS ROUTES
Route.group(() => {
  // Create a Review for a Product
  Route.post('reviews', 'ReviewsController.store').middleware('auth')

  // Get Review by ID
  Route.get('reviews/:id', 'ReviewsController.show')

  // Update a Review
  Route.put('reviews/:reviewId', 'ReviewsController.update')

  // Delete a Review
  Route.delete('reviews/:reviewId', 'ReviewsController.destroy')

  // Get All Reviews for a Product
  Route.get('products/:productId/reviews', 'ReviewsController.index')

  // Get Average Review Score for a Product
  Route.get('products/:productId/average-score', 'ReviewsController.getAverageScore')

  // Get User's Reviews
  Route.get('users/:userId/reviews', 'ReviewsController.getUserReviews')
}).prefix('api/v1/')

//WISHLIST ROUTES
Route.group(() => {
  Route.get('/wishlist', 'WishlistsController.index').middleware('auth')
  Route.post('/wishlist', 'WishlistsController.store').middleware('auth')
  Route.delete('/wishlist/:productId', 'WishlistsController.destroy').middleware('auth')
}).prefix('api/v1')

//TAGS ROUTE
Route.group(() => {
  Route.get('/tags', 'TagsController.index')
  Route.post('/tags', 'TagsController.store').middleware('auth')
  Route.get('/tags/:id', 'TagsController.show')
  Route.put('/tags/:id', 'TagsController.update').middleware(['auth', 'checkRole:admin'])
  Route.delete('/tags/:id', 'TagsController.destroy').middleware(['auth', 'checkRole:admin'])
  Route.post('/attach-tags', 'TagsController.attachTags').middleware('auth')
  Route.post('/detach-tags', 'TagsController.detachTags').middleware('auth')
}).prefix('api/v1')

// ADDRESS ROUTE- creating, updating, listing, and deleting addresses
Route.group(() => {
  Route.post('/addresses', 'AddressesController.create')
  Route.put('/addresses/:id', 'AddressesController.update')
  Route.get('/addresses', 'AddressesController.index')
  Route.delete('/addresses/:id', 'AddressesController.destroy')
})
  .prefix('api/v1')
  .middleware('auth') // Apply authentication middleware

// Routes for Subscribers
Route.group(() => {
  Route.post('/subscribe', 'SubscribersController.subscribe')
  Route.post('/unsubscribe', 'SubscribersController.unsubscribe')
  Route.get('/subscribers', 'SubscribersController.listSubscribers').middleware([
    'auth',
    'checkRole:admin',
  ])
  Route.get('/subscribers/:idOrEmail', 'SubscribersController.getSubscriber').middleware([
    'auth',
    'checkRole:admin',
  ])
  Route.put('/subscribers/:id', 'SubscribersController.updateSubscriber').middleware([
    'auth',
    'checkRole:admin',
  ])
}).prefix('api/v1')

//ROUTES FOR COUPON
Route.group(() => {
  Route.post('coupons/apply', 'CouponsController.applyCoupon').middleware(['auth'])
  Route.post('coupons/create', 'CouponsController.createCoupon').middleware([
    'auth',
    'checkRole:admin',
  ])
  Route.put('coupons/:id', 'CouponsController.editCoupon').middleware(['auth', 'checkRole:admin'])
  Route.delete('coupons/:id', 'CouponsController.deleteCoupon').middleware([
    'auth',
    'checkRole:admin',
  ])
  Route.get('coupons/list', 'CouponsController.listCoupon').middleware(['auth'])
  Route.post('coupons/:id/users', 'CouponsController.assignCouponToUsers').middleware([
    'auth',
    'checkRole:admin',
  ])
  Route.post('users/:id/coupons', 'CouponsController.assignCouponsToUser').middleware([
    'auth',
    'checkRole:admin',
  ])
}).prefix('api/v1/')

// ROUTES FOR INVENTORY CONTROLLER
Route.group(() => {
  // Get inventory details for a specific product variation
  Route.get('inventory/:productId/:variationId', 'InventoriesController.getInventory')

  // Update inventory details for a specific product variation
  Route.put(
    'inventory/:productId/:variationId',
    'InventoriesController.updateInventory'
  ).middleware(['auth', 'checkRole:admin'])

  // Add new inventory for a specific product variation
  Route.post('inventory', 'InventoriesController.addInventory').middleware([
    'auth',
    'checkRole:admin',
  ])

  // List all inventory records
  Route.get('inventory', 'InventoriesController.listInventory').middleware('auth')

  // Generate an inventory report
  Route.get('inventory/report', 'InventoriesController.generateInventoryReport').middleware([
    'auth',
    'checkRole:admin',
  ])
}).prefix('api/v1/') // Add any desired authentication middleware

//ROUTES FOR HOME PAGE
Route.group(() => {
  // Top Selling Products API
  Route.get('top-selling-products', 'HomePagesController.getTopSellingProducts')

  // Top Selling Products by Category API
  Route.get(
    'top-selling-products/:categoryId',
    'HomePagesController.getTopSellingProductsByCategory'
  )

  // Latest Products API
  Route.get('latest-products', 'HomePagesController.getLatestProducts')

  // Featured Products API
  Route.get('featured-products', 'HomePagesController.getFeaturedProducts')
}).prefix('api/v1/home')

// ROUTES FOR CUSTOM-MENU
Route.group(() => {
  Route.get('/admin-menus', 'CustomMenusController.index').middleware('auth')
  Route.get('/admin-menus/:id', 'CustomMenusController.show')
  Route.post('/admin-menus', 'CustomMenusController.store').middleware('auth')
  Route.put('/admin-menus/:id', 'CustomMenusController.update').middleware('auth')
  Route.delete('/admin-menus/:id', 'CustomMenusController.destroy').middleware('auth')
  Route.get('/selected-menus', 'CustomMenusController.getSelectedMenus')
}).prefix('api/v1')

// ROUTES FOR SAVED-ITEM
Route.group(() => {
  // Route to store a new saved item
  Route.post('/', 'SavedItemsController.store')

  // Route to list all saved items for the authenticated user
  Route.get('/', 'SavedItemsController.index')

  // Route to update the quantity of a saved item
  Route.put('/:id', 'SavedItemsController.update')

  // Route to delete a saved item
  Route.delete('/:id', 'SavedItemsController.destroy')
})
  .prefix('api/v1/saved-items')
  .middleware('auth')

//SLIDERS ROUTES
Route.group(() => {
  Route.get('/sliders', 'SlidersController.index')
  Route.get('/sliders/:id', 'SlidersController.show')
  Route.get('/home-page-sliders', 'SlidersController.getSliders')
  Route.post('/sliders', 'SlidersController.store').middleware(['auth', 'checkRole:admin'])
  Route.put('/sliders/:id', 'SlidersController.update').middleware(['auth', 'checkRole:admin'])
  Route.delete('/sliders/:id', 'SlidersController.destroy').middleware(['auth', 'checkRole:admin'])
  Route.post('/sliders/uploadImage/:id', 'SlidersController.uploadImage').middleware('auth')
  Route.put('sliders/:id/images', 'SlidersController.updateImage').middleware('auth')
}).prefix('api/v1')

//WALLET ROUTES
Route.group(() => {
  Route.post('/wallets', 'WalletsController.create') // Create a new wallet for a user
  Route.get('/wallets/:id/balance', 'WalletsController.getBalance') // Get wallet balance for a user
  Route.post('/wallets/transaction', 'WalletsController.performTransaction') // Perform a transaction (credit or debit) on a user's wallet
  Route.get('/wallets/:id/transactions', 'WalletsController.listTransactions') // List transactions for a user's wallet
  Route.post('/wallets/transactions/:id/revert', 'WalletsController.revertTransaction') // Revert a transaction
  Route.post('/wallets/top-up', 'WalletsController.topUp') //Top Up Wallet Balance
})
  .prefix('api/v1')
  .middleware('auth')

Route.group(() => {
  // Routes for SizeType CRUD operations
  Route.get('/size-types', 'ProductSizesController.indexSizeType')
  Route.post('/size-types', 'ProductSizesController.storeSizeType').middleware([
    'auth',
    'checkRole:admin',
  ])
  Route.get('/size-types/:id', 'ProductSizesController.showSizeType')
  Route.put('/size-types/:id', 'ProductSizesController.updateSizeType').middleware([
    'auth',
    'checkRole:admin',
  ])
  Route.delete('/size-types/:id', 'ProductSizesController.destroySizeType').middleware([
    'auth',
    'checkRole:admin',
  ])

  // Routes for ProductSize CRUD operations
  Route.get('/product-sizes', 'ProductSizesController.indexProductSize')
  Route.post('/product-sizes', 'ProductSizesController.storeProductSize').middleware([
    'auth',
    'checkRole:admin',
  ])
  Route.get('/product-sizes/:id', 'ProductSizesController.showProductSize')
  Route.put('/product-sizes/:id', 'ProductSizesController.updateProductSize').middleware([
    'auth',
    'checkRole:admin',
  ])
  Route.delete('/product-sizes/:id', 'ProductSizesController.destroyProductSize').middleware([
    'auth',
    'checkRole:admin',
  ])
}).prefix('api/v1')
