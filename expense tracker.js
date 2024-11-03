document.querySelector('.add-expense').addEventListener('click', addExpense);
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
  updateChart();
}

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

function updateChart() {
  const categoryTotals = {};
  expenses.forEach(expense => {
    categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
  });

  const chart = document.getElementById('expenseChart').getContext('2d');
  new Chart(chart, {
    type: 'pie',
    data: {
      labels: Object.keys(categoryTotals),
      datasets: [{
        data: Object.values(categoryTotals),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#FF9F40', '#4BC0C0'],
      }],
    },
  });
}

document.querySelector('.print-report').addEventListener('click', printReport);

function printReport() {
  const startDate = prompt('Enter start date (YYYY-MM-DD):');
  const endDate = prompt('Enter end date (YYYY-MM-DD):');

  const filteredExpenses = expenses.filter(expense => 
    new Date(expense.date) >= new Date(startDate) && new Date(expense.date) <= new Date(endDate)
  );

  let reportContent = `Expense Report from ${startDate} to ${endDate}\n\n`;
  reportContent += `Date\tCategory\tAmount\tRemarks\tCurrency\n`;

  filteredExpenses.forEach(expense => {
    reportContent += `${expense.date}\t${expense.category}\t${expense.amount.toFixed(2)}\t${expense.remarks}\t${expense.currency}\n`;
  });

  const reportWindow = window.open('', '_blank');
  reportWindow.document.write(`<pre>${reportContent}</pre>`);
  reportWindow.document.close();
  reportWindow.print();
}
