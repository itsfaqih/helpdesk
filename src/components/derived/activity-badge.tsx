import { CheckCircle, XCircle } from '@phosphor-icons/react';
import { Badge } from '../base/badge';

export function ActiveBadge() {
  return (
    <Badge color="emerald">
      <CheckCircle className="w-4 h-4" />
      Active
    </Badge>
  );
}

export function InactiveBadge() {
  return (
    <Badge color="gray">
      <XCircle className="w-4 h-4" />
      Inactive
    </Badge>
  );
}
