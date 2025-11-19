export const ProjectStatus = {
  not_started: 'not_started',
  active: 'active',
  completed: 'completed',
  inactive: 'inactive',
} as const

export type ProjectStatusType = (typeof ProjectStatus)[keyof typeof ProjectStatus]

export const ProjectRole = {
  ProjectManager: 'Project Manager',
  Developer: 'Developer',
  Designer: 'Designer',
  Tester: 'Tester',
  TeamLead: 'Team Lead',
  Member: 'Member',
} as const

export type ProjectRoleType = (typeof ProjectRole)[keyof typeof ProjectRole]
