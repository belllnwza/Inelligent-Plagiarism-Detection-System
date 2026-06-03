# Intelligent Plagiarism Detection System

ระบบตรวจจับการคัดลอกผลงานอัจฉริยะ (Intelligent Plagiarism Detection System) พัฒนาขึ้นเพื่อเป็นเครื่องมือในการตรวจสอบและวิเคราะห์ความคล้ายคลึงของเนื้อหาในเอกสารเชิงวิชาการ โดยประยุกต์ใช้เทคนิคการประมวลผลภาษาธรรมชาติ (Natural Language Processing: NLP) เพื่อตรวจวัดความคล้ายคลึงเชิงความหมาย (Semantic Similarity) ช่วยเพิ่มประสิทธิภาพและความถูกต้องแม่นยำในการตรวจสอบการคัดลอกผลงาน

---

## คุณสมบัติของระบบ (Key Features)

* Multi-Document Verification: รองรับการเปรียบเทียบและตรวจสอบเอกสารต้นทาง เทียบกับคลังเอกสารอ้างอิงคราวละ 20 ไฟล์พร้อมกันในคำสั่งเดียว (One-to-Many Comparison)
* Semantic Similarity Analysis: วิเคราะห์ความคล้ายคลึงโดยคำนึงถึงบริบทและความหมายของข้อความด้วยเทคนิค NLP ไม่จำกัดเพียงแค่การจับคู่คำพ้อง (Keyword Matching)
* Automated Scoring: ประมวลผลและคำนวณคะแนนความคล้ายคลึง (Similarity Score) สรุปออกมาในรูปแบบรายงานที่เข้าใจง่าย

## เทคโนโลยีที่เลือกใช้ (Tech Stack)

* Core Language: Python 3.x
* Frontend: HTML5, CSS3, JavaScript (Vanilla JS)
* NLP & Data Processing: Python AI/NLP Libraries

## โครงสร้างของโปรเจกต์ (Project Structure)

```text
├── CSS/                # โฟลเดอร์เก็บไฟล์สไตล์ชีทสำหรับหน้าต่าง ๆ (style1-4.css)
├── HTML/               # โฟลเดอร์เก็บไฟล์หน้าเว็บระบบ (Login, Signup, Result, Main)
├── Img/                # โฟลเดอร์สำหรับจัดเก็บไฟล์รูปภาพที่ใช้ในระบบ
├── JS/                 # โฟลเดอร์เก็บไฟล์สคริปต์ควบคุมการทำงานฝั่ง Frontend (script1-4.js)
├── ai_engine.py        # โมดูลประมวลผลหลักและการทำงานของระบบ AI / NLP
├── main.py             # ไฟล์หลักสำหรับการเริ่มต้นทำงานของระบบ (Entry Point)
├── run_server.bat      # สคริปต์ไฟล์สำหรับกดรันเซิร์ฟเวอร์แบบอัตโนมัติ
├── training_data.json  # ไฟล์ฐานข้อมูลรูปแบบ JSON สำหรับใช้เทรนหรือเก็บข้อมูลระบบ
├── upload_data.py      # สคริปต์สำหรับจัดการระบบอัปโหลดเอกสารเข้าสู่ระบบ
└── .gitignore          # ไฟล์สำหรับกำหนดระบุไฟล์/โฟลเดอร์ที่ไม่ต้องการนำขึ้น GitHub
