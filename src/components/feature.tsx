import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, text, action }: { icon: LucideIcon; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed bg-card px-6 py-12 text-center">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Icon className="h-6 w-6" aria-hidden />
      </span>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function SetupNotice({ children }: { children: ReactNode }) {
  return (
    <div role="status" className="mb-6 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-foreground">
      {children}
    </div>
  );
}

export type FeatureTab = { value: string; label: string; icon: LucideIcon; emptyTitle: string; emptyText: string; action?: ReactNode; extra?: ReactNode };

export function FeatureTabs({ tabs }: { tabs: FeatureTab[] }) {
  return (
    <Tabs defaultValue={tabs[0]?.value ?? ""}>
      <TabsList className="mb-4 flex h-auto w-full flex-wrap justify-start gap-1 bg-muted p-1">
        {tabs.map((t) => (
          <TabsTrigger key={t.value} value={t.value} className="rounded-lg">{t.label}</TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((t) => (
        <TabsContent key={t.value} value={t.value} className="space-y-4">
          {t.extra}
          <EmptyState icon={t.icon} title={t.emptyTitle} text={t.emptyText} action={t.action} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
