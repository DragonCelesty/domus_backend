import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InventoryMovement } from './entities/inventory-movement.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { CreateInventoryMovementDto } from './dtos/create-inventory-movement.dto';
import { InventoryItem } from './entities/inventory-item.entity';

@Injectable()
export class MovementService {
  constructor(
    @InjectRepository(InventoryMovement)
    private readonly movementRepo: Repository<InventoryMovement>,
    @InjectRepository(InventoryItem)
    private readonly itemRepo: Repository<InventoryItem>,
  ) {}

  async create(dto: CreateInventoryMovementDto) {
    const item = await this.itemRepo.findOne({ where: { id: dto.itemId } });
    if (!item) throw new NotFoundException('Item not found');

    const movement = this.movementRepo.create({
      type: dto.type,
      quantity: dto.quantity,
      unitCost: dto.unitCost,
      item,
    });

    // lógica de stock y valor
    const quantity = dto.quantity;
    const cost = dto.unitCost;

    switch (dto.type) {
      case 'ENTRY':
        item.stock += quantity;
        item.totalValue += quantity * cost;
        break;

      case 'EXIT':
      case 'EXPIRATION':
        if (item.stock < quantity) throw new BadRequestException('Not enough stock');
        item.stock -= quantity;
        item.totalValue -= quantity * cost;
        break;

      case 'SALE':
        if (item.stock < quantity) throw new BadRequestException('Not enough stock');
        await this.applyFIFO(item, quantity);
        item.stock -= quantity;
        break;
    }

    await this.itemRepo.save(item);
    return this.movementRepo.save(movement);
  }
  findAll() {
    return this.movementRepo.find({ relations: {
      item: true,
    } });
  }

  findOne(id: number) {
    return this.movementRepo.findOne({ where: { id }, relations: ['item'] });
  }

  // lógica FIFO
  private async applyFIFO(item: InventoryItem, quantityToSell: number) {
    const entries = await this.movementRepo.find({
      where: { item: { id: item.id }, type: 'ENTRY' },
      order: { date: 'ASC' },
    });

    let remaining = quantityToSell;
    let valueConsumed = 0;

    for (const entry of entries) {
      if (remaining <= 0) break;

      const used = Math.min(entry.quantity, remaining);
      remaining -= used;
      valueConsumed += used * entry.unitCost;
    }

    item.totalValue -= valueConsumed;
  }
}