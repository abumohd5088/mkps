const API = '/api';
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

if (!token || !user.role) window.location.href = '/pages/auth.html';

const authHeaders = { Authorization: `Bearer ${token}` };
const userLabel = document.getElementById('userLabel');
const darkModeBtn = document.getElementById('darkModeBtn');
const logoutBtn = document.getElementById('logoutBtn');

if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark');
darkModeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});

logoutBtn.addEventListener('click', () => {
  localStorage.clear();
  window.location.href = '/pages/auth.html';
});

userLabel.textContent = `${user.name} (${user.role})`;

if (user.role !== 'teacher') document.querySelectorAll('.teacher-only').forEach((x) => x.remove());
if (!['teacher', 'admin'].includes(user.role)) document.querySelectorAll('.teacher-admin-only').forEach((x) => x.remove());
if (user.role !== 'admin') document.querySelectorAll('.admin-only').forEach((x) => x.remove());
if (user.role !== 'student') document.querySelectorAll('.student-only').forEach((x) => x.remove());

for (const btn of document.querySelectorAll('.tab-btn')) {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((tab) => tab.classList.remove('active'));
    document.getElementById(btn.dataset.tab)?.classList.add('active');
  });
}

async function api(url, options = {}) {
  const res = await fetch(`${API}${url}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...authHeaders,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed request');
  return data;
}

async function loadOverview() {
  const box = document.getElementById('analyticsCards');
  if (user.role === 'admin') {
    const an = await api('/analytics');
    box.innerHTML = Object.entries(an).map(([k, v]) => `<div class="card"><h3>${k}</h3><p>${v}</p></div>`).join('');
  } else {
    box.innerHTML = `<div class="card"><h3>Welcome</h3><p>Use the menu to manage your activities.</p></div>`;
  }
}

async function loadMarks() {
  const marks = await api('/marks');
  marksList.innerHTML = marks.map((m) => `<div class="list-item"><b>${m.subject}</b> ${m.score}/${m.total} - ${m.grade} (${m.exam})</div>`).join('') || '<p>No marks found.</p>';
}

async function loadAttendance() {
  const items = await api('/attendance');
  attendanceList.innerHTML = items.map((a) => `<div class="list-item">${a.date} | ${a.className} | <b>${a.status}</b></div>`).join('') || '<p>No attendance records.</p>';
}

async function loadAnnouncements() {
  const items = await api('/announcements');
  announcementList.innerHTML = items.map((a) => `<div class="list-item"><b>${a.title}</b><p>${a.message}</p><small>${new Date(a.createdAt).toLocaleString()}</small></div>`).join('') || '<p>No announcements.</p>';
}

async function loadAssignments() {
  const items = await api('/assignments');
  assignmentList.innerHTML = items.map((a) => `<div class="list-item"><b>${a.title}</b> (${a.subject}) <a href="${a.fileUrl}" download>Download</a></div>`).join('') || '<p>No assignments.</p>';
}

async function loadEvents() {
  const items = await api('/events');
  eventsList.innerHTML = items.map((e) => `<div class="list-item"><b>${e.eventDate}</b> - ${e.title}<p>${e.description || ''}</p></div>`).join('') || '<p>No events.</p>';
}

if (user.role === 'teacher') {
  marksForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await api('/marks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: markStudentId.value,
        subject: markSubject.value,
        exam: markExam.value,
        score: Number(markScore.value),
        total: Number(markTotal.value),
        grade: markGrade.value,
      }),
    });
    e.target.reset();
    loadMarks();
  });

  attendanceForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await api('/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: attStudentId.value,
        className: attClass.value,
        date: attDate.value,
        status: attStatus.value,
      }),
    });
    e.target.reset();
    loadAttendance();
  });

  assignmentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', asgTitle.value);
    fd.append('className', asgClass.value);
    fd.append('subject', asgSubject.value);
    fd.append('file', asgFile.files[0]);
    await api('/assignments', { method: 'POST', body: fd });
    e.target.reset();
    loadAssignments();
  });
}

if (['teacher', 'admin'].includes(user.role)) {
  announcementForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await api('/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: annTitle.value, message: annMessage.value, targetRole: annTarget.value }),
    });
    e.target.reset();
    loadAnnouncements();
  });

  eventForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await api('/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: eventTitle.value, description: eventDesc.value, eventDate: eventDate.value }),
    });
    e.target.reset();
    loadEvents();
  });
}

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  await api('/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ toUser: chatToUser.value, text: chatText.value }),
  });
  chatText.value = '';
});

loadChatBtn.addEventListener('click', async () => {
  const messages = await api(`/messages/${chatToUser.value}`);
  chatBox.innerHTML = messages.map((m) => `<div class="list-item"><b>${m.fromUser.name}:</b> ${m.text}</div>`).join('') || '<p>No messages.</p>';
});

if (user.role === 'admin') {
  classForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await api('/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: className.value, subjects: classSubjects.value.split(',').map((x) => x.trim()) }),
    });
    e.target.reset();
  });

  loadUsersBtn?.addEventListener('click', async () => {
    const [students, teachers] = await Promise.all([api('/students'), api('/teachers')]);
    const blocks = [...students, ...teachers].map((u) => `<div class="list-item">${u.name} - ${u.email} <button onclick="deleteUser('${u._id}')">Delete</button></div>`);
    usersList.innerHTML = blocks.join('') || '<p>No users found.</p>';
  });
}

window.deleteUser = async (id) => {
  await api(`/users/${id}`, { method: 'DELETE' });
  loadUsersBtn.click();
};

if (user.role === 'student') {
  downloadReportBtn?.addEventListener('click', async () => {
    const data = await api(`/report-card/${user.id}`);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'report-card.json';
    a.click();
  });
}

searchInput.addEventListener('input', async () => {
  if (!['teacher', 'admin'].includes(user.role)) return;
  const students = await api(`/students?search=${encodeURIComponent(searchInput.value)}`);
  const html = students.map((s) => `<div class="list-item">${s.name} (${s.className || '-'}) - ${s._id}</div>`).join('');
  usersList.innerHTML = html || '<p>No students matched.</p>';
});

Promise.all([loadOverview(), loadMarks(), loadAttendance(), loadAnnouncements(), loadAssignments(), loadEvents()]);
