document.addEventListener('DOMContentLoaded', () => {
    const loadMoreBtn = document.querySelector('.more-button');
    
    if (loadMoreBtn) {
        const boardShortName = loadMoreBtn.dataset.board || 'b';
        let currentPage = 1;

        loadMoreBtn.addEventListener('click', async () => {
            currentPage++;
            loadMoreBtn.disabled = true;
            loadMoreBtn.textContent = 'Загрузка...';

            try {
                const response = await fetch(`/api/boards/${boardShortName}/threads?page=${currentPage}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data.threads.length === 0) {
                    loadMoreBtn.textContent = 'Треды закончились';
                    loadMoreBtn.disabled = true;
                    return;
                }

                const threadList = document.querySelector('.thread-list');
                
                data.threads.forEach(thread => {
                    const threadElement = createThreadElement(thread);
                    threadList.appendChild(threadElement);
                });

                loadMoreBtn.disabled = false;
                loadMoreBtn.textContent = 'Ещё';
                
                // Обновляем заголовок, если он изменился
                const header = document.querySelector('.section-header h2');
                if (header) {
                    header.textContent = `/${data.boardShortName}/ - ${data.boardName}`;
                }
            } catch (error) {
                console.error('Ошибка при загрузке тредов:', error);
                loadMoreBtn.textContent = 'Ошибка загрузки';
                setTimeout(() => {
                    loadMoreBtn.textContent = 'Ещё';
                    loadMoreBtn.disabled = false;
                }, 2000);
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