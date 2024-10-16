const inputValue = document.getElementById('input-value');
const inputUnit = document.getElementById('input-unit');
const convertBtn = document.getElementById('convert-btn');
const results = document.getElementById('results');

const units = ['dbm', 'w', 'mw', 'uw', 'nw', 'kw'];
const unitLabels = {
    'dbm': 'dBm',
    'w': 'Вт',
    'mw': 'мВт',
    'uw': 'мкВт',
    'nw': 'нВт',
    'kw': 'кВт'
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
        case 'nw':
            watts = value / 1000000000;
            break;
        case 'kw':
            watts = value * 1000;
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
        case 'nw':
            return watts * 1000000000;
        case 'kw':
            return watts / 1000;
    }
}

function formatResult(value, unit) {
    if (unit === 'dbm') {
        return value.toFixed(2);
    } else {
        return value.toExponential(4);
    }
}

convertBtn.addEventListener('click', () => {
    const value = parseFloat(inputValue.value);
    const fromUnit = inputUnit.value;

    if (isNaN(value)) {
        results.innerHTML = '<p>Пожалуйста, введите числовое значение.</p>';
        return;
    }

    let resultHtml = '<h3>Результаты:</h3>';
    units.forEach(unit => {
        if (unit !== fromUnit) {
            const result = convertPower(value, fromUnit, unit);
            resultHtml += `
                <div class="result-item">
                    <span class="unit">${unitLabels[unit]}:</span>
                    <span class="value">${formatResult(result, unit)}</span>
                </div>
            `;
        }
    });

    results.innerHTML = resultHtml;
});

// Автоматическая конвертация при изменении значения или единицы измерения
inputValue.addEventListener('input', () => convertBtn.click());
inputUnit.addEventListener('change', () => convertBtn.click());

// Регистрация Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker зарегистрирован'))
            .catch(err => console.log('Ошибка регистрации Service Worker:', err));
    });
}
