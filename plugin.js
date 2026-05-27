(function () {
    'use strict';
    
    // Чекаємо, поки додаток повністю завантажиться
    if (window.appready) {
        initMAL();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                initMAL();
            }
        });
    }

    function initMAL() {
        console.log('[MAL] Initializing extension...');
        
        Lampa.Utils.putScriptAsync([
            'https://4hyrie.github.io/lampa-myanimelist/main/myanimelist/api.js',
            'https://4hyrie.github.io/lampa-myanimelist/main/myanimelist/component.js',
            'https://4hyrie.github.io/lampa-myanimelist/main/myanimelist/styles.js'
        ], function () {
            setupExtension();
        });
    }

    function setupExtension() {
        console.log('[MAL] Setting up extension...');
        
        // Реєструємо компоненти
        if (Lampa.Component && typeof Lampa.Component.add === 'function') {
            Lampa.Component.add('mal_anime', function (params) {
                return new MALAnimeComponent(params);
            });
            console.log('[MAL] mal_anime component registered');
        }

        // Додаємо в меню
        setTimeout(function () {
            addMenuItems();
        }, 500);

        // Інтеграція пошуку
        integrateSearch();

        // Реєструємо джерело для Full
        registerSourceProvider();

        console.log('[MAL] Extension setup complete');
    }

    function addMenuItems() {
        if (!Lampa.Menu || typeof Lampa.Menu.addButton !== 'function') {
            console.warn('[MAL] Lampa.Menu not available, retrying...');
            setTimeout(addMenuItems, 500);
            return;
        }

        try {
            // Кнопка MyAnimeList
            Lampa.Menu.addButton(createLogoSVG(), 'MyAnimeList', function () {
                Lampa.Activity.push({
                    url: '',
                    title: 'MyAnimeList',
                    component: 'mal_anime',
                    page: 1,
                    source: 'myanimelist'
                });
            });
            console.log('[MAL] MyAnimeList button added to menu');
        } catch (e) {
            console.error('[MAL] Error adding menu items:', e);
        }
    }

    function integrateSearch() {
        if (!Lampa.Search || typeof Lampa.Search.addSource !== 'function') {
            console.log('[MAL] Search integration skipped (not available)');
            return;
        }

        Lampa.Search.addSource({
            title: 'MyAnimeList',
            params: { save: true },
            search: function (params, oncomplite) {
                var query = (params && params.query || '').trim();
                if (!query) {
                    oncomplite([]);
                    return;
                }

                if (!window.MAL) {
                    oncomplite([]);
                    return;
                }

                MAL.search(query, 1, {}, function (data) {
                    if (data && data.data && Array.isArray(data.data)) {
                        var results = data.data.map(function (anime) {
                            var title = anime.title || 'Unknown';
                            var originalTitle = anime.title_japanese || '';
                            var displayTitle = originalTitle ? title + ' (' + originalTitle + ')' : title;

                            return {
                                id: anime.mal_id,
                                title: displayTitle,
                                original_title: originalTitle,
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
                if (window.MAL && typeof MAL.cancelRequests === 'function') {
                    MAL.cancelRequests();
                }
            }
        });
        console.log('[MAL] Search integration complete');
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

                if (!window.MAL) {
                    onerror && onerror('MAL: API not loaded');
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

                if (!window.MAL) {
                    onerror && onerror('MAL: API not loaded');
                    return;
                }

                if (query) {
                    MAL.search(query, page, {}, function (data) {
                        oncomplite && oncomplite(normalizeList(data));
                    }, function (err) {
                        onerror && onerror(err);
                    });
                } else {
                    MAL.getTop(page, {}, function (data) {
                        oncomplite && oncomplite(normalizeList(data));
                    }, function (err) {
                        onerror && onerror(err);
                    });
                }
            }
        };
        console.log('[MAL] Source provider registered');
    }

    function buildFullPayload(details) {
        var title = details.title || 'Unknown';
        var originalTitle = details.title_japanese || '';
        var displayTitle = originalTitle ? title + ' (' + originalTitle + ')' : title;

        return {
            movie: {
                id: details.mal_id,
                title: displayTitle,
                original_title: originalTitle,
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
        var title = anime.title || 'Unknown';
        var originalTitle = anime.title_japanese || '';
        var displayTitle = originalTitle ? title + ' (' + originalTitle + ')' : title;

        return {
            id: anime.mal_id,
            mal_id: anime.mal_id,
            title: displayTitle,
            original_title: originalTitle,
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
})();