let db;
let SQL;

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
    initSqlJsModule(config).then(function(sqlJs) {
        console.log('SQL.js initialized successfully');
        SQL = sqlJs;
        loadDatabase(localStorage.getItem('dbPath') || 'ndrs.db');
    }).catch(error => {
        console.error('Error initializing SQL.js:', error);
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
    console.log('Loading database from:', dbPath);
    
    fetch(dbPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            console.log('Database fetched successfully');
            return response.arrayBuffer();
        })
        .then(buffer => {
            console.log('Creating SQL database from buffer');
            if (SQL && SQL.Database) {
                db = new SQL.Database(new Uint8Array(buffer));
                loadData();
            } else {
                throw new Error('SQL.js is not properly initialized');
            }
        })
        .catch(error => {
            console.error('Error loading database:', error);
            alert('Ошибка при загрузке базы данных. Проверьте консоль разработчика для деталей.');
        });
}

function loadData() {
    console.log('Loading data from database');
    try {
        const results = db.exec("SELECT code, title, year, files, notes FROM ndrs ORDER BY year DESC");
        console.log('Query executed successfully');
        if (results.length > 0) {
            const data = results[0].values.map(row => ({
                code: row[0],
                title: row[1],
                year: row[2],
                files: row[3],
                notes: row[4]
            }));
            console.log('Data processed:', data);
            displayData(data);
        } else {
            console.log('No data found in the database');
        }
    } catch (error) {
        console.error('Error executing query:', error);
    }
}

function displayData(data) {
    const tableBody = document.getElementById('ndrTableBody');
    tableBody.innerHTML = '';
    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.code}</td>
            <td>${row.title}</td>
            <td>${row.year}</td>
            <td><a href="#" onclick="openFile('${row.files}')">${row.files}</a></td>
            <td>${row.notes}</td>
        `;
        tableBody.appendChild(tr);
    });
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