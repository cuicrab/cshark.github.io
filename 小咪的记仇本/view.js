// 获取DOM元素
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const currentMonthEl = document.getElementById('current-month');
const calendarDaysEl = document.getElementById('calendar-days');
const recordsListEl = document.getElementById('records-list');
const recordsTitleEl = document.getElementById('records-title');
const dateFilterEl = document.getElementById('date-filter');
const clearFilterBtn = document.getElementById('clear-filter');
const noRecordsEl = document.getElementById('no-records');
const backBtn = document.getElementById('back-btn');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const importInput = document.getElementById('import-input');
const themeSelect = document.getElementById('theme-select');

// 当前显示的月份和年份
let currentDate = new Date();
let selectedDate = null;

// 从本地存储加载记录
function loadRecords() {
    const records = localStorage.getItem('revengeRecords');
    return records ? JSON.parse(records) : [];
}

// 获取指定日期的记录
function getRecordsByDate(dateStr) {
    const records = loadRecords();
    return records.filter(record => record.date === dateStr);
}

// 获取有记录的日期集合
function getDatesWithRecords() {
    const records = loadRecords();
    const dates = new Set();
    records.forEach(record => dates.add(record.date));
    return dates;
}

// 格式化日期字符串
function formatDateString(year, month, day) {
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${monthStr}-${dayStr}`;
}

// 渲染日历
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // 设置当前月份标题
    currentMonthEl.textContent = `${year}年${month + 1}月`;
    
    // 获取当月第一天和最后一天
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const lastDayIndex = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay(); // 0-6, 0是周日
    
    // 获取上个月的最后几天
    const prevLastDay = new Date(year, month, 0);
    const prevLastDayIndex = prevLastDay.getDate();
    
    // 获取下个月的开始几天
    const nextDays = 7 - lastDay.getDay() - 1;
    
    // 获取有记录的日期
    const datesWithRecords = getDatesWithRecords();
    
    // 清空日历
    calendarDaysEl.innerHTML = '';
    
    // 渲染上个月的日期
    for (let i = firstDayOfWeek; i > 0; i--) {
        const day = prevLastDayIndex - i + 1;
        const dateStr = formatDateString(year, month - 1, day);
        const hasRecords = datesWithRecords.has(dateStr);
        
        const dayEl = document.createElement('div');
        dayEl.className = `calendar-day other-month ${hasRecords ? 'has-records' : ''}`;
        dayEl.textContent = day;
        dayEl.dataset.date = dateStr;
        
        if (hasRecords) {
            const dotEl = document.createElement('div');
            dotEl.className = 'event-dot';
            dayEl.appendChild(dotEl);
        }
        
        dayEl.addEventListener('click', () => selectDate(dateStr));
        calendarDaysEl.appendChild(dayEl);
    }
    
    // 渲染当前月的日期
    for (let i = 1; i <= lastDayIndex; i++) {
        const dateStr = formatDateString(year, month, i);
        const hasRecords = datesWithRecords.has(dateStr);
        const isCurrentDay = i === new Date().getDate() && 
                           month === new Date().getMonth() && 
                           year === new Date().getFullYear();
        const isSelected = selectedDate === dateStr;
        
        const dayEl = document.createElement('div');
        dayEl.className = `calendar-day ${hasRecords ? 'has-records' : ''} ${isCurrentDay ? 'current-day' : ''} ${isSelected ? 'selected' : ''}`;
        dayEl.textContent = i;
        dayEl.dataset.date = dateStr;
        
        if (hasRecords) {
            const dotEl = document.createElement('div');
            dotEl.className = 'event-dot';
            dayEl.appendChild(dotEl);
        }
        
        dayEl.addEventListener('click', () => selectDate(dateStr));
        calendarDaysEl.appendChild(dayEl);
    }
    
    // 渲染下个月的日期
    for (let i = 1; i <= nextDays; i++) {
        const dateStr = formatDateString(year, month + 1, i);
        const hasRecords = datesWithRecords.has(dateStr);
        
        const dayEl = document.createElement('div');
        dayEl.className = `calendar-day other-month ${hasRecords ? 'has-records' : ''}`;
        dayEl.textContent = i;
        dayEl.dataset.date = dateStr;
        
        if (hasRecords) {
            const dotEl = document.createElement('div');
            dotEl.className = 'event-dot';
            dayEl.appendChild(dotEl);
        }
        
        dayEl.addEventListener('click', () => selectDate(dateStr));
        calendarDaysEl.appendChild(dayEl);
    }
}

// 选择日期
function selectDate(dateStr) {
    selectedDate = dateStr;
    renderCalendar(); // 重新渲染日历以更新选中状态
    renderRecords();  // 渲染选中日期的记录
    
    // 更新筛选信息
    dateFilterEl.textContent = dateStr;
    dateFilterEl.style.display = 'inline-block';
    clearFilterBtn.style.display = 'inline-block';
    recordsTitleEl.textContent = `${dateStr} 的记录`;
}

// 清除筛选
function clearFilter() {
    selectedDate = null;
    renderCalendar();
    renderRecords();
    
    dateFilterEl.style.display = 'none';
    clearFilterBtn.style.display = 'none';
    recordsTitleEl.textContent = '所有记录';
}

// 渲染记录列表
function renderRecords() {
    const records = selectedDate ? getRecordsByDate(selectedDate) : loadRecords();
    
    recordsListEl.innerHTML = '';
    
    if (records.length === 0) {
        noRecordsEl.style.display = 'flex';
        return;
    }
    
    noRecordsEl.style.display = 'none';
    
    records.forEach(record => {
        const recordEl = document.createElement('div');
        recordEl.className = 'record-item';
        
        let html = `<div class="record-time">${record.time}</div>`;
        
        if (record.text) {
            html += `<div class="record-content">${record.text}</div>`;
        }
        
        if (record.images && record.images.length > 0) {
            html += '<div class="record-images">';
            record.images.forEach(img => {
                html += `<img src="${img}" alt="记录图片" class="record-img">`;
            });
            html += '</div>';
        }
        
        // 添加编辑和删除按钮
        html += `
        <div class="record-actions">
            <button class="edit-btn" data-id="${record.id}">
                ✏️ 编辑
            </button>
            <button class="delete-btn" data-id="${record.id}">
                🗑️ 删除
            </button>
        </div>
        `;
        
        recordEl.innerHTML = html;
        recordsListEl.appendChild(recordEl);
        
        // 添加事件监听器
        recordEl.querySelector('.edit-btn').addEventListener('click', () => editRecord(record));
        recordEl.querySelector('.delete-btn').addEventListener('click', () => deleteRecord(record.id));
    });
}

// 删除记录
function deleteRecord(recordId) {
    // 使用可爱的提示框代替普通confirm
    if (confirm('🐱 确定要删除这条记仇记录吗？😿')) {
        const records = loadRecords();
        const updatedRecords = records.filter(record => record.id !== recordId);
        localStorage.setItem('revengeRecords', JSON.stringify(updatedRecords));
        
        // 重新渲染日历和记录列表
        renderCalendar();
        renderRecords();
        
        // 显示删除成功提示
        alert('🗑️ 记录已删除！');
    }
}

// 编辑记录
function editRecord(record) {
    // 创建编辑模态框
    const modal = document.createElement('div');
    modal.className = 'edit-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease;
    `;
    
    // 编辑表单
    const form = document.createElement('div');
    form.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 15px;
        width: 90%;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 10px 30px var(--shadow-color);
        border: 3px solid var(--primary-color);
        animation: slideIn 0.3s ease;
    `;
    
    // 填充表单内容
    form.innerHTML = `
        <h3 style="color: var(--primary-color); margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
            ✏️ 编辑记仇记录
        </h3>
        <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #2d3436;">记录内容：</label>
            <textarea id="edit-text" style="width: 100%; padding: 12px; border: 2px solid var(--border-color); border-radius: 8px; min-height: 120px; font-size: 16px; resize: vertical;">${record.text || ''}</textarea>
        </div>
        <div style="display: flex; gap: 15px; justify-content: flex-end;">
            <button id="cancel-edit" style="padding: 10px 20px; background: #dfe6e9; border: none; border-radius: 20px; cursor: pointer; font-weight: 500;">取消</button>
            <button id="save-edit" style="padding: 10px 20px; background: var(--primary-color); color: white; border: none; border-radius: 20px; cursor: pointer; font-weight: 500;">保存修改</button>
        </div>
    `;
    
    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { transform: translateY(-50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    `;
    document.head.appendChild(style);
    
    modal.appendChild(form);
    document.body.appendChild(modal);
    
    // 事件监听器
    document.getElementById('cancel-edit').addEventListener('click', () => {
        document.body.removeChild(modal);
        document.head.removeChild(style);
    });
    
    document.getElementById('save-edit').addEventListener('click', () => {
        const newText = document.getElementById('edit-text').value.trim();
        
        if (!newText) {
            alert('🐱 记仇内容不能为空哦！');
            return;
        }
        
        // 更新记录
        const records = loadRecords();
        const updatedRecords = records.map(r => {
            if (r.id === record.id) {
                return { ...r, text: newText };
            }
            return r;
        });
        
        localStorage.setItem('revengeRecords', JSON.stringify(updatedRecords));
        
        // 清理并重新渲染
        document.body.removeChild(modal);
        document.head.removeChild(style);
        renderRecords();
        
        // 显示保存成功提示
        alert('✅ 记录已更新！');
    });
    
    // 点击背景关闭模态框
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
            document.head.removeChild(style);
        }
    });
}

