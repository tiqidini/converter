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
                <div class="result-item">
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
inputValue.addEventListener('input', () => convertBtn.click());
inputUnit.addEventListener('change', () => convertBtn.click());

// Регистрация Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/converter/sw.js')
            .then(reg => console.log('Service Worker зареєстровано'))
            .catch(err => console.log('Помилка реєстрації Service Worker:', err));
    });
}
