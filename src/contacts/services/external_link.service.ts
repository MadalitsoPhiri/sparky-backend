import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/auth/repositories';
import { RedisService } from 'src/redis/redis.service';
import { CreateExternalLinkDto } from '../dto/external_link.dto';
import { ExternalLinkRepository } from '../repositories/external_link.repository';

@Injectable()
export class ExternalLinkService {
  constructor(
    private user_repository: UserRepository,
    private redisService: RedisService,
    private readonly external_link_repository: ExternalLinkRepository,
  ) {}

  async create(createExternalLinkDto: CreateExternalLinkDto) {
    const user_data = await this.user_repository.get_by_id(
      createExternalLinkDto.userId,
    );
    if (!user_data) {
      return {
        data: null,
        error: 'Contact not found',
      };
    }

    const allExternalLinks = await this.external_link_repository.get_all({
      userId: user_data.id,
    });

    if (allExternalLinks.length >= 5) {
      return {
        data: null,
        error: 'You can only add 5 external links',
      };
    }

    const external_link = await this.external_link_repository.create({
      link: createExternalLinkDto.link,
      userId: user_data.id,
    });

    return {
      data: external_link,
      error: null,
    };
  }

  async update(id: string, data: any) {
    const external_link = await this.external_link_repository.update_one(
      { _id: id },
      data,
    );

    return {
      data: external_link,
      error: null,
    };
  }

  async findAll(userId: string) {
    const user_data = await this.user_repository.get_by_id(userId);
    if (!user_data) {
      return {
        data: null,
        error: 'User not found',
      };
    }

    const external_links = await this.external_link_repository.get_all({
      userId: user_data.id,
    });

    return {
      data: external_links,
      error: null,
    };
  }

  async findOne(id: string) {
    const external_link = await this.external_link_repository.get_by_id(id);
    return {
      data: external_link,
      error: null,
    };
  }

  async remove(id: string) {
    const external_link = await this.external_link_repository.delete_by_id(id);
    return {
      data: external_link,
      error: null,
    };
  }
}
