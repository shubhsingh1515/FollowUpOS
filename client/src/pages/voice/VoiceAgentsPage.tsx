import React, { useState, useEffect } from 'react';
import { Bot, Plus, Trash2, Edit, Sparkles, Check, AlertCircle, Loader2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';

export default function VoiceAgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    voiceId: 'alloy',
    language: 'en-US',
    instructions: '',
    isActive: true
  });

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/voice/agents');
      setAgents(res.data || []);
    } catch (err) {
      console.error('Failed to fetch agents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingAgent(null);
    setFormData({
      name: 'Sales Follow-up Agent',
      voiceId: 'alloy',
      language: 'en-US',
      instructions: 'You are an AI sales specialist for {{organization.name}}. Your job is to call {{lead.firstName}} from {{lead.company}}, qualify their needs, answer questions, and schedule a demo.',
      isActive: true
    });
    setError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (agent: any) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name || '',
      voiceId: agent.voiceId || 'alloy',
      language: agent.language || 'en-US',
      instructions: agent.instructions || '',
      isActive: agent.isActive !== undefined ? agent.isActive : true
    });
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Agent name is required');
      return;
    }
    setSaving(true);
    setError(null);

    try {
      if (editingAgent) {
        await api.put(`/voice/agents/${editingAgent._id}`, formData);
      } else {
        await api.post('/voice/agents', formData);
      }
      setModalOpen(false);
      fetchAgents();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save agent');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (agentId: string) => {
    if (!confirm('Are you sure you want to delete this AI Voice Agent?')) return;
    try {
      await api.delete(`/voice/agents/${agentId}`);
      fetchAgents();
    } catch (err) {
      console.error('Failed to delete agent:', err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">AI Voice Agents</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Configure custom conversational personas, voice signatures & system prompts for Telnyx calls.
          </p>
        </div>
        <Button size="sm" onClick={handleOpenCreate} className="gap-1.5 text-xs">
          <Plus className="w-4 h-4" /> Create AI Voice Agent
        </Button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-primary" /> Loading Voice Agents...
        </div>
      ) : agents.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center space-y-4">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
            <Bot className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-foreground">No AI Voice Agents Created</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Build your first AI Voice Agent to conduct automated qualification calls with prospective leads.
          </p>
          <Button size="sm" onClick={handleOpenCreate} className="gap-1.5 text-xs">
            <Plus className="w-4 h-4" /> Create AI Agent
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {agents.map((agent) => (
            <div key={agent._id} className="bg-card border border-border rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-primary/40 transition-all">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-foreground">{agent.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                          Voice: {agent.voiceId || 'alloy'}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {agent.language || 'en-US'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={agent.isActive ? 'default' : 'secondary'} className="text-[10px]">
                    {agent.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="mt-4 p-3 bg-muted/40 rounded-xl border border-border/60 text-xs text-muted-foreground line-clamp-3 font-mono">
                  "{agent.instructions || 'No prompt specified.'}"
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/60">
                <span className="text-[10px] text-muted-foreground">
                  Updated {new Date(agent.updatedAt || agent.createdAt).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(agent)} className="h-8 px-2 text-xs">
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(agent._id)} className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Creating / Editing Agent */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl p-6 overflow-hidden">
            <h2 className="font-bold text-lg text-foreground mb-4">
              {editingAgent ? 'Edit AI Voice Agent' : 'Create AI Voice Agent'}
            </h2>

            {error && (
              <div className="mb-4 p-3 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Agent Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Inbound Qualification Agent"
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Voice Selection</label>
                  <select
                    value={formData.voiceId}
                    onChange={(e) => setFormData({ ...formData, voiceId: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="alloy">Alloy (Warm Neutral)</option>
                    <option value="echo">Echo (Confident Male)</option>
                    <option value="fable">Fable (British Editorial)</option>
                    <option value="onyx">Onyx (Deep Professional)</option>
                    <option value="nova">Nova (Energetic Female)</option>
                    <option value="shimmer">Shimmer (Clear Conversational)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Primary Language</label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="en-US">English (US)</option>
                    <option value="en-GB">English (UK)</option>
                    <option value="es-ES">Spanish (Spain)</option>
                    <option value="fr-FR">French (France)</option>
                    <option value="de-DE">German (Germany)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1 flex items-center justify-between">
                  <span>Conversational System Prompt</span>
                  <span className="text-[10px] text-primary font-mono flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Dynamic variables supported
                  </span>
                </label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  rows={5}
                  placeholder="Define instructions for the agent..."
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                  required
                />
                <div className="mt-2 p-2.5 bg-muted/40 rounded-xl text-[10px] text-muted-foreground flex flex-wrap gap-1.5">
                  <span className="font-semibold text-foreground">Variables:</span>
                  <code className="bg-background px-1.5 py-0.5 rounded border">{'{{lead.firstName}}'}</code>
                  <code className="bg-background px-1.5 py-0.5 rounded border">{'{{lead.company}}'}</code>
                  <code className="bg-background px-1.5 py-0.5 rounded border">{'{{lead.phone}}'}</code>
                  <code className="bg-background px-1.5 py-0.5 rounded border">{'{{organization.name}}'}</code>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="isActiveToggle" className="text-xs font-medium text-foreground cursor-pointer">
                  Active (Ready for outbound and inbound calls)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Agent'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
