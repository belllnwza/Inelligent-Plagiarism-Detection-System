let isThai = false;
const langBtn = document.getElementById('lang-btn');
const historyTitle = document.getElementById('history-title');

// Navigation buttons
document.querySelector('.home-btn').addEventListener('click', () => {
  window.location.href = 'main2.html';
});

document.querySelector('.desc-btn').addEventListener('click', () => {
  document.querySelector('.description-section').scrollIntoView({ behavior: 'smooth' });
});

document.querySelector('.logout-btn').addEventListener('click', () => {
  localStorage.removeItem('username');
  window.location.href = 'login1.html';
});

// Update status text with logged-in user
const username = localStorage.getItem('username') || 'Teacher';
const statusTextEl = document.querySelector('.status-text');
statusTextEl.textContent = `User: ${username} | Viewing results...`;
statusTextEl.style.cursor = 'pointer';
statusTextEl.addEventListener('click', () => {
  window.location.href = 'profile3.html';
});

// Language toggle
langBtn.addEventListener('click', () => {
  isThai = !isThai;

  historyTitle.textContent = isThai ? "สรุปผลการตรวจคำตอบ..." : "Result Summation...";
  document.getElementById('desc-title').textContent = isThai ? "คำอธิบาย" : "Description";

  document.querySelectorAll('#desc-list li').forEach(li => {
    const span = li.querySelector('span.accuracy');
    if (span) {
      if (span.classList.contains('high')) {
        span.textContent = isThai ? "เขียว" : "Green";
        li.childNodes[0].nodeValue = " ";
        li.lastChild.nodeValue = isThai ? " หมายถึงความเหมือนต่ำกว่า 50%" : " indicates similarity of 49% or lower.";
      }
      else if (span.classList.contains('medium')) {
        span.textContent = isThai ? "เหลือง" : "Yellow";
        li.childNodes[0].nodeValue = " ";
        li.lastChild.nodeValue = isThai ? " หมายถึงความเหมือน 50%-79%" : " indicates similarity between 50%-79%.";
      }
      else if (span.classList.contains('low')) {
        span.textContent = isThai ? "แดง" : "Red";
        li.childNodes[0].nodeValue = " ";
        li.lastChild.nodeValue = isThai ? " หมายถึงความเหมือน 80% ขึ้นไป" : " indicates similarity of 80% or higher.";
      }
    }
    else {
      li.childNodes.forEach(node => {
        if (node.nodeType === 3) node.nodeValue = li.dataset[isThai ? 'th' : 'en'];
      });
    }
  });

  // Re-render items to update labels in correct language
  renderResults();
});

// Load results from localStorage
function renderResults() {
  const resultsData = JSON.parse(localStorage.getItem('check_results')) || [];
  const comparedWith = localStorage.getItem('compared_with') || '';

  const list = document.getElementById('history-list');
  list.innerHTML = ''; // Clear list

  if (resultsData.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.style.padding = '20px';
    emptyMsg.style.textAlign = 'center';
    emptyMsg.style.color = '#7f8c8d';
    emptyMsg.textContent = isThai ? "ไม่พบข้อมูลผลลัพธ์การคำนวณ" : "No result data found. Please run the inspection first.";
    list.appendChild(emptyMsg);
    return;
  }

  // Display master compared file
  const titleInfo = document.createElement('div');
  titleInfo.style.margin = '0 0 15px 10px';
  titleInfo.style.fontSize = '15px';
  titleInfo.style.color = '#6b7280';
  titleInfo.style.fontWeight = '500';
  titleInfo.textContent = isThai ? `เปรียบเทียบกับคำตอบหลัก: ${comparedWith}` : `Compared with Correct Answer: ${comparedWith}`;
  list.appendChild(titleInfo);

  resultsData.forEach(file => {
    const item = document.createElement('div');
    item.className = "history-item";

    item.addEventListener('click', () => {
      document.querySelectorAll('.history-item').forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
    });

    const info = document.createElement('div');
    info.className = "file-info";

    const icon = document.createElement('div');
    icon.className = "file-icon";
    icon.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8e44ad" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>`;

    const nameContainer = document.createElement('div');
    nameContainer.className = "file-name-container";
    nameContainer.style.display = 'flex';
    nameContainer.style.flexDirection = 'column';
    nameContainer.style.gap = '4px';

    const name = document.createElement('div');
    name.className = "file-name";
    name.textContent = file.student_file;
    nameContainer.appendChild(name);

    info.appendChild(icon);
    info.appendChild(nameContainer);

    const acc = document.createElement('div');
    acc.className = "accuracy";

    // Set score class based on similarity_percent:
    // >= 80% similarity -> RED ('low')
    // 50% - 79.99% similarity -> YELLOW ('medium')
    // < 50% similarity -> GREEN ('high')
    const percent = file.similarity_percent;
    if (percent >= 80) {
      acc.classList.add("low");
    } else if (percent >= 50) {
      acc.classList.add("medium");
    } else {
      acc.classList.add("high");
    }
    
    acc.textContent = percent + "%";

    item.appendChild(info);
    item.appendChild(acc);
    list.appendChild(item);
  });
}

// Initial render
renderResults();