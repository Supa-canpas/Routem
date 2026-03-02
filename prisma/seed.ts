import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

async function main() {
    const users =  [
        {id: '00000000-0000-0000-0000-000000000001', name: 'lychee'},
        {id: '00000000-0000-0000-0000-000000000002', name: 'avocado'}
    ]

    for(const user of users) {
        await prisma.user.upsert({
            where: { id: user.id },
            update: { name: user.name },
            create: {
                id: user.id,
                name: user.name,
            }
        })
    }
}

//実行処理
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
