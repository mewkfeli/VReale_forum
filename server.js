const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true })); // Для обработки данных форм
app.use(express.json()); // Для обработки JSON данных
app.use(morgan('dev')); // Логирование запросов

// Проверка существования необходимых шаблонов
const requiredTemplates = ['404.ejs', '500.ejs', 'thread.ejs', 'index.ejs'];
requiredTemplates.forEach(template => {
    const templatePath = path.join(__dirname, 'views', template);
    if (!fs.existsSync(templatePath)) {
        console.error(`ОШИБКА: Не найден шаблон ${template}`);
        process.exit(1);
    }
});

// Настройка подключения к базе данных
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'anonymous_forum',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Подключение к базе данных
db.connect(err => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err);
        process.exit(1);
    }
    console.log('Успешное подключение к базе данных');
});

// Middleware для статических файлов
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'css'))); // Явно для CSS
app.use('/js', express.static(path.join(__dirname, 'js'))); // Явно для JS
app.use('/resources', express.static(path.join(__dirname,'resources'))); // Явно для ресурсов

// Установка EJS как шаблонизатора
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Главная страница
app.get('/', async (req, res, next) => {
    try {
        // Первоначально загружаем только 3 треда
        const limit = 3;
        
        const [boardResults] = await db.promise().query(
            'SELECT id FROM boards WHERE short_name = "b" LIMIT 1'
        );
        
        if (!boardResults.length) {
            return res.status(404).render('404');
        }

        const boardId = boardResults[0].id;
        const [threads] = await db.promise().query(`
            SELECT t.*, p.message, p.created_at as post_created_at
            FROM threads t
            JOIN posts p ON t.id = p.thread_id AND p.is_op = TRUE
            WHERE t.board_id = ?
            ORDER BY t.is_pinned DESC, t.updated_at DESC
            LIMIT ?
        `, [boardId, limit]);

        const threadsWithComments = await Promise.all(
            threads.map(async thread => {
                const [comments] = await db.promise().query(`
                    SELECT p.id, p.message, p.created_at, p.name
                    FROM posts p
                    WHERE p.thread_id = ? AND p.is_op = FALSE
                    ORDER BY p.created_at DESC
                    LIMIT 3
                `, [thread.id]);

                const [countResult] = await db.promise().query(`
                    SELECT COUNT(*) as count
                    FROM posts
                    WHERE thread_id = ? AND is_op = FALSE
                `, [thread.id]);

                return {
                    ...thread,
                    comments: comments.reverse(),
                    replyCount: countResult[0].count
                };
            })
        );

        res.render('index', {
            threads: threadsWithComments,
            boardName: 'Бред',
            boardShortName: 'b',
            currentPage: 1 // Добавляем текущую страницу
        });
    } catch (err) {
        next(err);
    }
});

// Обработка создания нового треда в /b
app.post('/b/new', async (req, res, next) => {
    try {
        const { subject, message } = req.body;
        
        if (!message) {
            return res.status(400).render('400', { error: 'Сообщение обязательно' });
        }

        const [boardResults] = await db.promise().query(
            'SELECT id FROM boards WHERE short_name = "b" LIMIT 1'
        );
        
        if (!boardResults.length) {
            return res.status(404).render('404');
        }

        const boardId = boardResults[0].id;
        const [threadResult] = await db.promise().query(
            'INSERT INTO threads (board_id, subject, post_count) VALUES (?, ?, 1)',
            [boardId, subject]
        );

        await db.promise().query(
            'INSERT INTO posts (thread_id, is_op, message, subject) VALUES (?, TRUE, ?, ?)',
            [threadResult.insertId, message, subject]
        );

        res.redirect('/');
    } catch (err) {
        next(err);
    }
});

