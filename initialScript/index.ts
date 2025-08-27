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
            name: "Basic",
            price: 100,
            status: "active",
        },
    });

    const pkgPro = await prisma.package.upsert({
        where: { name: "Pro" },
        update: {},
        create: {
            name: "Pro",
            price: 300,
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

    const hr = await prisma.department.upsert({
        where: { id: 1 },
        update: {},
        create: { name: "Human Resourcing", workspace_id: workspace.id, status: "active" },
    });

    const engineering = await prisma.department.upsert({
        where: { id: 2 },
        update: {},
        create: { name: "Engineering", workspace_id: workspace.id, status: "active" },
    });

    // 4. Roles
    const roleCount = await prisma.systemRole.count();
    if (roleCount > 0) {
        throw new Error('Roles already exist')
    }

    const roles = await prisma.systemRole.createMany({
        data: [
            {
                role: RoleName.SuperAdmin,
            },
            {
                role: RoleName.Admin,
            },
            {
                role: RoleName.ProjectManager,
            },
            {
                role: RoleName.Employee,
            },
        ]
    })

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
            status: 'active'
        }
    })

    // 6. Users (workspace-level)
    const admin = await prisma.user.upsert({
        where: { email: "admin@acme.com" },
        update: {},
        create: {
            name: "Admin ACME",
            email: "admin@acme.com",
            password: hashedGeneralPassword,
            role_id: adminRole.id,
            workspace_id: workspace.id,
            department_id: hr.id,
            status: "active",
        },
    });

    const manager = await prisma.user.upsert({
        where: { email: "manager@acme.com" },
        update: {},
        create: {
            name: "Project Manager",
            email: "manager@acme.com",
            password: hashedGeneralPassword,
            role_id: managerRole.id,
            workspace_id: workspace.id,
            department_id: engineering.id,
            status: "active",
        },
    });

    const employee = await prisma.user.upsert({
        where: { email: "employee1@acme.com" },
        update: {},
        create: {
            name: "Employee One",
            email: "employee1@acme.com",
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
            name: "Website Revamp",
            workspace_id: workspace.id,
            start_date: new Date(),
            end_date: new Date(new Date().setMonth(new Date().getMonth() + 6)),
            status: "active",
        },
    });


    // 8. Tasks
    await prisma.task.createMany({
        data: [
            {
                id: generateUuid(),
                name: "Setup Landing Page",
                project_id: project.id,
                start_date: new Date(),
                due_date: new Date(new Date().setDate(new Date().getDate() + 7)),
                start_at: new Date(),
                status: "todo",
                priority: "medium",
            },
            {
                id: generateUuid(),
                name: "Integrate Auth System",
                project_id: project.id,
                start_date: new Date(),
                due_date: new Date(new Date().setDate(new Date().getDate() + 14)),
                start_at: new Date(),
                status: "doing",
                priority: "high",
            },
        ],
        skipDuplicates: true,
    });

    const firstTask = await prisma.task.findFirst({
        where: { name: "Setup Landing Page", project_id: project.id }
    });

    if (firstTask) {
        await prisma.taskUser.upsert({
            where: {
                task_id_user_id: {
                    task_id: firstTask.id,
                    user_id: employee.id
                }
            },
            update: {},
            create: {
                task_id: firstTask.id,
                user_id: employee.id,
                assigned_at: new Date()
            }
        });
    }

    const secondTask = await prisma.task.findFirst({
        where: { name: "Integrate Auth System", project_id: project.id }
    });

    if (secondTask) {
        await prisma.taskUser.upsert({
            where: {
                task_id_user_id: {
                    task_id: secondTask.id,
                    user_id: employee.id
                }
            },
            update: {},
            create: {
                task_id: secondTask.id,
                user_id: employee.id,
                assigned_at: new Date()
            }
        });
    }

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
