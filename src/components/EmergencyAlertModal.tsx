'use client';

import React, { useState } from 'react';
import { Habitation } from '@/types/disaster';
import {
  X,
  Megaphone,
  Volume2,
  VolumeX,
  Radio,
  Send,
  CheckCircle2,
  Smartphone,
  TowerControl,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import ToggleChip from '@/components/ui/ToggleChip';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { WhatsAppLogo, NDMAGovtLogo, GSMASmsLogo } from '@/components/icons/BrandLogos';

interface EmergencyAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetHabitations: Habitation[];
}

export default function EmergencyAlertModal({
  isOpen,
  onClose,
  targetHabitations,
}: EmergencyAlertModalProps) {
  const [isPlayingSiren, setIsPlayingSiren] = useState(false);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [oscillator, setOscillator] = useState<OscillatorNode | null>(null);
  const [isBroadcasted, setIsBroadcasted] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Channels active states (clear active vs inactive distinction)
  const [channels, setChannels] = useState({
    cell: true,
    whatsapp: true,
    sms: true,
    radio: false,
    pa: false,
  });

  if (!isOpen) return null;

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

        setAudioCtx(ctx);
        setOscillator(osc);
        setIsPlayingSiren(true);
      } catch (err) {
        console.error('Audio siren synthesis error', err);
      }
    }
  };

  const alertMessage = `"URGENT DISASTER WARNING [NDMA/BYTEX-DSS]: Flash flood & debris flow risk is imminent. Immediate evacuation ordered for designated red-zone sectors. Buses staging at sub-divisional depots. Move to designated safe shelters immediately. Dial 1077 for emergency assistance."`;

  const handleBroadcast = () => {
    setIsConfirmOpen(false);
    setIsBroadcasted(true);
    setTimeout(() => {
      setIsBroadcasted(false);
      onClose();
    }, 2000);
  };

  const handleWhatsAppBroadcast = () => {
    const text = encodeURIComponent(
      `🚨 URGENT DISASTER DIRECTIVE [NDMA / BYTEX-DSS]\n\nImmediate evacuation ordered for ${targetHabitations.length} high-risk settlements (${targetPopulation.toLocaleString()} citizens).\n\nPlease evacuate immediately to designated safe shelters. Convoys are deploying.\n\nEmergency Helpline: Dial 1077.`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const targetPopulation = targetHabitations.reduce((acc, h) => acc + h.population, 0);

  const channelLabelsMap: Record<string, string> = {
    cell: 'Cell Broadcast',
    whatsapp: 'WhatsApp',
    sms: 'SMS Gateway',
    radio: 'FM Radio',
    pa: 'Siren / PA',
  };
  const activeChannelLabels = Object.entries(channels)
    .filter(([_, active]) => active)
    .map(([k]) => channelLabelsMap[k] || k);

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm font-sans">
      <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-modal overflow-hidden text-gray-900">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gray-100 border border-gray-200 text-gray-900">
              <NDMAGovtLogo className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">
                CAP Emergency Broadcast Dispatcher
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Common Alerting Protocol | NDMA Disaster Gateway
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (isPlayingSiren && oscillator) {
                oscillator.stop();
                setIsPlayingSiren(false);
              }
              onClose();
            }}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Target Habitations Count */}
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-gray-600">
              <Radio className="w-4 h-4 text-gray-500" />
              <span>Target evacuation zone:</span>
            </div>
            <span className="font-semibold text-error">
              {targetHabitations.length} settlements ({targetPopulation.toLocaleString()} citizens)
            </span>
          </div>

          {/* Siren Acoustic Warning Generator */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isPlayingSiren ? (
                <Volume2 className="w-5 h-5 text-error animate-pulse" />
              ) : (
                <VolumeX className="w-5 h-5 text-gray-400" />
              )}
              <div>
                <div className="font-semibold text-xs text-gray-900">Local warning siren</div>
                <div className="text-xs text-gray-500">
                  {isPlayingSiren ? 'Broadcasting 853Hz alert tone...' : 'Test control room siren synthesizer'}
                </div>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={toggleSiren}
            >
              {isPlayingSiren ? 'Silence siren' : 'Test siren'}
            </Button>
          </div>

          {/* Alert Message Preview */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-gray-600">Citizen alert broadcast preview:</span>
              <span className="text-xs font-semibold text-error">
                Priority 1 Directive
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-gray-200 text-xs text-gray-800 leading-relaxed font-sans">
              {alertMessage}
            </div>
          </div>

          {/* Transmission Channels using Real Logos */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block">
              Active transmission channels:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <ToggleChip
                active={channels.whatsapp}
                onClick={() => setChannels({ ...channels, whatsapp: !channels.whatsapp })}
                icon={<WhatsAppLogo className="w-4 h-4" />}
                label="WhatsApp Broadcast"
                className="w-full justify-start text-xs rounded-xl"
              />
              <ToggleChip
                active={channels.sms}
                onClick={() => setChannels({ ...channels, sms: !channels.sms })}
                icon={<GSMASmsLogo className="w-4 h-4 text-primary" />}
                label="Telecom SMS Gateway"
                className="w-full justify-start text-xs rounded-xl"
              />
              <ToggleChip
                active={channels.cell}
                onClick={() => setChannels({ ...channels, cell: !channels.cell })}
                icon={<Smartphone className="w-3.5 h-3.5" />}
                label="Cell Broadcast (PWS)"
                className="w-full justify-start text-xs rounded-xl"
              />
              <ToggleChip
                active={channels.radio}
                onClick={() => setChannels({ ...channels, radio: !channels.radio })}
                icon={<TowerControl className="w-3.5 h-3.5" />}
                label="FM / AIR Radio Intercept"
                className="w-full justify-start text-xs rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Footer with One-Click WhatsApp Action */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleWhatsAppBroadcast}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 border border-[#25D366]/30 transition-all shadow-xs"
            title="Open WhatsApp with prefilled emergency alert"
          >
            <WhatsAppLogo className="w-4 h-4" />
            <span>Open in WhatsApp</span>
          </button>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                if (isPlayingSiren && oscillator) {
                  oscillator.stop();
                  setIsPlayingSiren(false);
                }
                onClose();
              }}
            >
              Cancel
            </Button>

            <Button
              variant="danger"
              size="sm"
              icon={<Send className="w-3.5 h-3.5" />}
              onClick={() => setIsConfirmOpen(true)}
              disabled={isBroadcasted}
            >
              {isBroadcasted ? 'Alerts Dispatched' : 'Transmit CAP Now'}
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={handleBroadcast}
        title="Confirm emergency transmission"
        description="You are about to transmit an official CAP emergency warning. This action cannot be recalled once sent."
        confirmLabel="Confirm transmission"
      >
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Target</span>
          <span className="font-semibold text-slate-900">{targetHabitations.length} settlements</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Population</span>
          <span className="font-semibold text-slate-900">{targetPopulation.toLocaleString()} citizens</span>
        </div>
        <div className="flex items-start justify-between gap-3">
          <span className="text-slate-500 shrink-0">Channels</span>
          <span className="font-semibold text-slate-900 text-right">
            {activeChannelLabels.length > 0 ? activeChannelLabels.join(', ') : 'None selected'}
          </span>
        </div>
      </ConfirmDialog>
    </div>
  );
}
