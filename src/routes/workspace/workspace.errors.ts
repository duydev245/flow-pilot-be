import { NotFoundException } from '@nestjs/common'

export const PACKAGE_ERRORS = new NotFoundException({
  code: 'NOT_FOUND_EXCEPTION',
  message: 'Package not found',
})
export const WORKSPACE_ERRORS = new NotFoundException({
  code: 'NOT_FOUND_EXCEPTION',
  message: 'Workspace not found',
})
