// app.js
let db;

document.getElementById('load-db').addEventListener('click', async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.db';
    input.onchange = async event => {
        const file = event.target.files[0];
        const arrayBuffer = await file.arrayBuffer();
        const Uints = new Uint8Array(arrayBuffer);
        db = new SQL.Database(Uints);
        loadData();
    };
    input.click();
});

function loadData() {
    const res = db.exec("SELECT * FROM ваша_таблица"); // Замените на вашу таблицу
    if (res.length > 0) {
        const columns = res[0].columns;
        const values = res[0].values;
        renderTable(columns, values);
    }
}

function renderTable(columns, values) {
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
            td.textContent = cell;
            td.setAttribute('data-label', columns[idx]);
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}