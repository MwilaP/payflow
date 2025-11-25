import { Minus, Square, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Titlebar() {
  const handleMinimize = () => {
    if (window.electron) {
      // Will need to add IPC handler for this
      console.log('Minimize window')
    }
  }

  const handleMaximize = () => {
    if (window.electron) {
      // Will need to add IPC handler for this
      console.log('Maximize window')
    }
  }

  const handleClose = () => {
    if (window.electron) {
      // Will need to add IPC handler for this
      console.log('Close window')
    }
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 h-10 bg-background border-b flex items-center justify-between px-4 z-50"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* App Title/Logo */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-foreground">Payroll System</span>
      </div>

      {/* Window Controls */}
      <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-muted"
          onClick={handleMinimize}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-muted"
          onClick={handleMaximize}
        >
          <Square className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
