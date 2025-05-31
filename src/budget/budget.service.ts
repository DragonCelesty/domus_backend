import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget } from './entities/budget.entity';
import { BudgetItem } from './entities/budget-item.entity';
import { InventoryItem } from 'src/inventory/entities/inventory-item.entity';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { FilterBudgetDto } from './dto/filter-budget.dto';
import { MovementService } from 'src/inventory/movement.service';

@Injectable()
export class BudgetService {
  constructor(
    @InjectRepository(Budget)
    private budgetRepo: Repository<Budget>,

    @InjectRepository(BudgetItem)
    private budgetItemRepo: Repository<BudgetItem>,

    @InjectRepository(InventoryItem)
    private inventoryRepo: Repository<InventoryItem>,
    private movementService: MovementService,
  ) {}

  async create(dto: CreateBudgetDto) {
    const budget = this.budgetRepo.create({
      clientId: dto.clientId,
    });

    await this.budgetRepo.save(budget);

    const items: BudgetItem[] = [];

    for (const itemDto of dto.items) {
      const product = await this.inventoryRepo.findOne({
        where: { id: itemDto.productId },
      });

      if (!product) {
        throw new NotFoundException(`Producto con ID ${itemDto.productId} no encontrado`);
      }

      const unitPrice = product.totalValue / (product.stock || 1); // evita división por cero
      const totalPrice = unitPrice * itemDto.quantity;

      const budgetItem = this.budgetItemRepo.create({
        budget,
        product,
        quantity: itemDto.quantity,
        unitPrice,
        totalPrice,
      });

      items.push(budgetItem);
    }

    await this.budgetItemRepo.save(items);

    return this.budgetRepo.findOne({
      where: { id: budget.id },
      relations: ['items', 'items.product'],
    });
  }

  async findByClient(clientId: string) {
    const budgets = await this.budgetRepo.find({
      where: { clientId },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });

    return budgets;
  }

  async findOne(id: number): Promise<Budget> {
    const budget = await this.budgetRepo.findOne({
      where: { id },
      relations: ['items', 'items.product'],
    });



    if (!budget) {
      throw new NotFoundException(`Presupuesto con ID ${id} no encontrado`);
    }

    // actualizar el total de cada item
    for (const item of budget.items) {
      if (!item.quantity || !item.unitPrice) {
        throw new BadRequestException('Item quantity and unit price must be provided');
      }
      item.totalPrice = item.quantity * item.unitPrice;
    }
    // actualizar el total del presupuesto
    budget.total = budget.items.reduce((sum, item) => sum + item.totalPrice, 0);

    return budget;
  }

  async findAll(): Promise<Budget[]> {
    const budgets = await this.budgetRepo.find({
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
    // actualizar el total de cada presupuesto y el total de cada item
    for (const budget of budgets) {
      // console.log('Presupuesto:', budget);
      for (const item of budget.items) {
        // console.log('Item:', item);
        
        item.unitPrice = parseInt(String(item.product.totalValue), 10) / (item.product.stock || 1);
        item.totalPrice = item.quantity * item.unitPrice;
        // console.log('Item:', item);
      }
      budget.total = budget.items.reduce((sum, item) => sum + item.totalPrice, 0);
      
      await this.budgetItemRepo.save(budget.items); 
    } 

    return budgets;
  } 


  async findAllWithFilters(filterDto: FilterBudgetDto): Promise<Budget[]> {
    const { clientId, startDate, endDate, itemId } = filterDto;
  
    const query = this.budgetRepo
      .createQueryBuilder('budget')
      .leftJoinAndSelect('budget.items', 'item')
      .leftJoinAndSelect('item.product', 'product');
  
    if (clientId) {
      query.andWhere('budget.clientId = :clientId', { clientId });
    }
  
    if (startDate) {
      query.andWhere('budget.createdAt >= :startDate', { startDate });
    }
  
    if (endDate) {
      query.andWhere('budget.createdAt <= :endDate', { endDate });
    }
  
    if (itemId) {
      query.andWhere('item.product = :itemId', { itemId });
    }
  
    query.orderBy('budget.createdAt', 'DESC');
  
    return await query.getMany();
  }

  async createSaleFromBudget(budgetId: number) {
    const budget = await this.budgetRepo.findOne({
      where: { id: budgetId },
      relations: ['items', 'items.product'],
    });
  
    if (!budget) throw new NotFoundException('Budget not found');
    if (budget.isOrder) throw new BadRequestException('Budget has already been converted to a sale order');

    console.log('Presupuesto a convertir:', budget);

    // Actualizar el presupuesto para marcarlo como orden
    budget.isOrder = true;
    budget.updatedAt = new Date();
    budget.orderDate = new Date(); // fecha de la orden
    await this.budgetRepo.save(budget);
    // aqui se hace la logica que crea un movimiento de venta por cada item del presupuesto usando el service de movimientos de inventario y FIFO
    for (const item of budget.items) {
      const movement = {
        itemId: item.product.id,
        type: 'SALE' as const, // tipo de movimiento de venta
        quantity: item.quantity,
        unitCost: item.unitPrice,
      }
      await this.movementService.create(movement);  
    }
  }

}