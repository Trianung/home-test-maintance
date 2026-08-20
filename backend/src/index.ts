import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'
import auth from './routes/auth'
import requests from './routes/requests'
import userRoutes from './routes/users'
const app = new Hono()

app.use('/*', cors({
  origin: 'http://localhost:3000',
  credentials: true,
}))

app.get('/', (c) => {
    return c.json({
        message: 'Maintenance Request API is running'
    })
})

app.route('/api/auth', auth)
app.route('/api/requests', requests)
app.route('/api/users', userRoutes)

serve({
    fetch: app.fetch,
    port: 3001
})

console.log('API running at http://localhost:3001')