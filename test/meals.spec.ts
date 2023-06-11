import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('Meals routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new meal', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'Jhon Doe',
      })
      .expect(201)

    const cookies = createUserResponse.get('Set-Cookie')

    const createMealResponse = await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Pao',
        description: 'Pao com manteiga',
        inDiet: false,
      })
      .expect(200)

    expect(createMealResponse.body.meal).toEqual(
      expect.objectContaining({
        name: 'Pao',
        description: 'Pao com manteiga',
        in_diet: false,
      }),
    )
  })
})
