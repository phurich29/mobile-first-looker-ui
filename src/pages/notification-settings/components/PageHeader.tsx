
interface PageHeaderProps {
  title: string;
}

export const PageHeader = ({ title }: PageHeaderProps) => {
  return (
    <div className="mb-6">
      <div className="flex items-center mb-2">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{title}</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        ระบบแจ้งเตือนส่วนตัว - จะแจ้งเตือนเฉพาะเมื่อคุณตั้งค่าไว้และค่าเกินเกณฑ์ที่กำหนด
      </p>
    </div>
  );
};
