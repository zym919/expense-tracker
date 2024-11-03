const expenses = [];
const currencyRates = {
  USD: 1,
  EUR: 0.85,
  GBP: 0.75,
  NGN: 1460,
};
const currencySymbols = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  NGN: '₦',
};

// Event listeners for adding expenses and generating reports
document.querySelector('.add-expense').addEventListener('click', addExpense);
document.querySelector('.generate-report').addEventListener('click', generateReport);

async function addExpense() {
  const date = document.querySelector('input[name="date"]').value;
  const category = document.querySelector('input[name="category"]').value;
  const amount = parseFloat(document.querySelector('input[name="amount"]').value);
  const remarks = document.querySelector('textarea[name="remarks"]').value;
  const currency = document.querySelector('select[name="currency"]').value;

  if (!date || !category || isNaN(amount)) return alert('Please complete all fields.');

  const convertedAmountUSD = await convertToUSD(amount, currency);
  expenses.push({ date, category, amount: convertedAmountUSD, remarks });
  renderExpenses();
}

async function convertToUSD(amount, currency) {
    if (currency === 'USD') return amount; // No conversion needed for USD
    try {
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${currency}`);
      const data = await response.json();
      return amount * data.rates.USD;
    } catch (error) {
      // Hardcoded conversion rates, if API fails
      if (currency === 'NGN') {
        return amount / 1460; 
      } else if (currency === 'EUR') {
        return amount / 0.85;
      } else if (currency === 'GBP') {
        return amount / 0.75;
      }
      return amount * (1 / currencyRates[currency]);
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
      <td>$${expense.amount.toFixed(2)}</td>
      <td>${expense.remarks}</td>
      <td>USD</td>
    `;
    tableBody.appendChild(row);
  });
}

function generateReport() {
  const reportTable = document.querySelector('.report-table');
  const reportBody = reportTable.querySelector('tbody');
  const grandTotalCell = document.querySelector('.grand-total');

  // Calculate totals per category in USD
  const categoryTotals = {};
  expenses.forEach(expense => {
    categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
  });

  // Clear and populate report table with USD symbol
  reportBody.innerHTML = '';
  let grandTotal = 0;
  for (const [category, total] of Object.entries(categoryTotals)) {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${category}</td><td>$${total.toFixed(2)}</td>`;
    reportBody.appendChild(row);
    grandTotal += total;
  }

  grandTotalCell.textContent = `$${grandTotal.toFixed(2)}`;
  reportTable.style.display = 'table';
}
