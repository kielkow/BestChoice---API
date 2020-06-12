import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import Product from '../infra/typeorm/entities/Product';
import IProductsRepository from '../repositories/IProductsRepository';

interface IRequest {
  name: string;
  price: number;
  quantity: number;
}

@injectable()
class CreateProductService {
  constructor(
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
  ) {}

  public async execute({ name, price, quantity }: IRequest): Promise<Product> {
    const findProductWithSameName = await this.productsRepository.findByName(
      name,
    );

    if (findProductWithSameName) {
      throw new AppError('This product already exists.');
    }

    if (quantity === 0 || quantity < 0) {
      throw new AppError('Quantity invalid.', 400);
    }

    const product = await this.productsRepository.create({
      name,
      price,
      quantity,
    });

    product.price = Number(product.price);

    return product;
  }
}

export default CreateProductService;
