import { connectDB, resetDatabase } from './db.js';

const runReset = async () => {
  console.log('--------------------------------------------------');
  console.log('⚡ RESETTING MONGO DB & DISK PERSISTENT STORE ⚡');
  console.log('--------------------------------------------------');
  
  await connectDB();
  await resetDatabase();
  
  console.log('✨ All old collections dropped and disk store cleared!');
  console.log('🌱 System initialized fresh for Pune & Kolhapur.');
  console.log('--------------------------------------------------');
  process.exit(0);
};

runReset().catch(err => {
  console.error('Error resetting DB:', err);
  process.exit(1);
});
