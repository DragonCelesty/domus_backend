import { IsOptional, IsString } from 'class-validator';

export class UpdateInventoryItemDto {
  @IsOptional()
  @IsString()
  name?: string;
}