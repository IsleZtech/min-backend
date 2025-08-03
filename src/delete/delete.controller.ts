import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { DeleteService } from './delete.service';
import { DeleteCreateDto } from './dto/create.dto';

@Controller('delete')
export class DeleteController {
  constructor(private readonly deleteService: DeleteService) {}
}
