import * as RadixDialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export const Dialog = RadixDialog.Root
export const DialogTitle = RadixDialog.Title
export const DialogDescription = RadixDialog.Description

export function DialogContent({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 bg-black/40" />
      <RadixDialog.Content
        className={cn(
          'fixed top-1/2 left-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg',
          className,
        )}
      >
        {children}
        <RadixDialog.Close className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="h-4 w-4" />
        </RadixDialog.Close>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  )
}
