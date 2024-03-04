import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { getUser } from 'src/auth/decorators';
import { JwtGuard } from 'src/auth/entities/guard';
import JwtPayload from 'src/auth/entities/types/jwt.payload';
import { ListContactDto, UpdateListContactDto } from './dto/list.dto';
import { ListService } from './services/list.service';

@Controller('lists')
export class ListsController {
  constructor(private readonly list_service: ListService) {}

  @UseGuards(JwtGuard)
  @Post()
  create(
    @getUser() user: JwtPayload,
    @Body() createContactDto: ListContactDto,
  ) {
    return this.list_service.create(createContactDto, user);
  }

  @UseGuards(JwtGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateListContactDto: UpdateListContactDto,
  ) {
    const response = await this.list_service.update(id, updateListContactDto);
    return response;
  }

  @UseGuards(JwtGuard)
  @Get()
  findAll(@getUser() user: JwtPayload) {
    return this.list_service.findAll(user);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.list_service.remove(id);
  }
}
