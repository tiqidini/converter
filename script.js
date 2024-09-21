document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadData();
});

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
    // Здесь можно добавить логику сохранения настроек, если это необходимо
    closeSettings();
}

function loadData() {
    const data = localStorage.getItem('ndrData');
    if (data) {
        displayData(JSON.parse(data));
    } else {
        fetch('https://raw.githubusercontent.com/tiqidini/ndr/main/ndrs.json')
            .then(response => response.json())
            .then(data => {
                localStorage.setItem('ndrData', JSON.stringify(data));
                displayData(data);
            })
            .catch(error => {
                displayErrorMessage('Ошибка загрузки данных: ' + error.message);
            });
    }
}

function displayData(data) {
    const tableBody = document.getElementById('ndrTableBody');
    tableBody.innerHTML = '';
    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${safeText(row.code)}</td>
            <td>${safeText(row.title)}</td>
            <td>${safeText(row.year)}</td>
            <td>${safeText(row.files)}</td>
            <td>${safeText(row.notes)}</td>
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