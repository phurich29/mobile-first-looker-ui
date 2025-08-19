# ✅ Testing Checklist สำหรับระบบแจ้งเตือน

## 🧪 Pre-Development Testing

### Database Schema Testing
- [ ] ทดสอบ migration scripts ใน staging
- [ ] ตรวจสอบ RLS policies ทำงานถูกต้อง
- [ ] ทดสอบ foreign key constraints
- [ ] ตรวจสอบ index performance

```sql
-- Test RLS Policy
SET ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"test-user-1"}', true);
SELECT * FROM notification_settings; -- ควรเห็นเฉพาะของ user นี้
```

---

## 🔧 Development Phase Testing

### API Testing
- [ ] **POST /api/notification-settings**
  - [ ] บันทึกพร้อม user_id ถูกต้อง
  - [ ] ไม่สามารถบันทึกให้ user อื่นได้
  - [ ] Validation ทำงานถูกต้อง

- [ ] **GET /api/notification-settings**
  - [ ] ส่งคืนเฉพาะของ user ปัจจุบัน
  - [ ] กรอง device_code ถูกต้อง
  - [ ] Response format ถูกต้อง

```javascript
// Test API calls
const user1Settings = await getNotificationSettings(user1Id);
const user2Settings = await getNotificationSettings(user2Id);
console.assert(user1Settings !== user2Settings, 'Settings should be different');
```

### Hook Testing
- [ ] **useNotificationSettings**
  - [ ] ดึงข้อมูลเฉพาะ user ปัจจุบัน
  - [ ] บันทึกการตั้งค่าถูกต้อง
  - [ ] Loading states ทำงานดี
  - [ ] Error handling

```javascript
// Test hook behavior
const { settings, saveSettings } = useNotificationSettings();
expect(settings.every(s => s.user_id === currentUserId)).toBe(true);
```

---

## 🎛️ Component Testing

### MeasurementItem Component
- [ ] แสดง alert indicator เฉพาะเมื่อ user ปัจจุบันตั้งค่าไว้
- [ ] เล่นเสียงเฉพาะกับ user ที่ตั้งค่า
- [ ] ไม่มี memory leak จากการ subscribe

```javascript
// Test component behavior
render(<MeasurementItem data={testData} />);
expect(screen.getByTestId('alert-indicator')).toBeVisible();
// Test sound only plays for current user
```

### Notification Components
- [ ] **NotificationList**
  - [ ] แสดงเฉพาะการแจ้งเตือนของ user
  - [ ] Real-time updates ทำงาน
  - [ ] Pagination ถูกต้อง

- [ ] **NotificationHistory**
  - [ ] History แยกตาม user
  - [ ] Filter และ search ทำงาน
  - [ ] Export functionality (ถ้ามี)

---

## 🌐 Integration Testing

### Multi-User Scenarios
- [ ] **Scenario 1: Same Device, Different Users**
  ```
  1. User A ตั้งค่าแจ้งเตือนสำหรับ Device X
  2. User B ล็อกอินในอุปกรณ์เดียวกัน
  3. ข้อมูลใหม่เข้ามาทำให้เกิดเงื่อนไขแจ้งเตือน
  4. ✅ User A ได้รับการแจ้งเตือน
  5. ❌ User B ไม่ได้รับการแจ้งเตือน
  ```

- [ ] **Scenario 2: Same User, Multiple Devices**
  ```
  1. User A ตั้งค่าแจ้งเตือนหลายอุปกรณ์
  2. เกิดเงื่อนไขแจ้งเตือนในหลายอุปกรณ์พร้อมกัน
  3. ✅ User A ได้รับการแจ้งเตือนจากทุกอุปกรณ์
  4. ✅ การแจ้งเตือนไม่ซ้ำกัน
  ```

- [ ] **Scenario 3: Admin vs Regular User**
  ```
  1. Admin ตั้งค่าแจ้งเตือนสำหรับอุปกรณ์
  2. Regular User เข้าดูอุปกรณ์เดียวกัน
  3. ✅ Admin เห็นการตั้งค่าของตัวเอง
  4. ❌ Regular User ไม่เห็นการตั้งค่าของ Admin
  ```

### Edge Function Testing
- [ ] **check_notifications Function**
  - [ ] สร้างการแจ้งเตือนตาม user_id ถูกต้อง
  - [ ] ไม่มี duplicate notifications
  - [ ] Performance ยอมรับได้
  - [ ] Error handling

```javascript
// Test edge function
const result = await supabase.functions.invoke('check_notifications', {
  body: { timestamp: new Date().toISOString() }
});
expect(result.data.notificationCount).toBeGreaterThan(0);
```

---

## 🚀 Performance Testing

### Load Testing
- [ ] **Concurrent Users Test**
  - [ ] 50 users พร้อมกัน
  - [ ] Response time < 2s
  - [ ] Memory usage stable
  - [ ] No timeout errors

