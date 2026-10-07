const sessions = [
  { time: '8:00 AM', end: '9:30 AM', name: 'Youth Hockey · U12', category: 'hockey', sheet: 'Sheet A', attendance: '18 / 20', status: 'In progress' },
  { time: '9:00 AM', end: '10:00 AM', name: 'Learn to Skate · Level 1', category: 'lessons', sheet: 'Sheet B', attendance: '12 / 16', status: 'In progress' },
  { time: '10:30 AM', end: '12:00 PM', name: 'Adult Pickup Hockey', category: 'hockey', sheet: 'Sheet A', attendance: '22 / 24', status: 'Upcoming' },
  { time: '11:00 AM', end: '12:00 PM', name: 'Public Skate', category: 'public', sheet: 'Sheet B', attendance: '36 / 60', status: 'Upcoming' },
  { time: '12:30 PM', end: '2:00 PM', name: 'Northline Juniors · Practice', category: 'hockey', sheet: 'Sheet A', attendance: '19 / 20', status: 'Almost full', full: true },
  { time: '1:00 PM', end: '2:00 PM', name: 'Community Public Skate', category: 'public', sheet: 'Sheet B', attendance: '28 / 60', status: 'Upcoming' },
  { time: '2:30 PM', end: '3:15 PM', name: 'Learn to Skate · Level 2', category: 'lessons', sheet: 'Sheet A', attendance: '10 / 16', status: 'Upcoming' },
  { time: '3:30 PM', end: '4:15 PM', name: 'Private Coaching · Maya R.', category: 'lessons', sheet: 'Sheet B', attendance: '1 / 4', status: 'Upcoming' },
];

const sessionList = document.querySelector('#session-list');
const modal = document.querySelector('#session-modal');
const toast = document.querySelector('#toast');
let activeFilter = 'all';
let toastTimer;

function renderSessions() {
  sessionList.innerHTML = sessions.map((session, index) => `
    <article class="session-row" data-category="${session.category}" data-session-index="${index}" ${activeFilter !== 'all' && session.category !== activeFilter ? 'hidden' : ''}>
      <div class="session-time">${session.time}<small>${session.end}</small></div>
      <span class="session-color" aria-hidden="true"></span>
      <div class="session-details"><strong>${escapeHtml(session.name)}</strong><small>${escapeHtml(session.sheet)}<span>·</span>${session.attendance} spots</small></div>
      <span class="session-status ${session.full ? 'full' : ''}">${session.status}</span>
    </article>`).join('');
  const visibleCount = sessions.filter((session) => activeFilter === 'all' || session.category === activeFilter).length;
  document.querySelector('#session-count').textContent = visibleCount;
  document.querySelector('#hero-session-count').textContent = sessions.length;
  document.querySelectorAll('.filter-chip').forEach((chip) => {
    const category = chip.dataset.filter;
    const count = category === 'all' ? sessions.length : sessions.filter((session) => session.category === category).length;
    chip.querySelector('span').textContent = count;
  });
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = '';
}

function openModal() {
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  modal.querySelector('input[name="name"]').focus();
}

function updateClock() {
  const now = new Date();
  document.querySelector('#current-time').textContent = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles', hour: 'numeric', minute: '2-digit',
  }).format(now);
}

