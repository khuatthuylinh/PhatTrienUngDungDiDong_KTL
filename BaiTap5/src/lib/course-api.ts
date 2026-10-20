export type Category = {
  id: string;
  name: string;
  description: string;
};

export type Course = {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  instructor: string;
  price: number;
  duration: number;
  thumbnail: string;
  trailerUrl: string;
  createdAt: string;
};

export type CategoryInput = Omit<Category, 'id'>;
export type CourseInput = Omit<Course, 'id'>;

const API_BASE_URL = 'https://6acdeafaf338359cf1c2a15e.mockapi.io';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error (${response.status})`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const courseApi = {
  getCategories: () => request<Category[]>('/categories'),
  getCourses: () => request<Course[]>('/courses'),
  createCategory: (category: CategoryInput) =>
    request<Category>('/categories', { method: 'POST', body: JSON.stringify(category) }),
  updateCategory: (id: string, category: CategoryInput) =>
    request<Category>(`/categories/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    }),
  deleteCategory: (id: string) =>
    request<void>(`/categories/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  createCourse: (course: CourseInput) =>
    request<Course>('/courses', { method: 'POST', body: JSON.stringify(course) }),
  updateCourse: (id: string, course: CourseInput) =>
    request<Course>(`/courses/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(course),
    }),
  deleteCourse: (id: string) =>
    request<void>(`/courses/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};

export function formatPrice(price: number) {
  return `${new Intl.NumberFormat('vi-VN').format(price)} đ`;
}