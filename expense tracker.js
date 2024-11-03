document.querySelector('.add-expense').addEventListener('click', addExpense);
document.querySelector('.generate-report').addEventListener('click', generateReport);

const expenses = [];
const currencyRates = {
  USD: 1,
  EUR: 0.85,
  GBP: 0.75,
};

async function addExpense() {
  const date = document.querySelector('input[name="date"]').value;
  const category = document.querySelector('input[name="category"]').value;
  const amount = parseFloat(document.querySelector('input[name="amount"]').value);
  const remarks = document.querySelector('textarea[name="remarks"]').value;
  const currency = document.querySelector('select[name="currency"]').value;

  if (!date || !category || isNaN(amount)) return alert('Please complete all fields.');

  const convertedAmount = await convertCurrency(amount, currency);
  expenses.push({ date, category, amount: convertedAmount, currency, remarks });
  renderExpenses();
}

// Convert currency with fallback rates
async function convertCurrency(amount, currency) {
  try {
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${currency}`);
    const data = await response.json();
    return amount * data.rates.USD;
  } catch (error) {
    return amount * (currencyRates[currency] || 1);
  }
}

function renderExpenses() {
  const tableBody = document.querySelector('table tbody');
  tableBody.innerHTML = '';
  expenses.forEach(expense => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${expense.date}</td>
      <td>${expense.category}</td>
      <td>${expense.amount.toFixed(2)}</td>
      <td>${expense.remarks}</td>
      <td>${expense.currency}</td>
    `;
    tableBody.appendChild(row);
  });
}

// Generate and display the report
function generateReport() {
  const reportTable = document.querySelector('.report-table');
  const reportBody = reportTable.querySelector('tbody');
  const grandTotalCell = document.querySelector('.grand-total');

  // Calculate totals per category
  const categoryTotals = {};
  expenses.forEach(expense => {
    categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
  });

  // Clear and populate report table
  reportBody.innerHTML = '';
  let grandTotal = 0;
  for (const [category, total] of Object.entries(categoryTotals)) {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${category}</td><td>${total.toFixed(2)}</td>`;
    reportBody.appendChild(row);
    grandTotal += total;
  }

  grandTotalCell.textContent = grandTotal.toFixed(2);
  reportTable.style.display = 'table';
}
