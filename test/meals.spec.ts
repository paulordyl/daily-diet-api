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

  it('should be able to update a meal', async () => {
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

    const { meal } = createMealResponse.body

    const updateMealResponse = await request(app.server)
      .put(`/meals/${meal.id}`)
      .set('Cookie', cookies)
      .send({
        name: 'Pao com manteiga',
      })
      .expect(200)

    expect(updateMealResponse.body.meal).toEqual(
      expect.objectContaining({
        name: 'Pao com manteiga',
      }),
    )
  })

  it('should be able to delete a meal', async () => {
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

    const { meal } = createMealResponse.body

    await request(app.server)
      .delete(`/meals/${meal.id}`)
      .set('Cookie', cookies)
      .expect(201)
  })

  it('should be able to list all meals', async () => {
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

    const { meal } = createMealResponse.body

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    expect(listMealsResponse.body.meals).toEqual([
      expect.objectContaining({
        name: meal.name,
        description: meal.description,
      }),
    ])
  })

  it('shoud be able to list a specific meal', async () => {
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

    const { meal } = createMealResponse.body

    const listMealResponse = await request(app.server)
      .get(`/meals/${meal.id}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(listMealResponse.body.meal).toEqual(
      expect.objectContaining({
        name: meal.name,
        description: meal.description,
      }),
    )
  })
})
