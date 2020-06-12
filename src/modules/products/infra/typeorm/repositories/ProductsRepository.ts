/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { getRepository, Repository, In } from 'typeorm';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';

import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';

import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({
      name,
      price,
      quantity,
    });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const product = await this.ormRepository.findOne({ where: { name } });

    return product;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const productsId = products.map(product => {
      return product.id;
    });

    const foundProducts = await this.ormRepository.find({
      id: In(productsId),
    });

    return foundProducts;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const updatedProductsQuantity: Product[] = [];

    for (const product of products) {
      const foundProduct = await this.ormRepository.findOne(product.id);

      if (!foundProduct) {
        throw new AppError(`Product ${product.id} not found to update.`, 400);
      }

      if (foundProduct.quantity - product.quantity < 0) {
        throw new AppError(`No ${foundProduct.name} enough.`, 400);
      }

      foundProduct.quantity -= product.quantity;

      updatedProductsQuantity.push(await this.ormRepository.save(foundProduct));
    }

    return updatedProductsQuantity;
  }
}

export default ProductsRepository;
