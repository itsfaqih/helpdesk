import { cn } from "@/libs/cn.lib";

type AppPageTitleProps = {
  title: string;
  actions?: React.ReactNode;
  className?: string;
};

export function AppPageTitle({ title, actions, className }: AppPageTitleProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      {actions && <div className="ml-auto">{actions}</div>}
    </div>
  );
}
