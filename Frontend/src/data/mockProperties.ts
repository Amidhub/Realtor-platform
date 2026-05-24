// Mock-данные объявлений.
// Используются для разработки каталога, пока backend не подключён стабильно.

import type { Property } from '../types/property'

export const mockProperties: Property[] = [
  {
    id: 1,
    type: 'sale',
    title: 'Светлая квартира рядом с метро',
    description:
      'Уютная квартира с современным ремонтом, просторной кухней и удобной транспортной доступностью.',
    price: 8500000,
    rooms: 2,
    area: 56,
    address: 'Екатеринбург, ул. Мира, 19',
    status: 'active',
    photos: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=1200&q=80',
    ],
    created_at: '2026-03-10T10:00:00.000Z',
  },
  {
    id: 2,
    type: 'rent',
    title: 'Квартира для аренды в центре',
    description:
      'Квартира с мебелью и техникой, подходит для студентов или молодой семьи.',
    price: 45000,
    rooms: 1,
    area: 38,
    address: 'Екатеринбург, ул. Ленина, 45',
    status: 'active',
    photos: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
    ],
    created_at: '2026-03-12T12:30:00.000Z',
  },
  {
    id: 3,
    type: 'sale',
    title: 'Просторная семейная квартира',
    description:
      'Трёхкомнатная квартира рядом со школой, парком и магазинами. Хороший вариант для семьи.',
    price: 12300000,
    rooms: 3,
    area: 82,
    address: 'Екатеринбург, ул. Гагарина, 12',
    status: 'active',
    photos: [
      'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80',
    ],
    created_at: '2026-03-08T09:15:00.000Z',
  },
]