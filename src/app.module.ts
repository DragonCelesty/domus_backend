import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InventoryService } from './inventory/inventory.service';
import { MovementService } from './inventory/movement.service';
import { InventoryController } from './inventory/inventory.controller';
import { MovementController } from './inventory/moviment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryItem } from './inventory/entities/inventory-item.entity';
import { InventoryMovement } from './inventory/entities/inventory-movement.entity';
import { BudgetModule } from './budget/budget.module';
import { BudgetController } from './budget/budget.controller';
import { BudgetService } from './budget/budget.service';
import { BudgetItem } from './budget/entities/budget-item.entity';
import { Budget } from './budget/entities/budget.entity';

@Module({
  imports: [AuthModule, ConfigModule.forRoot({isGlobal:true}),TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    useFactory: (config: ConfigService) => ({
      type: 'postgres',
      host: config.get<string>('DB_HOST'),
      port: config.get<number>('DB_PORT'),
      username: config.get<string>('DB_USERNAME'),
      password: config.get<string>('DB_PASSWORD'),
      database: config.get<string>('DB_NAME'),
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    inject: [ConfigService],
  }),TypeOrmModule.forFeature([InventoryItem,InventoryMovement,BudgetItem,Budget]), BudgetModule],
  controllers: [InventoryController,MovementController, BudgetController],
  providers: [InventoryService,MovementService, BudgetService],
})
export class AppModule {}
