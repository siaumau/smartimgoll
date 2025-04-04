// 導入 i18n 管理器
import { initI18n, applyTranslation, setLanguage, getCurrentLanguage, getTooltipVisibility, setTooltipVisibility, saveSettings } from './i18n/i18nManager.js';

// 主要元素
const fileInput = document.getElementById('file-input');
const uploadBtn = document.getElementById('upload-btn');
const rectangleBtn = document.getElementById('rectangle-btn');
const lassoBtn = document.getElementById('lasso-btn');
const colorPickerBtn = document.getElementById('color-picker-btn');
const eraseBtn = document.getElementById('erase-btn');
const resetBtn = document.getElementById('reset-btn');
const downloadBtn = document.getElementById('download-btn');
const undoBtn = document.getElementById('undo-btn');
const settingsBtn = document.getElementById('settings-btn');
const canvasContainer = document.getElementById('canvas-container');
const canvas = document.getElementById('main-canvas');
const ctx = canvas.getContext('2d');
const settingsModal = document.getElementById('settings-modal');
const closeBtn = document.querySelector('.close');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const languageOptions = document.querySelectorAll('.language-option');
const tooltipToggle = document.getElementById('tooltip-toggle');
const fillColorInput = document.getElementById('fill-color');
const fillColorPreview = document.getElementById('fill-color-preview');
const transparentBtn = document.getElementById('transparent-btn');
const toleranceContainer = document.getElementById('tolerance-container');
const toleranceSlider = document.getElementById('tolerance-slider');
const toleranceValue = document.getElementById('tolerance-value');

// 状态变量
let originalImage = null;
let imageHistory = [];
let isDrawing = false;
let currentTool = null;
let startX, startY;
let points = [];
let fillColor = 'transparent'; // 默认透明填充
let pickedColor = null;
let colorTolerance = 30; // 默认颜色容差

// 工具模式常量
const TOOLS = {
    RECTANGLE: 'rectangle',
    LASSO: 'lasso',
    COLOR_PICKER: 'color-picker'
};

// 事件监听
uploadBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);
rectangleBtn.addEventListener('click', () => setTool(TOOLS.RECTANGLE));
lassoBtn.addEventListener('click', () => setTool(TOOLS.LASSO));
colorPickerBtn.addEventListener('click', () => setTool(TOOLS.COLOR_PICKER));
eraseBtn.addEventListener('click', eraseSelection);
resetBtn.addEventListener('click', resetImage);
downloadBtn.addEventListener('click', downloadImage);
undoBtn.addEventListener('click', undoLastOperation);
settingsBtn.addEventListener('click', openSettingsModal);
closeBtn.addEventListener('click', closeSettingsModal);
saveSettingsBtn.addEventListener('click', saveUserSettings);
transparentBtn.addEventListener('click', setTransparentFill);
fillColorInput.addEventListener('input', updateFillColor);
toleranceSlider.addEventListener('input', updateToleranceValue);

// 画布事件监听
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseleave', stopDrawing);
canvas.addEventListener('click', handleCanvasClick);

// 触摸事件支持
canvas.addEventListener('touchstart', handleTouchStart);
canvas.addEventListener('touchmove', handleTouchMove);
canvas.addEventListener('touchend', handleTouchEnd);

// 语言选项事件
languageOptions.forEach(option => {
    option.addEventListener('click', () => {
        // 移除所有选项的活动状态
        languageOptions.forEach(opt => opt.classList.remove('active'));
        // 添加当前选项的活动状态
        option.classList.add('active');
        // 设置当前语言
        setLanguage(option.dataset.lang);
    });
});

// 更新填充颜色
function updateFillColor(e) {
    fillColor = e.target.value;
    fillColorPreview.style.backgroundColor = fillColor;
}

// 设置透明填充
function setTransparentFill() {
    fillColor = 'transparent';
    fillColorPreview.style.backgroundColor = 'transparent';
    fillColorInput.value = '#00000000'; // 重置颜色选择器
}

// 更新容差值
function updateToleranceValue(e) {
    colorTolerance = parseInt(e.target.value);
    toleranceValue.textContent = colorTolerance;
}

