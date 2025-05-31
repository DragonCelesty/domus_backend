export class CreateBudgetItemDto {
    productId: number; // ID del producto en el inventario
    productName: string;
    quantity: number;
  }
  
  export class CreateBudgetDto {
    clientId: string;
    items: CreateBudgetItemDto[];
  }