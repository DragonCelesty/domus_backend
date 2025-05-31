import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { BudgetItem } from './budget-item.entity';

@Entity()
export class Budget {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  clientId: string; // viene de Supabase

  @OneToMany(() => BudgetItem, item => item.budget, { cascade: true, eager: true })
  items: BudgetItem[];

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // presupuesto transformado a orden de salida
  @Column({ default: false })
  isOrder: boolean;

  // fecha de la orden de salida
  @Column({ type: 'timestamp', nullable: true })
  orderDate: Date;  
}