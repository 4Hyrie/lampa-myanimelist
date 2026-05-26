/**
 * MyAnimeList API Integration
 * Using Jikan API (https://jikan.moe/)
 */

var MAL = (function () {
    'use strict';

    var JIKAN_URL = 'https://api.jikan.moe/v4';
    var network = new Lampa.Reguest();

    return {
        /**
         * Пошук аніме
         */
        search: function (query, page, success, error) {
            var url = JIKAN_URL + '/anime?query=' + encodeURIComponent(query) + '&page=' + (page || 1) + '&limit=25';

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
         * Топ аніме
         */
        getTop: function (type, page, success, error) {
            var url = JIKAN_URL + '/top/anime?page=' + (page || 1) + '&limit=25&filter=bypopularity';

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
        getSeason: function (year, season, success, error) {
            var url = JIKAN_URL + '/seasons/' + year + '/' + season + '?limit=25';

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
            var url = JIKAN_URL + '/anime/' + malId + '/full';

            network.silent(url, function (data) {
                try {
                    var parsed = typeof data === 'string' ? JSON.parse(data) : data;
                    if (parsed && parsed.data) {
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
         * Персонажи аніме
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
         * Персонал аніме (режисери, композитори)
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