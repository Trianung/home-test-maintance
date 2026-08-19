import { Hono } from 'hono'
import { serve } from '@hono/node-server'

const app = new Hono()

app.get('/', (c) => {
    return c.json({
        message: 'Maintenance Request API is running'
    })
})

serve({
    fetch: app.fetch,
    port: 3001
})

console.log('API running at http://localhost:3001')