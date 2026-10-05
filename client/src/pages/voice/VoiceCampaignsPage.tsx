import React, { useState, useEffect } from 'react';
import { Users, Plus, Play, Pause, XCircle, Bot, AlertCircle, Loader2, CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';

export default function VoiceCampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    voiceAgentId: '',
    filterStage: 'new',
    maxAttempts: 1
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [campRes, agentRes] = await Promise.all([
        api.get('/voice/campaigns').catch(() => ({ data: [] })),
        api.get('/voice/agents').catch(() => ({ data: [] }))
      ]);
      setCampaigns(campRes.data || []);
      setAgents(agentRes.data || []);
      if (agentRes.data && agentRes.data.length > 0) {
        setFormData((prev) => ({ ...prev, voiceAgentId: agentRes.data[0]._id }));
      }
    } catch (err) {
      console.error('Failed to fetch campaigns data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Campaign name is required');
      return;
    }
    if (!formData.voiceAgentId) {
      setError('Please select an AI Voice Agent');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await api.post('/voice/campaigns', formData);
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create campaign');
    } finally {
      setSaving(false);
    }
  };

  const handleStart = async (id: string) => {
    try {
      await api.post(`/voice/campaigns/${id}/start`);
      fetchData();
    } catch (err) {
      console.error('Failed to start campaign:', err);
    }
  };

  const handlePause = async (id: string) => {
    try {
      await api.post(`/voice/campaigns/${id}/pause`);
      fetchData();
    } catch (err) {
      console.error('Failed to pause campaign:', err);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this campaign?')) return;
    try {
      await api.post(`/voice/campaigns/${id}/cancel`);
      fetchData();
    } catch (err) {
      console.error('Failed to cancel campaign:', err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Outbound Voice Campaigns</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Automate high-volume AI outbound phone follow-ups across target lead segments.
          </p>
        </div>
        <Button size="sm" onClick={() => setModalOpen(true)} className="gap-1.5 text-xs">
          <Plus className="w-4 h-4" /> Create Voice Campaign
        </Button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-primary" /> Loading Campaigns...
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center space-y-4">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-foreground">No Outbound Voice Campaigns</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Launch batch voice campaigns to call multiple leads automatically with AI agents and analyze outcomes.
          </p>
          <Button size="sm" onClick={() => setModalOpen(true)} className="gap-1.5 text-xs">
            <Plus className="w-4 h-4" /> Create First Campaign
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {campaigns.map((c) => {
            const total = c.stats?.total || 0;
            const completed = c.stats?.completed || 0;
            const called = c.stats?.called || 0;
            const progress = total > 0 ? Math.round(((completed + called) / total) * 100) : 0;

            return (
              <div key={c._id} className="bg-card border border-border rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/40 transition-all">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-base text-foreground">{c.name}</h3>
                    <Badge variant={
                      c.status === 'running' ? 'default' :
                      c.status === 'completed' ? 'secondary' : 'outline'
                    } className="capitalize text-[10px]">
                      {c.status}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-medium text-foreground">
                      <Bot className="w-3.5 h-3.5 text-primary" /> Agent: {c.voiceAgentId?.name || 'Default Agent'}
                    </span>
                    <span>Max Attempts: {c.maxAttempts || 1}</span>
                    <span>Created: {new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1 max-w-md pt-1">
                    <div className="flex justify-between text-[11px] font-semibold text-muted-foreground">
                      <span>Progress: {progress}%</span>
                      <span>{completed + called} / {total} Leads</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-center">
                  {c.status === 'draft' || c.status === 'paused' ? (
                    <Button size="sm" onClick={() => handleStart(c._id)} className="gap-1.5 text-xs">
                      <Play className="w-3.5 h-3.5" /> Start Campaign
                    </Button>
                  ) : c.status === 'running' ? (
                    <Button size="sm" variant="secondary" onClick={() => handlePause(c._id)} className="gap-1.5 text-xs">
                      <Pause className="w-3.5 h-3.5" /> Pause
                    </Button>
                  ) : null}

                  {c.status !== 'cancelled' && c.status !== 'completed' && (
                    <Button size="sm" variant="outline" onClick={() => handleCancel(c._id)} className="text-xs text-destructive hover:bg-destructive/10">
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Creation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 overflow-hidden space-y-4">
            <h2 className="font-bold text-base text-foreground">Launch Outbound Voice Campaign</h2>

            {error && (
              <div className="p-3 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Campaign Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Q4 Re-engagement Phone Blast"
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Select AI Voice Agent</label>
                <select
                  value={formData.voiceAgentId}
                  onChange={(e) => setFormData({ ...formData, voiceAgentId: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                >
                  {agents.map((agent) => (
                    <option key={agent._id} value={agent._id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Target Lead Filter</label>
                <select
                  value={formData.filterStage}
                  onChange={(e) => setFormData({ ...formData, filterStage: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="new">New Incoming Leads</option>
                  <option value="contacted">Contacted Leads</option>
                  <option value="qualified">Qualified High Intent Leads</option>
                  <option value="all">All Registered Leads</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Campaign'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
