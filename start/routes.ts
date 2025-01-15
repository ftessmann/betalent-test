import router from '@adonisjs/core/services/router'
import db from '@adonisjs/lucid/services/db'

const OrderController = () => import('#controllers/http/order_controller')
const UsersController = () => import('#controllers/http/users_controller')
const ClientController = () => import('#controllers/http/client_controller')
const GatewayController = () => import('#controllers/http/gateways_controller')

router.get('/', async () => {
  return {
    test: 'This is a test',
  }
})

router.post('/orders', [OrderController, 'store'])

router.group(() => {
  router.get('/users', [UsersController, 'index'])
  router.post('/users', [UsersController, 'store'])
  router.get('/users/:id', [UsersController, 'show'])
  router.put('/users/:id', [UsersController, 'update'])
  router.delete('/users/:id', [UsersController, 'destroy'])
})

router.group(() => {
  router.get('/clients', [ClientController, 'index'])
  router.post('/clients', [ClientController, 'store'])
  router.get('/clients/:id', [ClientController, 'show'])
  router.put('/clients/:id', [ClientController, 'update'])
  router.delete('/clients/:id', [ClientController, 'destroy'])
})

router.group(() => {
  router.get('/products', 'ProductController.index')
  router.post('/products', 'ProductController.store')
  router.get('/products/:id', 'ProductController.show')
  router.put('/products/:id', 'ProductController.update')
  router.delete('/products/:id', 'ProductController.destroy')
})

router.group(() => {
  router.get('/transactions', 'TransactionController.index')
  router.post('/transactions', 'TransactionController.store')
  router.get('/transaction/:id', 'TransactionController.show')
  router.put('/transaction/:id', 'TrasactionController.update')
  router.delete('/transaction/:id', 'TransactionController.destroy')
})

router.group(() => {
  router.get('/transaction-products', 'TransactionProductsController.index')
  router.post('/transaction-products', 'TransactionProductsController.store')
  router.get('/transaction-products/:id', 'TransactionProductsController.show')
  router.put('/transaction-products/:id', 'TransactionProductsController.update')
  router.delete('/transaction-products/:id', 'TransactionProductsController.destroy')
})

router.group(() => {
  router.get('/gateway', [GatewayController, 'index'])
  router.post('/gateway', [GatewayController, 'store'])
  router.get('/gateway/:id', [GatewayController, 'show'])
  router.put('/gateway/:id', [GatewayController, 'update'])
  router.delete('/gateway/:id', [GatewayController, 'destroy'])
})

router.get('/test-db', async () => {
  const result = await db.from('users').select('*')
  return result
})
