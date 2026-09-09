const canvas = document.querySelector('#trend-chart');
const context = canvas.getContext('2d');

function daysInRange() {
  const days = [];
  const today = new Date();
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(today.getDate() - offset);
    days.push(date);
  }
  return days;
}

function drawChart(days, values) {
  const ratio = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, width, height);
  const padding = { top: 28, right: 20, bottom: 42, left: 46 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const max = Math.max(100, Math.ceil(Math.max(...values) / 100) * 100);
  context.font = '12px DM Sans';
  context.fillStyle = '#8b9891';
  context.strokeStyle = '#e6ece7';
  context.lineWidth = 1;
  for (let step = 0; step <= 4; step += 1) {
    const value = (max / 4) * step;
    const y = padding.top + chartHeight - (value / max) * chartHeight;
    context.beginPath(); context.moveTo(padding.left, y); context.lineTo(width - padding.right, y); context.stroke();
    context.fillText(`${Math.round(value)}`, 5, y + 4);
  }
  const points = values.map((value, index) => ({ x: padding.left + (chartWidth / 6) * index, y: padding.top + chartHeight - (value / max) * chartHeight }));
  const gradient = context.createLinearGradient(0, padding.top, 0, height);
  gradient.addColorStop(0, 'rgba(240,138,75,.25)'); gradient.addColorStop(1, 'rgba(240,138,75,0)');
  context.beginPath(); context.moveTo(points[0].x, padding.top + chartHeight); points.forEach(point => context.lineTo(point.x, point.y)); context.lineTo(points.at(-1).x, padding.top + chartHeight); context.closePath(); context.fillStyle = gradient; context.fill();
  context.beginPath(); points.forEach((point, index) => index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y)); context.strokeStyle = '#f08a4b'; context.lineWidth = 3; context.stroke();
  points.forEach((point, index) => { context.beginPath(); context.arc(point.x, point.y, 5, 0, Math.PI * 2); context.fillStyle = '#fff'; context.fill(); context.strokeStyle = '#f08a4b'; context.lineWidth = 3; context.stroke(); context.fillStyle = '#71807b'; context.fillText(days[index].toLocaleDateString('en-US', { weekday: 'short' }), point.x - 14, height - 12); });
}

async function loadTrend() {
  const days = daysInRange();
  const start = days[0].toISOString().slice(0, 10);
  const end = days[6].toISOString().slice(0, 10);
  document.querySelector('#trend-range').textContent = `${days[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${days[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  const response = await fetch(`/activities?startDate=${start}&endDate=${end}`);
  const activities = await response.json();
  const totals = days.map(day => activities.filter(activity => new Date(activity.timestamp).toDateString() === day.toDateString()).reduce((sum, activity) => sum + activity.calories, 0));
  document.querySelector('#week-total').textContent = totals.reduce((sum, value) => sum + value, 0).toLocaleString();
  drawChart(days, totals);
  const best = Math.max(...totals);
  document.querySelector('#trend-insight p').textContent = best ? `Your strongest day was ${days[totals.indexOf(best)].toLocaleDateString('en-US', { weekday: 'long' })} with ${best} calories burned.` : 'Keep moving. Your weekly story will appear here as activities arrive.';
}

loadTrend().catch(() => { document.querySelector('#trend-insight p').textContent = 'The Activity Server is unavailable.'; });
window.addEventListener('resize', loadTrend);
