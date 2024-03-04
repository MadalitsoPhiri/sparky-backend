import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { getUser } from 'src/auth/decorators';
import { JwtGuard } from 'src/auth/entities/guard';
import JwtPayload from 'src/auth/entities/types/jwt.payload';
import { CustomFieldsService } from './custom-fields.service';
import { CreateCustomFieldDto } from './dto/create-custom-field.dto';
import { UpdateCustomFieldDto } from './dto/update-custom-field.dto';

@Controller('custom-fields')
export class CustomFieldsController {
  constructor(private readonly customFieldsService: CustomFieldsService) {}

  @UseGuards(JwtGuard)
  @Post()
  create(
    @getUser() user: JwtPayload,
    @Body() createCustomFieldDto: CreateCustomFieldDto,
  ) {
    return this.customFieldsService.create(user, createCustomFieldDto);
  }

  @UseGuards(JwtGuard)
  @Get()
  findAll(@getUser() user: JwtPayload) {
    return this.customFieldsService.findAll(user);
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customFieldsService.findOneById(id);
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCustomFieldDto: UpdateCustomFieldDto,
  ) {
    return this.customFieldsService.update(+id, updateCustomFieldDto);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customFieldsService.remove(id);
  }
}
