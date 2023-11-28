import { User } from '@/schemas/user.schema';
import { db } from './db';

export const mockUserRecords: User[] = [
  {
    id: 'super-admin-id',
    full_name: 'Super admin',
    email: 'superuser@example.com',
    password: 'qwerty123',
    is_active: true,
    is_archived: false,
    role: 'super_admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'operator-id',
    full_name: 'Operator',
    email: 'operator@example.com',
    password: 'qwerty123',
    is_active: true,
    is_archived: false,
    role: 'operator',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export async function getUsers(): Promise<User[]> {
  return await db.users.toArray();
}
