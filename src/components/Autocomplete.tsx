'use client'

import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import type { Command as CommandPrimitive } from 'cmdk'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface AutocompleteProps {
  data: Array<string>
  value: string | null | undefined
  setValue: React.Dispatch<React.SetStateAction<string | null | undefined>>
  placeholder: string
  defaultValue: string
}

export function Autocomplete(
  props: AutocompleteProps &
    Omit<
      React.ComponentProps<typeof CommandPrimitive.Input>,
      'value' | 'setValue'
    >,
) {
  const { data, value, setValue, placeholder, defaultValue, ...rest } = props
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between"
        >
          {value ? value : defaultValue}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-(--radix-popover-trigger-width)">
        <Command>
          <CommandInput
            {...rest}
            placeholder={placeholder}
            className="h-9"
            onValueChange={(search: string) => setValue(search)}
          />
          <CommandList>
            <CommandEmpty>Not Found</CommandEmpty>
            <CommandGroup>
              {data.map((item) => (
                <CommandItem
                  key={item}
                  value={item}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? '' : currentValue)
                    setOpen(false)
                  }}
                >
                  {item}
                  <Check
                    className={cn(
                      'ml-auto',
                      value === item ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
