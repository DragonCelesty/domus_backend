import { Module } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { BudgetController } from './budget.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Budget } from './entities/budget.entity';
import { BudgetItem } from './entities/budget-item.entity';
import { InventoryItem } from 'src/inventory/entities/inventory-item.entity';
import { InventoryModule } from 'src/inventory/inventory.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([Budget, BudgetItem, InventoryItem]),
    InventoryModule, // Import InventoryModule to use InventoryItem
  ],
  controllers: [BudgetController],
  providers: [BudgetService],
})
export class BudgetModule {}
