import PageContainer from '@/components/layout/PageContainer';

export function RoutePlaceholder({ title }: { title: string }) {
  return (
    <PageContainer>
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <p className="text-muted-foreground">
        This route is registered for the Rsbuild + React Router migration and will be wired to the existing page implementation in the next steps.
      </p>
    </PageContainer>
  );
}
