// 导航网站主要JavaScript功能
class NavigationApp {
    constructor() {
        this.websites = this.loadWebsites();
        this.settings = this.loadSettings();
        this.searchHistory = this.loadSearchHistory();
        this.init();
    }

    init() {
        this.initParticles();
        this.initEventListeners();
        this.renderCategories();
        this.renderQuickAccess();
        this.initAnimations();
        this.updateStats();
    }

    // 初始化粒子背景
    initParticles() {
        if (typeof p5 !== 'undefined') {
            new p5((p) => {
                let particles = [];
                
                p.setup = () => {
                    let canvas = p.createCanvas(p.windowWidth, p.windowHeight);
                    canvas.parent('particles-container');
                    canvas.style('position', 'fixed');
                    canvas.style('top', '0');
                    canvas.style('left', '0');
                    canvas.style('z-index', '-1');
                    
                    for (let i = 0; i < 100; i++) {
                        particles.push({
                            x: p.random(p.width),
                            y: p.random(p.height),
                            vx: p.random(-0.5, 0.5),
                            vy: p.random(-0.5, 0.5),
                            size: p.random(2, 4)
                        });
                    }
                };
                
                p.draw = () => {
                    p.clear();
                    
                    particles.forEach(particle => {
                        particle.x += particle.vx;
                        particle.y += particle.vy;
                        
                        if (particle.x < 0 || particle.x > p.width) particle.vx *= -1;
                        if (particle.y < 0 || particle.y > p.height) particle.vy *= -1;
                        
                        p.fill(66, 153, 225, 100);
                        p.noStroke();
                        p.circle(particle.x, particle.y, particle.size);
                    });
                };
                
                p.windowResized = () => {
                    p.resizeCanvas(p.windowWidth, p.windowHeight);
                };
            });
        }
    }

