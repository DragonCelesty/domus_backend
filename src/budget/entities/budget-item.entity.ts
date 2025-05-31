// src/budget/entities/budget-item.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Budget } from './budget.entity';
import { InventoryItem } from 'src/inventory/entities/inventory-item.entity';

@Entity()
export class BudgetItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Budget, budget => budget.items)
  budget: Budget;

  @ManyToOne(() => InventoryItem)
  product: InventoryItem;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;
}