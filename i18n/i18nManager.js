// 導入翻譯資料
import translations from './translations.js';

// 當前語言
let currentLanguage = 'zh-TW';
// 是否顯示工具提示
let showTooltips = true;

// 初始化 i18n 管理器
function initI18n() {
    // 嘗試從本地存儲加載設置
    const savedLanguage = localStorage.getItem('textRemoverLanguage');
    const savedTooltips = localStorage.getItem('textRemoverTooltips');

    if (savedLanguage) {
        currentLanguage = savedLanguage;
    }

    if (savedTooltips) {
        showTooltips = savedTooltips === 'show';
    }

    // 應用翻譯
    applyTranslation();
}

// 應用翻譯
function applyTranslation() {
    const langData = translations[currentLanguage];
    if (!langData) return;

    // 遍歷所有需要翻譯的元素
    for (const [id, text] of Object.entries(langData)) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text;
        }
    }
}

// 應用工具提示可見性
function applyTooltipVisibility() {
    const tooltips = document.querySelectorAll('.tooltiptext');
    tooltips.forEach(tooltip => {
        tooltip.style.display = showTooltips ? 'block' : 'none';
    });
}

// 設置當前語言
function setLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
        applyTranslation();
        return true;
    }
    return false;
}

// 設置工具提示可見性
function setTooltipVisibility(show) {
    showTooltips = show;
    applyTooltipVisibility();
}

// 保存設置
function saveSettings() {
    localStorage.setItem('textRemoverLanguage', currentLanguage);
    localStorage.setItem('textRemoverTooltips', showTooltips ? 'show' : 'hide');
}

// 獲取當前語言
function getCurrentLanguage() {
    return currentLanguage;
}

// 獲取工具提示可見性
function getTooltipVisibility() {
    return showTooltips;
}

// 獲取所有支援的語言
function getSupportedLanguages() {
    return Object.keys(translations);
}

// 導出 i18n 管理器
export {
    initI18n,
    applyTranslation,
    applyTooltipVisibility,
    setLanguage,
    setTooltipVisibility,
    saveSettings,
    getCurrentLanguage,
    getTooltipVisibility,
    getSupportedLanguages
};