// 处理画布点击事件（用于拾色器）
function handleCanvasClick(e) {
    if (currentTool !== TOOLS.COLOR_PICKER || !originalImage) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    // 获取点击位置的颜色
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    pickedColor = {
        r: pixel[0],
        g: pixel[1],
        b: pixel[2],
        a: pixel[3]
    };

    // 显示选中的颜色
    const colorHex = `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3] / 255})`;
    fillColorPreview.style.backgroundColor = colorHex;

    // 保存当前状态用于撤销
    saveState();

    // 执行连续区域颜色移除（洪水填充算法）
    removeConnectedColor(x, y, pickedColor);
}

// 移除连续区域的颜色（洪水填充算法）
function removeConnectedColor(startX, startY, targetColor) {
    // 获取整个图像的数据
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;

    // 创建访问标记数组（避免重复处理像素）
    const visited = new Array(width * height).fill(false);

    // 定义栈用于存储待处理的像素坐标
    const stack = [{x: startX, y: startY}];

    // 判断颜色是否相似（基于容差）
    function isSimilarColor(index) {
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const a = data[index + 3];

        // 计算颜色差异
        const deltaR = Math.abs(r - targetColor.r);
        const deltaG = Math.abs(g - targetColor.g);
        const deltaB = Math.abs(b - targetColor.b);
        const deltaA = Math.abs(a - targetColor.a) / 255;

        // 计算颜色差异总和（简单的距离计算）
        const delta = (deltaR + deltaG + deltaB) / 3;

        return delta <= colorTolerance;
    }

    // 洪水填充算法（四向扩散）
    while (stack.length > 0) {
        const { x, y } = stack.pop();

        // 检查坐标是否有效
        if (x < 0 || x >= width || y < 0 || y >= height) {
            continue;
        }

        // 计算当前像素索引
        const currentIndex = (y * width + x) * 4;

        // 如果已访问或颜色不相似，跳过
        if (visited[y * width + x] || !isSimilarColor(currentIndex)) {
            continue;
        }

        // 标记为已访问
        visited[y * width + x] = true;

        // 设置像素为透明
        data[currentIndex + 3] = 0; // 设置Alpha通道为0

        // 将相邻的四个像素添加到栈中
        stack.push({x: x + 1, y: y}); // 右
        stack.push({x: x - 1, y: y}); // 左
        stack.push({x: x, y: y + 1}); // 下
        stack.push({x: x, y: y - 1}); // 上
    }

    // 将处理后的图像数据放回画布
    ctx.putImageData(imageData, 0, 0);

    // 更新原始图像
    originalImage.src = canvas.toDataURL();

    // 启用撤销按钮
    undoBtn.disabled = false;
}

// 从图像中移除特定颜色
function removeColorFromImage(color) {
    // 获取整个图像的数据
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // 遍历每个像素
    for (let i = 0; i < data.length; i += 4) {
        // 计算当前像素与选中颜色的差异
        const deltaR = Math.abs(data[i] - color.r);
        const deltaG = Math.abs(data[i+1] - color.g);
        const deltaB = Math.abs(data[i+2] - color.b);

        // 计算颜色差异总和（简单的距离计算）
        const delta = (deltaR + deltaG + deltaB) / 3;

        // 如果在容差范围内，将像素设为透明
        if (delta <= colorTolerance) {
            data[i+3] = 0; // 设置透明度为0（完全透明）
        }
    }

    // 将处理后的图像数据放回画布
    ctx.putImageData(imageData, 0, 0);

    // 更新原始图像
    originalImage.src = canvas.toDataURL();

    // 启用撤销按钮
    undoBtn.disabled = false;
}

// 应用工具提示可见性
function applyTooltipVisibility() {
    const tooltips = document.querySelectorAll('.tooltiptext');
    tooltips.forEach(tooltip => {
        tooltip.style.display = getTooltipVisibility() ? 'block' : 'none';
    });
}

// 打开设置模态框
function openSettingsModal() {
    settingsModal.style.display = 'flex';
}

// 关闭设置模态框
function closeSettingsModal() {
    settingsModal.style.display = 'none';
}

// 文件选择处理
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            // 设置画布大小与图片相同
            canvas.width = img.width;
            canvas.height = img.height;

            // 绘制图片并保存
            ctx.drawImage(img, 0, 0);
            originalImage = new Image();
            originalImage.src = canvas.toDataURL();

            // 清空历史记录并添加初始状态
            imageHistory = [];
            saveState();

            // 启用按钮
            resetBtn.disabled = false;
            downloadBtn.disabled = false;
            eraseBtn.disabled = true; // 先选择工具后才启用

            // 自动选择矩形工具作为默认
            setTool(TOOLS.RECTANGLE);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

