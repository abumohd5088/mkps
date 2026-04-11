const API = '/api';
const authMsg = document.getElementById('authMsg');

function show(msg, ok = true) {
  authMsg.textContent = msg;
  authMsg.style.color = ok ? 'green' : 'crimson';
}

async function request(url, method, body) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const data = await request(`${API}/auth/login`, 'POST', {
      role: loginRole.value,
      email: loginEmail.value,
      password: loginPassword.value,
    });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    show('Login successful! Redirecting...');
    window.location.href = '/pages/dashboard.html';
  } catch (error) {
    show(error.message, false);
  }
});

document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const data = await request(`${API}/auth/signup`, 'POST', {
      name: signupName.value,
      email: signupEmail.value,
      password: signupPassword.value,
      role: signupRole.value,
      className: signupClass.value,
      subjects: signupSubjects.value ? signupSubjects.value.split(',').map((x) => x.trim()) : [],
    });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    show('Signup successful! Redirecting...');
    window.location.href = '/pages/dashboard.html';
  } catch (error) {
    show(error.message, false);
  }
});

document.getElementById('resetForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const data = await request(`${API}/auth/reset-password`, 'POST', {
      email: resetEmail.value,
      newPassword: resetPassword.value,
    });
    show(data.message);
  } catch (error) {
    show(error.message, false);
  }
});
