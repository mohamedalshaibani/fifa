"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { RotateCcw, AlertTriangle, CheckCircle2, ChevronDown } from "lucide-react";
import Card from "@/components/Card";
import Button from "@/components/ui/Button";

type ResetStage = 1 | 2 | 3 | 4 | 5;

interface StageInfo {
  id: ResetStage;
  label: string;
  description: string;
  keeps: string[];
  deletes: string[];
  disabled: boolean;
  disabledReason?: string;
}

interface ResetToStageProps {
  tournamentId: string;
  status: string;
  hasType: boolean;
  hasTeams: boolean;
  hasMatches: boolean;
  isTeamBased: boolean;
  onResetToRegistrationOpen: (formData: FormData) => void;
  onResetToRegistrationClosed: (formData: FormData) => void;
  onResetToTypeSelection: (formData: FormData) => void;
  onResetToAfterTeamDraw: (formData: FormData) => void;
  onResetToAfterMatchGeneration: (formData: FormData) => void;
}

export default function ResetToStage({
  tournamentId,
  status,
  hasType,
  hasTeams,
  hasMatches,
  isTeamBased,
  onResetToRegistrationOpen,
  onResetToRegistrationClosed,
  onResetToTypeSelection,
  onResetToAfterTeamDraw,
  onResetToAfterMatchGeneration,
}: ResetToStageProps) {
  const [selectedStage, setSelectedStage] = useState<ResetStage | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [clearType, setClearType] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  // Auto-dismiss success message
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(null), 4000);
      return () => clearTimeout(t);
    }
  }, [success]);

  const isRegOpen = status === "registration_open";
  const isRegClosed = status === "registration_closed";

  const stages: StageInfo[] = [
    {
      id: 1,
      label: "فتح الاشتراكات",
      description: "الرجوع لمرحلة التسجيل المفتوح",
      keeps: ["المشاركون الحاليون"],
      deletes: ["الفرق", "أعضاء الفرق", "المباريات", "النتائج", "نوع البطولة"],
      disabled: isRegOpen,
      disabledReason: "البطولة بالفعل في مرحلة التسجيل المفتوح",
    },
    {
      id: 2,
      label: "إغلاق الاشتراكات",
      description: "الرجوع لمرحلة بعد إغلاق التسجيل (قبل اختيار النوع)",
      keeps: ["المشاركون"],
      deletes: ["الفرق", "أعضاء الفرق", "المباريات", "النتائج", "نوع البطولة"],
      disabled: isRegOpen || (isRegClosed && !hasType && !hasTeams && !hasMatches),
      disabledReason: isRegOpen
        ? "يجب أن يكون التسجيل مغلقاً أولاً"
        : "البطولة بالفعل في هذه المرحلة",
    },
    {
      id: 3,
      label: "اختيار نوع البطولة + الصيغة",
      description: "الإبقاء على المشاركين والنوع، حذف الفرق والمباريات",
      keeps: ["المشاركون", "نوع البطولة (اختياري)"],
      deletes: ["الفرق", "أعضاء الفرق", "المباريات", "النتائج"],
      disabled: isRegOpen || !hasType,
      disabledReason: isRegOpen
        ? "يجب أن يكون التسجيل مغلقاً أولاً"
        : "لم يتم تحديد نوع البطولة بعد",
    },
    {
      id: 4,
      label: "بعد تشكيل الفرق",
      description: "الإبقاء على الفرق، حذف المباريات فقط لإعادة القرعة",
      keeps: ["المشاركون", "الفرق", "أعضاء الفرق"],
      deletes: ["المباريات", "النتائج"],
      disabled: isRegOpen || !isTeamBased || !hasTeams,
      disabledReason: isRegOpen
        ? "يجب أن يكون التسجيل مغلقاً أولاً"
        : !isTeamBased
          ? "هذه المرحلة متاحة فقط لبطولات 2v2"
          : "لم يتم تشكيل الفرق بعد",
    },
    {
      id: 5,
      label: "بعد توليد المباريات",
      description: "الإبقاء على كل شيء، مسح النتائج فقط وإعادة المباريات للبداية",
      keeps: ["المشاركون", "الفرق", "هيكل المباريات"],
      deletes: ["نتائج المباريات", "الفائزين", "الجولات المتقدمة (إقصائي)"],
      disabled: !hasMatches,
      disabledReason: "لا توجد مباريات لإعادة تعيينها",
    },
  ];

  const selectedInfo = stages.find((s) => s.id === selectedStage);

  const handleStageSelect = (val: string) => {
    setSelectedStage(val ? (Number(val) as ResetStage) : null);
    setClearType(false);
  };

  const handleConfirm = () => {
    if (!selectedStage || !formRef.current) return;
    
    startTransition(async () => {
        const formData = new FormData(formRef.current!);
        formData.set("tournamentId", tournamentId);
        
        if (selectedStage === 3 && clearType) {
           formData.set("clearType", "true");
        }

        let action;
        switch (selectedStage) {
            case 1: action = onResetToRegistrationOpen; break;
            case 2: action = onResetToRegistrationClosed; break;
            case 3: action = onResetToTypeSelection; break;
            case 4: action = onResetToAfterTeamDraw; break;
            case 5: action = onResetToAfterMatchGeneration; break;
        }

        if (action) {
            await action(formData);
            setSuccess(selectedInfo?.label ?? "تم إعادة التعيين");
            setShowModal(false);
            setSelectedStage(null);
            setClearType(false);
        }
    });
  };

  return (
    <>
      <Card className="p-6 border-warning/20 hover:border-warning/40 transition-colors">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
            <div className="p-2 bg-warning/10 rounded-lg text-warning">
                <RotateCcw className="w-5 h-5" />
            </div>
            <div>
                <h3 className="font-bold text-lg text-foreground">إعادة تعيين المرحلة</h3>
                <p className="text-xs text-muted">التراجع إلى نقطة سابقة في البطولة</p>
            </div>
        </div>

        {/* Success notification */}
        {success && (
            <div className="mb-6 flex items-center gap-3 rounded-lg border border-success/20 bg-success/5 p-4 text-sm font-bold text-success animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>تمت العودة بنجاح إلى: {success}</span>
            </div>
        )}

        <div className="space-y-4">
            <div className="relative">
                <select
                    value={selectedStage ?? ""}
                    onChange={(e) => handleStageSelect(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-border bg-surface px-4 py-3 pr-10 text-sm font-semibold text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition cursor-pointer hover:bg-surface-hover"
                >
                    <option value="">— اختر نقطة العودة —</option>
                    {stages.map((stage) => (
                    <option key={stage.id} value={stage.id} disabled={stage.disabled}>
                        {stage.disabled ? "🔒 " : "• "}{stage.label}
                    </option>
                    ))}
                </select>
                <ChevronDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            </div>

            {selectedInfo && !selectedInfo.disabled ? (
                <div className="bg-surface-2 p-4 rounded-lg border border-border animate-in zoom-in-95 duration-200">
                    <div className="mb-4">
                        <span className="text-xs text-muted font-bold uppercase tracking-wider block mb-1">المرحلة المختارة</span>
                        <p className="text-sm font-bold text-foreground">{selectedInfo.label}</p>
                        <p className="text-xs text-secondary mt-1">{selectedInfo.description}</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 text-xs mb-4">
                        <div className="bg-success/5 p-3 rounded border border-success/10">
                            <span className="font-bold text-success block mb-2">✓ سيتم الاحتفاظ بـ:</span>
                            <ul className="space-y-1 text-secondary">
                                {selectedInfo.keeps.map(k => <li key={k}>• {k}</li>)}
                            </ul>
                        </div>
                        <div className="bg-danger/5 p-3 rounded border border-danger/10">
                             <span className="font-bold text-danger block mb-2">✕ سيتم حذف:</span>
                             <ul className="space-y-1 text-secondary">
                                {selectedInfo.deletes.map(k => <li key={k}>• {k}</li>)}
                             </ul>
                        </div>
                    </div>

                    {selectedStage === 3 && (
                        <div className="flex items-center gap-2 mb-4 p-3 bg-background rounded border border-border">
                            <input
                                type="checkbox"
                                id="clearType"
                                checked={clearType}
                                onChange={(e) => setClearType(e.target.checked)}
                                className="w-4 h-4 accent-warning rounded"
                            />
                            <label htmlFor="clearType" className="text-sm font-medium text-foreground cursor-pointer select-none">
                                مسح نوع البطولة وصيغتها أيضاً
                            </label>
                        </div>
                    )}

                    <Button 
                        onClick={() => setShowModal(true)} 
                        variant="ghost" 
                        className="w-full text-warning hover:text-warning hover:bg-warning/10 border-warning/20"
                    >
                        المتابعة للتأكيد
                    </Button>
                </div>
            ) : selectedInfo?.disabled ? (
                 <div className="p-4 rounded-lg bg-surface-2 border border-border text-center text-sm text-muted">
                    {selectedInfo.disabledReason}
                 </div>
            ) : (
                <div className="p-8 text-center border border-dashed border-border rounded-lg text-sm text-muted">
                    يرجى اختيار مرحلة للعودة إليها من القائمة أعلاه
                </div>
            )}
        </div>
      </Card>

      {/* Confirmation Modal */}
      {showModal && selectedInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <Card className="w-full max-w-md p-0 shadow-2xl border-warning/30 animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-border flex items-start justify-between">
                    <div className="flex items-center gap-3">
                         <div className="p-2 bg-warning/10 rounded-full text-warning">
                            <AlertTriangle className="w-5 h-5" />
                         </div>
                         <h3 className="text-lg font-bold text-foreground">تأكيد العودة</h3>
                    </div>
                </div>
                
                <div className="p-6 space-y-4">
                    <p className="text-foreground font-medium">
                        هل أنت متأكد من العودة إلى مرحلة <span className="text-warning font-bold">&quot;{selectedInfo.label}&quot;</span>؟
                    </p>
                    
                    <div className="bg-warning/5 p-4 rounded-lg border border-warning/10 text-sm text-secondary">
                        <p className="font-bold text-warning mb-1">⚠️ تحذير:</p>
                        سيتم حذف جميع البيانات اللاحقة لهذه المرحلة. هذا الإجراء لا يمكن التراجع عنه.
                    </div>

                    <form ref={formRef}>
                         <div className="flex gap-3 mt-6">
                            <Button 
                                type="button" 
                                variant="secondary" 
                                className="flex-1" 
                                onClick={() => setShowModal(false)}
                            >
                                إلغاء
                            </Button>
                            <Button 
                                type="button" 
                                variant="outline" 
                                className="flex-1 border-warning/50 text-warning hover:bg-warning hover:text-white"
                                onClick={handleConfirm}
                                isLoading={isPending}
                            >
                                تأكيد التنفيذ
                            </Button>
                        </div>
                    </form>
                </div>
            </Card>
        </div>
      )}
    </>
  );
}
