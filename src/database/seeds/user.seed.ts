import { DataSource } from 'typeorm';
import { User } from '../../shared/entities/user.entity';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config(); // Load biến môi trường từ .env

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '3306'),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [User],
  synchronize: true,
});

async function seed() {
  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(User);

  // Xóa hết user cũ (nếu muốn)
  await userRepo.clear();

  const users = [
    {
      name: 'Alice',
      email: 'alice@example.com',
      username: 'alice@example.com',
      type: "Customer",
      password: await bcrypt.hash('password123', 10),
    },
    {
      name: 'Bob',
      email: 'bob@example.com',
      username: 'bob@example.com',
      type: "Customer",
      password: await bcrypt.hash('password123', 10),
    },
  ];

  for (const data of users) {
    const user = userRepo.create(data);
    await userRepo.save(user);
  }

  console.log('✅ Seeded users!');
  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
