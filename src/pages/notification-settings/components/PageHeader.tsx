
interface PageHeaderProps {
  title: string;
}

export const PageHeader = ({ title }: PageHeaderProps) => {
  return (
    <div className="mb-6">
      <div className="flex items-center mb-2">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{title}</h1>
      </div>
    </div>
  );
};
