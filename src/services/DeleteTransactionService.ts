import { getRepository } from 'typeorm';

import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
// import TransactionRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionsRepository = getRepository(Transaction);

    const transactionById = await transactionsRepository.findOne({
      where: { id },
    });

    if (!transactionById) {
      throw new AppError('Could not find this transaction!', 404);
    }

    await transactionsRepository.remove(transactionById);
  }
}

export default DeleteTransactionService;
