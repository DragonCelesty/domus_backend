import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateInventoryItemDto {
  @IsNotEmpty()
  readonly name: string;

  @IsNumber()
  @Min(0)
  readonly stock: number;

  @IsNumber()
  @Min(0)
  readonly totalValue: number;
}