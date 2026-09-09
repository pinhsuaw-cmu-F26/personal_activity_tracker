const socket = io();
let activities = [];
let activeRange = {};

const activityList = document.querySelector('#activity-list');
const toast = document.querySelector('#toast');
const dateFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

function localDateKey(value) {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function dayLabel(value, index) {
  const date = new Date(value);
  const today = new Date();
  const difference = Math.floor((new Date(today.toDateString()) - new Date(date.toDateString())) / 86400000);
  if (difference === 0) return 'Today';
  if (difference >= 0 && difference < 7) return date.toLocaleDateString('en-US', { weekday: 'long' });
  return dateFormatter.format(date);
}

function render() {
  document.querySelector('#activity-count').textContent = activities.length;
  document.querySelector('#total-duration').textContent = activities.reduce((sum, item) => sum + item.duration, 0).toLocaleString();
  document.querySelector('#total-calories').textContent = activities.reduce((sum, item) => sum + item.calories, 0).toLocaleString();
  if (!activities.length) {
    activityList.innerHTML = '<div class="empty-state">No activities found for this view.</div>';
    return;
  }
  const groups = activities.reduce((result, activity) => {
    const key = localDateKey(activity.timestamp);
    (result[key] ||= []).push(activity);
    return result;
  }, {});
  activityList.innerHTML = Object.values(groups).map((group, index) => `
    <section class="day-group"><div class="day-heading">${dayLabel(group[0].timestamp, index)}</div><div class="cards">${group.map(cardTemplate).join('')}</div></section>
  `).join('');
  activityList.querySelectorAll('.delete-button').forEach(button => button.addEventListener('click', () => deleteActivity(button.dataset.id)));
}

function cardTemplate(activity) {
  const icons = { Walking: '♧', Running: '↗', Pickleball: '⌁', Tennis: '◇', Hiking: '♒', Swimming: '≋' };
  const distance = activity.distance === undefined ? '' : `${activity.distance} mi | `;
  return `<article class="activity-card"><span class="activity-icon" aria-hidden="true">${icons[activity.type] || '•'}</span><div class="activity-type">${activity.type}</div><div class="activity-summary">${activity.duration} min | ${distance}${activity.calories} calories</div><div class="heart-rate" aria-label="Average heart rate">♥ ${activity.averageHeartRate} bpm</div><button class="delete-button" data-id="${activity.id}" aria-label="Delete ${activity.type}">×</button></article>`;
}

async function loadActivities() {
  const query = activeRange.startDate && activeRange.endDate ? `?startDate=${activeRange.startDate}&endDate=${activeRange.endDate}` : '';
  const response = await fetch(`/activities${query}`);
  if (!response.ok) throw new Error('Unable to load activities');
  activities = await response.json();
  render();
}

async function deleteActivity(id) {
  if (!window.confirm('Delete this activity?')) return;
  const response = await fetch(`/activities/${id}`, { method: 'DELETE' });
  if (response.ok) { showToast('Activity deleted'); await loadActivities(); }
}

function showToast(message) { toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2600); }

function parseDateInput(value) {
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, month, day, year] = match;
  const date = new Date(`${year}-${month}-${day}T00:00:00`);
  if (date.getFullYear() !== Number(year) || date.getMonth() + 1 !== Number(month) || date.getDate() !== Number(day)) return null;
  return `${year}-${month}-${day}`;
}

document.querySelector('#current-date').textContent = dateFormatter.format(new Date());
document.querySelector('#filter-form').addEventListener('submit', event => {
  event.preventDefault();
  const startDate = parseDateInput(document.querySelector('#start-date').value);
  const endDate = parseDateInput(document.querySelector('#end-date').value);
  if (!startDate || !endDate || startDate > endDate) return showToast('Use MM/DD/YYYY for a valid date range');
  activeRange = { startDate, endDate };
  loadActivities().catch(() => showToast('Could not apply filter'));
});
document.querySelector('#clear-filter').addEventListener('click', () => { activeRange = {}; document.querySelector('#filter-form').reset(); loadActivities(); });
socket.on('activity:created', activity => { activities = [activity, ...activities.filter(item => item.id !== activity.id)]; if (!activeRange.startDate) render(); showToast('New activity synced'); });
loadActivities().catch(() => { activityList.innerHTML = '<div class="empty-state">The Activity Server is unavailable.</div>'; });
