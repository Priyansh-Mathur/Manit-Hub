import { useEffect, useMemo, useState } from "react";
import { GraduationCap, Plus, Target, TrendingUp, BookOpen, Layers } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Skeleton from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import SemesterCard from "../components/cgpa/SemesterCard";
import {
  SEMESTER_NUMBERS,
  computeSgpa,
  computeCgpa,
  totalCredits,
  formatGpa,
} from "../components/cgpa/constants";
import {
  fetchAcademicRecords,
  saveSemester,
  deleteSemester,
} from "../api/academicRecords";
import { useToast } from "../components/ui/useToast";

function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <Card padded={false} className="p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-600/10 text-primary-600">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            {label}
          </p>
          <p className="font-display text-xl font-extrabold text-fg">{value}</p>
        </div>
      </div>
      {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
    </Card>
  );
}

function TrendChart({ semesters }) {
  const points = semesters
    .map((s) => ({ semester: s.semester, sgpa: computeSgpa(s.subjects) }))
    .filter((p) => p.sgpa != null);

  if (points.length < 2) return null;

  return (
    <Card padded={false} className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary-600" />
        <h3 className="text-sm font-semibold text-fg">SGPA trend</h3>
      </div>
      <div className="flex h-36 items-end gap-3">
        {points.map(({ semester, sgpa }) => (
          <div
            key={semester}
            className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
          >
            <span className="text-xs font-semibold text-fg">
              {formatGpa(sgpa)}
            </span>
            <div
              className="w-full max-w-[44px] rounded-t-lg bg-gradient-to-t from-primary-600 to-primary-400"
              style={{ height: `${Math.max((sgpa / 10) * 100, 4)}%` }}
            />
            <span className="text-[11px] text-muted">Sem {semester}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function WhatIfCard({ records }) {
  const [target, setTarget] = useState("");
  const [plannedCredits, setPlannedCredits] = useState("");

  const earnedCredits = totalCredits(records);
  const cgpa = computeCgpa(records);

  const requiredSgpa = useMemo(() => {
    const t = Number(target);
    const planned = Number(plannedCredits);
    if (!t || !planned || planned <= 0 || cgpa == null) return null;
    return (t * (earnedCredits + planned) - cgpa * earnedCredits) / planned;
  }, [target, plannedCredits, cgpa, earnedCredits]);

  return (
    <Card padded={false} className="p-5">
      <div className="mb-3 flex items-center gap-2">
        <Target className="h-4 w-4 text-accent-600" />
        <h3 className="text-sm font-semibold text-fg">Target what-if</h3>
      </div>
      <p className="mb-3 text-xs text-muted">
        What SGPA do you need next semester to reach a target CGPA?
      </p>
      <div className="flex gap-2">
        <input
          type="number"
          min="0"
          max="10"
          step="0.1"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="Target CGPA"
          className="field flex-1"
        />
        <input
          type="number"
          min="1"
          max="40"
          value={plannedCredits}
          onChange={(e) => setPlannedCredits(e.target.value)}
          placeholder="Next sem credits"
          className="field flex-1"
        />
      </div>
      {requiredSgpa != null && (
        <div className="mt-3 rounded-xl border bg-surface px-4 py-3 text-sm">
          {requiredSgpa > 10 ? (
            <span className="font-medium text-danger-600">
              Not reachable next semester — you'd need an SGPA of{" "}
              {formatGpa(requiredSgpa)} (max is 10).
            </span>
          ) : requiredSgpa <= 0 ? (
            <span className="font-medium text-success-600">
              Already there — any passing semester keeps you at or above target.
            </span>
          ) : (
            <span className="text-fg">
              You need an SGPA of{" "}
              <span className="font-bold text-primary-600">
                {formatGpa(requiredSgpa)}
              </span>{" "}
              next semester.
            </span>
          )}
        </div>
      )}
    </Card>
  );
}

export default function CgpaCalculator() {
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const { show } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const records = await fetchAcademicRecords();
        setSemesters(
          records.map((r) => ({
            semester: r.semester,
            subjects: r.subjects.map((s) => ({
              name: s.name,
              credits: String(s.credits),
              grade: s.grade,
            })),
            dirty: false,
            saving: false,
          }))
        );
      } catch (err) {
        console.error("Failed to load academic records", err);
        show("Could not load your grades", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [show]);

  const usedNumbers = semesters.map((s) => s.semester);
  const nextSemester = SEMESTER_NUMBERS.find((n) => !usedNumbers.includes(n));

  const addSemester = () => {
    if (!nextSemester) return;
    setSemesters((prev) =>
      [
        ...prev,
        {
          semester: nextSemester,
          subjects: [{ name: "", credits: "", grade: "" }],
          dirty: true,
          saving: false,
        },
      ].sort((a, b) => a.semester - b.semester)
    );
  };

  const patchSemester = (semester, patch) => {
    setSemesters((prev) =>
      prev.map((s) => (s.semester === semester ? { ...s, ...patch } : s))
    );
  };

  const handleSave = async (entry) => {
    patchSemester(entry.semester, { saving: true });
    try {
      await saveSemester(
        entry.semester,
        entry.subjects.map((s) => ({
          name: s.name,
          credits: Number(s.credits),
          grade: s.grade,
        }))
      );
      patchSemester(entry.semester, { dirty: false, saving: false });
      show(`Semester ${entry.semester} saved`, "success");
    } catch (err) {
      console.error("Failed to save semester", err);
      patchSemester(entry.semester, { saving: false });
      show(err?.response?.data?.message || "Failed to save semester", "error");
    }
  };

  const handleDelete = async (entry) => {
    try {
      // A 404 just means this semester was never saved — still fine to remove.
      await deleteSemester(entry.semester).catch((err) => {
        if (err?.response?.status !== 404) throw err;
      });
      setSemesters((prev) =>
        prev.filter((s) => s.semester !== entry.semester)
      );
      show(`Semester ${entry.semester} removed`, "success");
    } catch (err) {
      console.error("Failed to delete semester", err);
      show("Failed to remove semester", "error");
    }
  };

  const cgpa = computeCgpa(semesters);
  const credits = totalCredits(semesters);
  const bestSgpa = semesters.reduce((best, s) => {
    const sgpa = computeSgpa(s.subjects);
    return sgpa != null && (best == null || sgpa > best) ? sgpa : best;
  }, null);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Academics"
        title="CGPA Tracker"
        subtitle="Track your grades semester by semester — SGPA & CGPA update live as you type."
        icon={GraduationCap}
        actions={
          <Button leftIcon={Plus} onClick={addSemester} disabled={!nextSemester}>
            Add semester
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              icon={GraduationCap}
              label="CGPA"
              value={formatGpa(cgpa)}
              hint="Credit-weighted across all semesters"
            />
            <StatCard
              icon={BookOpen}
              label="Credits earned"
              value={credits || "—"}
            />
            <StatCard
              icon={Layers}
              label="Semesters"
              value={semesters.length || "—"}
            />
            <StatCard
              icon={TrendingUp}
              label="Best SGPA"
              value={formatGpa(bestSgpa)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <TrendChart semesters={semesters} />
            <WhatIfCard records={semesters} />
          </div>

          {semesters.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="No semesters yet"
              description="Add your first semester and enter subjects, credits and grades to see your SGPA & CGPA."
              action={
                <Button leftIcon={Plus} onClick={addSemester}>
                  Add semester
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {semesters.map((entry) => (
                <SemesterCard
                  key={entry.semester}
                  semester={entry.semester}
                  subjects={entry.subjects}
                  dirty={entry.dirty}
                  saving={entry.saving}
                  onChange={(subjects) =>
                    patchSemester(entry.semester, { subjects, dirty: true })
                  }
                  onSave={() => handleSave(entry)}
                  onDelete={() => handleDelete(entry)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
