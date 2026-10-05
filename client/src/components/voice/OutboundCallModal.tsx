import React, { useState, useEffect } from 'react';
import { Phone, PhoneCall, Bot, AlertCircle, CheckCircle2, Loader2, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

interface OutboundCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  leadName?: string;
  leadPhone?: string;
  onCallInitiated?: () => void;
}

export const OutboundCallModal: React.FC<OutboundCallModalProps> = ({
  isOpen,
  onClose,
  leadId,
  leadName,
  leadPhone,
  onCallInitiated
}) => {
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>(leadPhone || '');
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [calling, setCalling] = useState(false);
  const [callSuccess, setCallSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPhoneNumber(leadPhone || '');
      setCallSuccess(false);
      setError(null);
      fetchAgents();
    }
  }, [isOpen, leadPhone]);

  const fetchAgents = async () => {
    setLoadingAgents(true);
    try {
      const res = await api.get('/voice/agents');
      setAgents(res.data || []);
      if (res.data && res.data.length > 0) {
        setSelectedAgentId(res.data[0]._id);
      }
    } catch (err: any) {
      console.error('Failed to fetch agents:', err);
    } finally {
      setLoadingAgents(false);
    }
  };

  const handleStartCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgentId) {
      setError('Please select an AI Agent');
      return;
    }
    if (!phoneNumber) {
      setError('Phone number is required');
      return;
    }

    setCalling(true);
    setError(null);

    try {
      await api.post('/voice/calls', {
        leadId,
        voiceAgentId: selectedAgentId,
        toNumber: phoneNumber
      });
      setCallSuccess(true);
      if (onCallInitiated) onCallInitiated();
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to initiate AI Voice call');
    } finally {
      setCalling(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-foreground tracking-tight flex items-center gap-2">
              AI Voice Call
              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono px-2 py-0.5 rounded-full font-semibold border border-emerald-500/20">
                Telnyx Live
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">Initiate outbound follow-up call to {leadName || 'Lead'}</p>
          </div>
        </div>

        {callSuccess ? (
          <div className="py-8 text-center space-y-3 animate-fade-in">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-foreground text-sm">Call Initiated Successfully!</h4>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Telnyx is dialing {phoneNumber}. AI Agent will conduct conversation and update CRM timeline automatically.
            </p>
          </div>
        ) : (
          <form onSubmit={handleStartCall} className="space-y-4">
            {error && (
              <div className="p-3 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Target Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Select AI Voice Agent
              </label>
              {loadingAgents ? (
                <div className="py-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading Agents...
                </div>
              ) : agents.length === 0 ? (
                <div className="p-3 text-xs bg-muted rounded-xl text-muted-foreground text-center">
                  No active AI Voice Agents. Creating default Sales Agent...
                </div>
              ) : (
                <select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {agents.map((agent) => (
                    <option key={agent._id} value={agent._id}>
                      {agent.name} ({agent.voiceId || 'Default Voice'})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="p-3 bg-muted/40 rounded-xl border border-border/60 text-[11px] text-muted-foreground space-y-1">
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> AI Follow-up Automation Active
              </div>
              <p>Transcript will be analyzed post-call. Sentiment, lead score, and extracted action items will be synced to CRM profile.</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={calling}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={calling || loadingAgents} className="gap-2">
                {calling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Dialing Telnyx...
                  </>
                ) : (
                  <>
                    <PhoneCall className="w-4 h-4" /> Start AI Call
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default OutboundCallModal;
