import { Injectable, Logger } from '@nestjs/common'
import { validate as isUuid } from 'uuid'
import { DepartmentRepository } from './department.repo'
import { CreateDepartmentBodyType, CreateDepartmentType, UpdateDepartmentType } from './department.model'
import {
    DepartmentNotFoundError,
    DepartmentNameExistsError,
    InvalidDepartmentIdError,
    WorkspaceNotFoundError,
    DepartmentHasUsersError,
} from './department.error'
import { SuccessResponse } from 'src/shared/sucess'

@Injectable()
export class DepartmentService {
    private readonly logger = new Logger(DepartmentService.name)

    constructor(private readonly departmentRepository: DepartmentRepository) { }

    async getAll(page: number = 1, limit: number = 10) {
        try {
            const result = await this.departmentRepository.getAll(page, limit)
            return SuccessResponse('Departments retrieved successfully', result)
        } catch (error) {
            this.logger.error(`Error getting departments: ${error.message}`)
            throw error
        }
    }

    async getAllByWorkspace(workspaceId: string, page: number = 1, limit: number = 10) {
        try {
            if (!isUuid(workspaceId)) {
                throw WorkspaceNotFoundError
            }

            const result = await this.departmentRepository.getAllByWorkspace(workspaceId, page, limit)

            return SuccessResponse('Departments retrieved successfully', result)
        } catch (error) {
            this.logger.error(`Error getting departments: ${error.message}`)
            throw error
        }
    }

    async getById(id: number) {
        try {
            if (!id || isNaN(id)) {
                throw InvalidDepartmentIdError
            }

            const department = await this.departmentRepository.findById(id)

            if (!department) {
                throw DepartmentNotFoundError
            }

            return SuccessResponse('Department retrieved successfully', department)
        } catch (error) {
            this.logger.error(`Error getting department by id: ${error.message}`)
            throw error
        }
    }

    async create(workspaceId: string, data: CreateDepartmentBodyType) {
        try {
            // Validate workspace exists
            if (!isUuid(workspaceId)) {
                throw WorkspaceNotFoundError
            }

            const workspaceExists = await this.departmentRepository.checkWorkspaceExists(workspaceId)
            if (!workspaceExists) {
                throw WorkspaceNotFoundError
            }

            // Check if department name already exists in workspace
            const existingDepartment = await this.departmentRepository.findByNameAndWorkspace(
                data.name,
                workspaceId,
            )

            if (existingDepartment) {
                throw DepartmentNameExistsError
            }

            const department = await this.departmentRepository.create({ ...data, workspace_id: workspaceId })

            return SuccessResponse('Department created successfully', department)
        } catch (error) {
            this.logger.error(`Error creating department: ${error.message}`)
            throw error
        }
    }

    async update(id: number, data: UpdateDepartmentType) {
        try {
            if (!id || isNaN(id)) {
                throw InvalidDepartmentIdError
            }

            // Check if department exists
            const existingDepartment = await this.departmentRepository.findById(id)
            if (!existingDepartment) {
                throw DepartmentNotFoundError
            }

            // If updating name, check for duplicates in the same workspace
            if (data.name && data.name !== existingDepartment.name) {
                const duplicateDepartment = await this.departmentRepository.findByNameAndWorkspace(
                    data.name,
                    existingDepartment.workspace_id,
                )

                if (duplicateDepartment && duplicateDepartment.id !== id) {
                    throw DepartmentNameExistsError
                }
            }

            const updatedDepartment = await this.departmentRepository.update(id, data)

            return SuccessResponse('Department updated successfully', updatedDepartment)
        } catch (error) {
            this.logger.error(`Error updating department: ${error.message}`)
            throw error
        }
    }

    async delete(id: number) {
        try {
            if (!id || isNaN(id)) {
                throw InvalidDepartmentIdError
            }

            // Check if department exists
            const department = await this.departmentRepository.findById(id)
            if (!department) {
                throw DepartmentNotFoundError
            }

            // Check if department has users
            const userCount = await this.departmentRepository.getUserCount(id)
            if (userCount > 0) {
                throw DepartmentHasUsersError
            }

            await this.departmentRepository.delete(id)

            return SuccessResponse('Department deleted successfully')
        } catch (error) {
            this.logger.error(`Error deleting department: ${error.message}`)
            throw error
        }
    }
}
