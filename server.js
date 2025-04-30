const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));

// Главная страница (перенаправляем на /b)
app.get('/', (req, res) => {
    res.redirect('/b');
});

// Проверка шаблонов
const requiredTemplates = ['404.ejs', '500.ejs', 'thread.ejs', 'index.ejs', 'board.ejs'];
requiredTemplates.forEach(template => {
    const templatePath = path.join(__dirname, 'views', template);
    if (!fs.existsSync(templatePath)) {
        console.error(`ОШИБКА: Не найден шаблон ${template}`);
        process.exit(1);
    }
});

// Настройка базы данных
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'anonymous_forum',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.connect(err => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err);
        process.exit(1);
    }
    console.log('Успешное подключение к базе данных');
});

// Middleware
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/resources', express.static(path.join(__dirname,'resources')));

app.set('view engine', 'ejs');

// Главная страница
app.get('/', async (req, res, next) => {
    try {
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

                // Обрабатываем сообщения для корректного отображения
                const processedComments = comments.map(comment => ({
                    ...comment,
                    message: comment.message.replace(/\n/g, '<br>')
                }));

                return {
                    ...thread,
                    message: thread.message.replace(/\n/g, '<br>'), // Обрабатываем OP-сообщение
                    comments: processedComments.reverse(),
                    replyCount: countResult[0].count
                };
            })
        );

        res.render('index', {
            threads: threadsWithComments,
            boardName: 'Бред',
            boardShortName: 'b',
            currentPage: 1
        });
    } catch (err) {
        next(err);
    }
});

// Создание треда в /b
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

// Страница категории (доски)
app.get('/:boardShortName', async (req, res, next) => {
    try {
        const { boardShortName } = req.params;
        const limit = 3;
        
        const [boardResults] = await db.promise().query(
            'SELECT id, name FROM boards WHERE short_name = ? LIMIT 1',
            [boardShortName]
        );
        
        if (!boardResults.length) {
            return res.status(404).render('404');
        }

        const board = boardResults[0];
        const [threads] = await db.promise().query(`
            SELECT t.*, p.message, p.created_at as post_created_at
            FROM threads t
            JOIN posts p ON t.id = p.thread_id AND p.is_op = TRUE
            WHERE t.board_id = ?
            ORDER BY t.is_pinned DESC, t.updated_at DESC
            LIMIT ?
        `, [board.id, limit]);

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

        res.render('board', {
            threads: threadsWithComments,
            boardName: board.name,
            boardShortName: boardShortName,
            currentPage: 1
        });
    } catch (err) {
        next(err);
    }
});

// Просмотр треда
app.get('/:boardShortName/:threadId', async (req, res, next) => {
    try {
        const { boardShortName, threadId } = req.params;
        
        const [boardResults] = await db.promise().query(
            'SELECT id, name FROM boards WHERE short_name = ? LIMIT 1',
            [boardShortName]
        );
        
        if (!boardResults.length) {
            return res.status(404).render('404');
        }

        const board = boardResults[0];
        
        const [threadResults] = await db.promise().query(`
            SELECT t.*, p.message as op_message, p.created_at as op_created_at, p.subject as op_subject
            FROM threads t
            JOIN posts p ON t.id = p.thread_id AND p.is_op = TRUE
            WHERE t.id = ? AND t.board_id = ?
            LIMIT 1
        `, [threadId, board.id]);

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
            boardShortName: boardShortName,
            boardName: board.name
        });
    } catch (err) {
        next(err);
    }
});

// Создание треда
app.post('/:boardShortName/new', async (req, res, next) => {
    try {
        const { boardShortName } = req.params;
        const { subject, message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Сообщение обязательно' });
        }

        const [boardResults] = await db.promise().query(
            'SELECT id FROM boards WHERE short_name = ? LIMIT 1',
            [boardShortName]
        );
        
        if (!boardResults.length) {
            return res.status(404).json({ error: 'Доска не найдена' });
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

        res.redirect(`/${boardShortName}`);
    } catch (err) {
        next(err);
    }
});


// Добавление комментария
app.post('/:boardShortName/:threadId/reply', async (req, res, next) => {
    try {
        const { boardShortName, threadId } = req.params;
        const { message, name } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Сообщение обязательно' });
        }

        const [boardResults] = await db.promise().query(
            'SELECT id FROM boards WHERE short_name = ? LIMIT 1',
            [boardShortName]
        );
        
        if (!boardResults.length) {
            return res.status(404).json({ error: 'Доска не найдена' });
        }

        const boardId = boardResults[0].id;

        const [thread] = await db.promise().query(
            'SELECT id FROM threads WHERE id = ? AND board_id = ? LIMIT 1',
            [threadId, boardId]
        );
        
        if (!thread.length) {
            return res.status(404).json({ error: 'Тред не найден' });
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

        res.redirect(`/${boardShortName}/${threadId}`);
    } catch (err) {
        console.error('Ошибка при добавлении комментария:', err);
        next(err);
    }
});

// API для загрузки тредов
app.get('/api/threads', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 3;
        const offset = (page - 1) * limit;

        const [boardResults] = await db.promise().query(
            'SELECT id FROM boards WHERE short_name = "b" LIMIT 1'
        );
        
        if (!boardResults.length) {
            return res.status(404).json({ error: 'Доска не найдена' });
        }

        const boardId = boardResults[0].id;
        
        const [threads] = await db.promise().query(`
            SELECT t.*, p.message, p.created_at as post_created_at
            FROM threads t
            JOIN posts p ON t.id = p.thread_id AND p.is_op = TRUE
            WHERE t.board_id = ?
            ORDER BY t.is_pinned DESC, t.updated_at DESC
            LIMIT ? OFFSET ?
        `, [boardId, limit, offset]);

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

// API для загрузки тредов по доске
app.get('/api/boards/:shortName/threads', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 3;
        const offset = (page - 1) * limit;
        const { shortName } = req.params;

        const [boardResults] = await db.promise().query(
            'SELECT id, name FROM boards WHERE short_name = ? LIMIT 1',
            [shortName]
        );
        
        if (!boardResults.length) {
            return res.status(404).json({ error: 'Доска не найдена' });
        }

        const board = boardResults[0];
        
        const [threads] = await db.promise().query(`
            SELECT t.*, p.message, p.created_at as post_created_at
            FROM threads t
            JOIN posts p ON t.id = p.thread_id AND p.is_op = TRUE
            WHERE t.board_id = ?
            ORDER BY t.is_pinned DESC, t.updated_at DESC
            LIMIT ? OFFSET ?
        `, [board.id, limit, offset]);

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

        res.json({
            threads: threadsWithComments,
            boardName: board.name,
            boardShortName: shortName
        });
    } catch (err) {
        console.error('Ошибка при загрузке тредов:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Обработка ошибок
app.use((req, res, next) => {
    res.status(400).render('400', { error: 'Неверный запрос' });
});

app.use((req, res, next) => {
    res.status(404).render('404');
});

app.use((err, req, res, next) => {
    console.error('Ошибка:', err.stack);
    res.status(500).render('500');
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});