// 设置当前工具
function setTool(tool) {
    currentTool = tool;

    // 更新按钮状态
    rectangleBtn.className = tool === TOOLS.RECTANGLE ? 'tooltip active' : 'tooltip';
    lassoBtn.className = tool === TOOLS.LASSO ? 'tooltip active' : 'tooltip';
    colorPickerBtn.className = tool === TOOLS.COLOR_PICKER ? 'tooltip active' : 'tooltip';

    // 显示/隐藏颜色容差控制
    toleranceContainer.style.display = tool === TOOLS.COLOR_PICKER ? 'flex' : 'none';

    // 如果有图片，根据选择的工具启用相应按钮
    if (originalImage) {
        eraseBtn.disabled = tool === TOOLS.COLOR_PICKER; // 拾色器模式下不需要清除按钮
    }
}

// 开始绘制
function startDrawing(e) {
    if (!currentTool || !originalImage || currentTool === TOOLS.COLOR_PICKER) return;

    isDrawing = true;

    // 获取鼠标相对于画布的准确坐标
    const rect = canvas.getBoundingClientRect();
    // 计算准确的缩放比例
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    // 应用缩放获取准确位置
    startX = (e.clientX - rect.left) * scaleX;
    startY = (e.clientY - rect.top) * scaleY;

    // 如果是套索工具，初始化点数组
    if (currentTool === TOOLS.LASSO) {
        points = [{x: startX, y: startY}];
    }

    // 绘制临时画布
    drawTempCanvas();
}

// 绘制过程
function draw(e) {
    if (!isDrawing || currentTool === TOOLS.COLOR_PICKER) return;

    // 获取当前鼠标准确坐标
    const rect = canvas.getBoundingClientRect();
    // 计算准确的缩放比例
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    // 应用缩放获取准确位置
    const currentX = (e.clientX - rect.left) * scaleX;
    const currentY = (e.clientY - rect.top) * scaleY;

    // 如果是套索工具，添加新点
    if (currentTool === TOOLS.LASSO) {
        // 只有当鼠标移动了足够距离才添加新点，避免过多点
        const lastPoint = points[points.length - 1];
        const dx = currentX - lastPoint.x;
        const dy = currentY - lastPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 只在移动足够距离时添加点（可根据需要调整阈值）
        if (distance > 3) {
            points.push({x: currentX, y: currentY});
        }
    }

    // 重绘临时画布
    drawTempCanvas(currentX, currentY);
}

// 停止绘制
function stopDrawing(e) {
    if (!isDrawing || currentTool === TOOLS.COLOR_PICKER) return;
    isDrawing = false;

    // 获取最后位置
    if (e) {
        const rect = canvas.getBoundingClientRect();
        // 计算准确的缩放比例
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        // 应用缩放获取准确位置
        const currentX = (e.clientX - rect.left) * scaleX;
        const currentY = (e.clientY - rect.top) * scaleY;

        // 记录最后位置
        if (currentTool === TOOLS.RECTANGLE) {
            points[0] = {x: currentX, y: currentY};
        }
    }

    // 如果是套索工具，自动闭合路径
    if (currentTool === TOOLS.LASSO && points.length > 2) {
        // 添加起点作为终点以闭合路径
        points.push({x: points[0].x, y: points[0].y});

        // 重绘以显示闭合的套索
        drawTempCanvas();
    }
}

// 绘制临时画布（用于显示选择区域）
function drawTempCanvas(currentX, currentY) {
    // 清除画布并重绘图像
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalImage, 0, 0);

    // 设置选择区域样式
    ctx.strokeStyle = 'rgba(0, 153, 255, 0.8)';
    ctx.lineWidth = 2;

    if (currentTool === TOOLS.RECTANGLE && currentX && currentY) {
        // 绘制矩形选框
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(startX, startY, currentX - startX, currentY - startY);
    } else if (currentTool === TOOLS.LASSO && points.length > 1) {
        // 绘制套索路径
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }

        // 如果还在绘制过程中且有当前位置，连接到当前位置
        if (isDrawing && currentX && currentY) {
            ctx.lineTo(currentX, currentY);
        }

        ctx.stroke();

        // 如果不在绘制过程中（已经松开鼠标），绘制闭合路径
        if (!isDrawing && points.length > 2) {
            ctx.closePath();
            ctx.stroke();
        }
    }

    ctx.setLineDash([]);
}

