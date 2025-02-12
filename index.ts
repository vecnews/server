import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'

import { config } from 'dotenv'
config()

const prisma = new PrismaClient()

const app = new Hono()

app.get('/', (c) => {
  return c.text('test')
})

export default {
  port: 3000,
  fetch: app.fetch
}
