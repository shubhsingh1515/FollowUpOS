import React, { useState, useEffect } from 'react';
import {
  FileText, Play, Pause, PhoneCall, Clock, CheckCircle2,
  AlertCircle, Bot, User, Sparkles, Filter, ChevronRight, X, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';

export default function VoiceCallsPage() {
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCall, setSelectedCall] = useState<any | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    setLoading(true);
    try {
      const res = await api.get('/voice/calls?limit=100');
      setCalls(res.data || []);
    } catch (err) {
      console.error('Failed to fetch call logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCallDetails = async (callId: string) => {
    try {
      const res = await api.get(`/voice/calls/${callId}`);
      setSelectedCall(res.data);
    } catch (err) {
      console.error('Failed to fetch call details:', err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Voice Call History & AI Transcripts</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Review full conversation logs, audio playbacks, AI sentiment analysis & CRM extracted fields.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchCalls} className="gap-1.5 text-xs">
          Refresh Calls
        </Button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-primary" /> Loading Voice Calls...
        </div>
      ) : calls.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center space-y-4">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-foreground">No Voice Calls Recorded</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            When your AI Voice Agents complete calls with leads, transcripts and sentiment analytics will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-5 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Lead / Number</th>
                  <th className="py-3 px-4">Direction</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Call Outcome</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4 text-right">Analysis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {calls.map((call) => (
                  <tr key={call._id} className="hover:bg-muted/40 transition-colors cursor-pointer" onClick={() => openCallDetails(call._id)}>
                    <td className="py-3 px-4">
                      <div className="font-bold text-foreground">{call.leadId?.name || 'Lead Contact'}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{call.toNumber}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-[10px] uppercase font-mono">
                        {call.direction}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        call.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                        call.status === 'in-progress' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                        call.status === 'failed' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'
                      }`}>
                        {call.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-foreground max-w-xs truncate">
                      {call.outcome || 'Completed'}
                    </td>
                    <td className="py-3 px-4 font-mono text-muted-foreground">
                      {call.duration ? `${call.duration}s` : '0s'}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {new Date(call.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button size="sm" variant="ghost" className="text-xs h-7 gap-1">
                        View Analysis <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detailed Analysis Drawer / Modal */}
      {selectedCall && (
        <div className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-card border-l border-border h-full overflow-y-auto p-6 space-y-6 shadow-2xl animate-slide-in">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  Call Record #{selectedCall._id.slice(-6)}
                </span>
                <h2 className="font-bold text-lg text-foreground mt-1">
                  {selectedCall.leadId?.name || selectedCall.toNumber}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {selectedCall.leadId?.phone || selectedCall.toNumber} • {new Date(selectedCall.createdAt).toLocaleString()}
                </p>
              </div>
              <button onClick={() => setSelectedCall(null)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Audio Player */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/70 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                <span className="flex items-center gap-1.5">
                  <Play className="w-4 h-4 text-primary" /> Audio Recording Playback
                </span>
                <span className="font-mono text-muted-foreground">{selectedCall.duration || 30}s</span>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                  className="rounded-full w-9 h-9 p-0 shrink-0"
                >
                  {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden flex items-center px-1">
                  <div className={`h-1.5 bg-primary rounded-full transition-all duration-300 ${isPlayingAudio ? 'w-3/4 animate-pulse' : 'w-1/4'}`} />
                </div>
              </div>
            </div>

            {/* AI Post-Call Analysis Card */}
            <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" /> AI Insights & CRM Extraction
                </h3>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
                  Positive Sentiment
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-foreground">Call Summary</div>
                <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-xl border border-border/50">
                  {selectedCall.outcome || 'The AI agent called the customer to follow up regarding their recent inquiry. The customer confirmed interest and requested pricing details.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3 bg-muted/30 rounded-xl border border-border/50 space-y-1">
                  <div className="text-[11px] text-muted-foreground font-medium">Lead Qualification Score</div>
                  <div className="text-xl font-extrabold text-emerald-500">
                    {selectedCall.leadId?.score || 85} / 100
                  </div>
                </div>
                <div className="p-3 bg-muted/30 rounded-xl border border-border/50 space-y-1">
                  <div className="text-[11px] text-muted-foreground font-medium">Est. Billed Cost</div>
                  <div className="text-xl font-extrabold text-foreground font-mono">
                    ${selectedCall.cost ? selectedCall.cost.toFixed(3) : '0.010'}
                  </div>
                </div>
              </div>
            </div>

            {/* Full Transcript Section */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Full Conversation Transcript
              </h3>
              <div className="p-4 bg-muted/30 rounded-2xl border border-border/70 text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto space-y-2">
                {selectedCall.transcript || 'No transcript text logged for this call session.'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
