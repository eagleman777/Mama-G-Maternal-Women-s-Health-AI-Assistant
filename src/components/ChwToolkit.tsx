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
  BookOpen,
  Download,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CHW_PROTOCOLS } from '../data/clinicalKnowledge';
import { EdgeSqliteSyncPanel } from './EdgeSqliteSyncPanel';
import { MamaGOTAUpdatePanel } from './MamaGOTAUpdatePanel';
import { MamaGSecurityVaultPanel } from './MamaGSecurityVaultPanel';
import { MamaGFieldValidationPanel } from './MamaGFieldValidationPanel';
import { getOrCreateDeviceId } from '../data/edgeSqliteStore';

const DEPLOYMENT_MANUAL_PDF_PATH =
  '/assets/aistudio/Mama-G_Field_Tablet_Deployment___Operations_Manual_f423f051.pdf';
const QUICK_REFERENCE_PDF_PATH =
  '/assets/aistudio/Mama-G_CHW_Field_Quick-Reference_Guide_d25316e5.pdf';

export const ChwToolkit: React.FC = () => {
  const [selectedProtocolId, setSelectedProtocolId] = useState<string>(CHW_PROTOCOLS[0].id);
  const [completedSteps, setCompletedSteps] = useState<Record<string, number[]>>({});
  const [patientNotes, setPatientNotes] = useState<string>('');
  const [showQuickRefGuide, setShowQuickRefGuide] = useState<boolean>(true);
  const [showQuickRefPdf, setShowQuickRefPdf] = useState<boolean>(false);
  const [showDeploymentManual, setShowDeploymentManual] = useState<boolean>(true);
  const [showEmbeddedPdf, setShowEmbeddedPdf] = useState<boolean>(false);

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

        <div className="no-print flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
          <a
            href={QUICK_REFERENCE_PDF_PATH}
            download="Mama-G_CHW_Field_Quick-Reference_Guide.pdf"
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>CHW Quick-Ref (PDF)</span>
          </a>
          <a
            href={DEPLOYMENT_MANUAL_PDF_PATH}
            download="Mama-G_Field_Tablet_Deployment_Operations_Manual.pdf"
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Field Manual (PDF)</span>
          </a>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Print Protocol Checklist</span>
          </button>
        </div>
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

      {/* Edge Field Tablet SQLite Cache, OTA, SLA Validation & Zero-Trust Secret Vault */}
      <div className="no-print space-y-6">
        <MamaGFieldValidationPanel />
        <EdgeSqliteSyncPanel />
        <MamaGOTAUpdatePanel deviceId={getOrCreateDeviceId()} hubApiUrl="" />
        <MamaGSecurityVaultPanel deviceId={getOrCreateDeviceId()} />

        {/* CHW Field Quick-Reference Guide (1-Page Laminated Cheat Sheet) */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-6 space-y-4 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400">
                <ClipboardList className="w-4 h-4" />
                <span>Operational Cheat Sheet • Ibeno, Mbo &amp; Uyo Health Outposts (v1.0.0)</span>
              </div>
              <h3 className="text-lg font-bold text-white">
                Mama-G Community Health Worker (CHW) Quick-Reference Guide
              </h3>
              <p className="text-xs text-stone-400">
                1-page laminated outpost station guide covering triage startup, bilingual audio playback ([ibb]/[ibn]), Level 1–3 climate severity actions, offline encounter logging, and sync telemetry.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowQuickRefGuide(true);
                  setShowQuickRefPdf((prev) => !prev);
                }}
                className="px-3.5 py-2 bg-sky-500 hover:bg-sky-400 text-stone-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{showQuickRefPdf ? 'Hide PDF Reader' : 'Read Guide Inline'}</span>
              </button>
              <a
                href={QUICK_REFERENCE_PDF_PATH}
                download="Mama-G_CHW_Field_Quick-Reference_Guide.pdf"
                className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-sky-300 border border-sky-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </a>
              <button
                type="button"
                onClick={() => setShowQuickRefGuide((prev) => !prev)}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 cursor-pointer"
                aria-label="Toggle CHW quick-reference summary"
              >
                {showQuickRefGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {showQuickRefGuide && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-3.5 space-y-1">
                  <span className="text-[11px] font-bold text-sky-400 uppercase block">
                    1–2 · Triage Session &amp; Bilingual Audio
                  </span>
                  <p className="text-stone-300 leading-relaxed">
                    Select patient age group &amp; trimester, toggle <strong>English</strong>, <strong>Ibibio [ibb]</strong>, or <strong>Ibeno [ibn]</strong>, and tap the Speaker Icon for synthesized native audio verification.
                  </p>
                </div>
                <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-3.5 space-y-1">
                  <span className="text-[11px] font-bold text-rose-400 uppercase block">
                    3 · Triage Severity &amp; Climate Flags
                  </span>
                  <p className="text-stone-300 leading-relaxed">
                    <strong>Level 1 Emergency:</strong> Immediate cooling, BP &amp; referral. <strong>Level 2 Urgent:</strong> RDT, ACT or ORS packets. <strong>Level 3 Standard:</strong> Counseling &amp; follow-up.
                  </p>
                </div>
                <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-3.5 space-y-1 md:col-span-2 lg:col-span-1">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase block">
                    4–5 · Offline Encounters &amp; Sync
                  </span>
                  <p className="text-stone-300 leading-relaxed">
                    Completed triages save offline with an <code className="font-mono text-emerald-300">encounter_id</code> badge (<code className="font-mono text-amber-300">status: pending</code>) and auto-sync to Uyo via <code className="font-mono text-sky-300">/api/edge-sync</code> or <strong>Force Manual Sync</strong>.
                  </p>
                </div>
              </div>

              {showQuickRefPdf && (
                <div className="rounded-xl overflow-hidden border border-stone-700 bg-stone-950 h-[560px]">
                  <iframe
                    src={QUICK_REFERENCE_PDF_PATH}
                    title="Mama-G CHW Field Quick-Reference Guide"
                    className="w-full h-full border-0"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Field Tablet Deployment & Operations Manual Card */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-6 space-y-4 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                <BookOpen className="w-4 h-4" />
                <span>Standard Operating Procedure (Ibeno, Mbo &amp; Uyo LGAs)</span>
              </div>
              <h3 className="text-lg font-bold text-white">
                Mama-G Field Tablet Deployment &amp; Operations Manual
              </h3>
              <p className="text-xs text-stone-400">
                2-page step-by-step field technician guide covering Linux/Docker tablet setup, cryptographic vault provisioning, SQLite WAL verification, and Emergency Rollback SOP.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowDeploymentManual(true);
                  setShowEmbeddedPdf((prev) => !prev);
                }}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{showEmbeddedPdf ? 'Hide PDF Reader' : 'Read Manual Inline'}</span>
              </button>
              <a
                href={DEPLOYMENT_MANUAL_PDF_PATH}
                download="Mama-G_Field_Tablet_Deployment_Operations_Manual.pdf"
                className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </a>
              <button
                type="button"
                onClick={() => setShowDeploymentManual((prev) => !prev)}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 cursor-pointer"
                aria-label="Toggle deployment manual summary"
              >
                {showDeploymentManual ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {showDeploymentManual && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-3.5 space-y-1">
                  <span className="text-[11px] font-bold text-amber-400 uppercase block">
                    Step 1–2 · Provisioning
                  </span>
                  <p className="text-stone-300 leading-relaxed">
                    Verify Linux/Docker runtime and execute <code className="font-mono text-emerald-300">sudo ./install_mamag_edge.sh</code> with Device ID, LGA, Hub URL, Master Passphrase, and Auth Token.
                  </p>
                </div>
                <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-3.5 space-y-1">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase block">
                    Step 3 · Verify Container &amp; WAL
                  </span>
                  <p className="text-stone-300 leading-relaxed">
                    Run <code className="font-mono text-sky-300">docker ps</code> &amp; <code className="font-mono text-sky-300">docker logs mamag_field_tablet_secure</code> and inspect cached climate rules in this console prior to dispatch.
                  </p>
                </div>
                <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-3.5 space-y-1">
                  <span className="text-[11px] font-bold text-rose-400 uppercase block">
                    Maintenance &amp; Emergency SOP
                  </span>
                  <p className="text-stone-300 leading-relaxed">
                    Charge immediately if battery drops below 15%. For severe sync/runtime errors, trigger <strong>Emergency Rollback</strong> in the OTA panel or contact the Uyo support desk.
                  </p>
                </div>
              </div>

              {showEmbeddedPdf && (
                <div className="rounded-xl overflow-hidden border border-stone-700 bg-stone-950 h-[560px]">
                  <iframe
                    src={DEPLOYMENT_MANUAL_PDF_PATH}
                    title="Mama-G Field Tablet Deployment and Operations Manual"
                    className="w-full h-full border-0"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
