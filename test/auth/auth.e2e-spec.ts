import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app/app.module';
import * as pactum from 'pactum';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { COOKIES, SignUpDto, User, USERTYPE } from '../../src/auth/entities';
import * as cookieParser from 'cookie-parser';
import { RedisService } from '../../src/redis/redis.service';

jest.setTimeout(60000);

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  const dto: SignUpDto = {
    user_name: 'Madalitso',
    password: 'testing123',
    email: 'Madalitso@test.com',
  };
  let redisService: RedisService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
          useFactory: (config: ConfigService) => ({
            uri: config.get('MONGODB_URI'),
          }),
          inject: [ConfigService],
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    const config = app.get(ConfigService);
    redisService = app.get(RedisService);
    const userModel = app.get(getModelToken(User.name));
    await userModel.deleteOne({
      email: dto.email.toLowerCase(),
      type: USERTYPE.AGENT,
    });

    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.use(cookieParser(config.get('REFRESH_TOKEN_SECRET')));

    await app.init();

    const port = config.get('PORT');
    // starting test server for pactum to use
    await app.listen(port);
    pactum.request.setBaseUrl(`http://localhost:${port}`);
  });

  afterAll(async () => {
    const userModel = app.get(getModelToken(User.name));
    await userModel.deleteOne({
      email: dto.email.toLowerCase(),
      type: USERTYPE.AGENT,
    });

    app.close();
  });

  describe('/api/auth/signup (POST)', () => {
    it('should be able to sign up', async () => {
      return pactum
        .spec()
        .post('/api/auth/signup')
        .withBody(dto)
        .expectStatus(201)
        .expectJsonLike({
          statusCode: 201,
          message: 'Successfully signed up.',
          data: {
            email: dto.email.toLowerCase(),
            user_name: dto.user_name,
            profile_picture_url: '',
          },
        })
        .stores('userId', '_id');
    });

    it('should prevent signup of identical email and user type combination.', () => {
      return pactum
        .spec()
        .post('/api/auth/signup')
        .withBody(dto)
        .expectStatus(409);
    });

    it('should not allow sign up with missing fields in body payload', () => {
      return pactum
        .spec()
        .post('/api/auth/signup')
        .withBody({})
        .expectStatus(400);
    });
    it('should not allow sign up without password in body payload', () => {
      return pactum
        .spec()
        .post('/api/auth/signup')
        .withBody({ user_name: dto.user_name, email: dto.email })
        .expectStatus(400);
    });

    it('should not allow sign up without email in body payload', () => {
      return pactum
        .spec()
        .post('/api/auth/signup')
        .withBody({ user_name: dto.user_name, password: dto.password })
        .expectStatus(400);
    });
  });

  describe('/api/auth/login (POST)', () => {
    it('it should be able to login', () => {
      return pactum
        .spec()
        .post('/api/auth/login')
        .withBody({ email: dto.email, password: dto.password })
        .expectStatus(200)
        .expectJsonLike({
          statusCode: 200,
          message: 'Login successfully',
          data: {
            email: dto.email.toLowerCase(),
            user_name: dto.user_name,
            profile_picture_url: '',
          },
        });
    });

    it('should not allow login with missing fields in body payload', () => {
      return pactum
        .spec()
        .post('/api/auth/login')
        .withBody({})
        .expectStatus(400);
    });
    it('should not allow login without password in body payload', () => {
      return pactum
        .spec()
        .post('/api/auth/login')
        .withBody({ email: dto.email })
        .expectStatus(400);
    });

    it('should not allow login without email in body payload', () => {
      return pactum
        .spec()
        .post('/api/auth/login')
        .withBody({ password: dto.password })
        .expectStatus(400);
    });
  });

  describe('/api/auth/refresh_token (GET)', () => {
    it('it should be able to refresh token', async () => {
      return pactum
        .spec()
        .get('/api/auth/refresh_token')
        .withHeaders('Set-Cookies', '$S{userId}')
        .expectStatus(200);
    });
  });

  describe('/api/auth/logout (DELETE)', () => {
    //Set-Cookie: theme=light
    it('/api/auth/logout (DELETE)', () => {
      return pactum
        .spec()
        .delete('/api/auth/logout')
        .withCookies(`${COOKIES.AUTH}`, '$S{userToken}')
        .inspect()
        .expectStatus(200)
        .expectBody({ statusCode: 200, message: 'Logged out successfully.' });
    });
  });
});
