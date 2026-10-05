import React, { useState, useEffect } from 'react';
import { Phone, Plus, Search, CheckCircle2, AlertCircle, Loader2, Bot, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';

export default function VoiceNumbersPage() {
  const [numbers, setNumbers] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Purchase modal states
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [areaCode, setAreaCode] = useState('415');
  const [availableNumbers, setAvailableNumbers] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNumbersAndAgents();
  }, []);

  const fetchNumbersAndAgents = async () => {
    setLoading(true);
    try {
      const [numRes, agentRes] = await Promise.all([
        api.get('/voice/numbers').catch(() => ({ data: [] })),
        api.get('/voice/agents').catch(() => ({ data: [] }))
      ]);
      setNumbers(numRes.data || []);
      setAgents(agentRes.data || []);
    } catch (err) {
      console.error('Failed to fetch numbers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchAvailable = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearching(true);
    setError(null);
    try {
      const res = await api.get(`/voice/numbers/search?areaCode=${areaCode}&countryCode=US`);
      setAvailableNumbers(res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to search available numbers');
    } finally {
      setSearching(false);
    }
  };

  const handlePurchase = async (num: any) => {
    setPurchasing(num.phoneNumber);
    setError(null);
    try {
      await api.post('/voice/numbers/purchase', {
        phoneNumber: num.phoneNumber
      });
      setPurchaseModalOpen(false);
      fetchNumbersAndAgents();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to purchase number');
    } finally {
      setPurchasing(null);
    }
  };

  const handleAssignAgent = async (numberId: string, agentId: string) => {
    try {
      await api.post(`/voice/numbers/${numberId}/assign`, { voiceAgentId: agentId });
      fetchNumbersAndAgents();
    } catch (err) {
      console.error('Failed to assign agent:', err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Telnyx Phone Numbers</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your acquired phone numbers and map AI agents to handle incoming and outgoing calls.
          </p>
        </div>
        <Button size="sm" onClick={() => { setPurchaseModalOpen(true); handleSearchAvailable(); }} className="gap-1.5 text-xs">
          <Plus className="w-4 h-4" /> Get New Phone Number
        </Button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-primary" /> Loading Phone Numbers...
        </div>
      ) : numbers.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center space-y-4">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
            <Phone className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-foreground">No Phone Numbers Acquired Yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Purchase a dedicated Telnyx phone number to allow your AI Agents to send & receive voice calls.
          </p>
          <Button size="sm" onClick={() => { setPurchaseModalOpen(true); handleSearchAvailable(); }} className="gap-1.5 text-xs">
            <ShoppingCart className="w-4 h-4" /> Search & Acquire Number
          </Button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-5 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned AI Agent</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {numbers.map((num) => (
                  <tr key={num._id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-foreground">
                      {num.phoneNumber}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-[10px] uppercase font-mono">
                        {num.provider || 'telnyx'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        num.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-muted text-muted-foreground'
                      }`}>
                        {num.status || 'unassigned'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={num.voiceAgentId?._id || num.voiceAgentId || ''}
                        onChange={(e) => handleAssignAgent(num._id, e.target.value)}
                        className="px-2.5 py-1 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="">-- Select Agent --</option>
                        {agents.map((agent) => (
                          <option key={agent._id} value={agent._id}>
                            {agent.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-[10px] text-muted-foreground font-mono">
                        Telnyx Live
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Purchase Modal */}
      {purchaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl p-6 overflow-hidden space-y-4">
            <h2 className="font-bold text-base text-foreground flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" /> Acquire Telnyx Phone Number
            </h2>

            {error && (
              <div className="p-3 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSearchAvailable} className="flex gap-2">
              <input
                type="text"
                value={areaCode}
                onChange={(e) => setAreaCode(e.target.value)}
                placeholder="Area code (e.g. 415)"
                className="flex-1 px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Button type="submit" size="sm" disabled={searching} className="gap-1.5">
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Search
              </Button>
            </form>

            <div className="max-h-60 overflow-y-auto space-y-2 border border-border rounded-xl p-3 bg-muted/20">
              {searching ? (
                <div className="py-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" /> Searching available numbers on Telnyx...
                </div>
              ) : availableNumbers.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No numbers found. Try searching with a different area code.
                </div>
              ) : (
                availableNumbers.map((num) => (
                  <div key={num.phoneNumber} className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border/80 hover:border-primary/50 transition-colors">
                    <div>
                      <div className="font-mono font-bold text-xs text-foreground">{num.nationalFormat || num.phoneNumber}</div>
                      <div className="text-[10px] text-muted-foreground">{num.locality}, {num.region} ({num.countryCode})</div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handlePurchase(num)}
                      disabled={purchasing === num.phoneNumber}
                      className="text-xs h-7 gap-1"
                    >
                      {purchasing === num.phoneNumber ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Acquire $1/mo'}
                    </Button>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="ghost" size="sm" onClick={() => setPurchaseModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
