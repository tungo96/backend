import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { DataSource } from 'typeorm';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private dataSource: DataSource,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('db-check')
  async checkDatabase() {
    try {
      // Kiểm tra kết nối
      if (this.dataSource.isInitialized) {
        // Thử thực hiện một query đơn giản
        await this.dataSource.query('SELECT 1');
        const options = this.dataSource.options as any;
        return {
          status: 'success',
          message: 'Database connection is successful',
          details: {
            database: options.database,
            host: options.host,
            port: options.port,
            type: options.type
          }
        };
      } else {
        return {
          status: 'error',
          message: 'Database is not initialized'
        };
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'Database connection failed',
        error: error.message
      };
    }
  }
}
