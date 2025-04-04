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
        let currentLanguage = 'zh-TW';
        let showTooltips = true;
        let fillColor = 'transparent'; // 默认透明填充
        let pickedColor = null;
        let colorTolerance = 30; // 默认颜色容差

        // 工具模式常量
        const TOOLS = {
            RECTANGLE: 'rectangle',
            LASSO: 'lasso',
            COLOR_PICKER: 'color-picker'
        };

        // 语言数据
        const translations = {
            'zh-TW': {
                'app-title': '圖片文字移除工具',
                'file-tools-title': '檔案操作',
                'upload-btn-text': '上傳圖片',
                'upload-tooltip': '選擇要處理的圖片',
                'selection-tools-title': '選擇工具',
                'rectangle-btn-text': '矩形選擇',
                'rectangle-tooltip': '用矩形框選要刪除的區域',
                'lasso-btn-text': '套索工具',
                'lasso-tooltip': '自由繪製不規則選區',
                'color-picker-btn-text': '拾色器',
                'color-picker-tooltip': '點選並移除特定顏色',
                'edit-tools-title': '編輯操作',
                'erase-btn-text': '清除選區',
                'erase-tooltip': '移除選中區域的內容',
'undo-tooltip': '返回上一步操作',
                'output-tools-title': '輸出選項',
                'reset-btn-text': '恢復原圖',
                'reset-tooltip': '恢復到原始圖片',
                'download-btn-text': '下載圖片',
                'download-tooltip': '保存處理後的圖片',
                'fill-color-label': '填充顏色',
                'transparent-btn-text': '透明',
                'transparent-tooltip': '使用透明填充',
                'tolerance-label': '顏色容差',
                'instructions-title': '使用說明：',
                'instruction-1': '點擊"上傳圖片"按鈕選擇需要處理的PNG圖片',
                'instruction-2': '選擇"矩形選擇"工具框選文字區域，或使用"套索工具"自由繪製選區',
                'instruction-3': '選擇填充顏色（默認透明）或使用拾色器選擇要移除的顏色',
                'instruction-4': '點擊"清除選區"將選中區域內的文字清除（選區線條會自動消失）',
                'instruction-5': '使用"撤銷操作"可以返回上一步',
                'instruction-6': '如需完全恢復原始圖片，請點擊"恢復原圖"',
                'instruction-7': '處理完成後，點擊"下載圖片"保存結果',
                'settings-title': '設置',
                'language-settings-title': '語言設置',
                'interface-settings-title': '界面設置',
                'tooltip-label': '顯示按鈕提示',
                'tooltip-show': '顯示',
                'tooltip-hide': '隱藏',
                'save-settings-btn': '保存設置'
            },
            'zh-CN': {
                'app-title': '图片文字移除工具',
                'file-tools-title': '文件操作',
                'upload-btn-text': '上传图片',
                'upload-tooltip': '选择要处理的图片',
                'selection-tools-title': '选择工具',
                'rectangle-btn-text': '矩形选择',
                'rectangle-tooltip': '用矩形框选要删除的区域',
                'lasso-btn-text': '套索工具',
                'lasso-tooltip': '自由绘制不规则选区',
                'color-picker-btn-text': '拾色器',
                'color-picker-tooltip': '点选并移除特定颜色',
                'edit-tools-title': '编辑操作',
                'erase-btn-text': '清除选区',
                'erase-tooltip': '移除选中区域的内容',
                'undo-btn-text': '撤销操作',
                'undo-tooltip': '返回上一步操作',
                'output-tools-title': '输出选项',
                'reset-btn-text': '恢复原图',
                'reset-tooltip': '恢复到原始图片',
                'download-btn-text': '下载图片',
                'download-tooltip': '保存处理后的图片',
                'fill-color-label': '填充颜色',
                'transparent-btn-text': '透明',
                'transparent-tooltip': '使用透明填充',
                'tolerance-label': '颜色容差',
                'instructions-title': '使用说明：',
                'instruction-1': '点击"上传图片"按钮选择需要处理的PNG图片',
                'instruction-2': '选择"矩形选择"工具框选文字区域，或使用"套索工具"自由绘制选区',
                'instruction-3': '选择填充颜色（默认透明）或使用拾色器选择要移除的颜色',
                'instruction-4': '点击"清除选区"将选中区域内的文字清除（选区线条会自动消失）',
                'instruction-5': '使用"撤销操作"可以返回上一步',
                'instruction-6': '如需完全恢复原始图片，请点击"恢复原图"',
                'instruction-7': '处理完成后，点击"下载图片"保存结果',
                'settings-title': '设置',
                'language-settings-title': '语言设置',
                'interface-settings-title': '界面设置',
                'tooltip-label': '显示按钮提示',
                'tooltip-show': '显示',
                'tooltip-hide': '隐藏',
                'save-settings-btn': '保存设置'
            },
            'en': {
                'app-title': 'Image Text Removal Tool',
                'file-tools-title': 'File Operations',
                'upload-btn-text': 'Upload Image',
                'upload-tooltip': 'Select an image to process',
                'selection-tools-title': 'Selection Tools',
                'rectangle-btn-text': 'Rectangle Select',
                'rectangle-tooltip': 'Select area with rectangle',
                'lasso-btn-text': 'Lasso Tool',
                'lasso-tooltip': 'Draw irregular selection',
                'color-picker-btn-text': 'Color Picker',
                'color-picker-tooltip': 'Click to remove specific color',
                'edit-tools-title': 'Edit Operations',
                'erase-btn-text': 'Erase Selection',
                'erase-tooltip': 'Remove content in selected area',
                'undo-btn-text': 'Undo',
                'undo-tooltip': 'Return to previous step',
                'output-tools-title': 'Output Options',
                'reset-btn-text': 'Reset Image',
                'reset-tooltip': 'Restore original image',
                'download-btn-text': 'Download Image',
                'download-tooltip': 'Save processed image',
                'fill-color-label': 'Fill Color',
                'transparent-btn-text': 'Transparent',
                'transparent-tooltip': 'Use transparent fill',
                'tolerance-label': 'Color Tolerance',
                'instructions-title': 'Instructions:',
                'instruction-1': 'Click "Upload Image" to select a PNG image',
                'instruction-2': 'Use "Rectangle Select" or "Lasso Tool" to select text areas',
                'instruction-3': 'Choose fill color (default: transparent) or use color picker to select colors to remove',
                'instruction-4': 'Click "Erase Selection" to remove text (selection lines will disappear)',
                'instruction-5': 'Use "Undo" to return to previous step',
                'instruction-6': 'Click "Reset Image" to restore the original image',
                'instruction-7': 'Click "Download Image" to save the result',
                'settings-title': 'Settings',
                'language-settings-title': 'Language Settings',
                'interface-settings-title': 'Interface Settings',
                'tooltip-label': 'Show Button Tips',
                'tooltip-show': 'Show',
                'tooltip-hide': 'Hide',
                'save-settings-btn': 'Save Settings'
            },
            'ja': {
                'app-title': '画像テキスト削除ツール',
                'file-tools-title': 'ファイル操作',
                'upload-btn-text': '画像をアップロード',
                'upload-tooltip': '処理する画像を選択',
                'selection-tools-title': '選択ツール',
                'rectangle-btn-text': '矩形選択',
                'rectangle-tooltip': '矩形で削除する領域を選択',
                'lasso-btn-text': '自由選択ツール',
                'lasso-tooltip': '不規則な選択範囲を描画',
                'color-picker-btn-text': 'カラーピッカー',
                'color-picker-tooltip': 'クリックして特定の色を削除',
                'edit-tools-title': '編集操作',
                'erase-btn-text': '選択範囲を消去',
                'erase-tooltip': '選択した領域の内容を削除',
                'undo-btn-text': '元に戻す',
                'undo-tooltip': '前のステップに戻る',
                'output-tools-title': '出力オプション',
                'reset-btn-text': '画像をリセット',
                'reset-tooltip': '元の画像に戻す',
                'download-btn-text': '画像をダウンロード',
                'download-tooltip': '処理した画像を保存',
                'fill-color-label': '塗りつぶし色',
                'transparent-btn-text': '透明',
                'transparent-tooltip': '透明な塗りつぶしを使用',
                'tolerance-label': '色の許容範囲',
                'instructions-title': '使用方法：',
                'instruction-1': '「画像をアップロード」をクリックしてPNG画像を選択',
                'instruction-2': '「矩形選択」または「自由選択ツール」を使用してテキスト領域を選択',
                'instruction-3': '塗りつぶし色を選択（デフォルト：透明）またはカラーピッカーを使用して削除する色を選択',
                'instruction-4': '「選択範囲を消去」をクリックして選択した領域のテキストを削除（選択線は自動的に消えます）',
                'instruction-5': '「元に戻す」を使用して前のステップに戻る',
                'instruction-6': '元の画像に戻すには「画像をリセット」をクリック',
                'instruction-7': '「画像をダウンロード」をクリックして結果を保存',
                'settings-title': '設定',
                'language-settings-title': '言語設定',
                'interface-settings-title': 'インターフェース設定',
                'tooltip-label': 'ボタンヒントを表示',
                'tooltip-show': '表示',
                'tooltip-hide': '非表示',
                'save-settings-btn': '設定を保存'
            },
            'ko': {
                'app-title': '이미지 텍스트 제거 도구',
                'file-tools-title': '파일 작업',
                'upload-btn-text': '이미지 업로드',
                'upload-tooltip': '처리할 이미지 선택',
                'selection-tools-title': '선택 도구',
                'rectangle-btn-text': '사각형 선택',
                'rectangle-tooltip': '사각형으로 영역 선택',
                'lasso-btn-text': '올가미 도구',
                'lasso-tooltip': '불규칙한 선택 영역 그리기',
                'color-picker-btn-text': '색상 추출기',
                'color-picker-tooltip': '클릭하여 특정 색상 제거',
                'edit-tools-title': '편집 작업',
                'erase-btn-text': '선택 영역 지우기',
                'erase-tooltip': '선택한 영역의 내용 제거',
                'undo-btn-text': '실행 취소',
                'undo-tooltip': '이전 단계로 돌아가기',
                'output-tools-title': '출력 옵션',
                'reset-btn-text': '이미지 초기화',
                'reset-tooltip': '원본 이미지 복원',
                'download-btn-text': '이미지 다운로드',
                'download-tooltip': '처리된 이미지 저장',
                'fill-color-label': '채우기 색상',
                'transparent-btn-text': '투명',
                'transparent-tooltip': '투명 채우기 사용',
                'tolerance-label': '색상 허용 오차',
                'instructions-title': '사용 방법:',
                'instruction-1': '"이미지 업로드"를 클릭하여 PNG 이미지 선택',
                'instruction-2': '"사각형 선택" 도구나 "올가미 도구"를 사용하여 텍스트 영역 선택',
                'instruction-3': '채우기 색상 선택(기본값: 투명) 또는 색상 추출기를 사용하여 제거할 색상 선택',
                'instruction-4': '"선택 영역 지우기"를 클릭하여 선택 영역 내 텍스트 제거 (선택 선은 자동으로 사라짐)',
                'instruction-5': '"실행 취소"를 사용하여 이전 단계로 돌아가기',
                'instruction-6': '원본 이미지로 복원하려면 "이미지 초기화" 클릭',
                'instruction-7': '처리 완료 후 "이미지 다운로드"를 클릭하여 결과 저장',
                'settings-title': '설정',
                'language-settings-title': '언어 설정',
                'interface-settings-title': '인터페이스 설정',
                'tooltip-label': '버튼 도움말 표시',
                'tooltip-show': '표시',
                'tooltip-hide': '숨김',
                'save-settings-btn': '설정 저장'
            }
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
        saveSettingsBtn.addEventListener('click', saveSettings);
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
                currentLanguage = option.dataset.lang;
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

        // 应用存储的语言设置
        function loadSettings() {
            // 尝试从本地存储加载设置
            const savedLanguage = localStorage.getItem('textRemoverLanguage');
            const savedTooltips = localStorage.getItem('textRemoverTooltips');

            if (savedLanguage) {
                currentLanguage = savedLanguage;
                // 更新语言选项UI
                languageOptions.forEach(opt => {
                    if (opt.dataset.lang === savedLanguage) {
                        opt.classList.add('active');
                    } else {
                        opt.classList.remove('active');
                    }
                });

                // 应用翻译
                applyTranslation();
            }

            if (savedTooltips) {
                showTooltips = savedTooltips === 'show';
                tooltipToggle.value = savedTooltips;

                // 应用工具提示可见性
                applyTooltipVisibility();
            }
        }

        // 保存设置
        function saveSettings() {
            localStorage.setItem('textRemoverLanguage', currentLanguage);
            localStorage.setItem('textRemoverTooltips', tooltipToggle.value);

            // 应用翻译
            applyTranslation();

            // 应用工具提示可见性
            showTooltips = tooltipToggle.value === 'show';
            applyTooltipVisibility();

            // 关闭设置模态框
            closeSettingsModal();
        }

        // 应用工具提示可见性
        function applyTooltipVisibility() {
            const tooltips = document.querySelectorAll('.tooltiptext');
            tooltips.forEach(tooltip => {
                tooltip.style.display = showTooltips ? 'block' : 'none';
            });
        }

        // 应用翻译
        function applyTranslation() {
            const langData = translations[currentLanguage];
            if (!langData) return;

            // 遍历所有需要翻译的元素
            for (const [id, text] of Object.entries(langData)) {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = text;
                }
            }
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
// 清除选区
      debugSelection();

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

      function debugSelection() {
    // 显示当前选择框（仅用于调试）
    console.log("调试信息：");
    console.log("工具类型:", currentTool);
    console.log("起始点:", startX, startY);

    if (currentTool === TOOLS.RECTANGLE && points[0]) {
        console.log("矩形终点:", points[0].x, points[0].y);

        const width = Math.abs(points[0].x - startX);
        const height = Math.abs(points[0].y - startY);
        const x = Math.min(startX, points[0].x);
        const y = Math.min(startY, points[0].y);

        console.log("矩形区域:", x, y, width, height);
    } else if (currentTool === TOOLS.LASSO) {
        console.log("套索点数:", points.length);
        console.log("套索点:", points);
    }
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

        // 初始设置
        window.addEventListener('DOMContentLoaded', () => {
            // 加载存储的设置
            loadSettings();

            // 应用翻译
            applyTranslation();

            // 设置矩形工具为默认
            setTool(TOOLS.RECTANGLE);

            // 应用工具提示可见性
            applyTooltipVisibility();

            // 设置默认填充颜色为透明
            setTransparentFill();
        });
