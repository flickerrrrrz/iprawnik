import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreVertical, Eye, Edit, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { statusColors } from '@/lib/schemas/matter'
import { formatDistanceToNow } from 'date-fns'

interface Matter {
  id: string
  title: string
  client_name: string
  status: 'active' | 'pending' | 'closed' | 'archived'
  matter_type?: string
  created_at: string
  updated_at: string
}

interface MatterCardProps {
  matter: Matter
}

export function MatterCard({ matter }: MatterCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1 flex-1">
          <Link href={`/matters/${matter.id}`}>
            <CardTitle className="text-lg hover:underline cursor-pointer">
              {matter.title}
            </CardTitle>
          </Link>
          <CardDescription>{matter.client_name}</CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/matters/${matter.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/matters/${matter.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Badge
            variant="secondary"
            className={statusColors[matter.status]}
          >
            {matter.status}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(matter.created_at), { addSuffix: true })}
          </span>
        </div>
        {matter.matter_type && (
          <div className="mt-2">
            <Badge variant="outline">{matter.matter_type}</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
