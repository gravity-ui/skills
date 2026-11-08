export type UserStatus = 'active' | 'pending' | 'blocked';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  age: number;
  city: string;
  balance: number;
  status: UserStatus;
}

const FIRST_NAMES = [
  'Alice', 'Bob', 'Carol', 'David', 'Emma', 'Frank', 'Grace', 'Henry',
  'Ivy', 'Jack', 'Karen', 'Liam', 'Mia', 'Noah', 'Olivia', 'Peter',
];

const LAST_NAMES = [
  'Anderson', 'Brown', 'Clark', 'Davis', 'Evans', 'Foster', 'Garcia',
  'Harris', 'Johnson', 'Kim', 'Lopez', 'Miller', 'Nguyen', 'Parker',
];

const CITIES = [
  'Amsterdam', 'Berlin', 'London', 'Madrid', 'New York',
  'Paris', 'Prague', 'Tokyo', 'Toronto', 'Warsaw',
];

const ROLES = [
  'Developer', 'Designer', 'Manager', 'Analyst', 'DevOps', 'QA Engineer', 'Support',
];

const STATUSES: UserStatus[] = ['active', 'pending', 'blocked'];

function buildUsers(count: number): User[] {
  const users: User[] = [];
  for (let i = 0; i < count; i++) {
    const first = FIRST_NAMES[i % FIRST_NAMES.length];
    const last = LAST_NAMES[(i * 5 + Math.floor(i / FIRST_NAMES.length)) % LAST_NAMES.length];
    const name = `${first} ${last}`;
    users.push({
      id: `user-${i + 1}`,
      name,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@example.com`,
      role: ROLES[(i * 3) % ROLES.length],
      age: 21 + ((i * 13) % 42),
      city: CITIES[(i * 7) % CITIES.length],
      balance: Math.round(((i * 7919) % 95000) + 500) / 100 + 1000 * ((i * 31) % 9),
      status: STATUSES[(i * 2 + Math.floor(i / 7)) % STATUSES.length],
    });
  }
  return users;
}

export const USERS: User[] = buildUsers(57);
