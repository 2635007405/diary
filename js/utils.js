function generateTOC(tocData) {
    // ===== 星光波纹效果 =====
function createRipple(e, item) {
    const ripple = document.createElement('div');
    ripple.className = 'toc-ripple';

    const rect = item.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';

    item.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
}

    const container = document.getElementById('toc-container');

    // 读取折叠状态
    const savedState = localStorage.getItem('revelationCollapsed') === 'true';

    let html = "";
    let revelationOpen = false;

    tocData.forEach(item => {
        // 启示录标题
        if (item.text === '启示录') {
            html += `
                <div class="toc-item revelation-header" data-id="${item.id}">
                    <span class="arrow">${savedState ? '✦▶' : '✦▼'}</span>
                    ${item.text}
                </div>
                <div class="revelation-children" style="display:${savedState ? 'none' : 'block'};">
            `;
            revelationOpen = true;
            return;
        }

        // 启示录子目录
        if (item.isRevelationChild) {
            html += `
                <div class="toc-item revelation-child" data-id="${item.id}">
                    ${item.text}
                </div>
            `;
            return;
        }

        // 普通目录项
        if (revelationOpen) {
            html += `</div>`; // 关闭 revelation-children
            revelationOpen = false;
        }

        html += `
            <div class="toc-item" data-id="${item.id}">
                ${item.text}
            </div>
        `;
    });

    // 如果启示录是最后一项，补上关闭标签
    if (revelationOpen) {
        html += `</div>`;
    }

    container.innerHTML = html;

    // 点击跳转
    document.querySelectorAll('.toc-item').forEach(item => {
        item.addEventListener('click', (e) => {
    createRipple(e, item);

    const target = document.getElementById(item.dataset.id);
    if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
});
});

    // 启示录折叠逻辑
    const header = document.querySelector('.revelation-header');
    const children = document.querySelector('.revelation-children');
    if (!savedState) {
    children.style.height = children.scrollHeight + 'px';
} else {
    children.style.height = '0px';
}

    const arrow = header.querySelector('.arrow');

    header.addEventListener('click', () => {
        header.classList.add('pulse');
setTimeout(() => header.classList.remove('pulse'), 400);
        const collapsed = children.style.display === 'none';
        if (collapsed) {
    children.style.display = 'block';
    const fullHeight = children.scrollHeight + 'px';
    children.style.height = '0px';
    requestAnimationFrame(() => {
        children.style.height = fullHeight;
    });
} else {
    children.style.height = children.scrollHeight + 'px';
    requestAnimationFrame(() => {
        children.style.height = '0px';
    });
    setTimeout(() => {
        children.style.display = 'none';
    }, 350);
}

        arrow.textContent = collapsed ? '✦▼' : '✦▶';
        localStorage.setItem('revelationCollapsed', !collapsed);
    });

    // scroll spy
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
    setupSwipe();
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
// ===== 移动端手势：右滑打开目录 / 左滑关闭目录 =====
function setupSwipe() {
    const sidebar = document.getElementById('sidebar');
    const threshold = 60; // 触发滑动的最小距离
    let startX = 0;
    let currentX = 0;

    document.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    });

    document.addEventListener('touchmove', (e) => {
        currentX = e.touches[0].clientX;
    });

    document.addEventListener('touchend', () => {
        const delta = currentX - startX;

        // 右滑：打开目录
        if (delta > threshold) {
            sidebar.classList.add('sidebar-open');
        }

        // 左滑：关闭目录
        if (delta < -threshold) {
            sidebar.classList.remove('sidebar-open');
        }
    });
}

