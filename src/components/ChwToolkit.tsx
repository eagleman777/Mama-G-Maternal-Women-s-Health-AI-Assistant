import React, { useState } from 'react';
import {
  ClipboardList,
  CheckCircle2,
  Printer,
  AlertTriangle,
  Stethoscope,
  ShieldAlert,
  FileText,
  UserCheck,
} from 'lucide-react';
import { CHW_PROTOCOLS } from '../data/clinicalKnowledge';

export const ChwToolkit: React.FC = () => {
  const [selectedProtocolId, setSelectedProtocolId] = useState<string>(CHW_PROTOCOLS[0].id);
  const [completedSteps, setCompletedSteps] = useState<Record<string, number[]>>({});
  const [patientNotes, setPatientNotes] = useState<string>('');

  const currentProtocol =
    CHW_PROTOCOLS.find((p) => p.id === selectedProtocolId) || CHW_PROTOCOLS[0];

  const toggleStep = (protocolId: string, stepNum: number) => {
    setCompletedSteps((prev) => {
      const currentList = prev[protocolId] || [];
      const updated = currentList.includes(stepNum)
        ? currentList.filter((s) => s !== stepNum)
        : [...currentList, stepNum];
      return { ...prev, [protocolId]: updated };
    });
  };

  const currentCompleted = completedSteps[currentProtocol.id] || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-6 text-stone-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Stethoscope className="w-4 h-4" />
            <span>Field Nurse & CHEW Clinical Co-Pilot</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Primary Healthcare Clinical Guidelines & Checklists
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-2xl">
            Actionable step-by-step algorithms based on WHO Antenatal Care (ANC) and Emergency Obstetric and Newborn Care (EmONC) standards for primary care centers and community health visits.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="no-print self-start md:self-auto px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shrink-0"
        >
          <Printer className="w-4 h-4 text-amber-400" />
          <span>Print Protocol Checklist</span>
        </button>
      </div>

      {/* Protocol Selection Tabs */}
      <div className="no-print grid grid-cols-1 sm:grid-cols-3 gap-3">
        {CHW_PROTOCOLS.map((protocol) => {
          const isSelected = selectedProtocolId === protocol.id;
          const completedCount = (completedSteps[protocol.id] || []).length;
          return (
            <button
              key={protocol.id}
              onClick={() => setSelectedProtocolId(protocol.id)}
              className={`p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-amber-500/20 border-amber-500 text-stone-100 shadow-sm'
                  : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-850'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-amber-400 uppercase">
                  Clinical Protocol
                </span>
                <span className="text-[11px] text-stone-400">
                  {completedCount}/{protocol.steps.length} Done
                </span>
              </div>
              <h4 className="font-semibold text-stone-200 text-sm leading-snug">
                {protocol.title}
              </h4>
            </button>
          );
        })}
      </div>

      {/* Main Checklist Card */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-7 shadow-sm space-y-6">
        {/* Protocol Meta */}
        <div className="border-b border-stone-800 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg sm:text-xl font-bold text-white">
              {currentProtocol.title}
            </h3>
            <span className="text-xs bg-stone-800 border border-stone-700 px-3 py-1 rounded-full text-stone-300">
              Target: {currentProtocol.audience}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-300 mt-2 leading-relaxed">
            {currentProtocol.summary}
          </p>
        </div>

        {/* Steps List */}
        <div className="space-y-3">
          {currentProtocol.steps.map((st) => {
            const isDone = currentCompleted.includes(st.step);
            return (
              <div
                key={st.step}
                onClick={() => toggleStep(currentProtocol.id, st.step)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                  isDone
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-stone-200'
                    : 'bg-stone-800/60 border-stone-700/80 text-stone-300 hover:bg-stone-800'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isDone}
                  readOnly
                  className="mt-1 rounded accent-emerald-500 w-4 h-4 shrink-0 cursor-pointer"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-amber-400 uppercase tracking-wide">
                      Step {st.step}
                    </span>
                    <span className={`text-sm font-bold text-white ${isDone ? 'line-through opacity-80' : ''}`}>
                      {st.action}
                    </span>
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    {st.note}
                  </p>
                  {st.caution && (
                    <div className="bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs p-2.5 rounded-lg mt-1.5 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>{st.caution}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Clinical Documentation / Patient Referral Field */}
        <div className="no-print bg-stone-800/50 border border-stone-700 p-4 rounded-xl space-y-2">
          <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-amber-400" />
            Field Case Notes & Referral Summary (Optional):
          </label>
          <textarea
            rows={3}
            value={patientNotes}
            onChange={(e) => setPatientNotes(e.target.value)}
            placeholder="Document patient name/code, vitals (BP, FHR, Hb), drugs administered, and referral facility details..."
            className="w-full bg-stone-900 text-stone-100 text-xs p-3 rounded-lg border border-stone-700 focus:outline-none focus:border-amber-500 placeholder-stone-500"
          />
        </div>

        {/* Quick Medication & Referral Guidelines Callout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          <div className="bg-stone-950/70 p-3.5 rounded-xl border border-stone-800 space-y-1">
            <span className="font-bold text-amber-400 block">
              Pre-eclampsia Emergency Dosing:
            </span>
            <p className="text-stone-300 text-[11px] leading-relaxed">
              Magnesium Sulfate (MgSO4) 20% solution: 4g IV slowly over 15 minutes, plus 10g IM (5g in each buttock with 1ml 2% lidocaine). Always monitor patellar reflexes, respiratory rate (&gt;16/min), and urine output (&gt;30ml/hr). Keep Calcium Gluconate 10% on hand as antidote.
            </p>
          </div>

          <div className="bg-stone-950/70 p-3.5 rounded-xl border border-stone-800 space-y-1">
            <span className="font-bold text-rose-400 block">
              PPH Uterotonic Cold-Chain Rules:
            </span>
            <p className="text-stone-300 text-[11px] leading-relaxed">
              Oxytocin (10 IU IM) requires 2°C–8°C refrigeration. If cold chain is broken or unavailable in remote communities, use Misoprostol (600–800 mcg orally or sublingually), which remains stable at ambient tropical temperatures.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
