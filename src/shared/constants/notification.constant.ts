export const NotificationEnum = {
  info: 'info',
  warning: 'warning',
  alert: 'alert',
  task: 'task',
  project: 'project',
  system: 'system'
} as const

export type NotificationType = (typeof NotificationEnum)[keyof typeof NotificationEnum]