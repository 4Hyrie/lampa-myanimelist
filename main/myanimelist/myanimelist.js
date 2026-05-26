(function () {
    'use strict';

    // Загружаємо необхідні модулі
    Lampa.Utils.putScriptAsync([
        'https://4hyrie.github.io/lampa-myanimelist/main/myanimelist/api.js',
        'https://4hyrie.github.io/lampa-myanimelist/main/myanimelist/component.js',
        'https://4hyrie.github.io/lampa-myanimelist/main/myanimelist/styles.js'
    ], function () {
        initMALExtension();
    });

    function initMALExtension() {
        console.log('[MAL] Initializing MyAnimeList extension');

        // Додаємо меню в Lampa
        addMenuItems();

        // Реєстрируємо компоненти
        registerComponents();

        // Інтеграція з пошуком
        integrateSearch();

        // Реєстрація джерела для Full
        registerSourceProvider();

        console.log('[MAL] Extension initialized successfully');
    }

    function addMenuItems() {
        if (!Lampa.Menu || typeof Lampa.Menu.addButton !== 'function') return;

        // Кнопка "Аніме" (топ)
        Lampa.Menu.addButton(createLogoSVG(), 'MyAnimeList', function () {
            Lampa.Activity.push({
                url: '',
                title: 'MyAnimeList - Топ Аніме',
                component: 'mal_anime',
                page: 1,
                source: 'myanimelist'
            });
        });

        // Кнопка "Сезони"
        Lampa.Menu.addButton(createSeasonSVG(), 'Сезони', function () {
            Lampa.Activity.push({
                url: '',
                title: 'MyAnimeList - Сезони',
                component: 'mal_seasons',
                page: 1,
                source: 'myanimelist'
            });
        });
    }

    function registerComponents() {
        if (!Lampa.Component || typeof Lampa.Component.add !== 'function') return;

        // Компонент каталогу
        Lampa.Component.add('mal_anime', function (params) {
            return new MALAnimeComponent(params);
        });

        // Компонент сезонів
        Lampa.Component.add('mal_seasons', function (params) {
            return new MALSeasonsComponent(params);
        });
    }

    function integrateSearch() {
        if (!Lampa.Search || typeof Lampa.Search.addSource !== 'function') return;

        Lampa.Search.addSource({
            title: 'MyAnimeList',
            params: { save: true },
            search: function (params, oncomplite) {
                var query = (params && params.query || '').trim();
                if (!query) {
                    oncomplite([]);
                    return;
                }

                MAL.search(query, 1, function (data) {
                    if (data && data.data && Array.isArray(data.data)) {
                        var results = data.data.map(function (anime) {
                            return {
                                id: anime.mal_id,
                                title: anime.title,
                                original_title: anime.title_english || anime.title_japanese,
                                poster: anime.images.jpg.large_image_url,
                                img: anime.images.jpg.large_image_url,
                                vote_average: anime.score || 0,
                                overview: (anime.synopsis || '').substring(0, 200),
                                source: 'myanimelist',
                                mal_id: anime.mal_id
                            };
                        });

                        oncomplite([{
                            title: 'MyAnimeList',
                            results: results,
                            source: 'myanimelist',
                            page: 1,
                            total_pages: 1
                        }]);
                    } else {
                        oncomplite([]);
                    }
                }, function () {
                    oncomplite([]);
                });
            },
            onCancel: function () {
                if (MAL && typeof MAL.cancelRequests === 'function') {
                    MAL.cancelRequests();
                }
            }
        });
    }

    function registerSourceProvider() {
        if (!Lampa.Api) Lampa.Api = {};
        if (!Lampa.Api.sources) Lampa.Api.sources = {};

        Lampa.Api.sources.myanimelist = {
            full: function (params, oncomplite, onerror) {
                var malId = params && (params.id || params.mal_id);
                if (!malId) {
                    onerror && onerror('MAL: missing mal_id');
                    return;
                }

                MAL.getById(malId, function (details) {
                    if (!details) {
                        onerror && onerror('MAL: failed to get details');
                        return;
                    }

                    var payload = buildFullPayload(details);
                    oncomplite && oncomplite(payload);
                }, function (err) {
                    onerror && onerror(err);
                });
            },

            list: function (params, oncomplite, onerror) {
                var page = params && params.page || 1;
                var query = params && params.query;

                if (query) {
                    MAL.search(query, page, function (data) {
                        oncomplite && oncomplite(normalizeList(data));
                    }, function (err) {
                        onerror && onerror(err);
                    });
                } else {
                    MAL.getTop('anime', page, function (data) {
                        oncomplite && oncomplite(normalizeList(data));
                    }, function (err) {
                        onerror && onerror(err);
                    });
                }
            },

            seasons: function (params, oncomplite, onerror) {
                var year = params && params.year || new Date().getFullYear();
                var season = params && params.season || 'fall';

                MAL.getSeason(year, season, function (data) {
                    var results = data && data.data ? data.data : [];
                    oncomplite && oncomplite({
                        results: results.map(normalizeAnimeCard),
                        total_pages: 1,
                        page: 1
                    });
                }, function (err) {
                    onerror && onerror(err);
                });
            }
        };
    }

    function buildFullPayload(details) {
        return {
            movie: {
                id: details.mal_id,
                title: details.title,
                original_title: details.title_english || details.title_japanese,
                overview: details.synopsis || 'Опис відсутній',
                poster_path: null,
                poster: details.images.jpg.large_image_url,
                img: details.images.jpg.large_image_url,
                vote_average: details.score || 0,
                status: details.status,
                first_air_date: details.aired && details.aired.from ? new Date(details.aired.from).toISOString().split('T')[0] : '',
                number_of_episodes: details.episodes,
                genres: Array.isArray(details.genres) ? details.genres.map(function (g) {
                    return { id: g.mal_id, name: g.name };
                }) : [],
                production_companies: Array.isArray(details.studios) ? details.studios.map(function (s) {
                    return { id: s.mal_id, name: s.name };
                }) : [],
                mal_id: details.mal_id,
                source: 'myanimelist'
            },
            episodes: null,
            discuss: null
        };
    }

    function normalizeList(data) {
        var results = data && data.data ? data.data : [];
        return {
            results: results.map(normalizeAnimeCard),
            total_pages: Math.ceil((data && data.pagination && data.pagination.last_visible_page) || 1),
            page: (data && data.pagination && data.pagination.current_page) || 1
        };
    }

    function normalizeAnimeCard(anime) {
        return {
            id: anime.mal_id,
            mal_id: anime.mal_id,
            title: anime.title,
            original_title: anime.title_english || anime.title_japanese,
            poster_path: null,
            poster: anime.images.jpg.large_image_url,
            img: anime.images.jpg.large_image_url,
            vote_average: anime.score || 0,
            overview: (anime.synopsis || '').substring(0, 150),
            media_type: 'tv',
            source: 'myanimelist',
            mal_id: anime.mal_id
        };
    }

    function createLogoSVG() {
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" style="width:1.2em;height:1.2em;"><rect x="10" y="10" width="100" height="100" fill="#2E51B6" rx="8"/><text x="60" y="70" font-size="60" font-weight="bold" fill="#FFF" text-anchor="middle">M</text></svg>';
    }

    function createSeasonSVG() {
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" style="width:1.2em;height:1.2em;"><circle cx="60" cy="60" r="50" fill="#FF6B6B"/><text x="60" y="70" font-size="50" font-weight="bold" fill="#FFF" text-anchor="middle">S</text></svg>';
    }
})();