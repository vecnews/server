import { Hono } from 'hono'
import prisma from '../services/prisma'

const captions = new Hono()

captions.post('/:streamId', async (c) => {
  const stream_id = c.req.param('streamId')
  const { text } = await c.req.json()
  try {
    const caption = await prisma.caption.create({
      data: {
        text,
        stream_id
      }
    })
    return c.json(caption)
  } catch (error) {
    return c.json({ error: 'Invalid stream ID' }, 400)
  }
})

captions.get('/:streamId', async (c) => {
  const stream_id = c.req.param('streamId')
  try {
    const captions = await prisma.caption.findMany({
      where: { stream_id },
      orderBy: { created_at: 'desc' }
    })
    return c.json(captions)
  } catch (error) {
    return c.json({ error: 'Invalid stream ID' }, 400)
  }
})

export default captions 