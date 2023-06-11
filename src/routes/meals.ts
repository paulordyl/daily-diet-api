import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import {
  CustomRequest,
  checkSessionIdExists,
} from '../middlewares/check-session-id-exists'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'

export async function mealsRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request: CustomRequest) => {
      const userId = request.user!.id

      const meals = await knex('meals').where('user_id', userId).select()

      return { meals }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request: CustomRequest) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getMealParamsSchema.parse(request.params)

      const meal = await knex('meals').where('id', id).first()

      if (!meal) {
        return { error: 'Not found' }
      }

      if (request.user!.id !== meal.user_id) {
        return { error: 'Unauthorized' }
      }

      return { meal }
    },
  )

  app.post(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request: CustomRequest, reply) => {
      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        inDiet: z.boolean(),
      })

      const { name, description, inDiet } = createMealBodySchema.parse(
        request.body,
      )

      const payload = {
        id: randomUUID(),
        name,
        description,
        in_diet: inDiet,
        user_id: request.user!.id,
      }

      await knex('meals').insert(payload)

      return reply.status(200).send({ meal: payload })
    },
  )

  app.put(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request: CustomRequest, reply) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getMealParamsSchema.parse(request.params)

      const createMealBodySchema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        inDiet: z.boolean().optional(),
      })

      const { name, description, inDiet } = createMealBodySchema.parse(
        request.body,
      )

      const updatePayload = {
        ...(name && { name }),
        ...(description && { description }),
        ...(inDiet && { in_diet: inDiet }),
      }

      const meal = await knex('meals')
        .where('id', id)
        .update(updatePayload)
        .returning('*')

      return { meal: meal[0] }
    },
  )

  app.delete(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request: CustomRequest, reply) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getMealParamsSchema.parse(request.params)

      const meal = await knex('meals').where('id', id).first()

      if (!meal) {
        return { error: 'Not found' }
      }

      if (request.user!.id !== meal.user_id) {
        return { error: 'Unauthorized' }
      }

      await knex('meals').where('id', id).delete()

      return reply.status(201).send()
    },
  )
}
