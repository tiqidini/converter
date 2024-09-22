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

// Функция для создания таблицы
function createTable(data) {
    const table = document.createElement('table');
    table.style.fontFamily = 'Courier New';
    table.style.borderCollapse = 'collapse'; // Добавляем видимые границы
    table.style.width = '100%';

    // Создаем заголовок таблицы
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['Название', 'Категория', 'Статус'].forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        th.style.border = '1px solid black'; // Добавляем границы для заголовков
        th.style.padding = '5px';
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Создаем тело таблицы
    const tbody = document.createElement('tbody');
    data.forEach(item => {
        const row = document.createElement('tr');
        ['name', 'category', 'status'].forEach(key => {
            const td = document.createElement('td');
            td.textContent = item[key];
            td.style.border = '1px solid black'; // Добавляем границы для ячеек
            td.style.padding = '5px';
            row.appendChild(td);
        });
        tbody.appendChild(row);
    });
    table.appendChild(tbody);

    return table;
}

// Функция для фильтрации данных
function filterData(data, searchText, category) {
    return data.filter(item => 
        item.name.toLowerCase().includes(searchText.toLowerCase()) &&
        (category === '' || item.category === category)
    );
}

// Инициализация таблицы и элементов управления
function initializeTable(data) {
    const container = document.getElementById('table-container');
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Поиск по названию';

    const categorySelect = document.createElement('select');
    categorySelect.innerHTML = `
        <option value="">Все категории</option>
        <option value="category1">Категория 1</option>
        <option value="category2">Категория 2</option>
    `;

    container.appendChild(searchInput);
    container.appendChild(categorySelect);

    const tableWrapper = document.createElement('div');
    container.appendChild(tableWrapper);

    // Создаем быстрые фильтры
    const filterContainer = document.createElement('div');
    filterContainer.style.marginBottom = '10px';
    
    const filters = [
        { name: 'status', label: 'Статус' },
        { name: 'category', label: 'Категория' },
        // Добавьте другие фильтры по необходимости
    ];

    filters.forEach(filter => {
        const select = document.createElement('select');
        select.id = `filter-${filter.name}`;
        select.innerHTML = `<option value="">Все ${filter.label}</option>`;
        
        // Получаем уникальные значения для фильтра
        const uniqueValues = [...new Set(data.map(item => item[filter.name]))];
        uniqueValues.forEach(value => {
            select.innerHTML += `<option value="${value}">${value}</option>`;
        });
        
        const label = document.createElement('label');
        label.textContent = `${filter.label}: `;
        label.appendChild(select);
        
        filterContainer.appendChild(label);
        filterContainer.appendChild(document.createTextNode(' ')); // Пробел между фильтрами
    });

    container.appendChild(filterContainer);

    function updateTable() {
        let filteredData = data;
        
        // Применяем все фильтры
        filters.forEach(filter => {
            const selectValue = document.getElementById(`filter-${filter.name}`).value;
            if (selectValue) {
                filteredData = filteredData.filter(item => item[filter.name] === selectValue);
            }
        });
        
        // Применяем поиск
        filteredData = filteredData.filter(item => 
            item.name.toLowerCase().includes(searchInput.value.toLowerCase())
        );

        tableWrapper.innerHTML = '';
        tableWrapper.appendChild(createTable(filteredData));
    }

    // Добавляем слушатели событий для новых фильтров
    filters.forEach(filter => {
        document.getElementById(`filter-${filter.name}`).addEventListener('change', updateTable);
    });

    updateTable();
}

// Загрузка данных и инициализация таблицы
fetch('your-data-url.json')
    .then(response => response.json())
    .then(data => {
        initializeTable(data);
    })
    .catch(error => console.error('Error loading data:', error));