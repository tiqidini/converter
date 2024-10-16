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
        // Используем более понятное форматирование
        const absValue = Math.abs(value);
        if (absValue >= 1e9) {
            return (value / 1e9).toFixed(2) + ' млрд';
        } else if (absValue >= 1e6) {
            return (value / 1e6).toFixed(2) + ' млн';
        } else if (absValue >= 1e3) {
            return (value / 1e3).toFixed(2) + ' тыс';
        } else if (absValue < 1e-6) {
            return (value * 1e9).toFixed(2) + ' нано';
        } else if (absValue < 1e-3) {
            return (value * 1e6).toFixed(2) + ' микро';
        } else if (absValue < 1) {
            return (value * 1e3).toFixed(2) + ' милли';
        } else {
            return value.toLocaleString('ru-RU', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
            });
        }
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
            const formattedResult = formatResult(result, unit);
            let displayUnit = unitLabels[unit];
            if (formattedResult.includes('млрд') || formattedResult.includes('млн') || 
                formattedResult.includes('тыс') || formattedResult.includes('милли') || 
                formattedResult.includes('микро') || formattedResult.includes('нано')) {
                displayUnit = unit === 'w' ? 'Вт' : unit;
            }
            resultHtml += `
                <div class="result-item">
                    <span class="unit">${unitLabels[unit]}:</span>
                    <span class="value">${formattedResult} ${displayUnit}</span>
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
