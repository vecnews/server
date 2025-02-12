import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { config } from 'dotenv'
import { streams, captions, triggers } from './src/routes'

config()

const app = new Hono()

app.use('/*', cors())

app.route('/streams', streams)
app.route('/captions', captions)
app.route('/triggers', triggers)

export default {
  port: 3000,
  fetch: app.fetch
}
