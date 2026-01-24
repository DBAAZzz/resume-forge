import { http, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';

export const handlers = [
  http.get('/api/users', () => {
    // Generate 5 random users using Faker.js
    const users = Array.from({ length: 5 }).map(() => ({
      id: faker.number.int(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
    }));

    // Simulate network delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(HttpResponse.json(users));
      }, 500);
    });
  }),

  http.get('/api/me', () => {
    const user = {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      avatar: faker.image.avatar(),
      title: faker.person.jobTitle(),
    };

    return HttpResponse.json(user);
  }),

  http.get('/api/resumes', () => {
    const resumes = Array.from({ length: 6 }).map(() => ({
      id: faker.string.uuid(),
      title: faker.person.jobTitle() + ' Resume',
      summary: faker.lorem.sentence(),
      lastUpdated: faker.date.recent().toISOString().split('T')[0],
      status: faker.helpers.arrayElement(['draft', 'published']),
      completionScore: faker.number.int({ min: 20, max: 100 }),
    }));

    return HttpResponse.json(resumes);
  }),
];
