import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { InventoryItem } from './inventory-item.entity';

@Entity()
export class InventoryMovement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: 'ENTRY' | 'EXIT' | 'EXPIRATION' | 'SALE';

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitCost: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @ManyToOne(() => InventoryItem, (item) => item.movements, { onDelete: 'CASCADE' })
  item: InventoryItem;
}