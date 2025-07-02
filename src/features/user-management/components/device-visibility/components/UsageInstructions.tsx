export function UsageInstructions() {
  return (
    <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
      <p className="font-medium mb-1">📋 วิธีการใช้งาน:</p>
      <ul className="space-y-1 list-disc list-inside">
        <li>ใส่รหัสอุปกรณ์ที่ต้องการซ่อนจากการแสดงผลสำหรับ Admin</li>
        <li>อุปกรณ์ที่ซ่อนจะไม่แสดงในหน้ารายการอุปกรณ์สำหรับบัญชี Admin</li>
        <li>การตั้งค่านี้ใช้ได้เฉพาะบัญชี Super Admin เท่านั้น</li>
        <li>สามารถเอาอุปกรณ์กลับมาแสดงได้โดยกดปุ่ม X</li>
      </ul>
    </div>
  );
}