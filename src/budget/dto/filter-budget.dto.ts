// src/budget/dto/filter-budget.dto.ts
import { IsOptional, IsString, IsDateString, IsUUID } from 'class-validator';

export class FilterBudgetDto {
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  itemId?: number;
}