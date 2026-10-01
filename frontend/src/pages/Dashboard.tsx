import React, { useState, useEffect } from 'react';
import { useAuth } from '../services/useAuth';
import { useSchedule } from '../services/useSchedule';
import { useDuties } from '../services/useDuties';
import { useBilling } from '../services/useBilling';
import html2canvas from 'html2canvas';
import { StudentDashboardView } from '../component/Dashboard/StudentDashboardView';
import { FacultyDashboardView } from '../component/Dashboard/FacultyDashboardView';
import { LabManagerDashboardView } from '../component/Dashboard/LabManagerDashboardView';
import { DeptManagerDashboardView } from '../component/Dashboard/DeptManagerDashboardView';
import { IRASParseModal } from '../component/Schedule/IRASParseModal';
import { SubmitBillModal } from '../component/Billing/SubmitBillModal';
import { CreateDutyModal } from '../component/Duty/CreateDutyModal';
import { BillSubmitPayload } from '../model/billing';
import { useSemesters } from '../context/SemesterContext';
import { CheckCircle2 } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { activeSemester } = useSemesters();
  const [selectedSemester, setSelectedSemester] = useState<string>('');

  const { slots, toggleSlot, parseIRASText, loadDemoData, resetGrid, fetchSchedule } = useSchedule();
  const { duties, students, createDuty, refreshData: refreshDuties } = useDuties();
  const { submitBill } = useBilling();

  useEffect(() => {
    if (activeSemester && !selectedSemester) {
      setSelectedSemester(activeSemester.name);
    }
  }, [activeSemester, selectedSemester]);

  useEffect(() => {
    if (selectedSemester) {
      fetchSchedule(selectedSemester);
      refreshDuties(selectedSemester);
    }
  }, [selectedSemester, fetchSchedule, refreshDuties]);

  const [isParseModalOpen, setIsParseModalOpen] = useState<boolean>(false);
  const [isBillModalOpen, setIsBillModalOpen] = useState<boolean>(false);
  const [isCreateDutyModalOpen, setIsCreateDutyModalOpen] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const role = user?.role || 'Student';

  const handleExportPNG = async () => {
    const gridElem = document.getElementById('availability-grid-container');
    if (!gridElem) return;

    try {
      const canvas = await html2canvas(gridElem, { backgroundColor: '#ffffff', scale: 2 });
      const link = document.createElement('a');
      link.download = `sod_weekly_schedule_${user?.name.replace(' ', '_') || 'student'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      setToastMsg('Weekly schedule PNG image downloaded successfully!');
      setTimeout(() => setToastMsg(null), 3500);
    } catch {
      alert('Failed to export schedule PNG image.');
    }
  };

  const handleSubmitBill = async (payload: BillSubmitPayload) => {
    if (!user) return;
    await submitBill(user, payload);
    setToastMsg(`Monthly duty bill for ${payload.month} submitted successfully for Faculty verification!`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Feedback Toast Notification */}
      {toastMsg && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-3 shadow-xs animate-fadeIn text-left">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Role-Tailored Custom Dashboard Rendering */}
      {role === 'Faculty' ? (
        <FacultyDashboardView user={user} duties={duties} />
      ) : role === 'LabManager' ? (
        <LabManagerDashboardView
          user={user}
          duties={duties}
          onOpenCreateModal={() => setIsCreateDutyModalOpen(true)}
        />
      ) : role === 'DeptManager' ? (
        <DeptManagerDashboardView user={user} duties={duties} />
      ) : (
        /* Default Student Dashboard */
        <StudentDashboardView
          user={user}
          slots={slots}
          duties={duties}
          selectedSemester={selectedSemester}
          onSelectSemester={setSelectedSemester}
          onToggleSlot={(day, time) => toggleSlot(day, time, selectedSemester)}
          onResetGrid={resetGrid}
          onLoadDemoData={loadDemoData}
          onOpenParseModal={() => setIsParseModalOpen(true)}
          onOpenBillModal={() => setIsBillModalOpen(true)}
          onExportPNG={handleExportPNG}
        />
      )}

      {/* Shared Modals */}
      <IRASParseModal
        isOpen={isParseModalOpen}
        onClose={() => setIsParseModalOpen(false)}
        onParse={(rawText) => parseIRASText(rawText, selectedSemester)}
      />

      <SubmitBillModal
        isOpen={isBillModalOpen}
        onClose={() => setIsBillModalOpen(false)}
        onSubmitBill={handleSubmitBill}
      />

      <CreateDutyModal
        isOpen={isCreateDutyModalOpen}
        students={students}
        onClose={() => setIsCreateDutyModalOpen(false)}
        onCreate={createDuty}
      />
    </div>
  );
};
