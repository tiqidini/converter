// app.js
let db;
let currentPage = 1;
const recordsPerPage = 20;

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
        const tableName = 'ndrs';
        const res = db.exec(`SELECT * FROM ${tableName};`);
        if (res.length > 0 && res[0].values.length > 0) {
            const columns = res[0].columns;
            const allValues = res[0].values;
            renderTable(columns, allValues);
            setupPagination(allValues.length);
        } else {
            console.log(`Таблица ${tableName} пуста или запрос не вернул результатов`);
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

function renderTable(columns, allValues) {
    const thead = document.querySelector('#data-table thead tr');
    const tbody = document.querySelector('#data-table tbody');
    
    thead.innerHTML = '';
    tbody.innerHTML = '';

    columns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        thead.appendChild(th);
    });

    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const pageValues = allValues.slice(startIndex, endIndex);

    pageValues.forEach(row => {
        const tr = document.createElement('tr');
        row.forEach((cell, idx) => {
            const td = document.createElement('td');
            td.textContent = cell !== null ? cell.toString() : '';
            td.setAttribute('data-label', columns[idx]);
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

function setupPagination(totalRecords) {
    const totalPages = Math.ceil(totalRecords / recordsPerPage);
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination';
    
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => {
            currentPage = i;
            loadData(db);
        });
        paginationContainer.appendChild(pageButton);
    }
    
    document.body.appendChild(paginationContainer);
}