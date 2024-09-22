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
  table.style.fontFamily = 'Courier New';
  table.style.borderCollapse = 'collapse';
  table.style.width = '100%';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  ['Название', 'Категория', 'Статус'].forEach(headerText => {
    const th = document.createElement('th');
    th.textContent = headerText;
    th.style.border = '1px solid black';
    th.style.padding = '5px';
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  data.forEach(item => {
    const row = document.createElement('tr');
    ['name', 'category', 'status'].forEach(key => {
      const td = document.createElement('td');
      td.textContent = item[key];
      td.style.border = '1px solid black';
      td.style.padding = '5px';
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
  
  const filterContainer = document.createElement('div');
  filterContainer.style.marginBottom = '10px';
  
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