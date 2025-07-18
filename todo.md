# แผนการทำงาน

- [x] **ปรับปรุง (Refactor) `src/pages/Login.tsx`:**
    - [x] ลบฟังก์ชัน `checkAndInitializeUserRole` ที่ไม่ได้ใช้งานแล้ว
    - [x] ลบ `useEffect` ที่เรียกใช้ฟังก์ชันดังกล่าว

# สรุปการเปลี่ยนแปลง

- **`src/pages/Login.tsx`**: ลบฟังก์ชัน `checkAndInitializeUserRole` และ `useEffect` ที่เกี่ยวข้องกับการตรวจสอบและกำหนด role ของผู้ใช้ ซึ่งปัจจุบันถูกจัดการโดย trigger ของฐานข้อมูลแล้ว ทำให้โค้ดในฝั่ง client สะอาดและกระชับขึ้น
