'use client';

import React, { useState } from 'react';
import { useDisaster } from '@/context/DisasterContext';
import {
  Volume2,
  VolumeX,
  Send,
  Smartphone,
  TowerControl,
  Radio,
  Megaphone,
  History,
  CheckCircle2,
  AlertTriangle,
  RadioTower,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { WhatsAppLogo, GSMASmsLogo } from '@/components/icons/BrandLogos';

export default function WarningHubPage() {
  const { currentRegion, processedHabitations } = useDisaster();

  const immediateHabs = processedHabitations.filter(
    (h) => h.calculatedRisk.priority === 'Immediate'
  );

  const [language, setLanguage] = useState<'en' | 'hi' | 'regional'>('en');
  const [isPlayingSiren, setIsPlayingSiren] = useState(false);
  const [oscillator, setOscillator] = useState<OscillatorNode | null>(null);
  const [isBroadcasted, setIsBroadcasted] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Channels state
  const [channels, setChannels] = useState({
    cell: true,
    whatsapp: true,
    sms: true,
    radio: false,
    pa: false,
  });

  const toggleSiren = () => {
    if (isPlayingSiren) {
      if (oscillator) {
        oscillator.stop();
        oscillator.disconnect();
      }
      setIsPlayingSiren(false);
    } else {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(853, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);

        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(2, ctx.currentTime);
        lfoGain.gain.setValueAtTime(200, ctx.currentTime);
        lfo.connect(osc.frequency);
        lfo.start();

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        setOscillator(osc);
        setIsPlayingSiren(true);
      } catch (err) {
        console.error('Audio siren error', err);
      }
    }
  };

  const handleBroadcast = () => {
    setIsConfirmOpen(false);
    setIsBroadcasted(true);
  };

  const activeChannelLabels = [
    channels.whatsapp && 'Official WhatsApp Broadcast',
    channels.sms && 'Telecom SMS Gateway',
    channels.cell && 'Cell-Broadcast (4G/5G PWS)',
    channels.radio && 'All India Radio / Local FM',
    channels.pa && 'Gram Panchayat PA Sirens',
  ].filter(Boolean) as string[];

  const targetPopulation = immediateHabs.reduce((acc, h) => acc + h.population, 0);

  const alertTemplates = {
    en: `EMERGENCY EVACUATION DIRECTIVE [NDMA / BYTEX-DSS / DEOC]: Severe multi-hazard flash flood & debris flow imminent in ${currentRegion.name}. Immediate evacuation ordered for red-zone sectors. Staged transit convoys are deploying to village pickup coordinates. Proceed to designated certified shelters immediately. Emergency extraction helpline: Dial 1077.`,
    hi: `आपातकालीन निकासी आदेश [एनडीएमए / बाइट-एक्स डीएसएस / जिला आपातकालीन केंद्र]: ${currentRegion.name} क्षेत्र में मूसलाधार वर्षा एवं भूस्खलन का तात्कालिक खतरा है। सभी चिन्हित रेड-ज़ोन गांवों को तुरंत सुरक्षित शिविरों में स्थानांतरित होने का निर्देश दिया जाता है। सहायता एवं राहत हेतु टोल-फ्री हेल्पलाइन 1077 पर संपर्क करें।`,
    regional: `അടിയന്തര മുന്നറിയിപ്പ് [NDMA / DEOC]: ${currentRegion.name} പ്രദേശത്ത് അതിതീവ്ര പ്രളയ, മണ്ണിടിച്ചിൽ സാധ്യത നിലനിൽക്കുന്നതിനാൽ റെഡ് സോൺ മേഖലകളിലുള്ളവർ അടിയന്തരമായി അംഗീകൃത ദുരിതാശ്വാസ കേന്ദ്രങ്ങളിലേക്ക് മാറുക. സഹായത്തിന് 1077 എന്ന നമ്പറിൽ ബന്ധപ്പെടുക.`,
  };

  const transmissionStatus = isBroadcasted ? 'TRANSMITTED' : immediateHabs.length > 0 ? 'READY' : 'STANDBY';

  return (
    <div className="max-w-7xl mx-auto w-full space-y-6 font-sans">
      {/* Top Header Row matching ecme-next */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Alert Center</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Multi-channel emergency broadcast transmitter compliant with ITU-T X.1303 CAP standards
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={
            isPlayingSiren ? (
              <Volume2 className="w-3.5 h-3.5 text-error animate-pulse" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-gray-500" />
            )
          }
          onClick={toggleSiren}
        >
          {isPlayingSiren ? 'Silence Acoustic Siren' : 'Test Acoustic Siren'}
        </Button>
      </div>

      {/* Target Exposure Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card card-border p-5 bg-white shadow-xs space-y-1.5">
          <div className="text-xs font-semibold text-gray-500">Target Settlements</div>
          <div className="text-2xl sm:text-3xl font-bold text-error tracking-tight">
            {immediateHabs.length}
          </div>
          <div className="text-xs text-gray-400">Settlements under directive</div>
        </div>

        <div className="card card-border p-5 bg-white shadow-xs space-y-1.5">
          <div className="text-xs font-semibold text-gray-500">Target Population Reach</div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            {targetPopulation.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400">Citizens in geo-fenced zone</div>
        </div>

        <div className="card card-border p-5 bg-white shadow-xs space-y-1.5">
          <div className="text-xs font-semibold text-gray-500">Active Delivery Channels</div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            {Object.values(channels).filter(Boolean).length} / 5
          </div>
          <div className="text-xs text-gray-400">Redundant broadcast paths</div>
        </div>
      </div>

      {/* 2-Column Workspace: Left Composer + Channel Selector, Right Transmission Review */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: Composer (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="card card-border p-5 bg-white shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3">
              <span className="font-bold text-xs uppercase tracking-wider text-gray-900">
                Message Composer
              </span>

              {/* Language Toggle */}
              <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-xs">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    language === 'en'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('hi')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    language === 'hi'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  हिन्दी
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('regional')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    language === 'regional'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Regional
                </button>
              </div>
            </div>

            {/* Message Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">
                Emergency Message Payload
              </label>
              <textarea
                rows={4}
                value={alertTemplates[language]}
                readOnly
                className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-xs font-normal leading-relaxed focus:outline-none"
              />
            </div>

            {/* Delivery Channels with Real Logos and Clean Toggle Buttons */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <label className="text-xs font-semibold text-gray-700">
                Transmission Channels
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Channel 1: WhatsApp */}
                <button
                  type="button"
                  onClick={() => setChannels({ ...channels, whatsapp: !channels.whatsapp })}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all ${
                    channels.whatsapp
                      ? 'bg-blue-50/60 border-blue-300 text-gray-900 shadow-xs'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <WhatsAppLogo className="w-4 h-4 shrink-0" />
                    <span>Official WhatsApp Broadcast</span>
                  </div>
                  {channels.whatsapp ? (
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-gray-300 shrink-0" />
                  )}
                </button>

                {/* Channel 2: Telecom SMS */}
                <button
                  type="button"
                  onClick={() => setChannels({ ...channels, sms: !channels.sms })}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all ${
                    channels.sms
                      ? 'bg-blue-50/60 border-blue-300 text-gray-900 shadow-xs'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <GSMASmsLogo className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Telecom SMS Gateway</span>
                  </div>
                  {channels.sms ? (
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-gray-300 shrink-0" />
                  )}
                </button>

                {/* Channel 3: Cell-Broadcast */}
                <button
                  type="button"
                  onClick={() => setChannels({ ...channels, cell: !channels.cell })}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all ${
                    channels.cell
                      ? 'bg-blue-50/60 border-blue-300 text-gray-900 shadow-xs'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Cell-Broadcast (4G/5G PWS)</span>
                  </div>
                  {channels.cell ? (
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-gray-300 shrink-0" />
                  )}
                </button>

                {/* Channel 4: FM / AIR Radio */}
                <button
                  type="button"
                  onClick={() => setChannels({ ...channels, radio: !channels.radio })}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all ${
                    channels.radio
                      ? 'bg-blue-50/60 border-blue-300 text-gray-900 shadow-xs'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <TowerControl className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>FM / AIR Radio Intercept</span>
                  </div>
                  {channels.radio ? (
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-gray-300 shrink-0" />
                  )}
                </button>

                {/* Channel 5: Acoustic Sirens */}
                <button
                  type="button"
                  onClick={() => setChannels({ ...channels, pa: !channels.pa })}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all sm:col-span-2 ${
                    channels.pa
                      ? 'bg-blue-50/60 border-blue-300 text-gray-900 shadow-xs'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Radio className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Gram Panchayat Acoustic Sirens</span>
                  </div>
                  {channels.pa ? (
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-gray-300 shrink-0" />
                  )}
                </button>
              </div>
            </div>
            </div>
          </div>

          {/* RIGHT: Transmission Review Panel (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="card card-border p-5 bg-white shadow-xs space-y-4">
              <div className="pb-2 border-b border-gray-200">
                <span className="font-bold text-xs uppercase tracking-wider text-gray-900">
                  Transmission Review
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Target Settlements</span>
                  <span className="font-bold text-gray-900 font-sans">{immediateHabs.length} settlements</span>
                </div>

                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Target Population</span>
                  <span className="font-bold text-gray-900 font-sans">{targetPopulation.toLocaleString()} citizens</span>
                </div>

                <div className="space-y-1 py-1 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Configured Channels</span>
                  <div className="font-medium text-gray-800 text-[11px] space-y-0.5 mt-1">
                    {activeChannelLabels.map((c) => (
                      <div key={c} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{c}</span>
                      </div>
                    ))}
                    {activeChannelLabels.length === 0 && (
                      <span className="text-error font-medium">No channels selected</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1 py-1">
                  <span className="text-gray-500 font-medium">Language Encoding</span>
                  <div className="font-medium text-gray-800 text-xs mt-0.5">
                    {language === 'en' ? 'English (Standard)' : language === 'hi' ? 'Hindi (Devanagari)' : 'Regional Language'}
                  </div>
                </div>
              </div>

              {/* Broadcast Execution Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    const text = encodeURIComponent(alertTemplates[language]);
                    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
                  }}
                  className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl text-xs font-bold bg-[#25D366] hover:bg-[#20ba59] text-white shadow-xs button-press-feedback transition-all"
                >
                  <WhatsAppLogo className="w-4 h-4" fill="#ffffff" />
                  <span>Broadcast Directive on WhatsApp</span>
                </button>

                <Button
                  variant="primary"
                  size="md"
                  icon={<Megaphone className="w-3.5 h-3.5" />}
                  onClick={() => setIsConfirmOpen(true)}
                  disabled={activeChannelLabels.length === 0}
                  className="w-full justify-center !bg-error hover:!bg-red-600 !border-error text-white font-bold"
                >
                  Authorize Full Emergency Broadcast
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Transmission History Audit */}
        <div className="card card-border p-5 bg-white shadow-xs space-y-3">
          <div className="pb-2 border-b border-gray-200">
            <span className="font-bold text-xs uppercase tracking-wider text-gray-900">
              Broadcast Transmission Audit Log
            </span>
          </div>

          <div className="text-xs space-y-2">
            {isBroadcasted && (
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between font-medium">
                <div>
                  <strong className="text-gray-900">Immediate CAP Evacuation Warning</strong> | Broadcasted across {activeChannelLabels.length} channels to {immediateHabs.length} settlements
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  TRANSMITTED JUST NOW
                </span>
              </div>
            )}
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between font-medium">
              <div>
                <strong className="text-gray-900">Historical Monsoon Advisory 04</strong> | Cell-broadcast transmission to {immediateHabs.length} red-zone settlements
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                98.4% Delivered
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between font-medium">
              <div>
                <strong className="text-slate-900">Gram Panchayat Acoustic Siren Diagnostic</strong> | Sub-divisional tower array verification
              </div>
              <span className="font-sans font-semibold text-gray-600 text-xs">Completed</span>
            </div>
          </div>
        </div>

      {/* Confirm Emergency Transmission Modal */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={handleBroadcast}
        title="Confirm Emergency Transmission"
        description="This action will send an emergency warning immediately to the targeted population. This emergency protocol cannot be recalled once dispatched."
        confirmLabel="Confirm Transmission"
      >
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Target Settlements</span>
          <span className="font-bold text-slate-900">{immediateHabs.length} settlements</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Target Population</span>
          <span className="font-bold text-slate-900">{targetPopulation.toLocaleString()} citizens</span>
        </div>
        <div className="flex items-start justify-between gap-3">
          <span className="text-slate-500 shrink-0">Channels</span>
          <span className="font-semibold text-slate-900 text-right">
            {activeChannelLabels.length > 0 ? activeChannelLabels.join(', ') : 'None selected'}
          </span>
        </div>
        <div className="flex items-start justify-between gap-3">
          <span className="text-slate-500 shrink-0">Language</span>
          <span className="font-semibold text-slate-900">
            {language === 'en' ? 'English' : language === 'hi' ? 'Hindi' : 'Regional'}
          </span>
        </div>
      </ConfirmDialog>
    </div>
  );
}
