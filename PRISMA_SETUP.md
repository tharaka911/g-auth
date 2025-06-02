# Prisma ORM Integration

This project now has Prisma ORM integrated for database management with PostgreSQL.

## What's Been Set Up

### 1. Database Configuration
- **Database**: PostgreSQL (Neon)
- **Connection**: Configured in `.env` file
- **Schema**: Located at `prisma/schema.prisma`

### 2. Files Created/Modified

#### Core Prisma Files:
- `prisma/schema.prisma` - Database schema definition
- `src/lib/prisma.ts` - Prisma client singleton
- `.env` - Database connection string

#### Example Implementation:
- `src/app/api/users/route.ts` - API routes for user CRUD operations
- `src/app/users/page.tsx` - Demo page showing Prisma integration
- `src/app/page.tsx` - Updated with link to demo

#### Package Scripts:
- `db:generate` - Generate Prisma client
- `db:push` - Push schema to database
- `db:migrate` - Create and run migrations
- `db:studio` - Open Prisma Studio

## Usage

### 1. Running the Application
```bash
npm run dev
```
Visit `http://localhost:3000/users` to see the Prisma demo in action.

### 2. Database Operations

#### Generate Prisma Client:
```bash
npm run db:generate
# or
npx prisma generate
```

#### Push Schema Changes:
```bash
npm run db:push
# or
npx prisma db push
```

#### Open Prisma Studio:
```bash
npm run db:studio
# or
npx prisma studio
```

### 3. Using Prisma in Your Code

#### Import the client:
```typescript
import { prisma } from '@/lib/prisma'
```

#### Example queries:
```typescript
// Create a user
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe'
  }
})

// Find all users
const users = await prisma.user.findMany()

// Find user by email
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' }
})

// Update user
const updatedUser = await prisma.user.update({
  where: { id: 'user-id' },
  data: { name: 'Jane Doe' }
})

// Delete user
await prisma.user.delete({
  where: { id: 'user-id' }
})
```

## Database Schema

Currently includes a basic User model:

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

## Adding New Models

1. Add your model to `prisma/schema.prisma`
2. Run `npm run db:push` to update the database
3. The Prisma client will be automatically regenerated

Example:
```prisma
model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  published Boolean  @default(false)
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("posts")
}
```

## Environment Variables

Make sure your `.env` file contains:
```
DATABASE_URL="your-postgresql-connection-string"
```

## Next Steps

1. Modify the User model in `prisma/schema.prisma` to fit your needs
2. Add additional models as required
3. Create API routes for your new models
4. Build your application logic using Prisma queries

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma with Next.js](https://www.prisma.io/docs/getting-started/setup-prisma/add-to-existing-project/relational-databases/next-js)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)