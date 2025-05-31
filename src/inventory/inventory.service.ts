import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InventoryItem } from './entities/inventory-item.entity';
import { Repository } from 'typeorm';
import { CreateInventoryItemDto } from './dtos/create-inventory-item.dto'
import { UpdateInventoryItemDto } from './dtos/update-inventory-item.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryItem)
    private readonly itemRepo: Repository<InventoryItem>,
  ) {}

  create(dto: CreateInventoryItemDto) {
    const item = this.itemRepo.create(dto);
    return this.itemRepo.save(item);
  }

  findAll() {
    // Vamos a calcular el stock total y el valor total de cada item
    const items = this.itemRepo.find({
      relations: ['movements'],
      order: { name: 'ASC' },
    });
    // y se va a actualizar el stock y el valor total
    items.then(items => {
      items.forEach(item => {
        item.stock = item.movements.reduce((acc, movement) => {
          return acc + (movement.type === 'ENTRY' ? movement.quantity : -movement.quantity);
        }, 0);

        item.totalValue = item.movements.reduce((acc, movement) => {
          return acc + (movement.type === 'ENTRY' ? movement.quantity * movement.unitCost : -movement.quantity * movement.unitCost);
        }, 0);
      });
    });
    // Guardamos los cambios en la base de datos
    return items.then(updatedItems => {
      return this.itemRepo.save(updatedItems);
    } ); 
  }

  findOne(id: number) {
    return this.itemRepo.findOne({ where: { id }, relations: ['movements'] });
  }

  async update(id: number, dto: UpdateInventoryItemDto) {
    const item = await this.itemRepo.preload({ id, ...dto });
    if (!item) throw new NotFoundException('Item not found');
    return this.itemRepo.save(item);
  }

  async remove(id: number) {
    const item = await this.itemRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Item not found');
    return this.itemRepo.remove(item);
  }

  async getMovements(id: number) {
    const item = await this.itemRepo.findOne({ where: { id }, relations: ['movements'] });
    console.log(item);
    if (!item) throw new NotFoundException('Item not found');
    return item.movements;
  } 

  async createMovement(id: number, dto: any) {
    const item = await this.itemRepo.findOne({ where: { id }, relations: ['movements'] });
    if (!item) throw new NotFoundException('Item not found');
    
    const movement = this.itemRepo.manager.create('InventoryMovement', {
      ...dto,
      item,
    });

    // Lógica de stock y valor
    const quantity = dto.quantity;
    const cost = dto.unitCost;
    switch (dto.type) {
      case 'ENTRY':
        item.stock += quantity;
        item.totalValue += quantity * cost;
        break;

      case 'EXIT':
      case 'EXPIRATION':
        if (item.stock < quantity) throw new NotFoundException('Not enough stock');
        item.stock -= quantity;
        item.totalValue -= quantity * cost;
        break;

      case 'SALE':
        if (item.stock < quantity) throw new NotFoundException('Not enough stock');
        item.stock -= quantity;
        break;
    }
    await this.itemRepo.save(item);

    
    return this.itemRepo.manager.save(movement);
  }
}