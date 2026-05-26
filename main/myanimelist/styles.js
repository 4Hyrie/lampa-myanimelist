/**
 * MyAnimeList Styles
 */

(function () {
    var style = document.createElement('style');
    style.innerHTML = `
        .mal-seasons {
            padding: 2em 1.5em;
            max-width: 60em;
            margin: 0 auto;
        }

        .hikka-logo-icon {
            display: inline-block;
            width: 1.2em;
            height: 1.2em;
        }

        .mal-card {
            position: relative;
            overflow: hidden;
            border-radius: 0.5em;
            background: rgba(255, 255, 255, 0.08);
        }

        .mal-card:hover {
            background: rgba(255, 255, 255, 0.15);
        }

        .mal-card__image {
            width: 100%;
            height: 280px;
            object-fit: cover;
        }

        .mal-card__info {
            padding: 1em;
        }

        .mal-card__title {
            font-weight: 600;
            font-size: 1.1em;
            margin-bottom: 0.5em;
            color: rgba(255, 255, 255, 0.95);
        }

        .mal-card__rating {
            display: flex;
            align-items: center;
            gap: 0.5em;
            color: #FFD700;
            font-size: 0.9em;
        }

        .mal-card__status {
            margin-top: 0.5em;
            font-size: 0.85em;
            color: rgba(255, 255, 255, 0.7);
        }
    `;
    document.head.appendChild(style);
})();