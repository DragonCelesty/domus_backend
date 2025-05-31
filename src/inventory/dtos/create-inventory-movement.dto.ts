import { IsEnum, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateInventoryMovementDto {
  @IsNumber()
  @IsNotEmpty()
  readonly itemId: number;

  @IsEnum(['ENTRY', 'EXIT', 'EXPIRATION', 'SALE'])
  type: 'ENTRY' | 'EXIT' | 'EXPIRATION' | 'SALE';

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitCost: number;
}