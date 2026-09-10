import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/store/authStore'
import { formatCurrency } from '@/lib/utils'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, FunnelChart,
  Funnel, LabelList, Legend,
} from 'recharts'
import api from '@/lib/api'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6']

export default function AnalyticsPage() {
  const { organization } = useAuthStore()
  const currency = organization?.currency || 'INR'

  const { data: overview } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/overview')
      return data.data
    },
  })

  const { data: sourcesData } = useQuery({
    queryKey: ['analytics', 'sources'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/sources')
      return data.data
    },
  })

  const { data: funnelData } = useQuery({
    queryKey: ['analytics', 'funnel'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/funnel')
      return data.data
    },
  })

  const { data: revenueData } = useQuery({
    queryKey: ['analytics', 'revenue'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/revenue')
      return data.data
    },
  })

  const { data: teamData } = useQuery({
    queryKey: ['analytics', 'team'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/team')
      return data.data
    },
  })

  const { data: trendsData } = useQuery({
    queryKey: ['analytics', 'trends'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/trends?days=30')
      return data.data
    },
  })

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Your sales performance overview</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Leads', value: overview?.totalLeads },
          { label: 'Conversion Rate', value: overview ? `${overview.conversionRate}%` : '—' },
          { label: 'Avg Lead Score', value: overview?.avgLeadScore },
          { label: 'Won Revenue', value: overview ? formatCurrency(overview.wonRevenue, currency) : '—' },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground mb-1">{kpi.label}</div>
              <div className="text-2xl font-bold">{kpi.value ?? <Skeleton className="h-7 w-16" />}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead trend */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Leads — Last 30 Days</CardTitle>
          </CardHeader>
          <CardContent>
            {trendsData?.length ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={trendsData}>
                  <defs>
                    <linearGradient id="gradLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" name="Leads" stroke="#6366f1" strokeWidth={2} fill="url(#gradLeads)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : <Skeleton className="h-48" />}
          </CardContent>
        </Card>

        {/* Sources */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Leads by Source</CardTitle>
          </CardHeader>
          <CardContent>
            {sourcesData?.length ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={sourcesData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border" />
                  <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} />
                  <YAxis type="category" dataKey="source" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={80} />
                  <Tooltip />
                  <Bar dataKey="count" name="Leads" radius={[0, 4, 4, 0]}>
                    {sourcesData.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <Skeleton className="h-48" />}
          </CardContent>
        </Card>

        {/* Revenue by month */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Won Revenue by Month</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueData?.length ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false}
                    tickFormatter={(v) => formatCurrency(v, currency)} />
                  <Tooltip formatter={(v: number) => [formatCurrency(v, currency), 'Revenue']} />
                  <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                No revenue data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conversion funnel */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            {funnelData?.length ? (
              <div className="space-y-2">
                {funnelData.map((stage: any, i: number) => (
                  <div key={stage.stage} className="flex items-center gap-3">
                    <div className="text-xs capitalize w-24 shrink-0 text-muted-foreground">{stage.stage}</div>
                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${Math.min((stage.count / (funnelData[0]?.count || 1)) * 100, 100)}%`, background: COLORS[i % COLORS.length] }}
                      />
                    </div>
                    <div className="text-xs font-medium w-8 text-right">{stage.count}</div>
                  </div>
                ))}
              </div>
            ) : <Skeleton className="h-48" />}
          </CardContent>
        </Card>
      </div>

      {/* Team performance */}
      {teamData?.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Team Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs text-muted-foreground py-2 font-medium">Sales Rep</th>
                    <th className="text-right text-xs text-muted-foreground py-2 font-medium">Leads</th>
                    <th className="text-right text-xs text-muted-foreground py-2 font-medium">Hot</th>
                    <th className="text-right text-xs text-muted-foreground py-2 font-medium">Won</th>
                    <th className="text-right text-xs text-muted-foreground py-2 font-medium">Conversion</th>
                    <th className="text-right text-xs text-muted-foreground py-2 font-medium">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {teamData.map((member: any) => (
                    <tr key={member.userId} className="border-b border-border/50">
                      <td className="py-2.5 text-sm font-medium">{member.user?.name || 'Unknown'}</td>
                      <td className="py-2.5 text-sm text-right">{member.totalLeads}</td>
                      <td className="py-2.5 text-sm text-right text-red-600">{member.hotLeads}</td>
                      <td className="py-2.5 text-sm text-right text-green-600">{member.wonLeads}</td>
                      <td className="py-2.5 text-sm text-right">{member.conversionRate}%</td>
                      <td className="py-2.5 text-sm text-right font-medium">{formatCurrency(member.totalValue, currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
