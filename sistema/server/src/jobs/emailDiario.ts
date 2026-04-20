import cron from 'node-cron';
import { EmailService } from '../services/EmailService';
import { dataHoje } from '../utils/date';

export function iniciarJobEmailDiario(): void {
  cron.schedule('0 23 * * *', async () => {
    await EmailService.processarFilaDiaria(dataHoje());
  });
}
