import { randomUUID } from 'node:crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import {
  CustomRequest,
  checkSessionIdExists,
} from '../middlewares/check-session-id-exists'

export async function usersRoutes(app: FastifyInstance) {
  app.get(
    '/metrics',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request: CustomRequest) => {
      const user = request.user!

      const totalMeals = await knex('meals').where('user_id', user.id).count()

      const totalMealsInDiet = await knex('meals')
        .where('user_id', user.id)
        .andWhere('in_diet', true)
        .count()

      const totalMealsNotInDiet = await knex('meals')
        .where('user_id', user.id)
        .andWhere('in_diet', false)
        .count()

      const bestSequence = await knex.raw(
        `
          SELECT MAX(sequence_length) AS max_sequence_length
          FROM (
            SELECT
              SUM(CASE WHEN in_diet = 1 THEN 1 ELSE 0 END) AS sequence_length,
              COUNT(*) AS total_meals
            FROM meals
            WHERE user_id = ?
            GROUP BY in_diet
          ) AS subquery
          WHERE total_meals = sequence_length
        `,
        [user.id],
      )

      const bestSequenceLength = bestSequence[0].max_sequence_length

      return {
        totalMeals: totalMeals[0]['count(*)'],
        totalMealsInDiet: totalMealsInDiet[0]['count(*)'],
        totalMealsNotInDiet: totalMealsNotInDiet[0]['count(*)'],
        bestSequence: bestSequenceLength,
      }
    },
  )

  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
    })

    const { name } = createUserBodySchema.parse(request.body)

    const sessionId = randomUUID()

    reply.cookie('sessionId', sessionId, {
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    })

    // TODO: Make route to renew session id

    await knex('users').insert({
      id: randomUUID(),
      name,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })
}
