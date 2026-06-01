const API_BASE = 'http://localhost:8080';
let isThai = false;

async function handleSignup() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const confirm = document.getElementById('confirm-password').value.trim();

  if (!username || !password || !confirm) {
    showMessage(isThai ? 'กรุณากรอกข้อมูลให้ครบ' : 'Please fill in all fields.', 'error');
    return;
  }

  if (password !== confirm) {
    showMessage(isThai ? 'รหัสผ่านไม่ตรงกัน' : 'Passwords do not match.', 'error');
    return;
  }

  if (password.length < 4) {
    showMessage(isThai ? 'รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร' : 'Password must be at least 4 characters.', 'error');
    return;
  }

  const btn = document.getElementById('signup-btn');
  btn.disabled = true;
  btn.textContent = isThai ? 'กำลังลงทะเบียน...' : 'Registering...';

  try {
    const response = await fetch(`${API_BASE}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();

    if (data.status === 'success') {
      showMessage(isThai ? 'ลงทะเบียนสำเร็จ! กำลังไปหน้า Login...' : 'Registration successful! Redirecting to Login...', 'success');
      setTimeout(() => { window.location.href = 'login1.html'; }, 1500);
    } else {
      showMessage(data.message || (isThai ? 'เกิดข้อผิดพลาด' : 'Registration failed.'), 'error');
    }
  } catch (err) {
    showMessage(isThai ? 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้' : 'Cannot connect to server. Is it running?', 'error');
  }

  btn.disabled = false;
  btn.textContent = isThai ? 'ลงทะเบียน' : 'SIGN UP';
}

function showMessage(msg, type) {
  let el = document.getElementById('auth-message');
  if (!el) {
    el = document.createElement('div');
    el.id = 'auth-message';
    el.style.cssText = 'margin-top:12px;padding:10px 14px;border-radius:8px;font-size:14px;font-weight:bold;text-align:center;';
    document.querySelector('.login-box').appendChild(el);
  }
  el.textContent = msg;
  el.style.backgroundColor = type === 'success' ? '#d1fae5' : '#fee2e2';
  el.style.color = type === 'success' ? '#065f46' : '#991b1b';
}


function toggleLanguage() {
  isThai = !isThai;
  if (isThai) {
    document.getElementById('signup-title').textContent = 'ลงทะเบียน';
    document.getElementById('username').placeholder = 'กรอกชื่อผู้ใช้';
    document.getElementById('password').placeholder = 'กรอกรหัสผ่าน';
    document.getElementById('confirm-password').placeholder = 'ยืนยันรหัสผ่าน';
    document.getElementById('signup-btn').textContent = 'ลงทะเบียน';
    document.getElementById('login-link').textContent = 'เข้าสู่ระบบ';
  } else {
    document.getElementById('signup-title').textContent = 'SIGN UP';
    document.getElementById('username').placeholder = 'Enter your name...';
    document.getElementById('password').placeholder = 'Enter your password...';
    document.getElementById('confirm-password').placeholder = 'Confirm your password...';
    document.getElementById('signup-btn').textContent = 'SIGN UP';
    document.getElementById('login-link').textContent = 'Log In';
  }
}

// Nav buttons animation
document.querySelectorAll('.nav-buttons button').forEach(button => {
  button.addEventListener('click', () => {
    button.style.transform = 'scale(0.95)';
    setTimeout(() => button.style.transform = 'scale(1)', 150);
  });
});
