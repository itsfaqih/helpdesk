import { Badge } from '@/components/base/badge';
import { XCircle } from '@phosphor-icons/react';

export function DisabledBadge() {
  return (
    <Badge color="gray">
      <XCircle className="w-4 h-4" />
      Disabled
    </Badge>
  );
}
