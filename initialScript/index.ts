import envConfig from "src/shared/config";
import { RoleName } from "src/shared/constants/role.constant";
import { HashingService } from "src/shared/services/hashing.service";
import { PrismaService } from "src/shared/services/prisma.service"

const prisma = new PrismaService()
const hashingService = new HashingService()

const main = async () => {
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

    const adminRole = await prisma.systemRole.findFirstOrThrow({
        where: {
            role: RoleName.SuperAdmin
        }
    });

    const hashedPassword = await hashingService.hash(envConfig.ADMIN_PASSWORD);

    const adminUser = await prisma.user.create({
        data: {
            email: envConfig.ADMIN_EMAIL,
            password: hashedPassword,
            name: envConfig.ADMIN_NAME,
            role_id: adminRole.id,
            status: 'active'
        }
    });

    return {
        createdRoleCount: roles.count,
        adminUser,
    }
}

main()
    .then(({ adminUser, createdRoleCount }) => {
        console.log(`Created ${createdRoleCount} roles`)
        console.log(`Created admin user: ${adminUser.email}`)
    })
    .catch(console.error)
