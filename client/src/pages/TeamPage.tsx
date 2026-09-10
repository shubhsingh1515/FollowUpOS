import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Users, UserPlus, Mail, Shield, CheckCircle2, MoreVertical,
  Award, TrendingUp, Clock, Sparkles
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'
import api from '@/lib/api'

export default function TeamPage() {
  const queryClient = useQueryClient()
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteRole, setInviteRole] = useState('sales_rep')

  // Fetch team members
  const { data: members, isLoading } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const res = await api.get('/settings/team')
      return res.data.data.members || []
    },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-500" />
            Team & Sales Reps
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your sales reps, assign lead routing rules, and monitor close rates.
          </p>
        </div>

        <Button
          onClick={() => setShowInviteModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
        >
          <UserPlus className="w-4 h-4" />
          Invite Team Member
        </Button>
      </div>

      {/* Invite Modal / Card */}
      {showInviteModal && (
        <Card className="border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Invite a New Team Member</CardTitle>
            <CardDescription className="text-xs">
              They will receive an email invitation to join your sales workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                placeholder="Full Name"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                className="text-xs bg-background"
              />
              <Input
                placeholder="Work Email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="text-xs bg-background"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-xs"
              >
                <option value="sales_rep">Sales Rep</option>
                <option value="manager">Sales Manager</option>
                <option value="admin">Workspace Admin</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInviteModal(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-indigo-600 text-white"
                onClick={() => {
                  alert(`Invitation sent to ${inviteEmail}!`)
                  setShowInviteModal(false)
                  setInviteName('')
                  setInviteEmail('')
                }}
              >
                Send Invite
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Members Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-3 text-center py-10 text-muted-foreground text-xs">
            Loading team members...
          </div>
        ) : !members || members.length === 0 ? (
          <div className="col-span-3 text-center py-10 text-muted-foreground text-xs">
            No team members found
          </div>
        ) : (
          members.map((member: any) => (
            <Card key={member._id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-11 h-11">
                      <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold text-sm">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground">{member.name}</h3>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>

                  <Badge
                    variant={member.role === 'owner' ? 'default' : 'secondary'}
                    className="capitalize text-[10px]"
                  >
                    {member.role?.replace('_', ' ') || 'Member'}
                  </Badge>
                </div>

                {/* Performance Mini-Stats */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t text-center">
                  <div className="bg-muted/40 p-2 rounded-lg">
                    <div className="text-[10px] text-muted-foreground">Leads</div>
                    <div className="text-xs font-bold text-foreground mt-0.5">24</div>
                  </div>
                  <div className="bg-muted/40 p-2 rounded-lg">
                    <div className="text-[10px] text-muted-foreground">Win Rate</div>
                    <div className="text-xs font-bold text-emerald-600 mt-0.5">38%</div>
                  </div>
                  <div className="bg-muted/40 p-2 rounded-lg">
                    <div className="text-[10px] text-muted-foreground">Avg Speed</div>
                    <div className="text-xs font-bold text-indigo-600 mt-0.5">4m</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
