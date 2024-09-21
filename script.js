let db;
let SQL;

const config = {
    locateFile: filename => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${filename}`
};

document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    setupEventListeners();
    initSqlJs();
});

function initSqlJs() {
    initSqlJsModule(config).then(function(sqlJs) {
        SQL = sqlJs;
        loadDatabase(localStorage.getItem('dbPath') || 'ndrs.db');
    }).catch(error => {
        displayErrorMessage('Ошибка инициализации SQL.js: ' + error.message);
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
    const absoluteDbPath = 'https://raw.githubusercontent.com/tiqidini/ndr/main/ndrs.db';
    
    fetch(absoluteDbPath)
        .then(response => response.arrayBuffer())
        .then(buffer => {
            if (SQL && SQL.Database) {
                db = new SQL.Database(new Uint8Array(buffer));
                loadData();
            } else {
                throw new Error('SQL.js is not properly initialized');
            }
        })
        .catch(error => {
            displayErrorMessage('Ошибка загрузки базы данных: ' + error.message);
        });
}

function loadData() {
    try {
        const results = db.exec("SELECT code, title, year, files, notes FROM ndrs ORDER BY year DESC");
        if (results.length > 0 && results[0].values.length > 0) {
            displayData(results[0].values);
        } else {
            displayNoDataMessage();
        }
    } catch (error) {
        displayErrorMessage('Ошибка выполнения запроса: ' + error.message);
    }
}

function displayData(data) {
    const tableBody = document.getElementById('ndrTableBody');
    tableBody.innerHTML = '';
    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${safeText(row[0])}</td>
            <td>${safeText(row[1])}</td>
            <td>${safeText(row[2])}</td>
            <td>${safeText(row[3])}</td>
            <td>${safeText(row[4])}</td>
        `;
        tableBody.appendChild(tr);
    });
}

function safeText(text) {
    if (text == null) return '';
    return String(text).replace(/[&<>"']/g, function(m) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[m];
    });
}

function displayNoDataMessage() {
    const tableBody = document.getElementById('ndrTableBody');
    tableBody.innerHTML = '<tr><td colspan="5">Нет данных в базе данных</td></tr>';
}

function displayErrorMessage(message) {
    const tableBody = document.getElementById('ndrTableBody');
    tableBody.innerHTML = `<tr><td colspan="5">${safeText(message)}</td></tr>`;
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

function openFile(fileName) {
    alert(`Открытие файла: ${fileName}`);
}