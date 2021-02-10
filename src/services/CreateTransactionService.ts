import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

type RequestDTO = {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
};
class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: RequestDTO): Promise<Transaction> {
    let category_id: string;

    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const balance = await transactionsRepository.getBalance();

    if (type === 'outcome' && balance.total < value) {
      throw new AppError('insufficient funds', 400);
    }

    const categoryRepository = getRepository(Category);

    const categoryWithSameTitle = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!categoryWithSameTitle) {
      const newCategory = categoryRepository.create({
        title: category,
      });
      categoryRepository.save(newCategory);
      category_id = newCategory.id;
    } else {
      category_id = categoryWithSameTitle.id;
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id,
    });

    transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
