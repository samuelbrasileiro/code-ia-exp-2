import cron from 'node-cron';
import { EmailService } from '../services/EmailService';
import { dataHoje } from '../utils/date';
import { createLogger } from '../utils/logger';

const logger = createLogger('JobEmailDiario');

export function iniciarJobEmailDiario(): void {
  cron.schedule('0 23 * * *', async () => {
    const data = dataHoje()
    logger.info(`Job iniciado para a data ${data}`)
    try {
      await EmailService.processarFilaDiaria(data)
      logger.info(`Job concluído para a data ${data}`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      logger.error(`Job falhou para a data ${data}`, { message })
    }
  });

  logger.info('Job de e-mail diário agendado (23h00)')
}
