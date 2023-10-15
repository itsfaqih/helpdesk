import { Badge } from '@/components/base/badge';
import { CheckCircle } from '@phosphor-icons/react';

export function EnabledBadge() {
  return (
    <Badge color="green">
      <CheckCircle className="mr-1.5 w-4 h-4" />
      Enabled
    </Badge>
  );
}
