import { Hono } from 'hono'
import prisma from '../services/prisma'

const streams = new Hono()

streams.post('/', async (c) => {
  const { streamUrl } = await c.req.json()
  const stream = await prisma.stream.create({
    data: { streamUrl }
  })
  return c.json(stream)
})

streams.get('/', async (c) => {
  const streams = await prisma.stream.findMany({
    include: { captions: true }
  })
  return c.json(streams)
})

streams.get('/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const stream = await prisma.stream.findFirst({
      where: { id },
      include: { captions: true }
    })
    if (!stream) return c.notFound()
    return c.json(stream)
  } catch (error) {
    return c.json({ error: 'Invalid stream ID' }, 400)
  }
})

streams.delete('/:id', async (c) => {
  const id = c.req.param('id')
  try {
    await prisma.stream.delete({
      where: { id }
    })
    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Invalid stream ID' }, 400)
  }
})

export default streams 