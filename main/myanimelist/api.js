/**
 * MyAnimeList API Integration
 * Using Jikan API (https://jikan.moe/)
 */

var MAL = (function () {
    'use strict';

    var JIKAN_URL = 'https://api.jikan.moe/v4';
    var network = new Lampa.Reguest();
    var cache = {};

    return {
        /**
         * Поиск аниме
         */
        search: function (query, page, filters, success, error) {
            var url = JIKAN_URL + '/anime?query=' + encodeURIComponent(query) + '&page=' + (page || 1) + '&limit=25&order_by=score&sort=desc';
            
            if (filters && filters.type) {
                url += '&type=' + filters.type;
            }
            if (filters && filters.status) {
                url += '&status=' + filters.status;
            }
            if (filters && filters.min_score) {
                url += '&min_score=' + filters.min_score;
            }

            network.silent(url, function (data) {
                try {
                    var parsed = typeof data === 'string' ? JSON.parse(data) : data;
                    if (success) success(parsed);
                } catch (e) {
                    if (error) error('Parse error: ' + e.message);
                }
            }, function (err) {
                if (error) error('Network error: ' + err);
            });
        },

        /**
         * Топ аніме з фільтрами
         */
        getTop: function (page, filters, success, error) {
            var url = JIKAN_URL + '/top/anime?page=' + (page || 1) + '&limit=25';
            
            if (filters) {
                if (filters.filter) {
                    url += '&filter=' + filters.filter; // airing, upcoming, bypopularity, favorite
                }
                if (filters.type) {
                    url += '&type=' + filters.type;
                }
            }

            network.silent(url, function (data) {
                try {
                    var parsed = typeof data === 'string' ? JSON.parse(data) : data;
                    if (success) success(parsed);
                } catch (e) {
                    if (error) error('Parse error: ' + e.message);
                }
            }, function (err) {
                if (error) error('Network error: ' + err);
            });
        },

        /**
         * Аніме сезону
         */
        getSeason: function (year, season, page, success, error) {
            var url = JIKAN_URL + '/seasons/' + year + '/' + season + '?page=' + (page || 1) + '&limit=25';

            network.silent(url, function (data) {
                try {
                    var parsed = typeof data === 'string' ? JSON.parse(data) : data;
                    if (success) success(parsed);
                } catch (e) {
                    if (error) error('Parse error: ' + e.message);
                }
            }, function (err) {
                if (error) error('Network error: ' + err);
            });
        },

        /**
         * Деталі аніме по ID
         */
        getById: function (malId, success, error) {
            if (cache[malId]) {
                success(cache[malId]);
                return;
            }

            var url = JIKAN_URL + '/anime/' + malId + '/full';

            network.silent(url, function (data) {
                try {
                    var parsed = typeof data === 'string' ? JSON.parse(data) : data;
                    if (parsed && parsed.data) {
                        cache[malId] = parsed.data;
                        if (success) success(parsed.data);
                    } else {
                        if (error) error('Invalid response');
                    }
                } catch (e) {
                    if (error) error('Parse error: ' + e.message);
                }
            }, function (err) {
                if (error) error('Network error: ' + err);
            });
        },

        /**
         * Персонажі аніме
         */
        getCharacters: function (malId, success, error) {
            var url = JIKAN_URL + '/anime/' + malId + '/characters';

            network.silent(url, function (data) {
                try {
                    var parsed = typeof data === 'string' ? JSON.parse(data) : data;
                    if (success) success(parsed);
                } catch (e) {
                    if (error) error('Parse error: ' + e.message);
                }
            }, function (err) {
                if (error) error('Network error: ' + err);
            });
        },

        /**
         * Персонал аніме
         */
        getStaff: function (malId, success, error) {
            var url = JIKAN_URL + '/anime/' + malId + '/staff';

            network.silent(url, function (data) {
                try {
                    var parsed = typeof data === 'string' ? JSON.parse(data) : data;
                    if (success) success(parsed);
                } catch (e) {
                    if (error) error('Parse error: ' + e.message);
                }
            }, function (err) {
                if (error) error('Network error: ' + err);
            });
        },

        /**
         * Форум аніме
         */
        getForum: function (malId, success, error) {
            var url = JIKAN_URL + '/anime/' + malId + '/forum';

            network.silent(url, function (data) {
                try {
                    var parsed = typeof data === 'string' ? JSON.parse(data) : data;
                    if (success) success(parsed);
                } catch (e) {
                    if (error) error('Parse error: ' + e.message);
                }
            }, function (err) {
                if (error) error('Network error: ' + err);
            });
        },

        /**
         * Скасування запитів
         */
        cancelRequests: function () {
            try {
                if (network && typeof network.clear === 'function') {
                    network.clear();
                }
            } catch (e) {
                console.log('[MAL] Cancel error:', e);
            }
        }
    };
})();