let isThai = false;
const langBtn = document.getElementById('lang-btn');
const correctFileText = document.getElementById('correct-file-text');
const calculateBtn = document.getElementById('calculate-btn');
const landingTitle = document.getElementById('landing-title');
const correctUploadBtn = document.getElementById('correct-answer-upload-btn');
const masterFileInput = document.getElementById('master-file-input');
const studentFileInput = document.getElementById('student-files-input');
const historyList = document.getElementById('history-list');
const uploadedCount = document.getElementById('uploaded-count');
const fileWarning = document.getElementById('file-warning');
const studentAnswersUploadBtn = document.getElementById('student-answers-upload-btn');
const uploadPlaceholder = document.getElementById('upload-placeholder');
const answerListFooter = document.getElementById('answer-list-footer');
const footerCountText = document.getElementById('footer-count-text');

let selectedMasterFile = null;
let selectedStudentFiles = [];

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
statusTextEl.textContent = `User: ${username} | Ready to inspect work...`;
statusTextEl.style.cursor = 'pointer';
statusTextEl.addEventListener('click', () => {
  window.location.href = 'profile3.html';
});

// Language toggle
langBtn.addEventListener('click', () => {
  isThai = !isThai;

  document.getElementById('desc-title').textContent = isThai ? "คำอธิบาย" : "Description";

  if (selectedMasterFile) {
    correctFileText.textContent = selectedMasterFile.name;
  } else {
    correctFileText.textContent = isThai ? "ใส่ไฟล์คำตอบที่ถูกต้อง..." : "Put the correct answer file here...";
  }

  // Update headers
  const correctTitleText = document.getElementById('correct-title-text');
  const studentTitleText = document.getElementById('student-title-text');
  if (correctTitleText) correctTitleText.textContent = isThai ? "คำตอบที่ถูกต้อง" : "Correct Answer";
  if (studentTitleText) studentTitleText.textContent = isThai ? "คำตอบที่ต้องการตรวจ" : "Answer to Check";

  // Update placeholder and footer text
  const placeholderText = document.getElementById('placeholder-text');
  if (placeholderText) {
    placeholderText.textContent = isThai ? "ใส่ไฟล์คำตอบที่นี่..." : "Put the answer file here...";
  }
  const footerHintText = document.getElementById('footer-hint-text');
  if (footerHintText) {
    footerHintText.textContent = isThai ? "ใส่ไฟล์คำตอบที่นี่..." : "Put the answer file here...";
  }

  calculateBtn.textContent = isThai ? "คำนวณคำตอบ" : "Calculate the Answer";
  landingTitle.textContent = isThai ? "หน้าแรก" : "Landing Page";

  document.querySelectorAll('#desc-list li').forEach(li => {
    const span = li.querySelector('span.accuracy');
    if (span) {
      if (span.classList.contains('high')) span.textContent = isThai ? "เขียว" : "Green";
      else if (span.classList.contains('medium')) span.textContent = isThai ? "เหลือง" : "Yellow";
      else if (span.classList.contains('low')) span.textContent = isThai ? "แดง" : "Red";
      li.childNodes.forEach(node => { if (node.nodeType === 3) node.nodeValue = ""; });
      li.lastChild.nodeValue = isThai ?
        li.dataset.th.split(" ")[1] : li.dataset.en.split(" ")[1];
    } else {
      li.childNodes.forEach(node => { if (node.nodeType === 3) node.nodeValue = li.dataset[isThai ? 'th' : 'en']; });
    }
  });
});

// Upload correct answer file click handler
correctUploadBtn.addEventListener('click', () => {
  masterFileInput.click();
});

masterFileInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    selectedMasterFile = e.target.files[0];
    correctFileText.textContent = selectedMasterFile.name;
    correctFileText.style.fontWeight = 'bold';
    fileWarning.textContent = isThai ? "อัปโหลดคีย์คำตอบเรียบร้อยแล้ว" : "Answer key file uploaded successfully";
    fileWarning.style.color = '#27ae60';
  }
});

// Make the student list container clickable to upload student files
studentAnswersUploadBtn.addEventListener('click', (e) => {
  // If clicking on an item, let the selection toggle. Otherwise trigger file selection
  if (e.target.closest('.file-item')) {
    const item = e.target.closest('.file-item');
    document.querySelectorAll('.file-item').forEach(i => i.classList.remove('selected'));
    item.classList.add('selected');
  } else {
    studentFileInput.click();
  }
});

studentFileInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    selectedStudentFiles = Array.from(e.target.files).slice(0, 10);
    renderSelectedFiles();
  }
});

// Render student files in list
function renderSelectedFiles() {
  // Clear all non-template items
  const items = historyList.querySelectorAll('.file-item:not(.template)');
  items.forEach(item => item.remove());

  if (selectedStudentFiles.length > 0) {
    uploadPlaceholder.style.display = 'none';
    historyList.style.display = 'flex';
    answerListFooter.style.display = 'flex';
    studentAnswersUploadBtn.style.borderStyle = 'solid';
  } else {
    uploadPlaceholder.style.display = 'flex';
    historyList.style.display = 'none';
    answerListFooter.style.display = 'none';
    studentAnswersUploadBtn.style.borderStyle = 'dashed';
  }

  const templateItem = document.querySelector('.file-item.template');
  const today = new Date().toLocaleDateString();

  selectedStudentFiles.forEach(file => {
    const item = templateItem.cloneNode(true);
    item.style.display = "flex";
    item.classList.remove('template');
    item.querySelector('.file-name').textContent = file.name;
    item.querySelector('.file-date').textContent = today;

    item.addEventListener('click', (e) => {
      e.stopPropagation(); // Stop trigger upload click on container
      document.querySelectorAll('.file-item').forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
    });

    historyList.appendChild(item);
  });

  const countText = `${selectedStudentFiles.length}/10 files`;
  uploadedCount.textContent = countText;
  footerCountText.textContent = countText;
}

// Calculate and call Backend API
calculateBtn.addEventListener('click', async () => {
  if (!selectedMasterFile) {
    alert(isThai ? 'กรุณาอัปโหลดไฟล์คำตอบที่ถูกต้อง (Master File) ก่อน' : 'Please upload the correct answer file (Master File) first');
    return;
  }
  if (selectedStudentFiles.length === 0) {
    alert(isThai ? 'กรุณาอัปโหลดไฟล์คำตอบของนักเรียนอย่างน้อย 1 ไฟล์' : 'Please upload at least one student answer file');
    return;
  }

  const statusText = document.querySelector('.status-text');
  statusText.textContent = isThai ? "กำลังคำนวณผลลัพธ์ด้วย Machine Learning..." : "Calculating results using Machine Learning...";

  const formData = new FormData();
  formData.append('master_file', selectedMasterFile);
  selectedStudentFiles.forEach(file => {
    formData.append('other_files', file);
  });

  try {
    // API call to FastAPI running locally (relative url or absolute http://localhost:8000 depending on environment)
    const response = await fetch('/check-students', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.status === 'success') {
      // Save results to localStorage to load on result4.html
      localStorage.setItem('check_results', JSON.stringify(data.results));
      localStorage.setItem('compared_with', data.compared_with);

      // Redirect to results page
      window.location.href = 'result4.html';
    } else {
      alert(isThai ? `เกิดข้อผิดพลาด: ${data.message}` : `Error: ${data.message}`);
    }
  } catch (error) {
    console.error('Calculation error:', error);
    alert(isThai ? 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ Backend ได้' : 'Failed to connect to the Backend server.');
  } finally {
    statusText.textContent = `User: ${username} | Ready to inspect work...`;
  }
});