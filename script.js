const inputValue = document.getElementById('input-value');
const inputUnit = document.getElementById('input-unit');
const convertBtn = document.getElementById('convert-btn');
const results = document.getElementById('results');

const units = ['dbm', 'w', 'mw', 'uw', 'nw', 'kw'];

function convertPower(value, fromUnit, toUnit) {
    // Сначала конвертируем в ватты
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

    // Затем конвертируем ватты в нужную единицу
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
            resultHtml += `<p>${result.toExponential(4)} ${unit}</p>`;
        }
    });

    results.innerHTML = resultHtml;
});

// Регистрация Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker зарегистрирован'))
            .catch(err => console.log('Ошибка регистрации Service Worker:', err));
    });
}
