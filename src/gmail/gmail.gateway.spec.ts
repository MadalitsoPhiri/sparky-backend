import { Test, TestingModule } from '@nestjs/testing';
import { GmailGateway } from './gmail.gateway';

describe('GmailGateway', () => {
  let gateway: GmailGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GmailGateway],
    }).compile();

    gateway = module.get<GmailGateway>(GmailGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
