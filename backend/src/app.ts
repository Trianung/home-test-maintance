import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { loggerMiddleware } from './middleware/logger'
import auth from './routes/auth'
import health from './routes/health'
import requests from './routes/requests'
import userRoutes from './routes/users'

const app = new Hono()

// Structured JSON logging for every request
app.use('/*', loggerMiddleware)

app.use('/*', cors({
  origin: 'http://localhost:3000',
  credentials: true,
}))

app.get('/', (c) => {
    return c.json({
        message: 'Maintenance Request API is running'
    })
})

app.route('/api/health', health)
app.route('/api/auth', auth)
app.route('/api/requests', requests)
app.route('/api/users', userRoutes)

export default app
