import React, { useMemo, useState } from 'react';
import { History, Loader2, Scale, SlidersHorizontal, Trophy } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { uniquePeople, useTeamMembers, useTeamRoles } from '@/components/team/teamApi';
import { PointsRulesEditor } from './PointsRulesEditor';
import { PointsLeaderboard } from './PointsLeaderboard';
import { PointsLedger } from './PointsLedger';
import { PointsAdjustForm } from './PointsAdjustForm';
import { useLeaderboard, usePointsSettings } from './pointsApi';

/** «نظام النقاط» — rules, leaderboard (by performance index), ledger and manual adjustments. */
export const PointsSystemPanel: React.FC = () => {
  const { loading: rolesLoading, userId, roles } = useTeamRoles();
  const { members } = useTeamMembers();
  const { settings, reload: reloadSettings } = usePointsSettings();
  const board = useLeaderboard();
  const [ledgerKey, setLedgerKey] = useState(0);

  const isPrincipal = roles.includes('principal');
  const people = useMemo(() => uniquePeople(members), [members]);
  const workers = useMemo(() => people.filter((p) => p.roles.some((r) => r !== 'principal' && r !== 'supervisor')), [people]);

  const refreshAll = () => {
    board.reload();
    setLedgerKey((k) => k + 1);
  };

  if (rolesLoading) return <Loader2 className="mx-auto my-16 h-6 w-6 animate-spin text-muted-foreground" />;
  if (roles.length === 0) {
    return (
      <p className="rounded-3xl border border-border bg-card p-6 text-center text-sm text-muted-foreground" dir="rtl">
        نظام النقاط متاح لأعضاء فريق المسابقة. أضف حسابك إلى الفريق من «لوحة تحكم الموظفين».
      </p>
    );
  }

  const top = board.rows[0];

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <Trophy className="h-5 w-5 text-primary" aria-hidden /> نظام النقاط
          </h2>
          <p className="text-sm text-muted-foreground">احتساب تلقائي عند إنجاز كل مهمة، وترتيب عادل بمؤشر الأداء.</p>
        </div>
        {top && top.perf_index !== null && (
          <div className="rounded-2xl bg-gradient-to-l from-brand-from to-brand-to px-4 py-2 text-sm font-bold text-primary-foreground shadow">
            الأول: {top.display_name ?? 'عضو'} · {top.perf_index.toLocaleString('ar')}٪
          </div>
        )}
      </div>

      <Tabs defaultValue="board" dir="rtl">
        <TabsList className="flex h-auto flex-wrap justify-start gap-1">
          <TabsTrigger value="board" className="gap-1.5">
            <Trophy className="h-4 w-4" /> الترتيب
          </TabsTrigger>
          <TabsTrigger value="ledger" className="gap-1.5">
            <History className="h-4 w-4" /> السجل
          </TabsTrigger>
          <TabsTrigger value="rules" className="gap-1.5">
            <SlidersHorizontal className="h-4 w-4" /> القواعد
          </TabsTrigger>
          {isPrincipal && (
            <TabsTrigger value="adjust" className="gap-1.5">
              <Scale className="h-4 w-4" /> تعديل يدوي
            </TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="board" className="pt-3">
          <PointsLeaderboard rows={board.rows} loading={board.loading} error={board.error} me={userId} />
        </TabsContent>
        <TabsContent value="ledger" className="pt-3">
          <PointsLedger people={people} canEdit={isPrincipal} refreshKey={ledgerKey} onChanged={board.reload} />
        </TabsContent>
        <TabsContent value="rules" className="pt-3">
          <PointsRulesEditor settings={settings} canEdit={isPrincipal} onSaved={reloadSettings} />
        </TabsContent>
        {isPrincipal && (
          <TabsContent value="adjust" className="pt-3">
            <PointsAdjustForm people={workers} onDone={refreshAll} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default PointsSystemPanel;
