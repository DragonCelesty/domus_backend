// src/budget/budget.controller.ts
import { Controller, Post, Body, Get, Param, Query, UseGuards } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { FilterBudgetDto } from './dto/filter-budget.dto';
import { SupabaseAuthGuard } from 'src/auth/guards/supabase-auth.guard';

@UseGuards(SupabaseAuthGuard)
@Controller('budgets')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService
  ) {}

  @Post()
  create(@Body() dto: CreateBudgetDto) {
    return this.budgetService.create(dto);
  }

  @Get('client/:clientId')
  getByClient(@Param('clientId') clientId: string) {
    return this.budgetService.findByClient(clientId);
  }

  @Get('filter')  
  findAllFilter(@Query() filterDto: FilterBudgetDto) {
    return this.budgetService.findAllWithFilters(filterDto);
  }
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.budgetService.findOne(id);
  }
  @Get()
  findAll() {
    return this.budgetService.findAll();
  }
  @Post('convert-to-order/:id')
  convertToOrder(@Param('id') id: number) {
    return this.budgetService.createSaleFromBudget(id);
  }
}
