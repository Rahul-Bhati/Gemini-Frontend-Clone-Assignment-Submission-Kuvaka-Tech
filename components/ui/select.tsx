"use client"

import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectContextType {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  onOpenChange: (open: boolean) => void
  placeholder?: string
}

const SelectContext = React.createContext<SelectContextType | undefined>(undefined)

const useSelectContext = () => {
  const context = React.useContext(SelectContext)
  if (!context) {
    throw new Error("Select components must be used within a Select")
  }
  return context
}

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
  children: React.ReactNode
  disabled?: boolean
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ value, onValueChange, defaultValue, children, disabled }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue || "")
    const [open, setOpen] = React.useState(false)

    const currentValue = value !== undefined ? value : internalValue
    const handleValueChange = onValueChange || setInternalValue

    const contextValue: SelectContextType = {
      value: currentValue,
      onValueChange: handleValueChange,
      open,
      onOpenChange: setOpen,
    }

    return (
      <SelectContext.Provider value={contextValue}>
        <div ref={ref} className={cn("relative", disabled && "opacity-50 pointer-events-none")}>
          {children}
        </div>
      </SelectContext.Provider>
    )
  },
)
Select.displayName = "Select"

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { open, onOpenChange } = useSelectContext()

    return (
      <button
        ref={ref}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        onClick={() => onOpenChange(!open)}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    )
  },
)
SelectTrigger.displayName = "SelectTrigger"

interface SelectValueProps {
  placeholder?: string
  className?: string
}

const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProps>(({ placeholder, className }, ref) => {
  const { value } = useSelectContext()
  const [displayValue, setDisplayValue] = React.useState<React.ReactNode>(null)

  React.useEffect(() => {
    // This will be set by SelectItem when it mounts
    const event = new CustomEvent("select-value-update", { detail: { value } })
    window.dispatchEvent(event)
  }, [value])

  React.useEffect(() => {
    const handleValueUpdate = (event: CustomEvent) => {
      if (event.detail.value === value && event.detail.children) {
        setDisplayValue(event.detail.children)
      }
    }

    window.addEventListener("select-item-mount", handleValueUpdate as EventListener)
    return () => window.removeEventListener("select-item-mount", handleValueUpdate as EventListener)
  }, [value])

  return (
    <span ref={ref} className={cn("block truncate", className)}>
      {displayValue || placeholder || "Select an option..."}
    </span>
  )
})
SelectValue.displayName = "SelectValue"

interface SelectContentProps {
  children: React.ReactNode
  className?: string
  position?: "top" | "bottom"
  align?: "start" | "center" | "end"
}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ children, className, position = "bottom", align = "start" }, ref) => {
    const { open, onOpenChange } = useSelectContext()
    const contentRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
          onOpenChange(false)
        }
      }

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          onOpenChange(false)
        }
      }

      if (open) {
        document.addEventListener("mousedown", handleClickOutside)
        document.addEventListener("keydown", handleEscape)
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
        document.removeEventListener("keydown", handleEscape)
      }
    }, [open, onOpenChange])

    if (!open) return null

    return (
      <div
        ref={contentRef}
        className={cn(
          "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
          position === "top" ? "bottom-full mb-1" : "top-full mt-1",
          align === "start" && "left-0",
          align === "center" && "left-1/2 -translate-x-1/2",
          align === "end" && "right-0",
          className,
        )}
        role="listbox"
      >
        <div className="max-h-60 overflow-auto">{children}</div>
      </div>
    )
  },
)
SelectContent.displayName = "SelectContent"

interface SelectItemProps {
  value: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ value, children, className, disabled }, ref) => {
    const { value: selectedValue, onValueChange, onOpenChange } = useSelectContext()
    const isSelected = selectedValue === value

    React.useEffect(() => {
      // Notify SelectValue about this item's existence
      const event = new CustomEvent("select-item-mount", {
        detail: { value, children },
      })
      window.dispatchEvent(event)
    }, [value, children])

    const handleClick = () => {
      if (!disabled) {
        onValueChange(value)
        onOpenChange(false)
      }
    }

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault()
        handleClick()
      }
    }

    return (
      <div
        ref={ref}
        role="option"
        aria-selected={isSelected}
        tabIndex={disabled ? -1 : 0}
        className={cn(
          "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
          isSelected && "bg-accent text-accent-foreground",
          disabled && "pointer-events-none opacity-50",
          className,
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          {isSelected && <Check className="h-4 w-4" />}
        </span>
        <span className="block truncate">{children}</span>
      </div>
    )
  },
)
SelectItem.displayName = "SelectItem"

interface SelectLabelProps {
  children: React.ReactNode
  className?: string
}

const SelectLabel = React.forwardRef<HTMLDivElement, SelectLabelProps>(({ children, className }, ref) => {
  return (
    <div ref={ref} className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}>
      {children}
    </div>
  )
})
SelectLabel.displayName = "SelectLabel"

interface SelectSeparatorProps {
  className?: string
}

const SelectSeparator = React.forwardRef<HTMLDivElement, SelectSeparatorProps>(({ className }, ref) => {
  return <div ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} />
})
SelectSeparator.displayName = "SelectSeparator"

export { Select, SelectContent, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue }
