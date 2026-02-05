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
if (savedState) {
    children.classList.add('collapsed');
    children.style.height = '0px';
} else {
    children.style.height = 'auto';
}


    const arrow = header.querySelector('.arrow');

header.addEventListener('click', () => {
    header.classList.add('pulse');
    setTimeout(() => header.classList.remove('pulse'), 400);

    const isCollapsed = children.classList.contains('collapsed');

    if (isCollapsed) {
        // 展开
        children.classList.remove('collapsed');
        const fullHeight = children.scrollHeight + 'px';
        children.style.height = fullHeight;
        setTimeout(() => {
            children.style.height = 'auto';
        }, 350);
    } else {
        // 收起
        const fullHeight = children.scrollHeight + 'px';
        children.style.height = fullHeight;
        requestAnimationFrame(() => {
            children.style.height = '0px';
        });
        setTimeout(() => {
            children.classList.add('collapsed');
        }, 350);
    }

    arrow.textContent = isCollapsed ? '✦▼' : '✦▶';
    localStorage.setItem('revelationCollapsed', !isCollapsed);
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
    const countBox = document.getElementById('search-count');
    const btnPrev = document.getElementById('search-prev');
    const btnNext = document.getElementById('search-next');

    let results = [];
    let index = -1;

    searchBox.addEventListener('input', () => {
        const keyword = searchBox.value.trim().toLowerCase();
        clearSearch();
        results = [];
        index = -1;

        if (!keyword) {
            countBox.textContent = '';
            return;
        }

        const targets = [
            ...document.querySelectorAll('.date'),
            ...document.querySelectorAll('.content p')
        ];

        targets.forEach(el => {
            const text = el.textContent.toLowerCase();
            if (text.includes(keyword)) {
                const html = el.innerHTML;
                const safe = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const reg = new RegExp(safe, 'gi');
                el.innerHTML = html.replace(reg, m => `<mark>${m}</mark>`);

                results.push(el);

                const parentDate = el.closest('.content')?.previousElementSibling;
                if (parentDate && parentDate.id) {
                    highlightTOC(parentDate.id);
                }
            }
        });

        if (results.length > 0) {
            index = 0;
            scrollToResult();
        }

        countBox.textContent = `找到 ${results.length} 个结果`;
    });

    btnPrev.addEventListener('click', () => {
        if (results.length === 0) return;
        index = (index - 1 + results.length) % results.length;
        scrollToResult();
    });

    btnNext.addEventListener('click', () => {
        if (results.length === 0) return;
        index = (index + 1) % results.length;
        scrollToResult();
    });

    function scrollToResult() {
        const el = results[index];
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });

        results.forEach(r => r.classList.remove('search-focus'));
        el.classList.add('search-focus');
    }

    function clearSearch() {
        document.querySelectorAll('mark').forEach(m => {
            const parent = m.parentNode;
            parent.replaceChild(document.createTextNode(m.textContent), m);
            parent.normalize();
        });

        document.querySelectorAll('.search-focus').forEach(el => {
            el.classList.remove('search-focus');
        });

        document.querySelectorAll('.toc-item').forEach(item => {
            item.style.background = 'none';
        });
    }

    function highlightTOC(targetId) {
        document.querySelectorAll('.toc-item').forEach(item => {
            item.style.background =
                item.dataset.id === targetId
                    ? 'rgba(255, 230, 180, 0.15)'
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
// ===== 浮动柔光标题栏 =====
function initFloatingHeader() {
    const header = document.getElementById('floating-header');

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                header.textContent = entry.target.textContent.trim();
                header.style.opacity = 1;
                header.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.chapter-title').forEach(title => {
        observer.observe(title);
    });
}

