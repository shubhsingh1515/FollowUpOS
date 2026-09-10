import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Calendar, CheckCircle2, XCircle, Clock, Wand2, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/primitives'
import { temperatureLabel, getInitials, timeAgo, cn } from '@/lib/utils'
import api from '@/lib/api'

function FollowUpCard({ task, onComplete, onCancel, onGenerate }: {
  task: any
  onComplete: (id: string) => void
  onCancel: (id: string) => void
  onGenerate: (id: string) => void
}) {
  const lead = task.leadId
  const contact = lead?.contactId
  const isOverdue = new Date(task.scheduledAt) < new Date() && task.status === 'pending'
  const { icon: tempIcon, className: tempClass } = temperatureLabel(lead?.leadTemperature)

  return (
    <Card className={cn('transition-all hover:shadow-md', isOverdue && 'border-red-200 bg-red-50/30')}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-9 w-9 mt-0.5 shrink-0">
              <AvatarFallback className={cn('text-sm font-medium', lead?.leadTemperature === 'hot' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700')}>
                {getInitials(contact?.fullName || '')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <Link to={`/leads/${lead?._id}`} className="font-medium text-sm hover:text-primary">
                  {contact?.fullName}
                </Link>
                <span>{tempIcon}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {contact?.company} · {lead?.service || 'General inquiry'}
              </div>
              <div className={cn('flex items-center gap-1.5 mt-1 text-xs', isOverdue ? 'text-red-600' : 'text-muted-foreground')}>
                <Clock className="w-3 h-3" />
                <span>
                  {isOverdue ? 'Overdue: ' : 'Due: '}
                  {new Date(task.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
                {isOverdue && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Overdue</Badge>}
              </div>
              {task.message && (
                <div className="mt-2 text-xs text-muted-foreground bg-muted rounded-lg p-2 max-w-sm line-clamp-2">
                  {task.message}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            {!task.message && task.status === 'pending' && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => onGenerate(task._id)}
              >
                <Wand2 className="w-3 h-3 mr-1" />
                Generate
              </Button>
            )}
            {task.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => onComplete(task._id)}
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Mark Done
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-muted-foreground"
                  onClick={() => onCancel(task._id)}
                >
                  <XCircle className="w-3 h-3 mr-1" />
                  Cancel
                </Button>
              </>
            )}
            {task.status === 'completed' && (
              <Badge variant="success" className="text-xs">Done ✓</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function FollowUpsPage() {
  const queryClient = useQueryClient()

  const { data: todayTasks, isLoading: todayLoading } = useQuery({
    queryKey: ['followups', 'today'],
    queryFn: async () => {
      const { data } = await api.get('/followups?filter=today')
      return data.data.tasks
    },
    refetchInterval: 30000,
  })

  const { data: upcomingTasks } = useQuery({
    queryKey: ['followups', 'upcoming'],
    queryFn: async () => {
      const { data } = await api.get('/followups?filter=upcoming&status=pending')
      return data.data.tasks
    },
  })

  const { data: overdueTasks } = useQuery({
    queryKey: ['followups', 'overdue'],
    queryFn: async () => {
      const { data } = await api.get('/followups?filter=overdue')
      return data.data.tasks
    },
  })

  const completeMutation = useMutation({
    mutationFn: (id: string) => api.post(`/followups/${id}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followups'] })
    },
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.post(`/followups/${id}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followups'] })
    },
  })

  const generateMutation = useMutation({
    mutationFn: (id: string) => api.post(`/followups/${id}/generate-message`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followups'] })
    },
  })

  const todayCount = todayTasks?.filter((t: any) => t.status === 'pending').length || 0
  const overdueCount = overdueTasks?.filter((t: any) => t.status === 'pending').length || 0

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Follow-ups
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {todayCount} pending today · {overdueCount} overdue
        </p>
      </div>

      <Tabs defaultValue="today">
        <TabsList>
          <TabsTrigger value="today">
            Today {todayCount > 0 && <span className="ml-1.5 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{todayCount}</span>}
          </TabsTrigger>
          <TabsTrigger value="overdue">
            Overdue {overdueCount > 0 && <span className="ml-1.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{overdueCount}</span>}
          </TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="mt-4">
          {todayLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
            </div>
          ) : !todayTasks?.length ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🎉</div>
              <p className="font-medium">No follow-ups today!</p>
              <p className="text-sm text-muted-foreground mt-1">You're all caught up. Great work!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayTasks.map((task: any) => (
                <FollowUpCard
                  key={task._id}
                  task={task}
                  onComplete={(id) => completeMutation.mutate(id)}
                  onCancel={(id) => cancelMutation.mutate(id)}
                  onGenerate={(id) => generateMutation.mutate(id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="overdue" className="mt-4">
          {!overdueTasks?.length ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">✅</div>
              <p className="font-medium">No overdue follow-ups!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {overdueTasks.map((task: any) => (
                <FollowUpCard
                  key={task._id}
                  task={task}
                  onComplete={(id) => completeMutation.mutate(id)}
                  onCancel={(id) => cancelMutation.mutate(id)}
                  onGenerate={(id) => generateMutation.mutate(id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="mt-4">
          {!upcomingTasks?.length ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📅</div>
              <p className="font-medium">No upcoming follow-ups scheduled</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingTasks.map((task: any) => (
                <FollowUpCard
                  key={task._id}
                  task={task}
                  onComplete={(id) => completeMutation.mutate(id)}
                  onCancel={(id) => cancelMutation.mutate(id)}
                  onGenerate={(id) => generateMutation.mutate(id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
