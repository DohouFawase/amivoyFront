export type DemoUser = {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  interests: string[];
};

let currentDemoUser: DemoUser = {
  firstName: 'Samira',
  lastName: 'Diallo',
  email: 'samira@example.com',
  country: 'Bénin',
  interests: ['Voyages', 'Restaurants', 'Culture'],
};

export function getDemoUser(): DemoUser {
  return currentDemoUser;
}

export function setDemoUser(user: DemoUser): void {
  currentDemoUser = user;
}

export function resetDemoUser(): void {
  currentDemoUser = {
    firstName: 'Samira',
    lastName: 'Diallo',
    email: 'samira@example.com',
    country: 'Bénin',
    interests: ['Voyages', 'Restaurants', 'Culture'],
  };
}
