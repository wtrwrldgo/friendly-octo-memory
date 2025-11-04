// file: components/PageHeader.tsx

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-navy-900 via-navy-700 to-primary dark:from-blue-400 dark:via-blue-300 dark:to-blue-500 bg-clip-text text-transparent mb-2">
          {title}
        </h1>
        {description && (
          <p className="text-gray-600 dark:text-gray-400 text-lg">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
