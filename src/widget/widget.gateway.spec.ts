import { Test, TestingModule } from '@nestjs/testing';
import { AdvertGateway } from './gateways/advert.gateway';
import { AdvertService } from './services/advert.service';

describe('WidgetGateway', () => {
  let gateway: AdvertGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdvertGateway, AdvertService],
    }).compile();

    gateway = module.get<AdvertGateway>(AdvertGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
