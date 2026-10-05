import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PhoneCall, Bot, Phone, Play, Clock, Sparkles, AlertCircle,
  CheckCircle2, RefreshCw, BarChart2, Plus, ArrowUpRight,
  TrendingUp, Users, ShieldCheck, FileText, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import OutboundCallModal from '@/components/voice/OutboundCallModal';

export default function VoiceDashboardPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<any>(null);
  const [usage, setUsage] = useState<any>(null);
  const [recentCalls, setRecentCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statusRes, usageRes, callsRes] = await Promise.all([
        api.get('/voice/status').catch(() => ({ data: { status: 'unconfigured' } })),
        api.get('/voice/usage').catch(() => ({ data: {} })),
        api.get('/voice/calls?limit=5').catch(() => ({ data: [] }))
      ]);

      setStatus(statusRes.data);
      setUsage(usageRes.data);
      setRecentCalls(callsRes.data || []);
    } catch (err) {
      console.error('Error fetching voice dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await api.post('/voice/telnyx/test');
      setTestResult(res.data);
    } catch (err: any) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">AI Voice Calling</h1>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-mono text-[10px]">
              Telnyx Production
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Automated AI phone agent calls, inbound call answering, transcripts & post-call CRM extraction.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/voice/agents')} className="gap-1.5 text-xs">
            <Bot className="w-4 h-4 text-primary" /> Manage Agents
          </Button>
          <Button size="sm" onClick={() => setCallModalOpen(true)} className="gap-1.5 text-xs">
            <PhoneCall className="w-4 h-4" /> Start AI Call
          </Button>
        </div>
      </div>

      {/* Connection Status Banner */}
      <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
            status?.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
          }`}>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-foreground">Telnyx Voice Connection</h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border font-mono ${
                status?.status === 'active'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
              }`}>
                {status?.status === 'active' ? 'ACTIVE & CONNECTED' : 'UNCONFIGURED / DEMO'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {status?.status === 'active'
                ? `Connected with API key starting with ${status?.apiKey ? status.apiKey.slice(0, 8) + '...' : 'TELNYX_KEY'}`
                : 'Telnyx Voice API credentials can be configured per organization in Settings or Integrations.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestConnection}
            disabled={testingConnection}
            className="text-xs gap-1.5"
          >
            {testingConnection ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
            Test Telnyx API
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/integrations')} className="text-xs gap-1">
            Configure <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {testResult && (
        <div className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
          testResult.success
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
            : 'bg-destructive/10 text-destructive border-destructive/20'
        }`}>
          {testResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{testResult.message || (testResult.success ? 'Telnyx connection active & verified!' : 'Connection test failed.')}</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Total AI Calls</span>
            <PhoneCall className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-extrabold text-foreground tracking-tight">
            {usage?.totalCalls || 0}
          </div>
          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            <span>Synced across all leads</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Voice Minutes Used</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-foreground tracking-tight">
            {usage?.totalMinutes || 0} <span className="text-xs font-normal text-muted-foreground">mins</span>
          </div>
          <div className="text-[11px] text-muted-foreground">
            Billed via Telnyx account
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Active AI Agents</span>
            <Bot className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-foreground tracking-tight">
            {usage?.activeAgents || 0}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {usage?.numbersCount || 0} phone numbers assigned
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Estimated Cost</span>
            <BarChart2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-foreground tracking-tight">
            ${usage?.totalCost?.toFixed(2) || '0.00'}
          </div>
          <div className="text-[11px] text-muted-foreground">
            ~$0.02 / minute rate
          </div>
        </div>
      </div>

      {/* Quick Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto">
        <Button size="sm" variant="secondary" className="text-xs font-semibold rounded-xl gap-1.5">
          Overview
        </Button>
        <Button size="sm" variant="ghost" onClick={() => navigate('/voice/agents')} className="text-xs text-muted-foreground hover:text-foreground rounded-xl gap-1.5">
          <Bot className="w-3.5 h-3.5" /> AI Agents
        </Button>
        <Button size="sm" variant="ghost" onClick={() => navigate('/voice/numbers')} className="text-xs text-muted-foreground hover:text-foreground rounded-xl gap-1.5">
          <Phone className="w-3.5 h-3.5" /> Phone Numbers
        </Button>
        <Button size="sm" variant="ghost" onClick={() => navigate('/voice/calls')} className="text-xs text-muted-foreground hover:text-foreground rounded-xl gap-1.5">
          <FileText className="w-3.5 h-3.5" /> Call History
        </Button>
        <Button size="sm" variant="ghost" onClick={() => navigate('/voice/campaigns')} className="text-xs text-muted-foreground hover:text-foreground rounded-xl gap-1.5">
          <Users className="w-3.5 h-3.5" /> Campaigns
        </Button>
      </div>

      {/* Recent Calls List */}
      <div className="bg-card rounded-2xl border border-border shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-foreground">Recent Voice Calls</h3>
            <p className="text-xs text-muted-foreground">Live activity log of AI calls made across leads</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/voice/calls')} className="text-xs gap-1 text-primary">
            View All Calls <ArrowUpRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        {recentCalls.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-foreground">No Voice Calls Recorded Yet</div>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Start your first AI outbound call or setup an outbound campaign to automate your lead follow-ups.
            </p>
            <Button size="sm" onClick={() => setCallModalOpen(true)} className="gap-1.5 text-xs">
              <PhoneCall className="w-3.5 h-3.5" /> Start First Call
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold">
                  <th className="py-2.5 px-3">Lead / Target</th>
                  <th className="py-2.5 px-3">Direction</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Outcome</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {recentCalls.map((call) => (
                  <tr key={call._id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-foreground">{call.leadId?.name || call.toNumber}</div>
                      <div className="text-[10px] text-muted-foreground">{call.toNumber}</div>
                    </td>
                    <td className="py-3 px-3 capitalize text-muted-foreground">
                      <Badge variant="outline" className="text-[10px]">
                        {call.direction}
                      </Badge>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        call.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                        call.status === 'in-progress' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                        call.status === 'failed' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'
                      }`}>
                        {call.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-foreground font-medium truncate max-w-xs">
                      {call.outcome || 'Call Ended'}
                    </td>
                    <td className="py-3 px-3 text-muted-foreground font-mono">
                      {call.duration ? `${call.duration}s` : '0s'}
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">
                      {new Date(call.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => navigate('/voice/calls')} className="text-xs h-7 px-2">
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <OutboundCallModal
        isOpen={callModalOpen}
        onClose={() => setCallModalOpen(false)}
        leadId=""
        leadName="Lead"
        onCallInitiated={fetchDashboardData}
      />
    </div>
  );
}
