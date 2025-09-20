import envConfig from "src/shared/config";
import { RoleName } from "src/shared/constants/role.constant";
import { generateUuid } from "src/shared/helpers";
import { HashingService } from "src/shared/services/hashing.service";
import { PrismaService } from "src/shared/services/prisma.service"

const prisma = new PrismaService()
const hashingService = new HashingService()

const main = async () => {
    // 1. Packages
    const pkgCount = await prisma.package.count();
    if (pkgCount > 0) {
        throw new Error('Packages already exist')
    }

    const pkgBasic = await prisma.package.upsert({
        where: { name: "Basic" },
        update: {},
        create: {
            id: generateUuid(),
            name: "Basic",
            price: 100,
            status: "active",
        },
    });

    const pkgPro = await prisma.package.upsert({
        where: { name: "Pro" },
        update: {},
        create: {
            id: generateUuid(),
            name: "Pro",
            price: 300,
            status: "active",
        },
    });

    // 1.1 Features
    // Tạo 2 features cho mỗi package
    const feature1 = await prisma.feature.create({
        data: {
            id: generateUuid(),
            name: "Kanban Board",
            description: "Quản lý công việc theo dạng bảng Kanban",
            package_id: pkgBasic.id,
            status: "active",
        },
    });
    const feature2 = await prisma.feature.create({
        data: {
            id: generateUuid(),
            name: "Task Assignment",
            description: "Giao việc cho thành viên",
            package_id: pkgBasic.id,
            status: "active",
        },
    });
    const feature3 = await prisma.feature.create({
        data: {
            id: generateUuid(),
            name: "Advanced Report",
            description: "Báo cáo nâng cao cho quản lý",
            package_id: pkgPro.id,
            status: "active",
        },
    });
    const feature4 = await prisma.feature.create({
        data: {
            id: generateUuid(),
            name: "Time Tracking",
            description: "Theo dõi thời gian làm việc từng task",
            package_id: pkgPro.id,
            status: "active",
        },
    });

    // 2. Workspace
    const wsCount = await prisma.workspace.count();
    if (wsCount > 0) {
        throw new Error('Workspace already exist')
    }

    const workspace = await prisma.workspace.create({
        data: {
            id: generateUuid(),
            name: "ACME Workspace",
            company_name: "ACME Ltd.",
            package_id: pkgPro.id,
            start_date: new Date(),
            expire_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            status: "active",
        },
    });

    // 3. Departments
    const deptCount = await prisma.department.count();
    if (deptCount > 0) {
        throw new Error('Department already exist')
    }

    const hr = await prisma.department.create({
        data: { name: "Human Resourcing", workspace_id: workspace.id, status: "active" },
    });

    const engineering = await prisma.department.create({
        data: { name: "Engineering", workspace_id: workspace.id, status: "active" },
    });

    // 4. Roles
    const roleCount = await prisma.systemRole.count();
    if (roleCount > 0) {
        throw new Error('Roles already exist')
    }

    const roles = await prisma.systemRole.createMany({
        data: [
            { role: RoleName.SuperAdmin },
            { role: RoleName.Admin },
            { role: RoleName.ProjectManager },
            { role: RoleName.Employee },
        ]
    });

    const superAdminRole = await prisma.systemRole.findFirstOrThrow({
        where: { role: RoleName.SuperAdmin },
    });

    const adminRole = await prisma.systemRole.findFirstOrThrow({
        where: { role: RoleName.Admin },
    });

    const managerRole = await prisma.systemRole.findFirstOrThrow({
        where: { role: RoleName.ProjectManager },
    });

    const employeeRole = await prisma.systemRole.findFirstOrThrow({
        where: { role: RoleName.Employee },
    });

    // Hash General Password
    const hashedGeneralPassword = await hashingService.hash(envConfig.GENERAL_PASSWORD);

    // 5. Super Admin user (global)
    const superAdminUser = await prisma.user.upsert({
        where: { email: envConfig.SUPERADMIN_EMAIL },
        update: {},
        create: {
            email: envConfig.SUPERADMIN_EMAIL,
            password: hashedGeneralPassword,
            name: envConfig.GENERAL_NAME,
            role_id: superAdminRole.id,
            is_first_login: false,
            status: 'active'
        }
    })

    // 6. Users (workspace-level)
    const admin = await prisma.user.upsert({
        where: { email: envConfig.ADMIN_EMAIL },
        update: {},
        create: {
            name: "Admin ACME",
            email: envConfig.ADMIN_EMAIL,
            password: hashedGeneralPassword,
            role_id: adminRole.id,
            workspace_id: workspace.id,
            department_id: hr.id,
            status: "active",
        },
    });

    const manager = await prisma.user.upsert({
        where: { email: envConfig.MANAGER_EMAIL },
        update: {},
        create: {
            name: "Project Manager",
            email: envConfig.MANAGER_EMAIL,
            password: hashedGeneralPassword,
            role_id: managerRole.id,
            workspace_id: workspace.id,
            department_id: engineering.id,
            status: "active",
        },
    });

    const employee = await prisma.user.upsert({
        where: { email: envConfig.EMPLOYEE_EMAIL },
        update: {},
        create: {
            name: "Employee One",
            email: envConfig.EMPLOYEE_EMAIL,
            password: hashedGeneralPassword,
            role_id: employeeRole.id,
            workspace_id: workspace.id,
            department_id: engineering.id,
            status: "active",
        },
    });

    // 7. Project
    const project = await prisma.project.create({
        data: {
            id: generateUuid(),
            name: "Website Revamp",
            workspace_id: workspace.id,
            manager_id: manager.id,
            start_date: new Date(),
            end_date: new Date(new Date().setMonth(new Date().getMonth() + 6)),
            manager_id: manager.id,
            status: "active",
        },
    });


    // 8. Tasks
    const task1 = await prisma.task.create({
        data: {
            id: generateUuid(),
            name: "Setup Landing Page",
            project_id: project.id,
            start_at: new Date(),
            // due_date removed, not in Task model
            status: "todo",
            priority: "medium",
        },
    });
    const task2 = await prisma.task.create({
        data: {
            id: generateUuid(),
            name: "Integrate Auth System",
            project_id: project.id,
            start_at: new Date(),
            // due_date removed, not in Task model
            status: "doing",
            priority: "high",
        },
    });

    await prisma.taskUser.create({
        data: {
            task_id: task1.id,
            user_id: employee.id,
            assigned_at: new Date(),
        },
    });
    await prisma.taskUser.create({
        data: {
            task_id: task2.id,
            user_id: employee.id,
            assigned_at: new Date(),
        },
    });

    // 9. Order + Payment
    const order = await prisma.order.create({
        data: {
            id: generateUuid(),
            workspace_id: workspace.id,
            package_id: pkgPro.id,
            order_date: new Date(),
            total_amount: 300,
            status: "confirmed",
        },
    });

    await prisma.payment.create({
        data: {
            id: generateUuid(),
            order_id: order.id,
            payment_date: new Date(),
            amount: 300,
            payment_method: "momo",
            status: "success",
        },
    });
    
    return {
        createdRoleCount: roles.count,
        superAdminUser,
        admin,
        manager,
        employee,
        workspace,
        project,
    };
}

main()
    .then((result) => {
        console.log("✅ Seed done");
        console.info(result);
        console.table(result, ["email", "name"]);
    })
    .catch(console.error)
