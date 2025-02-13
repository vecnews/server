import { Hono } from 'hono'
import prisma from '../services/prisma'

const streams = new Hono()

streams.post('/reset-tracking', async (c) => {
  await prisma.stream.updateMany({
    data: {
      tracking: false
    }
  })
  return c.json({ success: true })
})

streams.post('/', async (c) => {
  const { url, title } = await c.req.json()
  const stream = await prisma.stream.upsert({
    where: { url },
    update: { tracking: true },
    create: { url, title, tracking: true }
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
streams.post('/captions/:streamUrl', async (c) => {
  const streamUrl = decodeURIComponent(c.req.param('streamUrl'))
  const { text } = await c.req.json()
  try {
    const caption = await prisma.caption.create({
      data: {
        text,
        stream: {
          connect: {
            url: streamUrl
          }
        }
      },
      include: {
        stream: true
      }
    })
    return c.json(caption)
  } catch (error) {
    return c.json({ error: 'Invalid stream URL or stream not found' }, 400)
  }
})

streams.get('/captions/:streamUrl', async (c) => {
  const streamUrl = decodeURIComponent(c.req.param('streamUrl'))
  try {
    const captions = await prisma.caption.findMany({
      where: {
        stream: {
          url: streamUrl
        }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        stream: true
      }
    })
    return c.json(captions)
  } catch (error) {
    return c.json({ error: 'Invalid stream URL' }, 400)
  }
})

export default streams 