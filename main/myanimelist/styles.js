/**
 * MyAnimeList Стилі
 */

(function () {
    var style = document.createElement('style');
    style.innerHTML = `
        .mal-filter-panel {
            z-index: 10;
        }

        .mal-filter-btn {
            transition: all 0.2s ease;
        }

        .mal-filter-btn:hover,
        .mal-filter-btn.focus {
            background: rgba(255,255,255,0.2) !important;
            border-color: rgba(255,255,255,0.4) !important;
        }

        .card {
            position: relative;
            overflow: hidden;
            border-radius: 0.4em;
            background: rgba(0,0,0,0.4);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .card:hover,
        .card.focus {
            transform: scale(1.05);
            box-shadow: 0 8px 20px rgba(0,0,0,0.4);
        }

        .card__view {
            width: 100%;
            padding-bottom: 140%;
            position: relative;
        }

        .card__img {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .card__info {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 1em;
            background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 100%);
        }

        .card__title {
            font-weight: 600;
            font-size: 0.95em;
            line-height: 1.2;
            color: rgba(255,255,255,0.95);
            margin-bottom: 0.3em;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .category-full {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 1em;
            padding: 1em;
        }

        @media (min-width: 768px) {
            .category-full {
                grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            }
        }
    `;
    document.head.appendChild(style);
})();