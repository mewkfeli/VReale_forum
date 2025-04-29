document.addEventListener('DOMContentLoaded', () => {
    const loadMoreBtn = document.querySelector('.more-button');
    let currentPage = 1;
    const boardShortName = '<%= boardShortName %>';

    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', async () => {
            currentPage++;
            loadMoreBtn.disabled = true;
            loadMoreBtn.innerHTML = '<span class="spinner"></span> Загрузка...';

            try {
                const response = await fetch(`/api/threads?page=${currentPage}`);
                
                // Проверка статуса ответа
                if (!response.ok) {
                    throw new Error('Сетевая ошибка: ' + response.status);
                }

                const threads = await response.json();

                if (!Array.isArray(threads) || threads.length === 0) {
                    loadMoreBtn.textContent = 'Треды закончились';
                    loadMoreBtn.disabled = true;
                    return;
                }

                const threadList = document.querySelector('.thread-list');

                threads.forEach(thread => {
                    const threadElement = createThreadElement(thread);
                    threadList.appendChild(threadElement);
                });

                loadMoreBtn.disabled = false;
                loadMoreBtn.textContent = 'Ещё';
            } catch (error) {
                console.error('Ошибка при загрузке тредов:', error);
                loadMoreBtn.textContent = 'Ошибка загрузки';
                loadMoreBtn.disabled = false; // Разблокируем кнопку в случае ошибки
            }
        });
    }

    function createThreadElement(thread) {
        const threadDiv = document.createElement('div');
        threadDiv.className = 'thread';

        // Форматируем дату
        const postDate = new Date(thread.post_created_at).toLocaleDateString('ru-RU');

        // Создаем HTML для треда
        threadDiv.innerHTML = `
            <div class="thread-header">
                <span class="thread-date">${postDate}</span>
            </div>
            <div class="thread-content">
                ${thread.subject ? `<h3>${thread.subject}</h3>` : ''}
                <p>${thread.message}</p>
            </div>

            ${thread.comments && thread.comments.length > 0 ? `
                <div class="thread-comments">
                    ${thread.comments.map(comment => `
                        <div class="comment">
                            <div class="comment-header">
                                <span class="comment-id">>>#${comment.id}</span>
                                <span class="comment-date">
                                    ${new Date(comment.created_at).toLocaleDateString('ru-RU')}
                                </span>
                            </div>
                            <div class="comment-content">
                                <p>${comment.message}</p>
                            </div>
                        </div>
                    `).join('')}

                    ${thread.replyCount > 3 ? `
                        <div class="view-thread">
                            <a href="/b/${thread.id}" class="view-thread-button">
                                Перейти в тред (${thread.replyCount} ответов)
                            </a>
                        </div>
                    ` : ''}
                </div>
            ` : ''}

            <div class="thread-footer">
                <span class="thread-replies">Ответов: ${thread.replyCount}</span>
                <a href="/b/${thread.id}" class="thread-reply">Ответить</a>
            </div>
        `;

        return threadDiv;
    }
});