function switchView(view) {
  const labels = { overview: 'Overview', schedule: 'Schedule', programs: 'Programs', facilities: 'Facilities', members: 'Members' };
  const label = labels[view] || 'Overview';
  document.querySelector('#breadcrumb-current').textContent = label;
  document.querySelectorAll('.nav-link').forEach((link) => link.classList.toggle('active', link.dataset.view === view));
  if (view === 'overview') {
    document.querySelector('#page-title').innerHTML = 'Good morning, Morgan <span class="wave" aria-hidden="true">✳</span>';
    document.querySelector('#page-subtitle').textContent = 'Here’s what’s happening at the rink today.';
    document.querySelector('#schedule-panel').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } else if (view === 'schedule') {
    document.querySelector('#page-title').textContent = 'Today’s schedule';
    document.querySelector('#page-subtitle').textContent = `${sessions.length} sessions across Sheet A and Sheet B.`;
    document.querySelector('#schedule-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    document.querySelector('#page-title').textContent = label;
    const detail = {
      programs: 'Manage hockey, public skate, and learn-to-skate sessions.',
      facilities: 'Track ice readiness and keep daily maintenance on schedule.',
      members: 'Northline Arena member and attendance overview.',
    }[view];
    document.querySelector('#page-subtitle').textContent = detail;
    if (view === 'facilities') document.querySelector('#tasks-panel').scrollIntoView({ behavior: 'smooth', block: 'center' });
    else showToast(`${label} workspace selected`);
  }
  document.querySelector('#sidebar').classList.remove('open');
}

document.querySelectorAll('[data-filter]').forEach((chip) => {
  chip.addEventListener('click', () => {
    activeFilter = chip.dataset.filter;
    document.querySelectorAll('.filter-chip').forEach((item) => item.classList.toggle('active', item === chip));
    renderSessions();
  });
});

document.querySelectorAll('[data-view]').forEach((link) => {
  link.addEventListener('click', () => switchView(link.dataset.view));
});

document.querySelector('#view-schedule-button').addEventListener('click', () => switchView('schedule'));
document.querySelector('#schedule-more').addEventListener('click', () => switchView('schedule'));
document.querySelector('#new-session-button').addEventListener('click', openModal);
document.querySelector('#close-modal').addEventListener('click', closeModal);
document.querySelector('#cancel-modal').addEventListener('click', closeModal);
modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !modal.hidden) closeModal(); });

document.querySelector('#session-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const [hours, minutes] = data.get('time').split(':').map(Number);
  const duration = Number(data.get('duration'));
  const endMinutes = hours * 60 + minutes + duration;
  const endHours = Math.floor(endMinutes / 60) % 24;
  const category = data.get('category');
  const formatTime = (hour, minute) => `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
  const startHour = hours % 12 || 12;
  const startTime = `${startHour}:${String(minutes).padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`;
  sessions.push({
    time: startTime,
    end: formatTime(endHours, endMinutes % 60),
    name: data.get('name').trim(),
    category,
    sheet: data.get('sheet'),
    attendance: `0 / ${data.get('capacity')}`,
    status: 'Upcoming',
  });
  sessions.sort((first, second) => {
    const toMinutes = (time) => { const [clock, period] = time.split(' '); let [hour, minute] = clock.split(':').map(Number); if (period === 'PM' && hour !== 12) hour += 12; if (period === 'AM' && hour === 12) hour = 0; return hour * 60 + minute; };
    return toMinutes(first.time) - toMinutes(second.time);
  });
  activeFilter = 'all';
  document.querySelectorAll('.filter-chip').forEach((chip) => chip.classList.toggle('active', chip.dataset.filter === 'all'));
  renderSessions();
  closeModal();
  event.currentTarget.reset();
  showToast('Session added to today’s schedule.');
});

document.querySelectorAll('.task-item input').forEach((checkbox) => {
  checkbox.addEventListener('change', () => {
    const remaining = [...document.querySelectorAll('.task-item input')].filter((input) => !input.checked).length;
    document.querySelector('#open-task-count').textContent = remaining;
    document.querySelector('#task-heading-count').textContent = remaining;
    document.querySelector('#task-complete').hidden = remaining !== 0;
    if (checkbox.checked) showToast('Task marked complete.');
  });
});

document.querySelector('#notification-button').addEventListener('click', () => showToast('You’re all caught up on notifications.'));
document.querySelector('#support-button').addEventListener('click', () => showToast('Support request started. We’ll be in touch shortly.'));
document.querySelector('#profile-button').addEventListener('click', () => showToast('Signed in as Morgan Chen.'));
document.querySelector('.top-avatar').addEventListener('click', () => showToast('Signed in as Morgan Chen.'));
document.querySelector('#mobile-menu').addEventListener('click', () => document.querySelector('#sidebar').classList.toggle('open'));

const today = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());
document.querySelector('#today-label').textContent = today.toUpperCase();
updateClock();
setInterval(updateClock, 30_000);
renderSessions();
