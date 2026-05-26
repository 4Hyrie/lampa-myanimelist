/**
 * MyAnimeList Компоненти для Lampa
 */

var MALAnimeComponent = function (object) {
    var self = this;
    this.object = object || {};
    this.html = document.createElement('div');
    this.contentContainer = document.createElement('div');
    this.scroll = new Lampa.Scroll({ mask: true, over: true });
    this.items = [];
    this.current_page = 1;
    this.total_pages = 1;
    this.loading = false;
    this.activity = null;

    this.create = function () {
        if (this.rendered) return this.html;
        this.rendered = true;

        this.activity = Lampa.Activity.active().activity;
        this.activity.loader(true);

        this.html.classList.add('layer--wheight');
        this.contentContainer.classList.add('category-full', 'items', 'items--cards', 'cols--6');

        this.scroll.append(this.contentContainer);
        this.html.appendChild(this.scroll.render(true));

        this.load();
        return this.html;
    };

    this.load = function () {
        if (self.loading) return;
        self.loading = true;
        self.activity.loader(true);

        MAL.getTop('anime', self.current_page, function (data) {
            self.loading = false;
            self.activity.loader(false);

            if (data && data.data && Array.isArray(data.data)) {
                self.total_pages = data.pagination ? data.pagination.last_visible_page : 1;
                self.append(data.data);
            } else {
                self.empty();
            }
        }, function () {
            self.loading = false;
            self.activity.loader(false);
            self.empty();
        });
    };

    this.append = function (results) {
        var fragment = document.createDocumentFragment();

        results.forEach(function (anime) {
            var card = self.createCard(anime);
            fragment.appendChild(card);
        });

        this.contentContainer.appendChild(fragment);

        if (this.current_page === 1) {
            this.activity.toggle();
            Lampa.Layer.update(this.html);
        }
    };

    this.createCard = function (anime) {
        var card = document.createElement('div');
        card.className = 'card selector';
        card.style.cursor = 'pointer';

        var cardInner = document.createElement('div');
        cardInner.className = 'card__view';

        var img = document.createElement('img');
        img.src = anime.images.jpg.large_image_url;
        img.className = 'card__img';

        var info = document.createElement('div');
        info.className = 'card__info';
        info.innerHTML = '<div class="card__title">' + anime.title + '</div>';

        cardInner.appendChild(img);
        cardInner.appendChild(info);
        card.appendChild(cardInner);

        $(card).on('hover:enter', function () {
            Lampa.Activity.push({
                url: '',
                component: 'full',
                id: anime.mal_id,
                method: 'tv',
                card: {
                    id: anime.mal_id,
                    mal_id: anime.mal_id,
                    title: anime.title,
                    original_title: anime.title_english,
                    poster: anime.images.jpg.large_image_url,
                    vote_average: anime.score,
                    source: 'myanimelist'
                },
                source: 'myanimelist'
            });
        });

        return card;
    };

    this.empty = function () {
        var empty = new Lampa.Empty();
        this.contentContainer.appendChild(empty.render(true));
        this.activity.toggle();
    };

    this.render = function () {
        return this.create();
    };

    this.start = function () {
        Lampa.Controller.add('content', {
            link: self,
            toggle: function () {
                Lampa.Controller.collectionSet(self.contentContainer);
            },
            left: function () {
                Lampa.Controller.toggle('menu');
            },
            back: function () {
                Lampa.Activity.backward();
            }
        });

        Lampa.Controller.toggle('content');
    };

    this.pause = function () {};
    this.stop = function () {};
    this.destroy = function () {
        this.rendered = false;
        this.scroll.destroy();
        this.html.remove();
    };
};

var MALSeasonsComponent = function (object) {
    var self = this;
    this.object = object || {};
    this.html = document.createElement('div');
    this.scroll = new Lampa.Scroll({ mask: true, over: true });
    this.activity = null;

    this.create = function () {
        if (this.rendered) return this.html;
        this.rendered = true;

        this.activity = Lampa.Activity.active().activity;
        this.activity.loader(true);

        this.html.classList.add('layer--wheight');

        var body = document.createElement('div');
        body.className = 'mal-seasons';

        var now = new Date();
        var year = now.getFullYear();
        var month = now.getMonth() + 1;
        var currentSeason = month <= 3 ? 'winter' : month <= 6 ? 'spring' : month <= 9 ? 'summer' : 'fall';

        var seasons = ['winter', 'spring', 'summer', 'fall'];
        var seasonLabels = {
            winter: 'Зима',
            spring: 'Весна',
            summer: 'Літо',
            fall: 'Осінь'
        };

        seasons.forEach(function (season) {
            var btn = document.createElement('div');
            btn.className = 'simple-button selector' + (season === currentSeason ? ' focus' : '');
            btn.innerHTML = '<span>' + seasonLabels[season] + ' ' + year + '</span>';
            btn.style.cursor = 'pointer';
            btn.style.padding = '1em';
            btn.style.marginBottom = '0.5em';
            btn.style.borderRadius = '0.5em';
            btn.style.background = 'rgba(255,255,255,0.1)';

            $(btn).on('hover:enter', function () {
                self.loadSeason(year, season);
            });

            body.appendChild(btn);
        });

        this.scroll.append(body);
        this.html.appendChild(this.scroll.render(true));
        this.activity.loader(false);
        this.activity.toggle();

        return this.html;
    };

    this.loadSeason = function (year, season) {
        this.activity.loader(true);

        MAL.getSeason(year, season, function (data) {
            self.activity.loader(false);

            if (data && data.data) {
                var seasonLabel = {
                    winter: 'Зима',
                    spring: 'Весна',
                    summer: 'Літо',
                    fall: 'Осінь'
                }[season];

                Lampa.Activity.push({
                    url: '',
                    title: 'MyAnimeList - ' + seasonLabel + ' ' + year,
                    component: 'category_full',
                    page: 1,
                    source: 'myanimelist',
                    season: season,
                    year: year
                });
            }
        }, function () {
            self.activity.loader(false);
        });
    };

    this.render = function () {
        return this.create();
    };

    this.start = function () {
        Lampa.Controller.toggle('content');
    };

    this.pause = function () {};
    this.stop = function () {};
    this.destroy = function () {
        this.rendered = false;
        this.scroll.destroy();
        this.html.remove();
    };
};