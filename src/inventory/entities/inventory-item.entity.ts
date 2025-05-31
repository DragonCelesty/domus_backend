import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { InventoryMovement } from './inventory-movement.entity';

@Entity()
export class InventoryItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: 0 })
  stock: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalValue: number;

  @OneToMany(() => InventoryMovement, (movement) => movement.item, { cascade: true })
  movements: InventoryMovement[];
}