import { Hono } from 'hono'
import prisma from '../services/prisma'

const streams = new Hono()

streams.post('/', async (c) => {
  const { url, title } = await c.req.json()
  const stream = await prisma.stream.create({
    data: {
      url,
      title
    }
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

// Captions routes
streams.post('/captions/:streamId', async (c) => {
  const streamId = c.req.param('streamId')
  const { text } = await c.req.json()
  try {
    const caption = await prisma.caption.create({
      data: {
        text,
        streamId
      }
    })
    return c.json(caption)
  } catch (error) {
    return c.json({ error: 'Invalid stream ID' }, 400)
  }
})

streams.get('/captions/:streamId', async (c) => {
  const streamId = c.req.param('streamId')
  try {
    const captions = await prisma.caption.findMany({
      where: { streamId },
      orderBy: { createdAt: 'desc' }
    })
    return c.json(captions)
  } catch (error) {
    return c.json({ error: 'Invalid stream ID' }, 400)
  }
})

export default streams 