import { NotFoundException } from "@nestjs/common";

export const PackageNotFound = new NotFoundException({
  code: 'NOT_FOUND_EXCEPTION',
  message: 'Package not found',
})