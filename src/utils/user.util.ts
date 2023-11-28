import { UserRole, UserRoleEnum } from '@/schemas/user.schema';

export const userRoleOptions = UserRoleEnum.options.map((value) => ({
  value,
  label: userRoleValueToLabel(value),
}));

export function userRoleValueToLabel(value: UserRole | '') {
  switch (value) {
    case 'super_admin':
      return 'Super admin';
    case 'operator':
      return 'Operator';
    case '':
      return 'All role';
    default:
      throw new Error('Invalid value');
  }
}

export function userRoleLabelToValue(label: string): UserRole | '' {
  switch (label) {
    case 'Super admin':
      return 'super_admin';
    case 'Operator':
      return 'operator';
    case 'All role':
      return '';
    default:
      throw new Error('Invalid label');
  }
}
