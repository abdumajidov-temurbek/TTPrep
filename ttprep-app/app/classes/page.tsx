import AppShell from '@/components/AppShell';

export default function ClassesPage() {
  return (
    <AppShell>
      <div className="min-h-screen bg-slate-50 p-5 lg:p-8">
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 lg:p-10">
          <h1 className="text-2xl font-semibold text-slate-900">Classes</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            This route is wired and ready. You can add class schedules, assignments, and teacher views here next.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
