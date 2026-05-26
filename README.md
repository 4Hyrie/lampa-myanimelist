# MyAnimeList Extension для Lampa

Полноценное расширение для интеграции MyAnimeList в Lampa Media Center.

## ✨ Возможности

- 🔍 **Поиск аніме** по названию
- ⭐ **Топ аніме** по популярности и рейтингу
- 📅 **Каталог по сезонам** (Зима/Весна/Літо/Осінь)
- 👥 **Информация о персонажах** и авторах
- 💬 **Обсуждения** и комментарии
- 🎬 **Полная интеграция** с Full компонентом Lampa
- 📱 **Адаптивный дизайн** в стиле Lampa

## 🚀 Установка

Добавьте в плагины Lampa:

```javascript
(function () {
    'use strict';
    Lampa.Utils.putScriptAsync([
        'https://4hyrie.github.io/lampa-myanimelist/main/myanimelist/myanimelist.js'
    ], function () {
        console.log('MyAnimeList extension loaded');
    });
})();
```

## 📚 API

Расширение использует **Jikan API** (неофициальный API MyAnimeList):

- **Base URL:** `https://api.jikan.moe/v4`
- **Документация:** https://jikan.moe/

### Методы

#### Поиск
```javascript
MAL.search(query, page, success, error)
```

#### Топ аніме
```javascript
MAL.getTop('anime', page, success, error)
```

#### Сезоны
```javascript
MAL.getSeason(year, season, success, error)
// season: 'winter', 'spring', 'summer', 'fall'
```

#### Детали
```javascript
MAL.getById(malId, success, error)
```

#### Персонажи
```javascript
MAL.getCharacters(malId, success, error)
```

#### Персонал
```javascript
MAL.getStaff(malId, success, error)
```

#### Форум
```javascript
MAL.getForum(malId, success, error)
```

## 🎯 Компоненты

### mal_anime
Каталог аніме с поддержкой:
- Поиска
- Фильтрации
- Пагинации
- Просмотра деталей

### mal_seasons
Сезонный каталог:
- Выбор сезона (Зима/Весна/Літо/Осінь)
- По годам
- Рейтинги и информация

## 📁 Структура

```
main/myanimelist/
├── myanimelist.js      # Главный файл
├── api.js              # API интеграция
├── component.js        # UI компоненты
└── styles.js           # CSS стили
```

## 🔗 Источник для Full

Для Full компонента используется встроенный источник `myanimelist`:

```javascript
Lampa.Api.sources.myanimelist = {
    full: function (params, oncomplite, onerror) { ... },
    list: function (params, oncomplite, onerror) { ... },
    seasons: function (params, oncomplite, onerror) { ... }
}
```

## 💡 Примеры использования

### Поиск аніме
```javascript
MAL.search('Naruto', 1, function(data) {
    console.log(data.data); // Массив результатов
}, function(err) {
    console.error(err);
});
```

### Топ аніме
```javascript
MAL.getTop('anime', 1, function(data) {
    console.log(data.data); // Топ аніме
}, function(err) {
    console.error(err);
});
```

### Сезоны
```javascript
MAL.getSeason(2024, 'fall', function(data) {
    console.log(data.data); // Аніме сезону
}, function(err) {
    console.error(err);
});
```

### Детали аніме
```javascript
MAL.getById(1, function(data) {
    console.log(data); // Полная информация
}, function(err) {
    console.error(err);
});
```

## 🛠️ Функции

- ✅ Интеграция с встроенным поиском Lampa
- ✅ Добавление в меню приложения
- ✅ Регистрация компонентов
- ✅ Поддержка Full страниц
- ✅ Кэширование запросов
- ✅ Обработка ошибок
- ✅ Украинская локализация

## 📝 Лицензия

MIT

## 👤 Автор

4Hyrie

## 🔗 Ссылки

- GitHub: https://github.com/4Hyrie/lampa-myanimelist
- Lampa: https://github.com/Lampa-app/Lampa
- Jikan API: https://jikan.moe/
- MyAnimeList: https://myanimelist.net/
