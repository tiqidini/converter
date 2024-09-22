// app.js
let db;
let stmt;

initSqlJs({ locateFile: file => `https://sql.js.org/dist/${file}` }).then(function (SQL) {
  console.log('SQL.js инициализирован успешно');
  fetch('ndrs.db')
    .then(response => response.arrayBuffer())
    .then(buffer => {
      db = new SQL.Database(new Uint8Array(buffer));
      console.log('База данных загружена, размер:', buffer.byteLength);
      console.log('База данных инициализирована');
      loadData();
    });
});

function loadData() {
  try {
    const result = db.exec("SELECT * FROM ndrs");
    const data = result[0].values.map(row => ({
      name: row[1],
      category: row[2],
      status: row[3]
      // добавьте другие поля, если они есть
    }));
    initializeTable(data);
  } catch (err) {
    console.error(' Ошибка при выполнении SQL-запроса:', err);
  }
}

function createTable(data) {
  const table = document.createElement('table');
  table.className = 'data-table';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  ['ID', 'Название', 'Категория', 'Статус', 'Дата создания', 'Дата обновления'].forEach(headerText => {
    const th = document.createElement('th');
    th.textContent = headerText;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  data.forEach(item => {
    const row = document.createElement('tr');
    [item[0], item[1], item[2], item[3], item[4], item[5]].forEach(cellText => {
      const td = document.createElement('td');
      td.textContent = cellText;
      row.appendChild(td);
    });
    tbody.appendChild(row);
  });
  table.appendChild(tbody);

  return table;
}

function filterData(data, searchText, filters) {
  return data.filter(item => 
    item.name.toLowerCase().includes(searchText.toLowerCase()) &&
    Object.entries(filters).every(([key, value]) => value === '' || item[key] === value)
  );
}

function initializeTable(data) {
  const container = document.getElementById('table-container');
  if (!container) {
    console.error('Контейнер таблицы не найден');
    return;
  }
  
  // Добавляем стили
  const style = document.createElement('style');
  style.textContent = `
    .data-table {
      font-family: 'Courier New', Courier, monospace;
      border-collapse: collapse;
      width: 100%;
      max-width: 100%;
      overflow-x: auto;
      display: block;
    }
    .data-table th, .data-table td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    .data-table th {
      background-color: #f2f2f2;
      font-weight: bold;
    }
    .data-table tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    .data-table tr:hover {
      background-color: #f5f5f5;
    }
    #table-container {
      overflow-x: auto;
    }
    .filter-container {
      margin-bottom: 15px;
    }
    .filter-container label, .filter-container input {
      margin-right: 10px;
    }
  `;
  document.head.appendChild(style);
  
  const filterContainer = document.createElement('div');
  filterContainer.className = 'filter-container';
  
  const filters = [
    { name: 'status', label: 'Статус' },
    { name: 'category', label: 'Категория' },
  ];

  const filterValues = {};

  filters.forEach(filter => {
    const select = document.createElement('select');
    select.id = `filter-${filter.name}`;
    select.innerHTML = `<option value="">Все ${filter.label}</option>`;
    
    const uniqueValues = [...new Set(data.map(item => item[filter.name]))];
    uniqueValues.forEach(value => {
      select.innerHTML += `<option value="${value}">${value}</option>`;
    });
    
    const label = document.createElement('label');
    label.textContent = `${filter.label}: `;
    label.appendChild(select);
    
    filterContainer.appendChild(label);
    filterContainer.appendChild(document.createTextNode(' '));

    filterValues[filter.name] = '';
  });

  container.appendChild(filterContainer);

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Поиск по названию';
  container.appendChild(searchInput);

  const tableWrapper = document.createElement('div');
  container.appendChild(tableWrapper);

  function updateTable() {
    filters.forEach(filter => {
      filterValues[filter.name] = document.getElementById(`filter-${filter.name}`).value;
    });
    
    const filteredData = filterData(data, searchInput.value, filterValues);
    tableWrapper.innerHTML = '';
    tableWrapper.appendChild(createTable(filteredData));
  }

  filters.forEach(filter => {
    document.getElementById(`filter-${filter.name}`).addEventListener('change', updateTable);
  });
  searchInput.addEventListener('input', updateTable);

  updateTable();
}