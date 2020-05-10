import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const initialBalance: Balance = {
      income: 0,
      outcome: 0,
      total: 0,
    };

    return transactions.reduce((acc, next) => {
      if (next.type === 'income') {
        acc.income += next.value;
        acc.total += next.value;
      }
      if (next.type === 'outcome') {
        acc.outcome += next.value;
        acc.total -= next.value;
      }
      return acc;
    }, initialBalance);
  }
}

export default TransactionsRepository;
