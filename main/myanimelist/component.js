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

    // Фільтри
    this.filters = {
        type: '',
        status: '',
        year: new Date().getFullYear(),
        genre: '',
        minScore: 0
    };

    this.create = function () {
        if (this.rendered) return this.html;
        this.rendered = true;

        this.activity = Lampa.Activity.active().activity;
        this.activity.loader(true);

        this.html.classList.add('layer--wheight');
        
        // Додаємо фільтри
        var filterPanel = this.createFilterPanel();
        this.html.appendChild(filterPanel);

        this.contentContainer.classList.add('category-full', 'items', 'items--cards', 'cols--6');
        this.scroll.append(this.contentContainer);
        this.html.appendChild(this.scroll.render(true));

        this.load();
        return this.html;
    };

    this.createFilterPanel = function () {
        var panel = document.createElement('div');
        panel.className = 'mal-filter-panel';
        panel.style.cssText = 'padding: 1em; background: rgba(0,0,0,0.3); border-bottom: 1px solid rgba(255,255,255,0.1);';

        var scroll = new Lampa.Scroll({ mask: false, over: true, horizontal: true });
        var body = document.createElement('div');
        body.style.cssText = 'display: flex; gap: 0.5em; padding: 0.5em; flex-wrap: wrap;';

        // Тип
        var typeBtn = this.createFilterButton('Тип: Всі', 'type');
        body.appendChild(typeBtn);

        // Статус
        var statusBtn = this.createFilterButton('Статус: Всі', 'status');
        body.appendChild(statusBtn);

        // Рік
        var yearBtn = this.createFilterButton('Рік: ' + this.filters.year, 'year');
        body.appendChild(yearBtn);

        // Мінімальний рейтинг
        var scoreBtn = this.createFilterButton('Рейтинг: 0+', 'score');
        body.appendChild(scoreBtn);

        scroll.append(body);
        panel.appendChild(scroll.render(true));

        return panel;
    };

    this.createFilterButton = function (title, type) {
        var btn = document.createElement('div');
        btn.className = 'simple-button selector mal-filter-btn';
        btn.innerHTML = '<span>' + title + '</span>';
        btn.style.cssText = 'padding: 0.6em 1em; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 0.4em; cursor: pointer; white-space: nowrap;';

        $(btn).on('hover:enter', function () {
            self.showFilterMenu(type);
        });

        return btn;
    };

    this.showFilterMenu = function (type) {
        var items = [];

        if (type === 'type') {
            items = [
                { title: 'Всі', value: '' },
                { title: 'TV', value: 'tv' },
                { title: 'Фільм', value: 'movie' },
                { title: 'OVA', value: 'ova' },
                { title: 'ONA', value: 'ona' },
                { title: 'Спеціальний', value: 'special' },
                { title: 'Музичний', value: 'music' }
            ];
        } else if (type === 'status') {
            items = [
                { title: 'Всі', value: '' },
                { title: 'Виходить', value: 'airing' },
                { title: 'Завершено', value: 'complete' },
                { title: 'Анонсовано', value: 'upcoming' }
            ];
        } else if (type === 'year') {
            var currentYear = new Date().getFullYear();
            for (var i = currentYear; i >= 2000; i--) {
                items.push({ title: String(i), value: i });
            }
        } else if (type === 'score') {
            items = [
                { title: '0+', value: 0 },
                { title: '5+', value: 5 },
                { title: '6+', value: 6 },
                { title: '7+', value: 7 },
                { title: '8+', value: 8 }
            ];
        }

        Lampa.Select.show({
            title: 'Оберіть фільтр',
            items: items,
            onSelect: function (item) {
                self.filters[type] = item.value;
                self.current_page = 1;
                self.clear();
                self.load();
            }
        });
    };

    this.load = function () {
        if (self.loading) return;
        self.loading = true;
        self.activity.loader(true);

        var filters = {
            type: self.filters.type,
            status: self.filters.status,
            min_score: self.filters.minScore
        };

        MAL.getTop(self.current_page, filters, function (data) {
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
        var title = anime.title || 'Unknown';
        var originalTitle = anime.title_japanese || '';
        var displayTitle = originalTitle ? title + ' (' + originalTitle + ')' : title;

        var card = document.createElement('div');
        card.className = 'card selector';
        card.style.cursor = 'pointer';

        var cardInner = document.createElement('div');
        cardInner.className = 'card__view';
        cardInner.style.cssText = 'position: relative; overflow: hidden; background: rgba(0,0,0,0.2);';

        var img = document.createElement('img');
        img.src = anime.images.jpg.large_image_url;
        img.className = 'card__img';
        img.style.cssText = 'width: 100%; height: 350px; object-fit: cover;';
        img.onload = function () {
            card.classList.add('loaded');
        };

        var info = document.createElement('div');
        info.className = 'card__info';
        info.style.cssText = 'position: absolute; bottom: 0; left: 0; right: 0; padding: 1em; background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%);';

        var titleEl = document.createElement('div');
        titleEl.className = 'card__title';
        titleEl.style.cssText = 'font-weight: 600; font-size: 0.95em; line-height: 1.2; color: rgba(255,255,255,0.95); margin-bottom: 0.3em; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;';
        titleEl.textContent = displayTitle;

        var ratingEl = document.createElement('div');
        ratingEl.style.cssText = 'color: #FFD700; font-size: 0.85em; font-weight: 600;';
        ratingEl.textContent = '★ ' + (anime.score || '0.0');

        info.appendChild(titleEl);
        info.appendChild(ratingEl);
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
                    original_title: anime.title_japanese,
                    poster: anime.images.jpg.large_image_url,
                    vote_average: anime.score,
                    source: 'myanimelist'
                },
                source: 'myanimelist'
            });
        });

        return card;
    };

    this.clear = function () {
        this.items = [];
        this.contentContainer.innerHTML = '';
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
            right: function () {},
            up: function () {},
            down: function () {
                if (self.current_page < self.total_pages && !self.loading) {
                    self.current_page++;
                    self.load();
                }
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