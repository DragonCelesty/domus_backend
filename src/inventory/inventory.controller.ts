import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto } from './dtos/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dtos/update-inventory-item.dto';
import { SupabaseAuthGuard } from 'src/auth/guards/supabase-auth.guard';

@UseGuards(SupabaseAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  create(@Body() dto: CreateInventoryItemDto) {
    return this.inventoryService.create(dto);
  }

  @Get()
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.inventoryService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateInventoryItemDto) {
    return this.inventoryService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.inventoryService.remove(+id);
  }

  @Get(':id/movements')
  getMovements(@Param('id') id: number) {
    return this.inventoryService.getMovements(+id);
  }

  @Post(':id/movements')
  createMovement(@Param('id') id: number, @Body() dto: any) {
    return this.inventoryService.createMovement(+id, dto);
  }
}