// 切换到上个月
function goToPrevMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
}

// 切换到下个月
function goToNextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
}

// 返回添加记录页面
function goBack() {
    window.location.href = 'index.html';
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
        
        csvContent += '"' + id + '","' + time + '","' + date + '","' + text + '","' + imageCount + '"\n';
    });
    
    // 创建Blob并下载
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', '记仇本_' + new Date().toISOString().slice(0, 10) + '.csv');
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
            localStorage.setItem('revengeRecords', JSON.stringify(mergedRecords));
            
            // 重新渲染日历和记录
            renderCalendar();
            renderRecords();
            
            alert('成功导入 ' + newRecords.length + ' 条记录！');
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
    if (theme && theme !== 'pink') { // 粉色是默认主题，不需要添加类
        document.body.classList.add(theme);
    }
    
    // 保存主题偏好
    localStorage.setItem('revengeBookTheme', theme || 'pink');
}

// 初始化页面
function init() {
    renderCalendar();
    renderRecords();
    
    // 恢复保存的主题
    const savedTheme = localStorage.getItem('revengeBookTheme') || 'pink';
    if (themeSelect) {
        themeSelect.value = savedTheme;
        applyTheme(savedTheme);
    }
    
    // 添加事件监听
    prevMonthBtn.addEventListener('click', goToPrevMonth);
    nextMonthBtn.addEventListener('click', goToNextMonth);
    clearFilterBtn.addEventListener('click', clearFilter);
    backBtn.addEventListener('click', goBack);
    
    // 添加导入导出和主题切换事件监听
    if (exportBtn) exportBtn.addEventListener('click', exportToCSV);
    if (importBtn) importBtn.addEventListener('click', () => importInput && importInput.click());
    if (importInput) importInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            importFromCSV(e.target.files[0]);
            e.target.value = ''; // 清空文件输入
        }
    });
    if (themeSelect) themeSelect.addEventListener('change', (e) => applyTheme(e.target.value));
    
    // 默认不显示筛选信息
    dateFilterEl.style.display = 'none';
}

// 页面加载完成后初始化
init();