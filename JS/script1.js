const API_BASE = 'http://localhost:8080';
let isThai = false;

async function handleLogin() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!username || !password) {
    showMessage(isThai ? 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' : 'Please fill in username and password.', 'error');
    return;
  }

  const btn = document.getElementById('login-btn');
  btn.disabled = true;
  btn.textContent = isThai ? 'กำลังตรวจสอบ...' : 'Checking...';

  try {
    const response = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();

    if (data.status === 'success') {
      localStorage.setItem('username', data.username);
      showMessage(isThai ? 'เข้าสู่ระบบสำเร็จ!' : 'Login successful!', 'success');
      setTimeout(() => { window.location.href = 'main2.html'; }, 800);
    } else {
      showMessage(data.message || (isThai ? 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' : 'Invalid username or password.'), 'error');
    }
  } catch (err) {
    showMessage(isThai ? 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้' : 'Cannot connect to server. Is it running?', 'error');
  }

  btn.disabled = false;
  btn.textContent = isThai ? 'เข้าสู่ระบบ' : 'LOG-IN';
}

function showMessage(msg, type) {
  let el = document.getElementById('auth-message');
  if (!el) {
    el = document.createElement('div');
    el.id = 'auth-message';
    el.style.cssText = 'margin-top:12px;padding:10px 14px;border-radius:8px;font-size:14px;font-weight:bold;text-align:center;transition:opacity 0.3s;';
    document.querySelector('.login-box').appendChild(el);
  }
  el.textContent = msg;
  el.style.backgroundColor = type === 'success' ? '#d1fae5' : '#fee2e2';
  el.style.color = type === 'success' ? '#065f46' : '#991b1b';
  el.style.opacity = '1';
}

function togglePassword() {
  const input = document.getElementById("password");
  const eye = document.getElementById("eyeIcon");
  if (input.type === "password") {
    input.type = "text";
    eye.innerHTML = `<circle cx="12" cy="12" r="3"/><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>`;
  } else {
    input.type = "password";
    eye.innerHTML = `<circle cx="12" cy="12" r="3"/><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><line x1="1" y1="1" x2="23" y2="23"/>`;
  }
}

function toggleLanguage() {
  isThai = !isThai;
  if (isThai) {
    document.getElementById('login-title').textContent = 'เข้าสู่ระบบ';
    document.getElementById('username').placeholder = 'กรอกชื่อผู้ใช้';
    document.getElementById('password').placeholder = 'กรอกรหัสผ่าน';
    document.getElementById('forgot-text').textContent = 'ลืมรหัสผ่าน?';
    document.getElementById('login-btn').textContent = 'เข้าสู่ระบบ';
    document.getElementById('signup-link').textContent = 'ยังไม่มีบัญชี? ลงทะเบียน';
  } else {
    document.getElementById('login-title').textContent = 'LOG-IN';
    document.getElementById('username').placeholder = 'Enter your name...';
    document.getElementById('password').placeholder = 'Enter your password...';
    document.getElementById('forgot-text').textContent = 'forgot your password';
    document.getElementById('login-btn').textContent = 'LOG-IN';
    document.getElementById('signup-link').textContent = "Don't have an account? Sign Up";
  }
}

// Nav buttons animation
document.querySelectorAll('.nav-buttons button').forEach(button => {
  button.addEventListener('click', () => {
    button.style.transform = 'scale(0.95)';
    setTimeout(() => button.style.transform = 'scale(1)', 150);
  });
});

// Forgot password → go to forgot.html
document.getElementById('forgot-text').addEventListener('click', (e) => {
  e.preventDefault();
  window.location.href = 'forgot.html';
});

// Change profile from backend
function changeProfile(src) {
  const avatar = document.getElementById('profile-avatar');
  const img = document.getElementById('profile-img');
  if (src) {
    img.src = src;
    avatar.classList.add('has-image');
  } else {
    img.src = '';
    avatar.classList.remove('has-image');
  }
}