- [ ] **Database Performance**
  - [ ] Query execution time < 100ms
  - [ ] Index usage optimal
  - [ ] Connection pool stable

```sql
-- Monitor query performance
EXPLAIN ANALYZE SELECT * FROM notification_settings WHERE user_id = 'test-user';
```

### Memory & Resource Testing
- [ ] **Frontend Memory**
  - [ ] ไม่มี memory leak
  - [ ] Audio context cleanup
  - [ ] Event listener cleanup

- [ ] **Backend Resources**
  - [ ] Database connections ไม่ leak
  - [ ] Edge function memory usage
  - [ ] API rate limiting

---

## 🔐 Security Testing

### Access Control Testing
- [ ] **RLS Policy Validation**
  ```sql
  -- Test unauthorized access
  SET ROLE authenticated;
  SELECT set_config('request.jwt.claims', '{"sub":"malicious-user"}', true);
  
  -- Should return empty or error
  SELECT * FROM notification_settings WHERE user_id != 'malicious-user';
  ```

- [ ] **API Authorization**
  - [ ] ไม่สามารถเข้าถึงข้อมูล user อื่นได้
  - [ ] JWT validation ทำงาน
  - [ ] Rate limiting ป้องกัน abuse

### Data Validation Testing
- [ ] **Input Validation**
  - [ ] SQL injection protection
  - [ ] XSS protection
  - [ ] Data type validation

- [ ] **Business Logic Validation**
  - [ ] Threshold values reasonable
  - [ ] Device access permissions
  - [ ] User role validation

---

## 📱 Cross-Platform Testing

### Browser Testing
- [ ] **Desktop Browsers**
  - [ ] Chrome ✅
  - [ ] Firefox ✅
  - [ ] Safari ✅
  - [ ] Edge ✅

- [ ] **Mobile Browsers**
  - [ ] Mobile Chrome ✅
  - [ ] Mobile Safari ✅
  - [ ] Samsung Internet ✅

### Audio Testing
- [ ] **Sound Alerts**
  - [ ] Desktop speakers ✅
  - [ ] Mobile speakers ✅
  - [ ] Bluetooth headphones ✅
  - [ ] ไม่มีเสียงรบกวนข้าม user

---

## 🎯 User Acceptance Testing

### Test User Scenarios
- [ ] **Scenario A: Production Manager**
  ```
  ความต้องการ: ต้องการแจ้งเตือนเมื่อคุณภาพข้าวต่ำกว่าเกณฑ์
  ทดสอบ: ตั้งค่าแจ้งเตือนและตรวจสอบการทำงาน
  ผลลัพธ์: ได้รับการแจ้งเตือนตรงตามที่ตั้งค่า
  ```

- [ ] **Scenario B: Quality Control Staff**
  ```
  ความต้องการ: ต้องการเสียงแจ้งเตือนดัง
  ทดสอบ: เปิดเสียงแจ้งเตือนและทดสอบ
  ผลลัพธ์: ได้ยินเสียงชัดเจนเมื่อเกิดเงื่อนไข
  ```

- [ ] **Scenario C: Multiple Shift Workers**
  ```
  ความต้องการ: แต่ละกะมีการตั้งค่าแจ้งเตือนต่างกัน
  ทดสอบ: เปลี่ยนผู้ใช้และตรวจสอบการตั้งค่า
  ผลลัพธ์: การตั้งค่าไม่ปะปนกัน
  ```

---

## ✅ Final Verification Checklist

### Business Requirements
- [ ] User แต่ละคนมีการตั้งค่าแจ้งเตือนแยกกัน
- [ ] เสียงแจ้งเตือนไม่รบกวน user อื่น
- [ ] การแจ้งเตือนแม่นยำและเชื่อถือได้
- [ ] Performance ยอมรับได้ในการใช้งานจริง

### Technical Requirements
- [ ] Database integrity maintained
- [ ] API security implemented
- [ ] RLS policies working correctly
- [ ] Error handling comprehensive
- [ ] Monitoring and logging in place

### Documentation
- [ ] User manual updated
- [ ] API documentation complete
- [ ] Troubleshooting guide ready
- [ ] Team training completed

---

## 🚨 Critical Issues to Watch

### Red Flags
- ❌ User เห็นการตั้งค่าของ user อื่น
- ❌ เสียงแจ้งเตือนดังข้าม user
- ❌ การแจ้งเตือนไม่ตรงกับการตั้งค่า
- ❌ Performance degradation
- ❌ Database errors หรือ timeouts

### Resolution Steps
1. Stop deployment immediately
2. Investigate root cause
3. Fix in staging environment
4. Re-test thoroughly
5. Deploy fix with careful monitoring

---

## 📊 Success Metrics

### Quantitative Metrics
- **Cross-user notifications:** 0%
- **Response time:** <2 seconds
- **Uptime:** >99.9%
- **Error rate:** <0.1%

### Qualitative Metrics
- User satisfaction with notification accuracy
- Ease of use for setting up alerts
- System reliability and trust
- Overall system performance