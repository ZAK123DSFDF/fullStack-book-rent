import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Define your categories
  const categories = [
    { name: 'Science Fiction' },
    { name: 'Fantasy' },
    { name: 'Mystery' },
    { name: 'Biography' },
    { name: 'Non-Fiction' },
  ];

  // Insert each category into the database
  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: { name: category.name },
    });
  }

  console.log('Categories have been seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
