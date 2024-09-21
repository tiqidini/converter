let db;
let SQL;

console.log('Script.js начал выполнение');

const config = {
    locateFile: filename => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${filename}`
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    loadSettings();
    setupEventListeners();
    initSqlJs();
});

function initSqlJs() {
    console.log('Initializing SQL.js');
    if (typeof initSqlJsModule === 'undefined') {
        console.error('initSqlJsModule is undefined');
        displayErrorMessage(new Error('SQL.js не инициализирован'));
        return;
    }
    initSqlJsModule(config).then(function(sqlJs) {
        console.log('SQL.js initialized successfully');
        SQL = sqlJs;
        loadDatabase(localStorage.getItem('dbPath') || 'ndrs.db');
    }).catch(error => {
        console.error('Error initializing SQL.js:', error);
        displayErrorMessage(error);
    });
}

function loadSettings() {
    const dbPath = localStorage.getItem('dbPath') || 'ndrs.db';
    document.getElementById('dbPath').value = dbPath;
}

function setupEventListeners() {
    document.getElementById('settingsBtn').addEventListener('click', openSettings);
    document.getElementById('closeSettings').addEventListener('click', closeSettings);
    document.getElementById('saveSettings').addEventListener('click', saveSettings);
    document.getElementById('searchInput').addEventListener('input', searchTable);
    document.getElementById('refreshBtn').addEventListener('click', refreshData);
}

function openSettings() {
    document.getElementById('settingsModal').style.display = 'block';
}

function closeSettings() {
    document.getElementById('settingsModal').style.display = 'none';
}

function saveSettings() {
    const dbPath = document.getElementById('dbPath').value;
    localStorage.setItem('dbPath', dbPath);
    loadDatabase(dbPath);
    closeSettings();
}

function loadDatabase(dbPath) {
    console.log('Starting database load from:', dbPath);
    const absoluteDbPath = 'https://raw.githubusercontent.com/tiqidini/ndr/main/ndrs.db';
    
    fetch(absoluteDbPath)
        .then(response => {
            console.log('Fetch response received:', response.status, response.statusText);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.arrayBuffer();
        })
        .then(buffer => {
            console.log('ArrayBuffer received, size:', buffer.byteLength);
            if (buffer.byteLength === 0) {
                throw new Error('Database file is empty');
            }
            console.log('Creating SQL database from buffer');
            if (SQL && SQL.Database) {
                db = new SQL.Database(new Uint8Array(buffer));
                loadData();
            } else {
                throw new Error('SQL.js is not properly initialized');
            }
        })
        .catch(error => {
            console.error('Detailed error in loadDatabase:', error);
            displayErrorMessage(error);
        });
}

function loadData() {
    console.log('Loading data from database');
    try {
        const results = db.exec("SELECT code, title, year, files, notes FROM ndrs ORDER BY year DESC");
        console.log('Query executed successfully, results:', results);
        if (results.length > 0 && results[0].values.length > 0) {
            const data = results[0].values.map((row, index) => {
                const rowData = {
                    code: row[0],
                    title: row[1],
                    year: row[2],
                    files: row[3],
                    notes: row[4]
                };
                console.log(`Row ${index} data:`, rowData);
                return rowData;
            });
            console.log('Data processed:', data);
            displayData(data);
        } else {
            console.log('No data found in the database');
            displayNoDataMessage();
        }
    } catch (error) {
        console.error('Error executing query:', error);
        displayErrorMessage(error);
    }
}

function displayData(data) {
    console.log('Displaying data, count:', data.length);
    const tableBody = document.getElementById('ndrTableBody');
    tableBody.innerHTML = '';
    data.forEach((row, index) => {
        try {
            console.log(`Processing row ${index}:`, row);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${escapeHtml(row.code)}</td>
                <td>${escapeHtml(row.title)}</td>
                <td>${escapeHtml(row.year)}</td>
                <td><a href="#" onclick="openFile('${escapeHtml(row.files)}');return false;">${escapeHtml(row.files)}</a></td>
                <td>${escapeHtml(row.notes)}</td>
            `;
            tableBody.appendChild(tr);
        } catch (error) {
            console.error(`Error displaying row ${index}:`, error, row);
            const tr = document.createElement('tr');
            tr.innerHTML = `<td colspan="5">Ошибка отображения строки ${index}</td>`;
            tableBody.appendChild(tr);
        }
    });
    console.log('Data display completed');
    checkTableContent();
}

