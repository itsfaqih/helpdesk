import { Badge } from '@/components/base/badge';
import { CheckCircle } from '@phosphor-icons/react';

export function EnabledBadge() {
  return (
    <Badge color="green">
      <CheckCircle className="w-4 h-4" />
      Enabled
    </Badge>
  );
}
