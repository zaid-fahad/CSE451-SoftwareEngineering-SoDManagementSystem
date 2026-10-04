import React, { useState, useEffect, useRef } from 'react';
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
import { StudentOnboardingWizardModal } from '../component/Schedule/StudentOnboardingWizardModal';
import { SubmitBillModal } from '../component/Billing/SubmitBillModal';
import { CreateDutyModal } from '../component/Duty/CreateDutyModal';
import { BillSubmitPayload } from '../model/billing';
import { useSemesters } from '../context/SemesterContext';
import { CheckCircle2 } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { activeSemester, semesters } = useSemesters();
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
  const [isOnboardingWizardOpen, setIsOnboardingWizardOpen] = useState<boolean>(false);
  const [isBillModalOpen, setIsBillModalOpen] = useState<boolean>(false);
  const [isCreateDutyModalOpen, setIsCreateDutyModalOpen] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const onboardStorageKey = user && selectedSemester ? `sod_student_onboarded_${user.id}_${selectedSemester}` : null;
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean>(true);
  const checkedStudentOnboarding = useRef<string | null>(null);

  useEffect(() => {
    if (onboardStorageKey) {
      const isDone = localStorage.getItem(onboardStorageKey) === 'true';
      setIsOnboardingCompleted(isDone);
    }
  }, [onboardStorageKey]);

  // Auto-launch onboarding wizard on student login / first visit to active semester if not completed
  useEffect(() => {
    if (user?.role === 'Student' && selectedSemester && onboardStorageKey) {
      const currentSemObj = semesters.find((s) => s.name === selectedSemester);
      const isArchived = Boolean(currentSemObj?.is_archived);
      const checkKey = `${user.id}-${selectedSemester}`;

      if (checkedStudentOnboarding.current !== checkKey) {
        checkedStudentOnboarding.current = checkKey;
        const isDone = localStorage.getItem(onboardStorageKey) === 'true';
        if (!isDone && !isArchived) {
          setIsOnboardingWizardOpen(true);
        }
      }
    }
  }, [user, selectedSemester, onboardStorageKey, semesters]);

  const handleCompleteOnboardingWizard = () => {
    if (onboardStorageKey) {
      localStorage.setItem(onboardStorageKey, 'true');
      setIsOnboardingCompleted(true);
    }
    setIsOnboardingWizardOpen(false);
    setToastMsg('Schedule onboarding completed successfully!');
    setTimeout(() => setToastMsg(null), 3500);
  };

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
          onOpenOnboardingWizard={() => setIsOnboardingWizardOpen(true)}
          isOnboardingCompleted={isOnboardingCompleted}
        />
      )}

      {/* Student Onboarding Wizard Modal */}
      {role === 'Student' && (
        <StudentOnboardingWizardModal
          isOpen={isOnboardingWizardOpen}
          onClose={() => setIsOnboardingWizardOpen(false)}
          onComplete={handleCompleteOnboardingWizard}
          slots={slots}
          onToggleSlot={(day, time) => toggleSlot(day, time, selectedSemester)}
          onParse={(rawText) => parseIRASText(rawText, selectedSemester)}
          semesterName={selectedSemester || activeSemester?.name || 'Autumn 2026'}
          isOnboardingOpen={Boolean(
            (semesters.find((s) => s.name === selectedSemester) || activeSemester)?.is_onboarding_open
          )}
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
