import { getRepository } from 'typeorm';
import { v4 } from 'uuid';

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

    const transactionsRepository = new TransactionsRepository();

    const balance = await transactionsRepository.getBalance();

    if (type === 'outcome' && balance.total < value) {
      throw new AppError('insufficient funds', 400);
    }

    const categoryRepository = getRepository(Category);

    const categoryWithSameTitle = await categoryRepository.findOne({
      where: { category },
    });

    if (!categoryWithSameTitle) {
      category_id = v4();
      const categoryRef = categoryRepository.create({
        id: category_id,
        title: category,
        created_at: new Date(),
        updated_at: new Date(),
      });
      categoryRepository.save(categoryRef);
      //  PEGAR O ID DA CAREGORIA CRIADA
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
