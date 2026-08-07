# Realtor-Platform

Платформа объявлений недвижимости с чатами в реальном времени, геолокацией и модерацией.

## Backend Стек

- FastAPI
- PostgreSQL (asyncpg)
- SQLAlchemy 2.0 (async)
- Alembic
- JWT
- WebSockets
- S3 (aiobotocore)
- Docker Compose

## Основной функционал

- **Аутентификация:** JWT access/refresh токены в HttpOnly-куках, роли user/moderator
- **Чат:** WebSocket-чаты между пользователями с историей, статусами "прочитано" и "печатает", счетчик непрочитанных
- **Объявления:** CRUD, загрузка фото в S3 с валидацией (тип/размер), статусы draft/moderation/active/rejected
- **Геолокация:** преобразование адреса в координаты через Nominatim, поиск объявлений в радиусе
- **Модерация:** принятие/отклонение объявлений с логами и причиной
- **Фильтрация:** по цене, комнатам, типу, сортировка, пагинация
- **Переводы (i18n):** система мультиязычных переводов на уровне БД
- **Согласия (GDPR):** пользователь дает/отзывает согласие на обработку данных

## Запуск

Клонируй репозиторий и заполни `.env`:

```env
MODE=DEV
PROJECT_NAME=NAME
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=password
DB_NAME=realestate
SECRETE_KEY=secret
ALGORITHM=HS256
ACCESS_KEY_S3=your_key
SECRET_KEY_S3=your_secret
ENDPOINT_URl_S3=https://s3.example.com
BUCKET_NAME_S3=your_bucket
```

Запусти с Docker Compose:

bash
```
docker-compose up -d
```
Выполни миграции:

bash
```alembic upgrade head```
Документация API доступна по адресу: http://localhost:8000/docs