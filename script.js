const inputValue = document.getElementById('input-value');
const inputUnit = document.getElementById('input-unit');
const convertBtn = document.getElementById('convert-btn');
const results = document.getElementById('results');

const units = ['dbm', 'w', 'mw', 'uw'];
const unitLabels = {
    'dbm': 'dBm',
    'w': 'Вт',
    'mw': 'мВт',
    'uw': 'мкВт'
};

function convertPower(value, fromUnit, toUnit) {
    // Конвертация в ватты
    let watts;
    switch (fromUnit) {
        case 'dbm':
            watts = math.pow(10, (value - 30) / 10);
            break;
        case 'w':
            watts = value;
            break;
        case 'mw':
            watts = value / 1000;
            break;
        case 'uw':
            watts = value / 1000000;
            break;
    }

    // Конвертация из ватт в нужную единицу
    switch (toUnit) {
        case 'dbm':
            return 10 * math.log10(watts * 1000);
        case 'w':
            return watts;
        case 'mw':
            return watts * 1000;
        case 'uw':
            return watts * 1000000;
    }
}

function formatResult(value) {
    return value.toLocaleString('uk-UA', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 6 
    });
}

function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const current = start + progress * (end - start);
        element.textContent = formatResult(current);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function saveLastInput() {
    localStorage.setItem('lastValue', inputValue.value);
    localStorage.setItem('lastUnit', inputUnit.value);
}

function loadLastInput() {
    const lastValue = localStorage.getItem('lastValue');
    const lastUnit = localStorage.getItem('lastUnit');
    if (lastValue) inputValue.value = lastValue;
    if (lastUnit) inputUnit.value = lastUnit;
}

// Добавьте эту функцию
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Скопійовано в буфер обміну!');
    }, (err) => {
        console.error('Помилка копіювання: ', err);
    });
}

// Вызовите эту функцию при загрузке страницы
loadLastInput();

// Добавьте в конец файла
const themeToggle = document.createElement('button');
themeToggle.classList.add('theme-toggle');
themeToggle.innerHTML = '🌙';
document.body.appendChild(themeToggle);

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    themeToggle.innerHTML = document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
});

convertBtn.addEventListener('click', () => {
    const value = parseFloat(inputValue.value);
    const fromUnit = inputUnit.value;

    if (isNaN(value)) {
        results.innerHTML = '<p>Будь ласка, введіть числове значення.</p>';
        return;
    }

    let resultHtml = '<h3>Результати:</h3>';
    units.forEach(unit => {
        if (unit !== fromUnit) {
            const result = convertPower(value, fromUnit, unit);
            resultHtml += `
                <div class="result-item" onclick="copyToClipboard('${formatResult(result)} ${unitLabels[unit]}')">
                    <span class="unit">${unitLabels[unit]}:</span>
                    <span class="value" data-value="${result}">0</span>
                </div>
            `;
        }
    });

    results.innerHTML = resultHtml;

    // Анимация результатов
    document.querySelectorAll('.value').forEach(element => {
        const endValue = parseFloat(element.dataset.value);
        animateValue(element, 0, endValue, 1000);
    });
});

// Автоматическая конвертация при изменении значения или единицы измерения
inputValue.addEventListener('input', () => {
    convertBtn.click();
    saveLastInput();
});
inputUnit.addEventListener('change', () => {
    convertBtn.click();
    saveLastInput();
});

// Регистрация Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/converter/sw.js')
            .then(reg => console.log('Service Worker зареєстровано'))
            .catch(err => console.log('Помилка реєстрації Service Worker:', err));
    });
}

// Добавьте эту функцию после других функций конвертации
function convertErrorDbToPercent(errorDb) {
    // Формула: ошибка_процент = (10^(ошибка_дБ/10) - 1) * 100
    return (Math.pow(10, errorDb / 10) - 1) * 100;
}

// Добавьте новый элемент ввода и кнопку в HTML
const errorDbInput = document.createElement('input');
errorDbInput.type = 'number';
errorDbInput.id = 'error-db-input';
errorDbInput.placeholder = 'Похибка в дБ';

const errorConvertBtn = document.createElement('button');
errorConvertBtn.id = 'error-convert-btn';
errorConvertBtn.textContent = 'Конвертувати похибку';

// Вставьте новые элементы после основного конвертера
document.querySelector('.converter').insertAdjacentElement('afterend', errorDbInput);
errorDbInput.insertAdjacentElement('afterend', errorConvertBtn);

// Добавьте обработчик события для новой кнопки
errorConvertBtn.addEventListener('click', () => {
    const errorDb = parseFloat(errorDbInput.value);
    if (isNaN(errorDb)) {
        alert('Будь ласка, введіть числове значення похибки в дБ.');
        return;
    }
    const errorPercent = convertErrorDbToPercent(errorDb);
    alert(`Похибка ${errorDb} дБ відповідає ${errorPercent.toFixed(2)}% у відносних одиницях.`);
});
