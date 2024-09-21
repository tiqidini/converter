// app.js
let db;

// Загрузка базы данных автоматически из ndrs.db
document.addEventListener('DOMContentLoaded', function() {
    initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}` })
        .then(SQL => {
            console.log("SQL.js инициализирован успешно");
            // Загрузка базы данных автоматически из ndrs.db
            fetch('ndrs.db')
                .then(response => response.arrayBuffer())
                .then(arrayBuffer => {
                    console.log("База данных загружена, размер:", arrayBuffer.byteLength);
                    const Uints = new Uint8Array(arrayBuffer);
                    const db = new SQL.Database(Uints);
                    console.log("База данных инициализирована");
                    loadData(db);
                })
                .catch(error => console.error('Ошибка загрузки базы данных:', error));
        })
        .catch(err => console.error('Ошибка инициализации SQL.js:', err));
});

// Удалить обработчик загрузки через кнопку
// document.getElementById('load-db').remove();

function loadData(db) {
    if (!db) {
        console.error('База данных не инициализирована');
        return;
    }

    try {
        console.log("Начало выполнения loadData");
        // Получение списка таблиц
        const tableRes = db.exec("SELECT name FROM sqlite_master WHERE type='table';");
        console.log("Результат запроса таблиц:", tableRes);
        if (tableRes.length > 0) {
            const tables = tableRes[0].values.map(row => row[0]);
            console.log("Таблицы в базе данных:", tables);
            
            // Используем таблицу 'ndrs'
            const tableName = 'ndrs';
            if (tables.includes(tableName)) {
                // Получаем информацию о структуре таблицы
                const structureRes = db.exec(`PRAGMA table_info(${tableName});`);
                console.log("Структура таблицы:", structureRes);

                // Выполняем запрос к таблице
                const res = db.exec(`SELECT * FROM ${tableName} LIMIT 10;`);
                console.log("Результат запроса данных:", res);
                if (res.length > 0 && res[0].values.length > 0) {
                    const columns = res[0].columns;
                    const values = res[0].values;
                    renderTable(columns, values);
                } else {
                    console.log(`Таблица ${tableName} пуста или запрос не вернул результатов`);
                }
            } else {
                console.log(`Таблица ${tableName} не найдена в базе данных`);
            }
        } else {
            console.log("В базе данных нет таблиц");
        }
    } catch (error) {
        console.error('Ошибка при выполнении SQL-запроса:', error);
    }
}

// Добавьте этот код для получения списка таблиц, если вы не знаете имя вашей таблицы
const tableRes = db.exec("SELECT name FROM sqlite_master WHERE type='table';");
if (tableRes.length > 0) {
    const tables = tableRes[0].values.map(row => row[0]);
    console.log("Таблицы в базе данных:", tables);
}

function renderTable(columns, values) {
    console.log("Начало рендеринга таблицы");
    console.log("Колонки:", columns);
    console.log("Значения:", values);

    const thead = document.querySelector('#data-table thead tr');
    const tbody = document.querySelector('#data-table tbody');
    
    // Очистить существующие данные
    thead.innerHTML = '';
    tbody.innerHTML = '';

    // Создать заголовки
    columns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        thead.appendChild(th);
    });

    // Создать строки данных
    values.forEach(row => {
        const tr = document.createElement('tr');
        row.forEach((cell, idx) => {
            const td = document.createElement('td');
            td.textContent = cell !== null ? cell.toString() : '';
            td.setAttribute('data-label', columns[idx]);
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    console.log("Таблица отрендерена");
}