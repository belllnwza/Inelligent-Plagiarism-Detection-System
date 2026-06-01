const API_BASE = 'http://localhost:8080';
// ---------------- Language toggle ----------------
let isThai = false;
const historyLabels = { en: "History...", th: "ประวัติการตรวจสอบ..." };
const historyTitle = document.getElementById('history-title');

// Navigation buttons
document.querySelector('.home-btn').addEventListener('click', () => {
  window.location.href = 'main2.html';
});

document.querySelector('.desc-btn').addEventListener('click', () => {
  // If description section is on another page, redirect to main2.html description
  window.location.href = 'main2.html#desc-title';
});

document.querySelector('.logout-btn').addEventListener('click', () => {
  localStorage.removeItem('username');
  localStorage.removeItem('check_results');
  localStorage.removeItem('compared_with');
  window.location.href = 'login1.html';
});

// Update status text with logged-in user
const username = localStorage.getItem('username') || 'Teacher';
document.querySelector('.status-text').textContent = `User: ${username} | Profile History`;
document.getElementById('profile-name').textContent = username;

function toggleLanguage() {
  isThai = !isThai;
  historyTitle.textContent = isThai ? historyLabels.th : historyLabels.en;
  fetchAndRenderHistory();
}


// ---------------- Render history from backend ----------------
async function fetchAndRenderHistory() {
  const list = document.getElementById('history-list');
  const template = document.querySelector('.history-item.template');
  
  // Clear non-template items
  list.querySelectorAll('.history-item:not(.template)').forEach(e => e.remove());

  try {
    const response = await fetch(`${API_BASE}/api/history?username=${encodeURIComponent(username)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const dataArray = await response.json();
    
    if (dataArray.length === 0) {
      const emptyItem = document.createElement('div');
      emptyItem.style.padding = '15px';
      emptyItem.style.textAlign = 'center';
      emptyItem.style.color = '#7f8c8d';
      emptyItem.textContent = isThai ? "ยังไม่มีประวัติการตรวจคำตอบ" : "No answer inspection history found.";
      list.appendChild(emptyItem);
      return;
    }

    dataArray.forEach(record => {
      const item = template.cloneNode(true);
      item.classList.remove('template');
      item.style.display = 'flex';
      
      // Calculate how many files checked and average matching percent
      const filesCount = record.results ? record.results.length : 0;
      const subtitle = isThai ? 
        `เทียบกับ: ${record.name} (${filesCount} ไฟล์)` : 
        `Compared with: ${record.name} (${filesCount} files)`;
        
      item.querySelector('.file-name').textContent = subtitle;
      item.querySelector('.file-date').textContent = record.date;

      // Click reaction to load this check's results in localStorage and view
      item.addEventListener('click', () => {
        if (record.results) {
          localStorage.setItem('check_results', JSON.stringify(record.results));
          localStorage.setItem('compared_with', record.name);
          window.location.href = 'result4.html';
        }
      });

      list.appendChild(item);
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    const errorItem = document.createElement('div');
    errorItem.style.padding = '15px';
    errorItem.style.textAlign = 'center';
    errorItem.style.color = '#e74c3c';
    errorItem.textContent = isThai ? "ไม่สามารถโหลดประวัติจากเซิร์ฟเวอร์ได้" : "Failed to load history from backend server.";
    list.appendChild(errorItem);
  }
}

// Initial fetch
fetchAndRenderHistory();