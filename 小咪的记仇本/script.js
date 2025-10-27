// 获取DOM元素
const recordInput = document.getElementById('record-input');
const addBtn = document.getElementById('add-btn');
const viewBtn = document.getElementById('view-btn');
const imageInput = document.getElementById('image-input');
const imagePreview = document.getElementById('image-preview');
const recentList = document.getElementById('recent-list');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const importInput = document.getElementById('import-input');
const themeSelect = document.getElementById('theme-select');

// 存储图片数据的数组
let selectedImages = [];

// 从本地存储加载记录
function loadRecords() {
    const records = localStorage.getItem('revengeRecords');
    return records ? JSON.parse(records) : [];
}

// 保存记录到本地存储
function saveRecords(records) {
    localStorage.setItem('revengeRecords', JSON.stringify(records));
}

// 格式化时间
function formatTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 获取日期字符串（用于日历功能）
function getDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

// 添加新记录
function addRecord() {
    const text = recordInput.value.trim();
    if (!text && selectedImages.length === 0) {
        alert('请输入记录内容或添加图片！');
        return;
    }
    
    // 创建新记录对象
    const now = new Date();
    const newRecord = {
        id: Date.now(),
        text: text,
        time: formatTime(now),
        date: getDateString(now),
        images: [...selectedImages]
    };
    
    // 获取现有记录并添加新记录
    const records = loadRecords();
    records.unshift(newRecord); // 添加到开头
    saveRecords(records);
    
    // 重新渲染最近记录
    renderRecentRecords();
    
    // 清空输入框和图片预览
    recordInput.value = '';
    clearImagePreview();
    
    alert('记录成功！');
}

// 清空图片预览
function clearImagePreview() {
    selectedImages = [];
    imagePreview.innerHTML = '';
}

// 渲染最近记录
function renderRecentRecords() {
    const records = loadRecords();
    const recentRecords = records.slice(0, 5); // 只显示最近5条
    
    if (recentRecords.length === 0) {
        recentList.innerHTML = '<div class="empty-state">还没有记录，快来添加第一条吧！</div>';
        return;
    }
    
    recentList.innerHTML = '';
    
    recentRecords.forEach(record => {
        const item = document.createElement('div');
        item.className = 'recent-item';
        
        let html = '';
        if (record.text) {
            html += `<div class="recent-text">${record.text}</div>`;
        }
        
        if (record.images && record.images.length > 0) {
            html += '<div class="recent-images">';
            record.images.forEach(img => {
                html += `<img src="${img}" alt="记录图片" class="recent-img">`;
            });
            html += '</div>';
        }
        
        html += `<div class="recent-time">${record.time}</div>`;
        
        item.innerHTML = html;
        recentList.appendChild(item);
    });
}

// 处理图片上传预览
function handleImageUpload(e) {
    const files = e.target.files;
    if (!files.length) return;
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // 检查是否为图片文件
        if (!file.type.match('image.*')) {
            alert('请上传图片文件！');
            continue;
        }
        
        const reader = new FileReader();
        reader.onload = function(event) {
            const imgUrl = event.target.result;
            selectedImages.push(imgUrl);
            
            // 创建预览元素
            const preview = document.createElement('div');
            preview.className = 'preview-image';
            preview.innerHTML = `
                <img src="${imgUrl}" alt="预览图片" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;">
                <span class="remove-image" data-index="${selectedImages.length - 1}">×</span>
            `;
            
            imagePreview.appendChild(preview);
            
            // 添加删除按钮事件
            const removeBtn = preview.querySelector('.remove-image');
            removeBtn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                selectedImages.splice(index, 1);
                preview.remove();
                
                // 更新其他图片的索引
                document.querySelectorAll('.remove-image').forEach((btn, i) => {
                    btn.setAttribute('data-index', i);
                });
            });
        };
        reader.readAsDataURL(file);
    }
    
    // 清空文件输入，允许重复选择同一个文件
    e.target.value = '';
}

// 跳转到查看页面
function goToViewPage() {
    window.location.href = 'view.html';
}

// 导出记录为CSV
function exportToCSV() {
    const records = loadRecords();
    if (records.length === 0) {
        alert('没有记录可导出！');
        return;
    }
    
    // CSV表头
    let csvContent = '"ID","时间","日期","内容","图片数量"\n';
    
    // 添加记录数据
    records.forEach(record => {
        const id = record.id || '';
        const time = record.time || '';
        const date = record.date || '';
        const text = (record.text || '').replace(/"/g, '""'); // 转义引号
        const imageCount = record.images ? record.images.length : 0;
        
        csvContent += `"${id}","${time}","${date}","${text}","${imageCount}"\n`;
    });
    
    // 创建Blob并下载
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `记仇本_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('导出成功！');
}

// 导入CSV文件
function importFromCSV(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const csvContent = e.target.result;
            const lines = csvContent.split('\n');
            const newRecords = [];
            
            // 跳过表头，从第二行开始读取
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                
                // 简单的CSV解析（不处理包含逗号的复杂情况）
                const match = lines[i].match(/"([^"]*)","([^"]*)","([^"]*)","([^"]*)","([^"]*)"/);
                if (match) {
                    const [, id, time, date, text, imageCount] = match;
                    
                    // 创建新记录（注意：图片数据无法通过CSV恢复）
                    newRecords.push({
                        id: Date.now() + i, // 使用新的ID避免冲突
                        text: text,
                        time: time,
                        date: date,
                        images: []
                    });
                }
            }
            
            if (newRecords.length === 0) {
                alert('没有从CSV文件中导入任何记录！');
                return;
            }
            
            // 合并现有记录
            const existingRecords = loadRecords();
            const mergedRecords = [...newRecords, ...existingRecords];
            saveRecords(mergedRecords);
            
            // 重新渲染
            renderRecentRecords();
            alert(`成功导入 ${newRecords.length} 条记录！`);
        } catch (error) {
            alert('导入失败：' + error.message);
        }
    };
    
    reader.readAsText(file, 'UTF-8');
}

// 应用主题
function applyTheme(theme) {
    // 移除所有主题类
    document.body.classList.remove('pink', 'yellow', 'green', 'blue');
    
    // 添加选中的主题类
    if (theme && theme !== 'pink') {
        document.body.classList.add(theme);
    }
    
    // 保存主题偏好
    localStorage.setItem('revengeBookTheme', theme || 'pink');
}

// 初始化页面
function init() {
    renderRecentRecords();
    
    // 恢复保存的主题
    const savedTheme = localStorage.getItem('revengeBookTheme') || 'pink';
    themeSelect.value = savedTheme;
    applyTheme(savedTheme);
    
    // 添加事件监听
    addBtn.addEventListener('click', addRecord);
    viewBtn.addEventListener('click', goToViewPage);
    imageInput.addEventListener('change', handleImageUpload);
    exportBtn.addEventListener('click', exportToCSV);
    importBtn.addEventListener('click', () => importInput.click());
    importInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            importFromCSV(e.target.files[0]);
            e.target.value = ''; // 清空文件输入
        }
    });
    themeSelect.addEventListener('change', (e) => applyTheme(e.target.value));
    
    // 回车添加记录
    recordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            addRecord();
        }
    });
    
}

// 注意：作者水印功能已移至index.html中的内联脚本

// 页面加载完成后初始化
init();