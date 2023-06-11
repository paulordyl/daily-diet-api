import { FastifyReply, FastifyRequest } from 'fastify'
import { knex } from '../database'

export interface CustomRequest extends FastifyRequest {
  user?: {
    id: string
    name: string
    created_at: string
    session_id?: string
  }
}

export async function checkSessionIdExists(
  request: CustomRequest,
  reply: FastifyReply,
) {
  const sessionId = request.cookies.sessionId

  if (!sessionId) {
    return reply.status(401).send({
      error: 'Unauthorized',
    })
  }

  const user = await knex('users').where('session_id', sessionId).first()

  if (!user) {
    return reply.status(401).send({
      error: 'Unauthorized',
    })
  }

  request.user = user
}