function openFile(fileName) {
    // В реальном приложении здесь будет код для открытия файла
    alert(`Открытие файла: ${fileName}`);
}

function searchTable() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toUpperCase();
    const table = document.getElementById('ndrTable');
    const tr = table.getElementsByTagName('tr');

    for (let i = 1; i < tr.length; i++) {
        let visible = false;
        const td = tr[i].getElementsByTagName('td');
        for (let j = 0; j < td.length; j++) {
            const cell = td[j];
            if (cell) {
                const textValue = cell.textContent || cell.innerText;
                if (textValue.toUpperCase().indexOf(filter) > -1) {
                    visible = true;
                    break;
                }
            }
        }
        tr[i].style.display = visible ? '' : 'none';
    }
}

function displayNoDataMessage() {
    const tableBody = document.getElementById('ndrTableBody');
    tableBody.innerHTML = '<tr><td colspan="5">Нет данных в базе данных</td></tr>';
}

function displayErrorMessage(error) {
    console.error('Error occurred:', error);
    const tableBody = document.getElementById('ndrTableBody');
    tableBody.innerHTML = `<tr><td colspan="5">Произошла ошибка при загрузке данных: ${escapeHtml(error.message)}</td></tr>`;
}

// Добавьте эту функцию в конец файла
function refreshData() {
    console.log('Refreshing data');
    loadDatabase(localStorage.getItem('dbPath') || 'ndrs.db');
}

// Переопределение console.log для отображения логов на странице
(function() {
    const oldLog = console.log;
    console.log = function(...args) {
        oldLog.apply(console, args);
        const logContainer = document.getElementById('logContainer');
        logContainer.style.display = 'block';
        logContainer.innerHTML += args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ') + '\n';
    };
})();

function escapeHtml(unsafe) {
    if (unsafe === null || unsafe === undefined) {
        return '';
    }
    if (typeof unsafe !== 'string') {
        console.warn('escapeHtml received non-string input:', unsafe, typeof unsafe);
        try {
            unsafe = String(unsafe);
        } catch (e) {
            console.error('Failed to convert to string:', e);
            return '';
        }
    }
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

// Добавьте эту функцию для отладки
function logRowData(row) {
    console.log('Row data:', {
        code: typeof row.code, 
        title: typeof row.title, 
        year: typeof row.year, 
        files: typeof row.files, 
        notes: typeof row.notes
    });
}

// Измените функцию loadData для использования logRowData
function loadData() {
    console.log('Loading data from database');
    try {
        const results = db.exec("SELECT code, title, year, files, notes FROM ndrs ORDER BY year DESC");
        console.log('Query executed successfully, results:', results);
        if (results.length > 0 && results[0].values.length > 0) {
            const data = results[0].values.map(row => {
                const rowData = {
                    code: row[0],
                    title: row[1],
                    year: row[2],
                    files: row[3],
                    notes: row[4]
                };
                logRowData(rowData);
                return rowData;
            });
            console.log('Data processed:', data);
            displayData(data);
        } else {
            console.log('No data found in the database');
            displayNoDataMessage();
        }
    } catch (error) {
        console.error('Error executing query:', error);
        displayErrorMessage(error);
    }
}

// ... (остальной код остается без изменений)

function checkTableContent() {
    const tableBody = document.getElementById('ndrTableBody');
    if (tableBody.children.length === 0) {
        console.log('Table is empty after display attempt');
        tableBody.innerHTML = '<tr><td colspan="5">Данные не отображаются. Пожалуйста, обновите страницу или свяжитесь с администратором.</td></tr>';
    } else {
        console.log('Table has content:', tableBody.children.length, 'rows');
    }
}