import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { MovementService } from './movement.service';
import { CreateInventoryMovementDto } from './dtos/create-inventory-movement.dto';
import { SupabaseAuthGuard } from 'src/auth/guards/supabase-auth.guard';

@UseGuards(SupabaseAuthGuard)
@Controller('inventory/movements')
export class MovementController {
  constructor(private readonly movementService: MovementService) {}

  @Post()
  create(@Body() dto: CreateInventoryMovementDto) {
    return this.movementService.create(dto);
  }

  @Get()
  findAll() {
    return this.movementService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.movementService.findOne(+id);
  }
}
