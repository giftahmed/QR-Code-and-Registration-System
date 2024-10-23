const calendar = document.getElementById('calendar');
const dateDisplay = document.getElementById('date-display');
const availabilityDiv = document.getElementById('availability');
const monthSelect = document.getElementById('month-select');
const yearSelect = document.getElementById('year-select');
const powerAutomateUrl = "https://prod-157.westeurope.logic.azure.com:443/workflows/b8a448099afa40ad9b99c19862201659/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=bPgSgBY6mZ7JqxVHkgt7HFV17jUy-iU_FCUJVLC9GZA";  // Replace with actual URL

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Populate month and year selectors
function populateSelectors() {
  months.forEach((month, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = month;
    monthSelect.appendChild(option);
  });

  const currentYear = new Date().getFullYear();
  for (let year = currentYear - 100; year <= currentYear + 50; year++) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  }
}

const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();

function generateCalendar(month, year) {
  calendar.innerHTML = '';
  const days = daysInMonth(month, year);
  const firstDay = new Date(year, month, 1).getDay();

  for (let i = 0; i < firstDay; i++) {
    const emptyDiv = document.createElement('div');
    calendar.appendChild(emptyDiv);
  }

  for (let day = 1; day <= days; day++) {
    const dayDiv = document.createElement('div');
    dayDiv.textContent = day;
    dayDiv.addEventListener('click', () => selectDate(day, month, year));
    calendar.appendChild(dayDiv);
  }
}

async function selectDate(day, month, year) {
  const selectedDate = new Date(year, month, day).toISOString().split('T')[0];
  dateDisplay.textContent = selectedDate;

  const response = await sendDateToPowerAutomate(selectedDate);
  displayAvailability(response);
}

async function sendDateToPowerAutomate(selectedDate) {
  try {
    const response = await fetch(powerAutomateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ selectedDate }),
    });

    if (!response.ok) {
      throw new Error('Failed to get availability.');
    }

    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    return { available: false, events: [] };
  }
}

function displayAvailability(data) {
  if (data.available) {
    availabilityDiv.innerHTML = "<strong>The selected date is free!</strong>";
  } else {
    const events = data.events
      .map(event => `<li>${event.title} at ${event.time}</li>`)
      .join('');
    availabilityDiv.innerHTML = `
      <strong>Events on this date:</strong>
      <ul>${events}</ul>
    `;
  }
}

const today = new Date();
populateSelectors();
monthSelect.value = today.getMonth();
yearSelect.value = today.getFullYear();
generateCalendar(today.getMonth(), today.getFullYear());

monthSelect.addEventListener('change', () => {
  const month = parseInt(monthSelect.value);
  const year = parseInt(yearSelect.value);
  generateCalendar(month, year);
});

yearSelect.addEventListener('change', () => {
  const month = parseInt(monthSelect.value);
  const year = parseInt(yearSelect.value);
  generateCalendar(month, year);
});
