// ===== СОСТОЯНИЕ ПРИЛОЖЕНИЯ =====
const AppState = {
    currentOrder: null,
    selectedPhotos: new Map() // sku-photoIndex -> number
};

// ===== БАЗА ДАННЫХ ЗАКАЗОВ (ДЕМО) =====
const ordersDB = {
    '333': {
        number: '333',
        items: [
            {
                sku: 'ACR-001',
                title: 'Акриловая фотография',
                image: 'https://via.placeholder.com/200/88ddde/ffffff?text=ACRYLIC',
                note: 'Выберите групповое фото',
                photos: [
                    { type: 'group', label: 'Групповое фото', pose: '1 поза', disabled: false }
                ]
            },
            {
                sku: 'FRM-002',
                title: 'Рамка деревянная',
                image: 'https://via.placeholder.com/200/88ddde/ffffff?text=FRAME',
                note: 'Выберите фото для рамки',
                photos: [
                    { type: 'photo1', label: 'Фото 1', pose: '3 позы' },
                    { type: 'photo2', label: 'Фото 2', pose: '3 позы' },
                    { type: 'photo3', label: 'Фото 3', pose: '3 позы' }
                ]
            },
            {
                sku: 'PKG-003',
                title: 'Пакет с фотографиями',
                image: 'https://via.placeholder.com/200/88ddde/ffffff?text=PACKAGE',
                note: 'Разберите фотографии по размерам',
                photos: [
                    { type: 'group', label: 'Фото класса 6x9', pose: '1 поза', disabled: true, note: 'групповое фото не выбирается' },
                    { type: 'individual', label: 'Индивидуальное 4x6', pose: '1 поза', disabled: false },
                    { type: 'small', label: 'Маленькие 4x6', pose: '4 позы', count: 4 }
                ]
            }
        ]
    },
    '444': {
        number: '444',
        items: [
            {
                sku: 'PKG-003',
                title: 'Пакет с фотографиями',
                image: 'https://via.placeholder.com/200/88ddde/ffffff?text=PACKAGE',
                note: 'Разберите фотографии по размерам',
                photos: [
                    { type: 'group', label: 'Фото класса 6x9', pose: '1 поза', disabled: true, note: 'групповое фото не выбирается' },
                    { type: 'individual', label: 'Индивидуальное 4x6', pose: '1 поза', disabled: false },
                    { type: 'small', label: 'Маленькие 4x6', pose: '4 позы', count: 4 }
                ]
            }
        ]
    },
    '555': {
        number: '555',
        items: [
            {
                sku: 'FRM-002',
                title: 'Рамка деревянная',
                image: 'https://via.placeholder.com/200/88ddde/ffffff?text=FRAME',
                note: 'Выберите фото для рамки',
                photos: [
                    { type: 'photo1', label: 'Фото 1', pose: '3 позы' },
                    { type: 'photo2', label: 'Фото 2', pose: '3 позы' },
                    { type: 'photo3', label: 'Фото 3', pose: '3 позы' }
                ]
            }
        ]
    }
};

// ===== УТИЛИТЫ =====
function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

function showLoading(container) {
    container.innerHTML = '<div class="loading">Загрузка...</div>';
}

// ===== ОСНОВНЫЕ ФУНКЦИИ =====
function showLoginScreen() {
    const template = document.getElementById('loginTemplate');
    const content = template.content.cloneNode(true);
    
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = '';
    mainContent.appendChild(content);
    
    document.getElementById('submitContainer').style.display = 'none';
    
    // Обработчики
    document.getElementById('loginBtn').addEventListener('click', () => {
        const code = document.getElementById('orderCode').value.trim();
        if (code) {
            loadOrder(code);
        } else {
            showToast('Введите номер заказа');
        }
    });
    
    document.getElementById('orderCode').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('loginBtn').click();
        }
    });
    
    // Демо-кнопки
    document.querySelectorAll('.demo-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            loadOrder(btn.dataset.order);
        });
    });
}

function loadOrder(orderNumber) {
    const order = ordersDB[orderNumber];
    
    if (!order) {
        showToast('Заказ не найден');
        return;
    }
    
    AppState.currentOrder = order;
    AppState.selectedPhotos.clear();
    renderGallery(order);
    showToast(`Заказ #${orderNumber} загружен`);
}