    // 初始化事件监听器
    initEventListeners() {
        // 搜索功能
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(e.target.value);
                }
            });
        }

        // 分类切换
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchCategory(e.target.dataset.category);
            });
        });

        // 网站卡片点击
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('website-card')) {
                this.visitWebsite(e.target.dataset.url, e.target.dataset.name);
            }
        });

        // 主题切换
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }

    // 处理搜索
    handleSearch(query) {
        if (query.length < 2) {
            this.hideSearchSuggestions();
            return;
        }

        const suggestions = this.getSearchSuggestions(query);
        this.showSearchSuggestions(suggestions);
    }

    // 执行搜索
    performSearch(query) {
        if (!query.trim()) return;
        
        this.addToSearchHistory(query);
        const searchEngine = this.settings.searchEngine || 'google';
        const searchUrls = {
            google: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
            baidu: `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`,
            bing: `https://www.bing.com/search?q=${encodeURIComponent(query)}`
        };
        
        window.open(searchUrls[searchEngine], '_blank');
    }

    // 获取搜索建议
    getSearchSuggestions(query) {
        const websites = Object.values(this.websites).flat();
        return websites
            .filter(site => 
                site.name.toLowerCase().includes(query.toLowerCase()) ||
                site.description.toLowerCase().includes(query.toLowerCase())
            )
            .slice(0, 5);
    }

    // 显示搜索建议
    showSearchSuggestions(suggestions) {
        const container = document.getElementById('search-suggestions');
        if (!container) return;

        container.innerHTML = suggestions.map(site => `
            <div class="suggestion-item p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                 onclick="window.navigationApp.visitWebsite('${site.url}', '${site.name}')">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-sm font-bold">
                        ${site.name.charAt(0)}
                    </div>
                    <div>
                        <div class="font-medium text-gray-900">${site.name}</div>
                        <div class="text-sm text-gray-500">${site.description}</div>
                    </div>
                </div>
            </div>
        `).join('');
        
        container.classList.remove('hidden');
    }

    // 隐藏搜索建议
    hideSearchSuggestions() {
        const container = document.getElementById('search-suggestions');
        if (container) {
            container.classList.add('hidden');
        }
    }

    // 渲染分类
    renderCategories() {
        const container = document.getElementById('categories-container');
        if (!container) return;

        const categories = Object.keys(this.websites);
        container.innerHTML = categories.map(category => `
            <div class="category-section mb-8">
                <h3 class="text-xl font-semibold text-gray-800 mb-4 capitalize">${category}</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    ${this.websites[category].map(site => this.createWebsiteCard(site)).join('')}
                </div>
            </div>
        `).join('');
    }

    // 创建网站卡片
    createWebsiteCard(site) {
        return `
            <div class="website-card bg-white rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 cursor-pointer p-4 text-center"
                 data-url="${site.url}" data-name="${site.name}" onclick="window.navigationApp.visitWebsite('${site.url}', '${site.name}')">
                <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <span class="text-white font-bold text-lg">${site.name.charAt(0)}</span>
                </div>
                <h4 class="font-medium text-gray-900 text-sm mb-1 truncate">${site.name}</h4>
                <p class="text-xs text-gray-500 truncate">${site.description}</p>
            </div>
        `;
    }

    // 渲染快速访问
    renderQuickAccess() {
        const container = document.getElementById('quick-access');
        if (!container) return;

        const quickAccess = this.getQuickAccessWebsites();
        container.innerHTML = quickAccess.map(site => `
            <div class="quick-access-item bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-opacity-100 transition-all duration-300 cursor-pointer"
                 onclick="window.navigationApp.visitWebsite('${site.url}', '${site.name}')">
                <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span class="text-white font-bold text-xl">${site.name.charAt(0)}</span>
                </div>
                <h4 class="font-medium text-gray-900">${site.name}</h4>
            </div>
        `).join('');
    }

    // 获取快速访问网站
    getQuickAccessWebsites() {
        const allSites = Object.values(this.websites).flat();
        return allSites.slice(0, 8);
    }

    // 访问网站
    visitWebsite(url, name) {
        this.addToVisitHistory(name, url);
        window.open(url, '_blank');
        
        // 更新点击统计
        this.updateClickStats(name);
        
        // 添加点击动画
        this.addClickAnimation(event.target);
    }

    // 添加点击动画
    addClickAnimation(element) {
        if (typeof anime !== 'undefined') {
            anime({
                targets: element,
                scale: [1, 0.95, 1],
                duration: 200,
                easing: 'easeInOutQuad'
            });
        }
    }

    // 初始化动画
    initAnimations() {
        if (typeof anime !== 'undefined') {
            // 页面加载动画
            anime({
                targets: '.animate-fade-in',
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 800,
                delay: anime.stagger(100),
                easing: 'easeOutQuad'
            });

            // 卡片悬停动画
            document.querySelectorAll('.website-card').forEach(card => {
                card.addEventListener('mouseenter', () => {
                    anime({
                        targets: card,
                        scale: 1.05,
                        duration: 200,
                        easing: 'easeOutQuad'
                    });
                });

                card.addEventListener('mouseleave', () => {
                    anime({
                        targets: card,
                        scale: 1,
                        duration: 200,
                        easing: 'easeOutQuad'
                    });
                });
            });
        }
    }

    // 切换主题
    toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.classList.contains('dark') ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        if (newTheme === 'dark') {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }
        
        this.settings.theme = newTheme;
        this.saveSettings();
    }

    // 更新统计信息
    updateStats() {
        const statsContainer = document.getElementById('user-stats');
        if (!statsContainer) return;

        const stats = this.calculateStats();
        
        // 使用ECharts渲染统计图表
        if (typeof echarts !== 'undefined') {
            const chart = echarts.init(statsContainer);
            const option = {
                title: {
                    text: '使用统计',
                    textStyle: { color: '#374151', fontSize: 16 }
                },
                tooltip: { trigger: 'item' },
                series: [{
                    type: 'pie',
                    radius: '70%',
                    data: stats.categoryData,
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }]
            };
            chart.setOption(option);
        }
    }

    // 计算统计数据
    calculateStats() {
        const categories = Object.keys(this.websites);
        const categoryData = categories.map(category => ({
            name: category,
            value: this.websites[category].length
        }));

        return { categoryData };
    }

    // 加载网站数据
    loadWebsites() {
        const defaultWebsites = {
            work: [
                { name: 'Gmail', url: 'https://gmail.com', description: '邮件服务' },
                { name: 'Google Drive', url: 'https://drive.google.com', description: '云存储' },
                { name: 'Slack', url: 'https://slack.com', description: '团队协作' },
                { name: 'Trello', url: 'https://trello.com', description: '项目管理' },
                { name: 'Notion', url: 'https://notion.so', description: '笔记协作' },
                { name: 'Zoom', url: 'https://zoom.us', description: '视频会议' }
            ],
            study: [
                { name: 'Coursera', url: 'https://coursera.org', description: '在线课程' },
                { name: 'Khan Academy', url: 'https://khanacademy.org', description: '免费教育' },
                { name: 'Duolingo', url: 'https://duolingo.com', description: '语言学习' },
                { name: 'GitHub', url: 'https://github.com', description: '代码托管' },
                { name: 'Stack Overflow', url: 'https://stackoverflow.com', description: '编程问答' },
                { name: 'Medium', url: 'https://medium.com', description: '文章阅读' }
            ],
            entertainment: [
                { name: 'YouTube', url: 'https://youtube.com', description: '视频平台' },
                { name: 'Netflix', url: 'https://netflix.com', description: '流媒体' },
                { name: 'Spotify', url: 'https://spotify.com', description: '音乐平台' },
                { name: 'Twitch', url: 'https://twitch.tv', description: '游戏直播' },
                { name: 'Reddit', url: 'https://reddit.com', description: '社区论坛' },
                { name: 'Discord', url: 'https://discord.com', description: '游戏聊天' }
            ],
            life: [
                { name: 'Amazon', url: 'https://amazon.com', description: '购物平台' },
                { name: 'Weather', url: 'https://weather.com', description: '天气预报' },
                { name: 'Maps', url: 'https://maps.google.com', description: '地图导航' },
                { name: 'Calendar', url: 'https://calendar.google.com', description: '日历管理' },
                { name: 'Photos', url: 'https://photos.google.com', description: '照片存储' },
                { name: 'Banking', url: 'https://bank.example.com', description: '网上银行' }
            ]
        };

        return JSON.parse(localStorage.getItem('navigation-websites')) || defaultWebsites;
    }

    // 加载设置
    loadSettings() {
        return JSON.parse(localStorage.getItem('navigation-settings')) || {
            theme: 'light',
            searchEngine: 'google'
        };
    }

    // 加载搜索历史
    loadSearchHistory() {
        return JSON.parse(localStorage.getItem('navigation-search-history')) || [];
    }

    // 保存设置
    saveSettings() {
        localStorage.setItem('navigation-settings', JSON.stringify(this.settings));
    }

    // 添加到搜索历史
    addToSearchHistory(query) {
        this.searchHistory.unshift({ query, timestamp: Date.now() });
        this.searchHistory = this.searchHistory.slice(0, 50);
        localStorage.setItem('navigation-search-history', JSON.stringify(this.searchHistory));
    }

    // 添加到访问历史
    addToVisitHistory(name, url) {
        const history = JSON.parse(localStorage.getItem('navigation-visit-history')) || [];
        history.unshift({ name, url, timestamp: Date.now() });
        localStorage.setItem('navigation-visit-history', JSON.stringify(history.slice(0, 100)));
    }

    // 更新点击统计
    updateClickStats(name) {
        const stats = JSON.parse(localStorage.getItem('navigation-click-stats')) || {};
        stats[name] = (stats[name] || 0) + 1;
        localStorage.setItem('navigation-click-stats', JSON.stringify(stats));
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.navigationApp = new NavigationApp();
});