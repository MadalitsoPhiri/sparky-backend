import { Test, TestingModule } from '@nestjs/testing';
import { TagsGateway } from './tags.gateway';
import { TagsService } from './tags.service';

describe('TagsGateway', () => {
  let gateway: TagsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TagsGateway, TagsService],
    }).compile();

    gateway = module.get<TagsGateway>(TagsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
