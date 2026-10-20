export const MSSV = 'BIT247620';
export const STORAGE_KEY = `${MSSV}_FoodManager_Data_v1`;
export const API_ENDPOINTS = {
  categories: 'https://6ad712f1f71f154ac487b390.mockapi.io/BIT247620_DishCategory',
  dishes: 'https://6ad712f1f71f154ac487b390.mockapi.io/BIT247620_Dish',
};
export const API_BASE_URL = API_ENDPOINTS.dishes.slice(0, API_ENDPOINTS.dishes.lastIndexOf('/'));
export const TABLES = {
  categories: `${MSSV}_DishCategory`,
  dishes: `${MSSV}_Dish`,
};

export const FIELDS = {
  id: `${MSSV}_Id`,
  name: `${MSSV}_Name`,
  description: `${MSSV}_Description`,
  price: `${MSSV}_Price`,
  preparationTime: `${MSSV}_PreparationTime`,
  isAvailable: `${MSSV}_IsAvailable`,
  categoryId: `${MSSV}_DishCategoryId`,
  images: `${MSSV}_DishImage`,
  imageUrl: `${MSSV}_ImageUrl`,
  isThumbnail: `${MSSV}_IsThumbnail`,
  remoteId: `${MSSV}_RemoteId`,
  clientId: `${MSSV}_ClientId`,
  entity: `${MSSV}_Entity`,
  action: `${MSSV}_Action`,
  snapshot: `${MSSV}_Snapshot`,
  changedAt: `${MSSV}_ChangedAt`,
};

const makeCategory = (id, name, description) => ({
  [FIELDS.id]: id,
  [FIELDS.name]: name,
  [FIELDS.description]: description,
  [FIELDS.remoteId]: null,
});

const makeDish = (id, name, price, preparationTime, isAvailable, description, categoryId, imageUrls) => ({
  [FIELDS.id]: id,
  [FIELDS.name]: name,
  [FIELDS.price]: price,
  [FIELDS.preparationTime]: preparationTime,
  [FIELDS.isAvailable]: isAvailable,
  [FIELDS.description]: description,
  [FIELDS.categoryId]: categoryId,
  [FIELDS.images]: imageUrls.map((url, index) => ({
    [FIELDS.imageUrl]: url,
    [FIELDS.isThumbnail]: index === 0,
  })),
  [FIELDS.remoteId]: null,
});

export function createSeedData() {
  const categories = [
    makeCategory('BIT247620-CAT-01', 'Starters', 'Small plates to begin your meal.'),
    makeCategory('BIT247620-CAT-02', 'Main courses', 'Freshly prepared signature dishes.'),
    makeCategory('BIT247620-CAT-03', 'Desserts', 'A sweet finish, made in-house.'),
  ];
  const dishes = [
    makeDish('BIT247620-DISH-01', 'Garden avocado bowl', 89000, 12, true, 'Avocado, greens, toasted seeds, and a bright citrus dressing.', categories[0][FIELDS.id], ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=85', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=85']),
    makeDish('BIT247620-DISH-02', 'Wood-fired margherita', 159000, 18, true, 'Tomato, mozzarella, basil, and olive oil on a crisp sourdough base.', categories[1][FIELDS.id], ['https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1000&q=85']),
    makeDish('BIT247620-DISH-03', 'Charred chicken plate', 189000, 24, true, 'Herb-marinated chicken with seasonal vegetables and lemon jus.', categories[1][FIELDS.id], ['https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=1000&q=85']),
    makeDish('BIT247620-DISH-04', 'Miso mushroom noodles', 139000, 15, false, 'Wheat noodles, roasted mushrooms, sesame, and light miso broth.', categories[1][FIELDS.id], ['https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1000&q=85']),
    makeDish('BIT247620-DISH-05', 'Vanilla berry panna cotta', 69000, 8, true, 'Silky vanilla cream with a seasonal berry compote.', categories[2][FIELDS.id], ['https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1000&q=85']),
  ];

  return {
    [TABLES.categories]: categories,
    [TABLES.dishes]: dishes,
    [`${MSSV}_PendingChanges`]: [],
    [`${MSSV}_ApiBaseUrl`]: API_BASE_URL,
    [`${MSSV}_Language`]: 'en',
  };
}

export function createEmptyStore() {
  return {
    [TABLES.categories]: [],
    [TABLES.dishes]: [],
    [`${MSSV}_PendingChanges`]: [],
    [`${MSSV}_ApiBaseUrl`]: API_BASE_URL,
    [`${MSSV}_Language`]: 'en',
  };
}

export function createId(prefix) {
  return `${MSSV}-${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createPendingChange(entity, action, snapshot) {
  return {
    [FIELDS.entity]: entity,
    [FIELDS.action]: action,
    [FIELDS.id]: snapshot[FIELDS.id],
    [FIELDS.remoteId]: snapshot[FIELDS.remoteId] ?? null,
    [FIELDS.snapshot]: action === 'upsert' ? snapshot : null,
    [FIELDS.changedAt]: Date.now(),
  };
}

export function getQuickStatus(preparationTime) {
  return Number(preparationTime) <= 15 ? 'quick' : 'regular';
}