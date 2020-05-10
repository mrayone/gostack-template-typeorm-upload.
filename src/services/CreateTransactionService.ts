import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Category from '../models/Category';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  category: string;
  type: 'income' | 'outcome';
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    category,
    type,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);
    if (type === 'outcome') {
      const balance = await transactionRepository.getBalance();
      const isInvalidOutCome = value > balance.total;

      if (isInvalidOutCome)
        throw new AppError(
          "Can't create outcome transaction with value greater than total balance.",
          400,
        );
    }

    let categoryExists = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });

    if (!categoryExists) {
      const newCategory = categoryRepository.create({
        title: category,
      });

      const categoryAdded = await categoryRepository.save(newCategory);

      categoryExists = categoryAdded;
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: categoryExists.id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
