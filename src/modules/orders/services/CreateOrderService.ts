/* eslint-disable no-param-reassign */
import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    // Check if customer exists
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) throw new AppError('Customer does not exists.', 400);

    // Update and check quantity of each product
    const updatedProductsQuantity = await this.productsRepository.updateQuantity(
      products,
    );

    // Format updated products
    const formatProducts = updatedProductsQuantity.map((product, index) => {
      return {
        product_id: product.id,
        price: product.price,
        quantity: products[index].quantity,
      };
    });

    // Create order
    const order = await this.ordersRepository.create({
      customer,
      products: formatProducts,
    });

    return order;
  }
}

export default CreateOrderService;
