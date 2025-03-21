// js/utils.js
function generateTOC(tocData) {
    const container = document.getElementById('toc-container');
    container.innerHTML = tocData.map(item => `
        <div class="toc-item" data-id="${item.id}">${item.text}</div>
    `).join('');

    document.querySelectorAll('.toc-item').forEach(item => {
        item.addEventListener('click', () => {
            const target = document.getElementById(item.dataset.id);
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    });
}

function setupSearch() {
    const searchBox = document.getElementById('search-box');
    let firstMatch = null;

    searchBox.addEventListener('input', (e) => {
        const keyword = e.target.value.toLowerCase();
        let found = false;

        document.querySelectorAll('.content').forEach(content => {
            const text = content.textContent.toLowerCase();
            const isMatch = text.includes(keyword);
            
            // 高亮逻辑
            content.style.backgroundColor = isMatch ? '#fff3e0' : 'transparent';
            
            // 自动定位第一个匹配项
            if (!found && isMatch) {
                firstMatch = content;
                found = true;
                content.scrollIntoView({ behavior: 'smooth', block: 'center' });
                highlightTOC(content.previousElementSibling?.id);
            }
        });

        // 无匹配时复位
        if (!found && firstMatch) {
            firstMatch = null;
            document.querySelectorAll('.toc-item').forEach(item => {
                item.style.background = 'none';
            });
        }
    });

    // 目录高亮函数
    function highlightTOC(targetId) {
        document.querySelectorAll('.toc-item').forEach(item => {
            item.style.background = item.dataset.id === targetId ? 'rgba(93, 64, 55, 0.1)' : 'none';
        });
    }
}

function initTheme() {
    const themeToggle = document.createElement('button');
    themeToggle.id = 'theme-toggle';
    themeToggle.textContent = '🌙 夜间模式';
    document.body.prepend(themeToggle);

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('night-mode');
        themeToggle.textContent = document.body.classList.contains('night-mode') 
            ? '☀️ 日间模式' 
            : '🌙 夜间模式';
        localStorage.setItem('theme', 
            document.body.classList.contains('night-mode') ? 'night' : 'day');
    });

    if (localStorage.getItem('theme') === 'night') {
        document.body.classList.add('night-mode');
        themeToggle.textContent = '☀️ 日间模式';
    }

    const backButton = document.createElement('button');
    backButton.id = 'back-to-top';
    backButton.textContent = '↑ 返回顶部';
    document.body.appendChild(backButton);

    window.addEventListener('scroll', () => {
        backButton.style.opacity = window.scrollY > 500 ? '1' : '0';
    });

    backButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}