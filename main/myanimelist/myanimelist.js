(function () {
    'use strict';

    // Загружаємо необхідні модулі
    Lampa.Utils.putScriptAsync([
        'https://4hyrie.github.io/lampa-myanimelist/main/myanimelist/api.js',
        'https://4hyrie.github.io/lampa-myanimelist/main/myanimelist/component.js',
        'https://4hyrie.github.io/lampa-myanimelist/main/myanimelist/styles.js'
    ], function () {
        console.log('[MAL] All modules loaded successfully');
    });

})();