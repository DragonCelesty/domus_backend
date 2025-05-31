import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { MovementController } from './moviment.controller';
import { MovementService } from './movement.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryItem } from './entities/inventory-item.entity';
import { InventoryMovement } from './entities/inventory-movement.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([InventoryItem, InventoryMovement]), // Import InventoryItem entity
  ],
  controllers: [InventoryController, MovementController],
  providers: [InventoryService,MovementService],
  exports: [MovementService], // Export the service if needed in other modules 
})
export class InventoryModule {}
