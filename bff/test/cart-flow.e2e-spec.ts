import { ValidationPipe } from '@nestjs/common';
import { INestApplication } from '@nestjs/common/interfaces/nest-application.interface';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Cart flow (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('browses catalogue, carts, checks out, and stock drops', async () => {
    const list = await request(app.getHttpServer()).get('/products').expect(200);
    const productId = list.body[0].id;
    const beforeStock = list.body[0].availableStock;

    const qty = Math.min(2, beforeStock);
    const { body: cart } = await request(app.getHttpServer())
      .post('/carts')
      .expect(201);

    await request(app.getHttpServer())
      .post(`/carts/${cart.id}/items`)
      .send({ productId, quantity: qty })
      .expect(201);

    const { body: order } = await request(app.getHttpServer())
      .post(`/carts/${cart.id}/checkout`)
      .expect(201);

    expect(order.ok).toBe(true);
    expect(order.totalPaidCents).toBeGreaterThan(0);

    const again = await request(app.getHttpServer())
      .get(`/products/${productId}`)
      .expect(200);
    expect(again.body.availableStock).toBe(beforeStock - qty);
  });
});
