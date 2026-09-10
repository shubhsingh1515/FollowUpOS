import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Search, Plus, Mail, Phone, Building } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { getInitials, cn } from '@/lib/utils'
import api from '@/lib/api'

export default function ContactsPage() {
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['contacts', search],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '50' })
      if (search) params.append('search', search)
      const { data } = await api.get(`/contacts?${params}`)
      return data.data
    },
  })

  return (
    <div className="p-4 lg:p-6 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Contacts</h1>
          <p className="text-sm text-muted-foreground">{data?.total ?? 0} contacts</p>
        </div>
        <Button size="sm"><Plus className="w-4 h-4 mr-1.5" />Add Contact</Button>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search contacts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />) :
          data?.contacts?.map((contact: any) => (
            <Card key={contact._id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-indigo-100 text-indigo-700 text-sm font-medium">
                    {getInitials(contact.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">{contact.fullName}</div>
                  <div className="text-xs text-muted-foreground">{contact.jobTitle}</div>
                  {contact.company && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Building className="w-3 h-3" />
                      <span className="truncate">{contact.company}</span>
                    </div>
                  )}
                  {contact.email && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <Phone className="w-3 h-3" />
                      <span>{contact.phone}</span>
                    </div>
                  )}
                </div>
                <Badge variant="secondary" className="text-[10px] shrink-0">
                  {contact.leadCount || 0} leads
                </Badge>
              </div>
            </Card>
          ))}
      </div>
    </div>
  )
}
