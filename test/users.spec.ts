import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('Users routes', () => {
  beforeAll(async () => {
    await app.ready()
    execSync('npm run knex migrate:latest')
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new user', async () => {
    await request(app.server)
      .post('/users')
      .send({
        name: 'Jhon Doe',
      })
      .expect(201)
  })

  it('should be able to get user metrics', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'Jhon Doe',
      })
      .expect(201)

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Pao',
        description: 'Pao com manteiga',
        inDiet: false,
      })
      .expect(200)

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Peira',
        description: 'Peira',
        inDiet: true,
      })
      .expect(200)

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Banana',
        description: 'Banana',
        inDiet: true,
      })
      .expect(200)

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Sorvete',
        description: 'Sorvete',
        inDiet: false,
      })
      .expect(200)

    const userMetricsResponse = await request(app.server)
      .get('/users/metrics')
      .set('Cookie', cookies)
      .expect(200)

    expect(userMetricsResponse.body).toEqual(
      expect.objectContaining({
        totalMeals: 4,
        totalMealsInDiet: 2,
        totalMealsNotInDiet: 2,
        bestSequence: 2,
      }),
    )
  })
})
