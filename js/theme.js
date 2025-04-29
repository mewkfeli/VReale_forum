document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.querySelector('.page-mode');
    const body = document.body;

    // Глобальная функция для установки темы
    function applyTheme(theme) {
        // Удаляем все возможные классы тем
        body.classList.remove('dark-theme', 'light-theme');
        
        // Добавляем нужный класс
        body.classList.add(theme + '-theme');
        
        // Обновляем иконку
        const icon = theme === 'dark' ? 'light' : 'dark';
        themeToggle.innerHTML = `<img src="/resources/icon-${icon}-mode.png" alt="${theme} тема">`;
        
        // Сохраняем в localStorage
        localStorage.setItem('theme', theme);
    }

    // Проверяем сохраненную тему или системные настройки
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

    // Применяем тему
    applyTheme(initialTheme);

    // Обработчик клика для переключения темы
    if (themeToggle) {
        themeToggle.addEventListener('click', (e) => {
            e.preventDefault();
            const currentTheme = body.classList.contains('dark-theme') ? 'dark' : 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';

            applyTheme(newTheme);
        });
    }
});
