import { VisibilityOperator } from '@common/enums';

export interface VisibilityCondition {
  questionCode: string;
  operator: VisibilityOperator;
  value?: any;
}
