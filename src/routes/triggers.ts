import { Hono } from 'hono'
import prisma from '../services/prisma'

const triggers = new Hono()

triggers.post('/', async (c) => {
  const { context } = await c.req.json()
  const trigger = await prisma.trigger.create({
    data: { context }
  })
  return c.json(trigger)
})

triggers.get('/', async (c) => {
  const triggers = await prisma.trigger.findMany({
    orderBy: { created_at: 'desc' }
  })
  return c.json(triggers)
})

triggers.delete('/:id', async (c) => {
  const id = c.req.param('id')
  try {
    await prisma.trigger.delete({
      where: { id }
    })
    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Invalid trigger ID' }, 400)
  }
})

export default triggers 