// 清除选区
function eraseSelection() {
    if (!originalImage || !currentTool || currentTool === TOOLS.COLOR_PICKER) return;

    // 保存当前状态用于撤销
    saveState();

    if (currentTool === TOOLS.RECTANGLE) {
        // 获取矩形选区的坐标和尺寸
        const width = Math.abs(points[0]?.x - startX) || 0;
        const height = Math.abs(points[0]?.y - startY) || 0;
        const x = Math.min(startX, points[0]?.x || startX);
        const y = Math.min(startY, points[0]?.y || startY);

        // 清除画布上的所有内容（包括虚线框）
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 重新绘制原始图像
        ctx.drawImage(originalImage, 0, 0);

        if (fillColor === 'transparent') {
            // 使用透明填充
            ctx.clearRect(x, y, width, height);
        } else {
            // 使用指定颜色填充
            ctx.fillStyle = fillColor;
            ctx.fillRect(x, y, width, height);
        }
    } else if (currentTool === TOOLS.LASSO && points.length > 2) {
        // 清除画布上的所有内容（包括虚线框）
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 重新绘制原始图像
        ctx.drawImage(originalImage, 0, 0);

        // 创建套索路径
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }

        ctx.closePath();

        if (fillColor === 'transparent') {
            // 使用透明填充
            ctx.save();
            ctx.clip();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
        } else {
            // 使用指定颜色填充
            ctx.fillStyle = fillColor;
            ctx.fill();
        }
    }

    // 更新原始图像
    originalImage.src = canvas.toDataURL();

    // 重置选择
    points = [];
    startX = startY = 0;

    // 启用撤销按钮
    undoBtn.disabled = false;
}

// 恢复原图
function resetImage() {
    if (!originalImage) return;

    // 保存当前状态用于撤销
    saveState();

    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 加载原始图像
    const img = new Image();
    img.onload = function() {
        ctx.drawImage(img, 0, 0);
        originalImage.src = img.src;
    };
    img.src = imageHistory[0]; // 使用历史记录中的第一个状态（原始图像）
}

// 下载图片
function downloadImage() {
    if (!originalImage) return;

    // 创建下载链接
    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// 保存当前状态
function saveState() {
    imageHistory.push(canvas.toDataURL());
    undoBtn.disabled = imageHistory.length <= 1;
}

// 撤销最后一步操作
function undoLastOperation() {
    if (imageHistory.length <= 1) return;

    // 删除最新状态
    imageHistory.pop();

    // 恢复前一个状态
    const previousState = imageHistory[imageHistory.length - 1];
    const img = new Image();
    img.onload = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        originalImage.src = canvas.toDataURL();
    };
    img.src = previousState;

    // 如果只剩一个状态，禁用撤销按钮
    undoBtn.disabled = imageHistory.length <= 1;
}

// 触摸事件处理函数
function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

function handleTouchEnd(e) {
    e.preventDefault();
    const mouseEvent = new MouseEvent('mouseup');
    canvas.dispatchEvent(mouseEvent);

    // 如果是拾色器，触发点击事件
    if (currentTool === TOOLS.COLOR_PICKER && e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        const clickEvent = new MouseEvent('click', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(clickEvent);
    }
    // 如果是套索工具，确保路径闭合
    else if (currentTool === TOOLS.LASSO && points.length > 2) {
        // 确保路径闭合
        points.push({x: points[0].x, y: points[0].y});
        // 重绘
        drawTempCanvas();
    }
}

// 保存设置
function saveUserSettings() {
    // 保存语言设置
    const selectedLanguage = document.querySelector('.language-option.active').dataset.lang;
    setLanguage(selectedLanguage);

    // 保存工具提示设置
    const showTooltips = tooltipToggle.value === 'show';
    setTooltipVisibility(showTooltips);

    // 保存到本地存储
    saveSettings();

    // 关闭设置模态框
    closeSettingsModal();
}

// 初始设置
window.addEventListener('DOMContentLoaded', () => {
    // 初始化 i18n
    initI18n();

    // 应用翻译
    applyTranslation();

    // 设置矩形工具为默认
    setTool(TOOLS.RECTANGLE);

    // 应用工具提示可见性
    applyTooltipVisibility();

    // 设置默认填充颜色为透明
    setTransparentFill();
});
