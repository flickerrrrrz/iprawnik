import { z } from 'zod'

/**
 * Validation schema for creating/updating matters
 */
export const createMatterSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  client_name: z.string().min(2, 'Client name is required'),
  client_email: z.string().email('Invalid email address').optional().or(z.literal('')),
  client_phone: z.string().optional(),
  client_address: z.string().optional(),
  matter_type: z.enum(['civil', 'criminal', 'administrative', 'other']).default('civil'),
  status: z.enum(['active', 'pending', 'closed', 'archived']).default('active'),
  assigned_to: z.string().uuid().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
})

export type CreateMatterInput = z.infer<typeof createMatterSchema>

/**
 * Status color mapping for badges
 */
export const statusColors = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  archived: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
} as const

/**
 * Priority color mapping for badges
 */
export const priorityColors = {
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
} as const
