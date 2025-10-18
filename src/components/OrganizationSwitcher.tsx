import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useState } from 'react';
import { useOrganization } from '@/hooks/useOrganization';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export const OrganizationSwitcher = () => {
  const [open, setOpen] = useState(false);
  const { currentOrganization, userOrganizations, switchOrganization } = useOrganization();

  if (!currentOrganization || userOrganizations.length === 0) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2 truncate">
            <span className="text-lg">{currentOrganization.icon}</span>
            <span className="truncate">{currentOrganization.name}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0">
        <Command>
          <CommandInput placeholder="Search organization..." />
          <CommandEmpty>No organization found.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {userOrganizations.map((org) => (
                <CommandItem
                  key={org.id}
                  value={org.name}
                  onSelect={() => {
                    if (org.id !== currentOrganization.id) {
                      switchOrganization(org.id);
                    }
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      currentOrganization.id === org.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex items-center gap-2 flex-1 truncate">
                    <span>{org.icon}</span>
                    <div className="flex-1 truncate">
                      <div className="truncate">{org.name}</div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {org.role}
                    </Badge>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
