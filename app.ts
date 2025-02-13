import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { config } from 'dotenv'
import { streams, captions, stories } from './src/routes'

config()

const app = new Hono()

app.use('/*', cors())

app.route('/streams', streams)
app.route('/captions', captions)
app.route('/stories', stories)

export default {
  port: 3000,
  fetch: app.fetch
}
