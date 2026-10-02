// components/StudentModuleGuard.tsx
import { useNavigate } from "react-router-dom";
import { useRoleCheck } from "../../hooks/useRoleCheck";
import { useCurrentStudent } from "../../hooks/useCurrentStudent";
import { Button } from "../ui/Button";

const MODULE_LABELS: Record<string, string> = {
  marks: "Marks",
  homework: "Homework",
  club: "Club",
  announcement: "Announcement",
  timetable: "Timetable",
  attendance: "Attendance",
};

interface StudentModuleGuardProps {
  moduleKey: string;
  children: React.ReactNode;
}

export default function StudentModuleGuard({ moduleKey, children }: StudentModuleGuardProps) {
  const { isParent } = useRoleCheck();
  const { unlockedModules } = useCurrentStudent();
  const navigate = useNavigate();

  if (isParent && !unlockedModules.includes(moduleKey)) {
    const label = MODULE_LABELS[moduleKey] || "This module";

    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-background min-h-[60vh]">
        <div className="bg-surface border border-border rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-lock text-2xl"></i>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            {label} isn't available yet
          </h2>
          <p className="text-sm text-muted mb-6">
            This section hasn't been enabled for your ward this academic year.
            Please reach out to the school staff's if you'd like access to it.
          </p>
          <Button
            variant="primary"
            // className="px-4 py-2 bg-primary text-white rounded-lg w-full flex items-center justify-center gap-2"
            onClick={() => navigate(-1)}
          >
            <i className="fas fa-arrow-left"></i>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}