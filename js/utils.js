function generateTOC(tocData) {
    const container = document.getElementById('toc-container');

    // 读取折叠状态
    const savedState = localStorage.getItem('revelationCollapsed') === 'true';

    // 构建目录 HTML
    container.innerHTML = tocData.map(item => {
        if (item.text === '启示录') {
            return `
                <div class="toc-item revelation-header" data-id="${item.id}">
                    <span class="arrow">${savedState ? '✦▶' : '✦▼'}</span>
                    ${item.text}
                </div>
                <div class="revelation-children" style="display:${savedState ? 'none' : 'block'};">
            `;
        }

        if (item.isRevelationChild) {
            return `
                <div class="toc-item revelation-child" data-id="${item.id}">
                    ${item.text}
                </div>
            `;
        }

        return `
            <div class="toc-item" data-id="${item.id}">
                ${item.text}
            </div>
        `;
    }).join('') + '</div>';

    // 点击跳转
    document.querySelectorAll('.toc-item').forEach(item => {
        item.addEventListener('click', () => {
            const target = document.getElementById(item.dataset.id);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    });

    // 启示录折叠逻辑
    const header = document.querySelector('.revelation-header');
    const children = document.querySelector('.revelation-children');
    const arrow = header.querySelector('.arrow');

    header.addEventListener('click', () => {
        const collapsed = children.style.display === 'none';
        children.style.display = collapsed ? 'block' : 'none';
        arrow.textContent = collapsed ? '✦▼' : '✦▶';

        // 保存状态
        localStorage.setItem('revelationCollapsed', !collapsed);
    });

    // scroll spy（自动高亮）
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            const id = entry.target.id;
            const tocItem = document.querySelector(`.toc-item[data-id="${id}"]`);
            if (entry.isIntersecting && tocItem) {
                document.querySelectorAll('.toc-item').forEach(i => i.classList.remove('active'));
                tocItem.classList.add('active');
            }
        });
    }, { threshold: 0.3 });

    tocData.forEach(item => {
        const el = document.getElementById(item.id);
        if (el) observer.observe(el);
    });
}



function setupSearch() {
    const searchBox = document.getElementById('search-box');

    searchBox.addEventListener('input', (e) => {
        const keyword = e.target.value.toLowerCase();
        let found = false;

        document.querySelectorAll('.content').forEach(content => {
            const text = content.textContent.toLowerCase();
            const isMatch = keyword ? text.includes(keyword) : false;

            content.style.backgroundColor = isMatch ? '#fff3e0' : 'transparent';

            if (!found && isMatch) {
                found = true;
                content.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const prev = content.previousElementSibling;
                if (prev && prev.id) {
                    highlightTOC(prev.id);
                }
            }
        });
    });

    function highlightTOC(targetId) {
        document.querySelectorAll('.toc-item').forEach(item => {
            item.style.background = item.dataset.id === targetId
                ? 'rgba(93, 64, 55, 0.1)'
                : 'none';
        });
    }
}

function initTheme() {
    // 直接不创建模式切换按钮
    // 不再读取 localStorage 的 theme
    // 不再添加 night-mode 类

    // 返回顶部按钮
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