// Маршрут для просмотра треда
app.get('/b/:threadId', async (req, res, next) => {
    try {
        const threadId = parseInt(req.params.threadId);
        if (isNaN(threadId)) {
            return res.status(400).render('400', { error: 'Неверный ID треда' });
        }

        const [threadResults] = await db.promise().query(`
            SELECT t.*, p.message as op_message, p.created_at as op_created_at, p.subject as op_subject
            FROM threads t
            JOIN posts p ON t.id = p.thread_id AND p.is_op = TRUE
            WHERE t.id = ? AND t.board_id = (SELECT id FROM boards WHERE short_name = 'b')
            LIMIT 1
        `, [threadId]);

        if (!threadResults.length) {
            return res.status(404).render('404');
        }

        const thread = threadResults[0];
        const [comments] = await db.promise().query(`
            SELECT p.id, p.message, p.created_at, p.name
            FROM posts p
            WHERE p.thread_id = ? AND p.is_op = FALSE
            ORDER BY p.created_at ASC
        `, [threadId]);

        res.render('thread', {
            thread: thread,
            comments: comments,
            boardShortName: 'b',
            boardName: 'Бред'
        });
    } catch (err) {
        next(err);
    }
});

// Маршрут для добавления комментария
app.post('/b/:threadId/reply', async (req, res, next) => {
    try {
        const threadId = parseInt(req.params.threadId);
        if (isNaN(threadId)) {
            return res.status(400).render('400', { error: 'Неверный ID треда' });
        }

        const { message, name } = req.body;
        if (!message) {
            return res.status(400).render('400', { error: 'Сообщение обязательно' });
        }

        await db.promise().query(
            'INSERT INTO posts (thread_id, is_op, message, name) VALUES (?, FALSE, ?, ?)',
            [threadId, message, name || 'Аноним']
        );

        await db.promise().query(`
            UPDATE threads 
            SET post_count = post_count + 1, 
                updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `, [threadId]);

        res.redirect(`/b/${threadId}`);
    } catch (err) {
        next(err);
    }
});

// Маршрут для загрузки тредов с пагинацией
app.get('/api/threads', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 3; // Количество тредов на страницу
        const offset = (page - 1) * limit;

        const [boardResults] = await db.promise().query(
            'SELECT id FROM boards WHERE short_name = "b" LIMIT 1'
        );
        
        if (!boardResults.length) {
            return res.status(404).json({ error: 'Доска не найдена' });
        }

        const boardId = boardResults[0].id;
        
        // Получаем треды для текущей страницы
        const [threads] = await db.promise().query(`
            SELECT t.*, p.message, p.created_at as post_created_at
            FROM threads t
            JOIN posts p ON t.id = p.thread_id AND p.is_op = TRUE
            WHERE t.board_id = ?
            ORDER BY t.is_pinned DESC, t.updated_at DESC
            LIMIT ? OFFSET ?
        `, [boardId, limit, offset]);

        // Получаем комментарии для каждого треда
        const threadsWithComments = await Promise.all(
            threads.map(async thread => {
                const [comments] = await db.promise().query(`
                    SELECT p.id, p.message, p.created_at, p.name
                    FROM posts p
                    WHERE p.thread_id = ? AND p.is_op = FALSE
                    ORDER BY p.created_at DESC
                    LIMIT 3
                `, [thread.id]);

                const [countResult] = await db.promise().query(`
                    SELECT COUNT(*) as count
                    FROM posts
                    WHERE thread_id = ? AND is_op = FALSE
                `, [thread.id]);

                return {
                    ...thread,
                    comments: comments.reverse(),
                    replyCount: countResult[0].count
                };
            })
        );

        res.json(threadsWithComments);
    } catch (err) {
        console.error('Ошибка при загрузке тредов:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Обработка 400 (неверный запрос)
app.use((req, res, next) => {
    res.status(400).render('400', { error: 'Неверный запрос' });
});

// Обработка 404 (страница не найдена)
app.use((req, res, next) => {
    res.status(404).render('404');
});

// Обработка 500 (ошибка сервера)
app.use((err, req, res, next) => {
    console.error('Ошибка:', err.stack);
    res.status(500).render('500');
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});