const API_BASE = 'http://localhost:8080';
let isThai = false;

async function handleReset() {
  const username = document.getElementById('username').value.trim();
  const newPassword = document.getElementById('new-password').value.trim();
  const confirm = document.getElementById('confirm-password').value.trim();

  if (!username || !newPassword || !confirm) {
    showMessage(isThai ? 'กรุณากรอกข้อมูลให้ครบ' : 'Please fill in all fields.', 'error');
    return;
  }

  if (newPassword !== confirm) {
    showMessage(isThai ? 'รหัสผ่านใหม่ไม่ตรงกัน' : 'New passwords do not match.', 'error');
    return;
  }

  if (newPassword.length < 4) {
    showMessage(isThai ? 'รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร' : 'Password must be at least 4 characters.', 'error');
    return;
  }

  const btn = document.getElementById('reset-btn');
  btn.disabled = true;
  btn.textContent = isThai ? 'กำลังรีเซ็ต...' : 'Resetting...';

  try {
    const response = await fetch(`${API_BASE}/api/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, new_password: newPassword })
    });
    const data = await response.json();

    if (data.status === 'success') {
      showMessage(isThai ? 'รีเซ็ตรหัสผ่านสำเร็จ! กำลังไปหน้า Login...' : 'Password reset successful! Redirecting to Login...', 'success');
      setTimeout(() => { window.location.href = 'login1.html'; }, 1500);
    } else {
      showMessage(data.message || (isThai ? 'ไม่พบชื่อผู้ใช้นี้ในระบบ' : 'Username not found in the system.'), 'error');
    }
  } catch (err) {
    showMessage(isThai ? 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้' : 'Cannot connect to server. Is it running?', 'error');
  }

  btn.disabled = false;
  btn.textContent = isThai ? 'รีเซ็ตรหัสผ่าน' : 'RESET PASSWORD';
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
    document.getElementById('forgot-title').textContent = 'รีเซ็ตรหัสผ่าน';
    document.getElementById('username').placeholder = 'กรอกชื่อผู้ใช้';
    document.getElementById('new-password').placeholder = 'กรอกรหัสผ่านใหม่';
    document.getElementById('confirm-password').placeholder = 'ยืนยันรหัสผ่านใหม่';
    document.getElementById('reset-btn').textContent = 'รีเซ็ตรหัสผ่าน';
    document.getElementById('back-login').textContent = 'กลับไปหน้า Login';
  } else {
    document.getElementById('forgot-title').textContent = 'RESET PASSWORD';
    document.getElementById('username').placeholder = 'Enter your username...';
    document.getElementById('new-password').placeholder = 'Enter new password...';
    document.getElementById('confirm-password').placeholder = 'Confirm new password...';
    document.getElementById('reset-btn').textContent = 'RESET PASSWORD';
    document.getElementById('back-login').textContent = 'Back to Log In';
  }
}

// Nav buttons animation
document.querySelectorAll('.nav-buttons button').forEach(button => {
  button.addEventListener('click', () => {
    button.style.transform = 'scale(0.95)';
    setTimeout(() => button.style.transform = 'scale(1)', 150);
  });
});
