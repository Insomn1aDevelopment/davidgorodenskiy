# Давид Городенский

Фронтенд находится в `nigger/index.html` и включает стили и JavaScript в одном файле. Изображения лежат в `nigger/img/`.

Запуск из корня репозитория:

```sh
npm start
```

Откройте <http://localhost:3000>. Сервер и API находятся в `nigger/server.js`; описание API — в [nigger/README.md](nigger/README.md).

Сервер заранее кэширует HTML и изображения в памяти, сжимает HTML gzip и использует ETag для повторных запросов. Зависимостей npm нет; требуется Node.js 20 или новее.
