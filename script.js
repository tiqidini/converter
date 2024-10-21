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

const increaseBtn = document.getElementById('increase-btn');
const decreaseBtn = document.getElementById('decrease-btn');
const errorIncreaseBtn = document.getElementById('error-increase-btn');
const errorDecreaseBtn = document.getElementById('error-decrease-btn');

function changeValue(input, delta) {
    let value = parseFloat(input.value) || 0;
    value += delta;
    input.value = value.toFixed(2);
    input.dispatchEvent(new Event('input'));
}

increaseBtn.addEventListener('click', () => changeValue(inputValue, 1));
decreaseBtn.addEventListener('click', () => changeValue(inputValue, -1));
errorIncreaseBtn.addEventListener('click', () => changeValue(errorDbInput, 0.1));
errorDecreaseBtn.addEventListener('click', () => changeValue(errorDbInput, -0.1));

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

function animateValue(element, start, end, duration, isPercentage = false) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const current = start + progress * (end - start);
        element.textContent = isPercentage ? 
            `${formatResult(current)} %` : 
            formatResult(current);
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

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Скопійовано в буфер обміну!');
    }, (err) => {
        console.error('Помилка копіювання: ', err);
    });
}

loadLastInput();

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

    document.querySelectorAll('.value').forEach(element => {
        const endValue = parseFloat(element.dataset.value);
        animateValue(element, 0, endValue, 1000);
    });
});

inputValue.addEventListener('input', () => {
    convertBtn.click();
    saveLastInput();
});
inputUnit.addEventListener('change', () => {
    convertBtn.click();
    saveLastInput();
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/converter/sw.js')
            .then(reg => console.log('Service Worker зареєстровано'))
            .catch(err => console.log('Помилка реєстрації Service Worker:', err));
    });
}

function convertErrorDbToPercent(errorDb) {
    return (Math.pow(10, errorDb / 10) - 1) * 100;
}

const errorDbInput = document.getElementById('error-db-input');
const errorConvertBtn = document.getElementById('error-convert-btn');
const errorResults = document.getElementById('error-results');

errorConvertBtn.addEventListener('click', () => {
    const errorDb = parseFloat(errorDbInput.value);
    if (isNaN(errorDb)) {
        errorResults.innerHTML = '<p>Будь ласка, введіть числове значення похибки в дБ.</p>';
        return;
    }
    const errorPercent = convertErrorDbToPercent(errorDb);
    let resultHtml = '<h3>Результат конвертації похибки:</h3>';
    resultHtml += `
        <div class="result-item" onclick="copyToClipboard('${errorPercent.toFixed(2)}%')">
            <span class="unit">Відносна похибка:</span>
            <span class="value" data-value="${errorPercent}">0 %</span>
        </div>
    `;
    errorResults.innerHTML = resultHtml;

    const valueElement = errorResults.querySelector('.value');
    animateValue(valueElement, 0, errorPercent, 1000, true);
});

errorDbInput.addEventListener('input', () => errorConvertBtn.click());
