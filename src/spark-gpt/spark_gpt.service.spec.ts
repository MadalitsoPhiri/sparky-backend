import { Test, TestingModule } from '@nestjs/testing';
import { SparkGPTService } from './spark_gpt.service';

describe('SparkGPTService', () => {
  let service: SparkGPTService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SparkGPTService],
    }).compile();

    service = module.get<SparkGPTService>(SparkGPTService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
