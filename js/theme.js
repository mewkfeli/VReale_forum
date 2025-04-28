document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.querySelector('.page-mode');
    const body = document.body;
    
    // Проверяем сохраненную тему
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = body.classList.contains('dark-theme') ? 'dark' : 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Проверяем системные настройки (если нет сохраненной темы)
    if (!localStorage.getItem('theme')) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) setTheme('dark');
    }

    function setTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-theme');
            themeToggle.innerHTML = '<img src="/resources/icon-light-mode.png" alt="Светлая тема">';
        } else {
            body.classList.remove('dark-theme');
            themeToggle.innerHTML = '<img src="/resources/icon-dark-mode.png" alt="Темная тема">';
        }
    }
});