import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { AlertTriangle, AlertCircle, Info, HelpCircle, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type ConfirmationVariant = 'danger' | 'warning' | 'info' | 'default'

export interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  description: React.ReactNode
  confirmText?: string
  cancelText?: string
  variant?: ConfirmationVariant
  icon?: React.ReactNode
  isLoading?: boolean
}

const variantStyles: Record<
  ConfirmationVariant,
  {
    iconBg: string
    iconColor: string
    defaultIcon: React.ReactNode
    confirmButtonVariant: 'destructive' | 'default'
    confirmButtonClass?: string
  }
> = {
  danger: {
    iconBg: 'bg-red-500/10 border-red-500/20 text-red-500',
    iconColor: 'text-red-500',
    defaultIcon: <AlertTriangle className="w-5 h-5" />,
    confirmButtonVariant: 'destructive',
    confirmButtonClass: 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20',
  },
  warning: {
    iconBg: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
    iconColor: 'text-amber-500',
    defaultIcon: <AlertCircle className="w-5 h-5" />,
    confirmButtonVariant: 'default',
    confirmButtonClass: 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/20',
  },
  info: {
    iconBg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500',
    iconColor: 'text-indigo-500',
    defaultIcon: <Info className="w-5 h-5" />,
    confirmButtonVariant: 'default',
    confirmButtonClass: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20',
  },
  default: {
    iconBg: 'bg-muted border-border text-foreground',
    iconColor: 'text-foreground',
    defaultIcon: <HelpCircle className="w-5 h-5" />,
    confirmButtonVariant: 'default',
    confirmButtonClass: '',
  },
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  icon,
  isLoading = false,
}: ConfirmationModalProps) {
  const styles = variantStyles[variant] || variantStyles.default

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (isLoading) return
    await onConfirm()
  }

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogPrimitive.Portal>
        {/* Backdrop */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity animate-fade-in data-[state=closed]:animate-fade-out" />

        {/* Content Container */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <DialogPrimitive.Content
            onEscapeKeyDown={(e) => {
              if (isLoading) e.preventDefault()
            }}
            onPointerDownOutside={(e) => {
              if (isLoading) e.preventDefault()
            }}
            className="w-full max-w-md rounded-2xl border border-border bg-card/95 p-6 shadow-2xl backdrop-blur-md transition-all animate-scale-in focus:outline-none data-[state=closed]:animate-scale-out"
          >
            {/* Header & Icon */}
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border',
                  styles.iconBg
                )}
              >
                {icon || styles.defaultIcon}
              </div>

              <div className="flex-1 min-w-0 pr-6">
                <DialogPrimitive.Title className="text-base font-bold text-foreground tracking-tight">
                  {title}
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  {description}
                </DialogPrimitive.Description>
              </div>

              {!isLoading && (
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-2.5 pt-2 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isLoading}
                className="h-9 text-xs px-4 border-border/80 hover:bg-muted/80"
              >
                {cancelText}
              </Button>
              <Button
                type="button"
                variant={styles.confirmButtonVariant}
                size="sm"
                onClick={handleConfirm}
                disabled={isLoading}
                className={cn('h-9 text-xs px-4 gap-1.5 font-semibold', styles.confirmButtonClass)}
              >
                {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {confirmText}
              </Button>
            </div>
          </DialogPrimitive.Content>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export default ConfirmationModal
