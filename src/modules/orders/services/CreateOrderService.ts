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

    // Find products
    const productsIds = products.map(product => {
      return { id: product.id };
    });

    const foundProducts = await this.productsRepository.findAllById(
      productsIds,
    );

    // Check if have some product
    if (
      foundProducts.length === 0 ||
      foundProducts.length !== productsIds.length
    ) {
      throw new AppError(
        'Any product was not found. Please check the products ID.',
        400,
      );
    }

    // Format products
    const formatProducts = foundProducts.map(product => {
      const formatProduct = products.filter(p => {
        return p.id === product.id;
      });

      return {
        product_id: product.id,
        price: product.price,
        quantity: formatProduct[0].quantity,
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
