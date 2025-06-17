import { DataSource } from 'typeorm';
import { User } from '../../shared/entities/user.entity';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '3306'),
  username: process.env.DATABASE_USERNAME || 'root',
  password: process.env.DATABASE_PASSWORD || 'root',
  database: process.env.DATABASE_NAME || 'backend',
  entities: [User],
  synchronize: true,
});

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('Database connection initialized');

    const userRepo = AppDataSource.getRepository(User);

    // Clear existing users
    await userRepo.clear();
    console.log('Cleared existing users');

    // Create sample users
    const users = [
      {
        name: 'Alice',
        email: 'alice@example.com',
        password: await bcrypt.hash('password123', 10),
      },
      {
        name: 'Bob',
        email: 'bob@example.com',
        password: await bcrypt.hash('password123', 10),
      },
    ];

    // Save users
    for (const userData of users) {
      const user = userRepo.create(userData);
      await userRepo.save(user);
      console.log(`Created user: ${user.email}`);
    }

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

seed(); 