import envConfig from 'src/shared/config'
import { RoleName } from 'src/shared/constants/role.constant'
import { generateUuid } from 'src/shared/helpers'
import { HashingService } from 'src/shared/services/hashing.service'
import { PrismaService } from 'src/shared/services/prisma.service'

const prisma = new PrismaService()
const hashingService = new HashingService()

const main = async () => {
  // 1. Packages
  const pkgCount = await prisma.package.count()
  if (pkgCount > 0) {
    throw new Error('Packages already exist')
  }

  // Tạo 3 gói: TEAM, GROWTH, ENTERPRISE
  const pkgTeam = await prisma.package.upsert({
    where: { name: 'TEAM' },
    update: {},
    create: {
      id: generateUuid(),
      name: 'TEAM',
      duration_in_months: 1,
      price: 299000,
      description: 'Gói cho đội ngũ nhỏ',
      status: 'active',
    },
  })

  const pkgGrowth = await prisma.package.upsert({
    where: { name: 'GROWTH' },
    update: {},
    create: {
      id: generateUuid(),
      name: 'GROWTH',
      duration_in_months: 1,
      price: 799000,
      description: 'Gói mở rộng cho tăng trưởng',
      status: 'active',
    },
  })

  const pkgEnterprise = await prisma.package.upsert({
    where: { name: 'ENTERPRISE' },
    update: {},
    create: {
      id: generateUuid(),
      name: 'ENTERPRISE',
      duration_in_months: 1,
      price: 1199000,
      description: 'Gói dành cho doanh nghiệp lớn',
      status: 'active',
    },
  })

  // 1.1 Features (dữ liệu tiếng Việt)
  const teamFeatures = [
    { name: 'Tối đa 10 thành viên', description: 'Hạn mức 10 thành viên cho workspace' },
    { name: 'Quản lý hồ sơ nhân sự, nghỉ phép, chấm công', description: 'Quản lý thông tin nhân sự, đơn nghỉ phép và chấm công cơ bản' },
    { name: 'Chế độ Tập trung', description: 'Chế độ giúp tăng sự tập trung khi làm việc' },
    { name: 'Báo cáo hiệu suất cơ bản (tuần/tháng)', description: 'Báo cáo đơn giản theo tuần và tháng' },
    { name: 'Hỗ trợ qua email', description: 'Hỗ trợ khách hàng thông qua email' },
  ]

  for (const f of teamFeatures) {
    // Check if feature exists first
    let feature = await prisma.feature.findFirst({
      where: { name: f.name }
    })

    if (!feature) {
      feature = await prisma.feature.create({
        data: {
          id: generateUuid(),
          name: f.name,
          description: f.description,
          status: 'active',
        },
      })
    }

    // Use upsert for PackageFeature to avoid duplicates
    await prisma.packageFeature.upsert({
      where: {
        package_id_feature_id: {
          package_id: pkgTeam.id,
          feature_id: feature.id,
        }
      },
      update: {},
      create: {
        id: generateUuid(),
        package_id: pkgTeam.id,
        feature_id: feature.id,
      },
    })
  }

  const growthFeatures = [
    { name: 'Tối đa 30 thành viên', description: 'Hạn mức 30 thành viên cho workspace' },
    { name: 'Toàn bộ tính năng trong Team', description: 'Bao gồm toàn bộ tính năng của gói TEAM' },
    { name: 'Báo cáo AI về hiệu suất & năng suất làm việc', description: 'Báo cáo phân tích bằng AI về hiệu suất và năng suất' },
    { name: 'Bảng điều khiển theo thời gian thực', description: 'Dashboard cập nhật số liệu theo thời gian thực' },
    { name: 'Đánh giá hiệu suất 360° & phản hồi đa chiều', description: 'Đánh giá toàn diện và thu thập phản hồi từ nhiều nguồn' },
    { name: 'Tùy chỉnh KPI & mục tiêu nhóm', description: 'Cấu hình KPI và mục tiêu cho từng nhóm' },
    { name: 'Báo cáo tự động (tuần/tháng/quý)', description: 'Tự động gửi báo cáo định kỳ' },
    { name: 'Hỗ trợ ưu tiên', description: 'Ưu tiên hỗ trợ khách hàng' },
  ]

  for (const f of growthFeatures) {
    // Check if feature exists first
    let feature = await prisma.feature.findFirst({
      where: { name: f.name }
    })

    if (!feature) {
      feature = await prisma.feature.create({
        data: {
          id: generateUuid(),
          name: f.name,
          description: f.description,
          status: 'active',
        },
      })
    }

    // Use upsert for PackageFeature to avoid duplicates
    await prisma.packageFeature.upsert({
      where: {
        package_id_feature_id: {
          package_id: pkgGrowth.id,
          feature_id: feature.id,
        }
      },
      update: {},
      create: {
        id: generateUuid(),
        package_id: pkgGrowth.id,
        feature_id: feature.id,
      },
    })
  }

  const enterpriseFeatures = [
    { name: '50 thành viên (có thể mở rộng thêm)', description: 'Hạn mức 50 thành viên, có thể nâng cấp mở rộng' },
    { name: 'Toàn bộ tính năng trong Growth', description: 'Bao gồm toàn bộ tính năng của gói GROWTH' },
    { name: 'Phân tích AI nâng cao: dự báo hiệu suất, phát hiện nguy cơ nghỉ việc', description: 'Phân tích nâng cao dùng AI để dự báo và phát hiện rủi ro' },
    { name: 'Tự động hóa quy trình nhân sự (nhắc nhở, phê duyệt, onboarding)', description: 'Workflows tự động cho quy trình nhân sự' },
    { name: 'Báo cáo tùy biến theo nhu cầu doanh nghiệp', description: 'Báo cáo có thể tuỳ chỉnh theo yêu cầu' },
    { name: 'Hỗ trợ riêng', description: 'Dedicated support cho khách hàng doanh nghiệp' },
    { name: 'Bảo mật nâng cao (SSO, phân quyền truy cập chi tiết)', description: 'Tính năng bảo mật doanh nghiệp: SSO và phân quyền chi tiết' },
  ]

  for (const f of enterpriseFeatures) {
    // Check if feature exists first
    let feature = await prisma.feature.findFirst({
      where: { name: f.name }
    })

    if (!feature) {
      feature = await prisma.feature.create({
        data: {
          id: generateUuid(),
          name: f.name,
          description: f.description,
          status: 'active',
        },
      })
    }

    // Use upsert for PackageFeature to avoid duplicates
    await prisma.packageFeature.upsert({
      where: {
        package_id_feature_id: {
          package_id: pkgEnterprise.id,
          feature_id: feature.id,
        }
      },
      update: {},
      create: {
        id: generateUuid(),
        package_id: pkgEnterprise.id,
        feature_id: feature.id,
      },
    })
  }

  // 2. Workspace
  const wsCount = await prisma.workspace.count()
  if (wsCount > 0) {
    throw new Error('Workspace already exist')
  }

  const workspace = await prisma.workspace.create({
    data: {
      id: generateUuid(),
      name: 'Flow Pilot Workspace',
      company_name: 'FLOWPILOT Ltd.',
      package_id: pkgEnterprise.id,
      start_date: new Date(),
      expire_date: new Date(new Date().setFullYear(new Date().getFullYear() + 12)),
      status: 'active',
    },
  })

  // 3. Departments
  const deptCount = await prisma.department.count()
  if (deptCount > 0) {
    throw new Error('Department already exist')
  }

  const mkt = await prisma.department.create({
    data: { name: 'Marketing', workspace_id: workspace.id, status: 'active' },
  })

  const hr = await prisma.department.create({
    data: { name: 'Human Resourcing', workspace_id: workspace.id, status: 'active' },
  })

  const engineering = await prisma.department.create({
    data: { name: 'Engineering', workspace_id: workspace.id, status: 'active' },
  })

  // 4. Roles
  const roleCount = await prisma.systemRole.count()
  if (roleCount > 0) {
    throw new Error('Roles already exist')
  }

  const roles = await prisma.systemRole.createMany({
    data: [
      { role: RoleName.SuperAdmin },
      { role: RoleName.Admin },
      { role: RoleName.ProjectManager },
      { role: RoleName.Employee },
    ],
  })

  const superAdminRole = await prisma.systemRole.findFirstOrThrow({
    where: { role: RoleName.SuperAdmin },
  })

  const adminRole = await prisma.systemRole.findFirstOrThrow({
    where: { role: RoleName.Admin },
  })

  const managerRole = await prisma.systemRole.findFirstOrThrow({
    where: { role: RoleName.ProjectManager },
  })

  const employeeRole = await prisma.systemRole.findFirstOrThrow({
    where: { role: RoleName.Employee },
  })

  // Hash General Password
  const hashedGeneralPassword = await hashingService.hash(envConfig.GENERAL_PASSWORD)
  
  // 5. Super Admin user (global)
  const superAdminUser = await prisma.user.upsert({
    where: { email: 'superadmin@flowpilot.io.vn' },
    update: {},
    create: {
      email: 'superadmin@flowpilot.io.vn',
      password: hashedGeneralPassword,
      name: 'Super Admin FlowPilot',
      role_id: superAdminRole.id,
      is_first_login: false,
      status: 'active',
    },
  })
  
  // 6. Users (workspace-level)
  const hashedLinhPassword = await hashingService.hash('@Linh123')
  const admin1 = await prisma.user.upsert({
    where: { email: 'linhvkss180600@fpt.edu.vn' },
    update: {},
    create: {
      name: 'Linh Admin',
      email: 'linhvkss180600@fpt.edu.vn',
      password: hashedLinhPassword,
      role_id: adminRole.id,
      workspace_id: workspace.id,
      department_id: hr.id,
      is_first_login: false,
      status: 'active',
    },
  })
  
  const hashedUyenPassword = await hashingService.hash('@Uyen123')
  const admin2 = await prisma.user.upsert({
    where: { email: 'baouyen2468@gmail.com' },
    update: {},
    create: {
      name: 'Uyen Admin',
      email: 'baouyen2468@gmail.com',
      password: hashedUyenPassword,
      role_id: adminRole.id,
      workspace_id: workspace.id,
      department_id: hr.id,
      is_first_login: false,
      status: 'active',
    },
  })

  return {
    createdRoleCount: roles.count,
    superAdminUser,
    admin1,
    admin2,
    workspace,
  }
}

main()
  .then((result) => {
    console.log('✅ Seed done')
    console.info(result)
    if (result && result.superAdminUser && result.admin1 && result.admin2) {
      console.table([result.superAdminUser, result.admin1, result.admin2], ['email', 'name'])
    }
  })
  .catch(console.error)
