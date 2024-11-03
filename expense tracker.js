// Updated script.js

const expenses = [];
const categoryColors = {
    food: '#FF6384',
    transport: '#36A2EB',
    entertainment: '#FFCE56',
    utilities: '#4BC0C0',
    other: '#9966FF'
};

let exchangeRates = {
    USD: 1, // Default rates if API fails
    EUR: 0.85,
    GBP: 0.75,
    NGN: 460
};
let selectedCurrency = 'USD';

const apiKey = 'YOUR_API_KEY'; // Replace with your actual API key
const apiUrl = `https://api.exchangeratesapi.io/latest?base=USD&symbols=USD,EUR,GBP,NGN`;

// Fetch exchange rates
async function fetchExchangeRates() {
    try {
        const response = await fetch(`${apiUrl}&access_key=${apiKey}`);
        const data = await response.json();

        if (data && data.rates) {
            exchangeRates = data.rates;
            console.log('Exchange rates fetched:', exchangeRates);
            updateReport(); // Update report with live rates
        } else {
            console.error('Error fetching exchange rates:', data);
        }
    } catch (error) {
        console.error('Failed to fetch exchange rates:', error);
    }
}

// Add expense entry
function addExpense() {
    const amount = parseFloat(document.querySelector('input[name="amount"]').value);
    const remark = document.querySelector('input[name="remark"]').value;
    const category = document.querySelector('select[name="category"]').value;
    const date = document.querySelector('input[name="date"]').value;

    // Check that all fields are filled
    if (amount && category && date && remark) {
        // Create expense object and push to expenses array
        expenses.push({ amount, category, date: new Date(date), remark });
        console.log('Expense added:', { amount, category, date, remark });
        
        // Clear form fields
        document.querySelector('input[name="amount"]').value = '';
        document.querySelector('input[name="remark"]').value = '';
        document.querySelector('input[name="date"]').value = '';
        
        // Update report after adding expense
        updateReport();
    } else {
        alert('Please fill in all fields.');
    }
}

// Filter expenses by date range
function filterExpenses(start, end) {
    return expenses.filter(expense => 
        expense.date >= new Date(start) && expense.date <= new Date(end)
    );
}

// Calculate total amount for filtered expenses
function calculateTotal(filteredExpenses) {
    const totalInUSD = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    return (totalInUSD * exchangeRates[selectedCurrency]).toFixed(2);
}

// Generate and display report
function generateReport() {
    const startDate = document.querySelector('input[name="start-date"]').value;
    const endDate = document.querySelector('input[name="end-date"]').value;

    if (startDate && endDate) {
        const filteredExpenses = filterExpenses(startDate, endDate);
        const totalSpent = calculateTotal(filteredExpenses);

        document.querySelector('.total').innerText = `${totalSpent} ${selectedCurrency}`;
        drawChart(filteredExpenses, startDate, endDate);
    } else {
        alert('Please select a time period.');
    }
}

// Draw chart for expenses in selected period
function drawChart(expensesData, startDate, endDate) {
    const ctx = document.querySelector('.expense-chart').getContext('2d');
    const groupedByCategory = {};

    // Aggregate expenses by category
    expensesData.forEach(expense => {
        groupedByCategory[expense.category] = 
            (groupedByCategory[expense.category] || 0) + expense.amount;
    });

    const chartData = {
        labels: Object.keys(groupedByCategory),
        datasets: [{
            data: Object.values(groupedByCategory).map(amount => amount * exchangeRates[selectedCurrency]),
            backgroundColor: Object.keys(groupedByCategory).map(category => categoryColors[category])
        }]
    };

    new Chart(ctx, {
        type: 'pie',
        data: chartData,
        options: {
            responsive: true,
            title: {
                display: true,
                text: `Expenses from ${startDate} to ${endDate} (${selectedCurrency})`
            }
        }
    });
}

// Print report for specific time period
function printReport() {
    const startDate = document.querySelector('input[name="start-date"]').value;
    const endDate = document.querySelector('input[name="end-date"]').value;
    const filteredExpenses = filterExpenses(startDate, endDate);
    const reportWindow = window.open('', '_blank');

    reportWindow.document.write(`<h1>Expense Report (${startDate} - ${endDate})</h1>`);
    reportWindow.document.write('<ul>');

    filteredExpenses.forEach(expense => {
        const convertedAmount = (expense.amount * exchangeRates[selectedCurrency]).toFixed(2);
        reportWindow.document.write(`
            <li>${expense.date.toLocaleDateString()}: ${expense.category} - ${convertedAmount} ${selectedCurrency}
            <br>Remark: ${expense.remark}</li>
        `);
    });

    const totalSpent = calculateTotal(filteredExpenses);
    reportWindow.document.write(`</ul>`);
    reportWindow.document.write(`<p><strong>Total Spent:</strong> ${totalSpent} ${selectedCurrency}</p>`);
    reportWindow.document.close();
    reportWindow.print();
}

// Change currency and update report
function updateCurrency() {
    selectedCurrency = document.querySelector('select[name="currency"]').value;
    console.log('Currency changed to:', selectedCurrency);
    updateReport();
}

// Update report summary for today
function updateReport() {
    const today = new Date().toISOString().slice(0, 10);
    const filteredExpenses = filterExpenses(today, today);
    const totalSpent = calculateTotal(filteredExpenses);

    document.querySelector('.total').innerText = `${totalSpent} ${selectedCurrency}`;
}

// Fetch exchange rates on page load
fetchExchangeRates();
