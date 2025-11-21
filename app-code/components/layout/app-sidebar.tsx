'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  FileText,
  Upload,
  CheckSquare,
  Users,
  Settings,
  LogOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface AppSidebarProps {
  tenantName?: string
  userFullName?: string
  userEmail?: string
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Matters', href: '/matters', icon: FileText },
  { name: 'Documents', href: '/documents', icon: Upload },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Team', href: '/team', icon: Users },
]

export function AppSidebar({ tenantName, userFullName, userEmail }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      {/* Logo & Tenant */}
      <div className="p-6">
        <h1 className="text-2xl font-bold">Prawnik AI</h1>
        {tenantName && (
          <p className="mt-1 text-sm text-muted-foreground">{tenantName}</p>
        )}
      </div>

      <Separator />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      <Separator />

      {/* User Menu */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>
              {userFullName?.split(' ').map((n) => n[0]).join('') || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium">{userFullName || 'User'}</p>
            <p className="truncate text-xs text-muted-foreground">
              {userEmail || 'user@example.com'}
            </p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <Button variant="ghost" size="sm" className="flex-1" asChild>
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
          <form action="/auth/signout" method="post">
            <Button variant="ghost" size="sm" type="submit">
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
