export const TaskStatus = {
  todo: 'todo',
  doing: 'doing',
  reviewing: 'reviewing',
  rejected: 'rejected',
  completed: 'completed',
  feedbacked: 'feedbacked',
  overdued: 'overdued',
} as const
export const TaskPriority = {
  low: 'low',
  medium: 'medium',
  high: 'high',
} as const

export type TaskPriorityType = (typeof TaskPriority)[keyof typeof TaskPriority]
export type TaskStatusType = keyof typeof TaskStatus

export enum BinaryStatus {
  active = 'active',
  inactive = 'inactive',
}

export enum TaskContentType {
  comment = 'comment',
  note = 'note',
}

export enum TaskContentStatus {
  active = 'active',
  inactive = 'inactive',
}