function renderGallery(order) {
    const template = document.getElementById('galleryTemplate');
    const content = template.content.cloneNode(true);
    
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = '';
    mainContent.appendChild(content);
    
    document.getElementById('orderNumber').textContent = order.number;
    
    const productsList = document.getElementById('productsList');
    
    order.items.forEach(item => {
        const productElement = renderProduct(item);
        productsList.appendChild(productElement);
    });
    
    document.getElementById('submitContainer').style.display = 'block';
    
    // Обработчик подтверждения
    document.getElementById('submitBtn').onclick = submitSelection;
}

function renderProduct(item) {
    const template = document.getElementById('productTemplate');
    const productElement = template.content.cloneNode(true);
    
    // Заполняем данные
    productElement.getElementById('productImg').src = item.image;
    productElement.getElementById('productImg').alt = item.title;
    productElement.getElementById('productSku').textContent = item.sku;
    productElement.getElementById('productTitle').textContent = item.title;
    
    if (item.note) {
        productElement.getElementById('productNote').textContent = item.note;
    } else {
        productElement.getElementById('productNote').style.display = 'none';
    }
    
    const photoBlocks = productElement.getElementById('photoBlocks');
    
    // Создаем блоки для фото
    item.photos.forEach((photo, blockIndex) => {
        const block = document.createElement('div');
        block.className = 'photo-block';
        
        const header = document.createElement('div');
        header.className = 'block-header';
        header.innerHTML = `
            <span class="block-title">${photo.label}</span>
            <span class="block-pose">${photo.pose}</span>
        `;
        block.appendChild(header);
        
        const inputs = document.createElement('div');
        inputs.className = 'photo-inputs';
        
        // Определяем количество полей
        const count = photo.count || 1;
        
        for (let i = 0; i < count; i++) {
            const photoItem = document.createElement('div');
            photoItem.className = 'photo-item';
            
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = '№';
            
            if (photo.disabled) {
                input.disabled = true;
            }
            
            // Уникальный ключ для хранения
            const photoKey = `${item.sku}-${blockIndex}-${i}`;
            input.dataset.key = photoKey;
            
            // Восстанавливаем сохраненное значение
            if (AppState.selectedPhotos.has(photoKey)) {
                input.value = AppState.selectedPhotos.get(photoKey);
            }
            
            // Сохраняем при вводе
            input.addEventListener('input', (e) => {
                if (e.target.value.trim()) {
                    AppState.selectedPhotos.set(photoKey, e.target.value.trim());
                } else {
                    AppState.selectedPhotos.delete(photoKey);
                }
            });
            
            photoItem.appendChild(input);
            
            const label = document.createElement('label');
            label.textContent = i + 1;
            photoItem.appendChild(label);
            
            inputs.appendChild(photoItem);
        }
        
        block.appendChild(inputs);
        
        if (photo.note) {
            const note = document.createElement('div');
            note.className = 'disabled-note';
            note.textContent = photo.note;
            block.appendChild(note);
        }
        
        photoBlocks.appendChild(block);
    });
    
    return productElement;
}

function submitSelection() {
    const selected = [];
    
    AppState.selectedPhotos.forEach((value, key) => {
        const [sku, blockIndex, photoIndex] = key.split('-');
        selected.push({
            sku,
            photoNumber: value,
            position: `Блок ${parseInt(blockIndex) + 1}, Фото ${parseInt(photoIndex) + 1}`
        });
    });
    
    if (selected.length === 0) {
        showToast('Выберите хотя бы одну фотографию');
        return;
    }
    
    // Формируем результат для отправки
    const result = {
        orderNumber: AppState.currentOrder.number,
        selectedPhotos: selected,
        timestamp: new Date().toISOString()
    };
    
    console.log('Результат выбора:', result);
    
    // Здесь будет отправка на сервер
    // Например: fetch('/api/save-selection', { method: 'POST', body: JSON.stringify(result) })
    
    // Показываем результат
    const summary = selected.map(s => `${s.sku}: №${s.photoNumber}`).join('\n');
    alert(`Спасибо! Выбраны фото:\n${summary}`);
    
    // Поздравляем и возвращаемся на вход
    showToast('Спасибо! Фотографии сохранены');
    setTimeout(() => {
        showLoginScreen();
    }, 2000);
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => {
    showLoginScreen();
    
    // Обработка Enter в поле ввода
    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.target.tagName !== 'INPUT') {
            const loginBtn = document.getElementById('loginBtn');
            if (loginBtn) loginBtn.click();
        }
    });
});
