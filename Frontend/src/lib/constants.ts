// Общие константы приложения.
// Здесь хранятся варианты для select, ключи localStorage и другие повторяющиеся данные.

export const dealTypeOptions = [
    {
      value: 'sale',
      label: 'Продажа',
    },
    {
      value: 'rent',
      label: 'Аренда',
    },
  ] as const
  
  export const roomsOptions = [0, 1, 2, 3, 4, 5, 6]