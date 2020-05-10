import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import uploadConfig from '../config/Upload';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface TransactionDTO {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(fileName: string): Promise<Transaction[]> {
    const csFilePath = path.resolve(uploadConfig.homeDir, fileName);
    const createTransactionService = new CreateTransactionService();
    const readCSVStream = await fs.createReadStream(csFilePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });
    const transactionsDTO = new Array<TransactionDTO>();

    const parseCSV = readCSVStream.pipe(parseStream);

    parseCSV.on('data', line => {
      const [title, type, value, category] = line;
      transactionsDTO.push({
        title,
        type,
        value: parseFloat(value),
        category,
      });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const transactions = new Array<Transaction>();
    for (const transaction of transactionsDTO) {
      const newTransaction = await createTransactionService.execute({
        ...transaction,
      });
      transactions.push(newTransaction);
    }

    await fs.promises.unlink(csFilePath);
    return transactions;
  }
}

export default ImportTransactionsService;
