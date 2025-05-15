
interface PageHeaderProps {
  title: string;
}

export const PageHeader = ({ title }: PageHeaderProps) => {
  return (
    <h1 className="text-2xl font-semibold text-emerald-800 mb-4">{title}</h1>
  );
};
