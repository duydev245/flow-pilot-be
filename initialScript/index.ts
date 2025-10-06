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
    const feature = await prisma.feature.create({
      data: {
        id: generateUuid(),
        name: f.name,
        description: f.description,
        status: 'active',
      },
    })

    await prisma.packageFeature.create({
      data: {
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
    const feature = await prisma.feature.create({
      data: {
        id: generateUuid(),
        name: f.name,
        description: f.description,
        status: 'active',
      },
    })

    await prisma.packageFeature.create({
      data: {
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
    const feature = await prisma.feature.create({
      data: {
        id: generateUuid(),
        name: f.name,
        description: f.description,
        status: 'active',
      },
    })

    await prisma.packageFeature.create({
      data: {
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
      name: 'ACME Workspace',
      company_name: 'ACME Ltd.',
  package_id: pkgGrowth.id,
      start_date: new Date(),
      expire_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      status: 'active',
    },
  })

  // 3. Departments
  const deptCount = await prisma.department.count()
  if (deptCount > 0) {
    throw new Error('Department already exist')
  }

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
    where: { email: envConfig.SUPERADMIN_EMAIL },
    update: {},
    create: {
      email: envConfig.SUPERADMIN_EMAIL,
      password: hashedGeneralPassword,
      name: envConfig.GENERAL_NAME,
      role_id: superAdminRole.id,
      is_first_login: false,
      status: 'active',
    },
  })

  // 6. Users (workspace-level)
  const admin = await prisma.user.upsert({
    where: { email: envConfig.ADMIN_EMAIL },
    update: {},
    create: {
      name: 'Admin ACME',
      email: envConfig.ADMIN_EMAIL,
      password: hashedGeneralPassword,
      role_id: adminRole.id,
      workspace_id: workspace.id,
      department_id: hr.id,
      status: 'active',
    },
  })

  const manager = await prisma.user.upsert({
    where: { email: envConfig.MANAGER_EMAIL },
    update: {},
    create: {
      name: 'Project Manager',
      email: envConfig.MANAGER_EMAIL,
      password: hashedGeneralPassword,
      role_id: managerRole.id,
      workspace_id: workspace.id,
      department_id: engineering.id,
      status: 'active',
    },
  })

  const employee = await prisma.user.upsert({
    where: { email: envConfig.EMPLOYEE_EMAIL },
    update: {},
    create: {
      name: 'Employee One',
      email: envConfig.EMPLOYEE_EMAIL,
      password: hashedGeneralPassword,
      role_id: employeeRole.id,
      workspace_id: workspace.id,
      department_id: engineering.id,
      status: 'active',
    },
  })

  // 7. Project
  const project = await prisma.project.create({
    data: {
      id: generateUuid(),
      name: 'Website Revamp',
      workspace_id: workspace.id,
      manager_id: manager.id,
      start_date: new Date(),
      end_date: new Date(new Date().setMonth(new Date().getMonth() + 6)),
      status: 'active',
    },
  })

  // 8. Tasks
  const now = new Date()
  const due1 = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) // 3 ngày sau
  const due2 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 ngày sau
  const duePast = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 ngày trước

  const task1 = await prisma.task.create({
    data: {
      id: generateUuid(),
      name: 'Setup Landing Page',
      project_id: project.id,
      start_at: now,
      due_at: due1,
      status: 'todo',
      priority: 'medium',
    },
  })
  const task2 = await prisma.task.create({
    data: {
      id: generateUuid(),
      name: 'Integrate Auth System',
      project_id: project.id,
      start_at: now,
      due_at: due2,
      status: 'doing',
      priority: 'high',
    },
  })
  // Task quá hạn để test
  const overdueTask = await prisma.task.create({
    data: {
      id: generateUuid(),
      name: 'Overdue Task',
      project_id: project.id,
      start_at: now,
      due_at: duePast,
      status: 'todo',
      priority: 'low',
    },
  })

  // 8.1 TaskContent
  await prisma.taskContent.create({
    data: {
      task_id: task1.id,
      user_id: employee.id,
      content: 'Initial content for task 1',
      type: 'comment',
      status: 'active',
    },
  })
  await prisma.taskContent.create({
    data: {
      task_id: task2.id,
      user_id: employee.id,
      content: 'Initial content for task 2',
      type: 'note',
      status: 'active',
    },
  })

  // 8.2 TaskChecklist
  await prisma.taskChecklist.create({
    data: {
      task_id: task1.id,
      title: 'Checklist 1 for task 1',
      status: 'active',
      is_completed: false,
    },
  })
  await prisma.taskChecklist.create({
    data: {
      task_id: task2.id,
      title: 'Checklist 1 for task 2',
      status: 'active',
      is_completed: false,
    },
  })

  await prisma.taskUser.create({
    data: {
      task_id: task1.id,
      user_id: employee.id,
      assigned_at: new Date(),
    },
  })
  await prisma.taskUser.create({
    data: {
      task_id: task2.id,
      user_id: employee.id,
      assigned_at: new Date(),
    },
  })

  // 9. Tạo thêm nhân viên để có nhiều dữ liệu performance
  const employee2 = await prisma.user.create({
    data: {
      name: 'Employee Two',
      email: 'employee2@example.com',
      password: hashedGeneralPassword,
      role_id: employeeRole.id,
      workspace_id: workspace.id,
      department_id: engineering.id,
      status: 'active',
    },
  })

  const employee3 = await prisma.user.create({
    data: {
      name: 'Employee Three',
      email: 'employee3@example.com',
      password: hashedGeneralPassword,
      role_id: employeeRole.id,
      workspace_id: workspace.id,
      department_id: engineering.id,
      status: 'active',
    },
  })

  // 10. Tạo thêm dự án
  const project2 = await prisma.project.create({
    data: {
      id: generateUuid(),
      name: 'Mobile App Development',
      workspace_id: workspace.id,
      manager_id: manager.id,
      start_date: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), // 3 tháng trước
      end_date: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), // 3 tháng sau
      status: 'active',
    },
  })

  // 11. Tạo thêm task với đa dạng trạng thái và thời gian
  const completedTask1 = await prisma.task.create({
    data: {
      id: generateUuid(),
      name: 'Design Database Schema',
      project_id: project.id,
      start_at: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
      due_at: new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000),
      completed_at: new Date(now.getTime() - 52 * 24 * 60 * 60 * 1000),
      status: 'completed',
      priority: 'high',
      time_spent_in_minutes: 480, // 8 giờ
    },
  })

  const completedTask2 = await prisma.task.create({
    data: {
      id: generateUuid(),
      name: 'Setup CI/CD Pipeline',
      project_id: project2.id,
      start_at: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
      due_at: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
      completed_at: new Date(now.getTime() - 41 * 24 * 60 * 60 * 1000),
      status: 'completed',
      priority: 'medium',
      time_spent_in_minutes: 360, // 6 giờ
    },
  })

  const lateTask = await prisma.task.create({
    data: {
      id: generateUuid(),
      name: 'Write Unit Tests',
      project_id: project.id,
      start_at: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      due_at: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
      completed_at: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      status: 'completed',
      priority: 'medium',
      time_spent_in_minutes: 720, // 12 giờ (hoàn thành muộn)
    },
  })

  // Tạo thêm nhiều task với trạng thái đa dạng
  const rejectedTask = await prisma.task.create({
    data: {
      id: generateUuid(),
      name: 'Create API Documentation',
      project_id: project2.id,
      start_at: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000),
      due_at: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      status: 'rejected',
      priority: 'medium',
      time_spent_in_minutes: 240,
    },
  })

  const feedbackedTask = await prisma.task.create({
    data: {
      id: generateUuid(),
      name: 'Optimize Database Queries',
      project_id: project.id,
      start_at: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000),
      due_at: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
      completed_at: new Date(now.getTime() - 23 * 24 * 60 * 60 * 1000),
      status: 'feedbacked',
      priority: 'high',
      time_spent_in_minutes: 600,
    },
  })

  const reviewingTask = await prisma.task.create({
    data: {
      id: generateUuid(),
      name: 'Implement Security Features',
      project_id: project2.id,
      start_at: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      due_at: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      status: 'reviewing',
      priority: 'high',
      time_spent_in_minutes: 320,
    },
  })

  // Tasks hoàn thành overdue với thời gian khác nhau
  const overdueCompleted1 = await prisma.task.create({
    data: {
      id: generateUuid(),
      name: 'Fix Critical Bug #1',
      project_id: project.id,
      start_at: new Date(now.getTime() - 80 * 24 * 60 * 60 * 1000),
      due_at: new Date(now.getTime() - 75 * 24 * 60 * 60 * 1000),
      completed_at: new Date(now.getTime() - 70 * 24 * 60 * 60 * 1000), // Hoàn thành muộn 5 ngày
      status: 'completed',
      priority: 'high',
      time_spent_in_minutes: 960, // 16 giờ
    },
  })

  const overdueCompleted2 = await prisma.task.create({
    data: {
      id: generateUuid(),
      name: 'Performance Optimization',
      project_id: project2.id,
      start_at: new Date(now.getTime() - 65 * 24 * 60 * 60 * 1000),
      due_at: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
      completed_at: new Date(now.getTime() - 55 * 24 * 60 * 60 * 1000), // Hoàn thành muộn 5 ngày
      status: 'completed',
      priority: 'medium',
      time_spent_in_minutes: 840, // 14 giờ
    },
  })

  // Tasks hoàn thành đúng hạn
  const onTimeCompleted1 = await prisma.task.create({
    data: {
      id: generateUuid(),
      name: 'Setup Monitoring System',
      project_id: project.id,
      start_at: new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000),
      due_at: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
      completed_at: new Date(now.getTime() - 46 * 24 * 60 * 60 * 1000), // Hoàn thành sớm 1 ngày
      status: 'completed',
      priority: 'medium',
      time_spent_in_minutes: 480, // 8 giờ
    },
  })

  const onTimeCompleted2 = await prisma.task.create({
    data: {
      id: generateUuid(),
      name: 'Code Review Process',
      project_id: project2.id,
      start_at: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
      due_at: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000),
      completed_at: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000), // Hoàn thành đúng hạn
      status: 'completed',
      priority: 'low',
      time_spent_in_minutes: 360, // 6 giờ
    },
  })

  // Tạo thêm nhân viên để có đủ dữ liệu
  const employee4 = await prisma.user.create({
    data: {
      name: 'Employee Four',
      email: 'employee4@example.com',
      password: hashedGeneralPassword,
      role_id: employeeRole.id,
      workspace_id: workspace.id,
      department_id: engineering.id,
      status: 'active',
    },
  })

  const employee5 = await prisma.user.create({
    data: {
      name: 'Employee Five',
      email: 'employee5@example.com',
      password: hashedGeneralPassword,
      role_id: employeeRole.id,
      workspace_id: workspace.id,
      department_id: hr.id,
      status: 'active',
    },
  })

  // Thêm dự án thứ 3
  const project3 = await prisma.project.create({
    data: {
      id: generateUuid(),
      name: 'Data Analytics Platform',
      workspace_id: workspace.id,
      manager_id: manager.id,
      start_date: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000), // 4 tháng trước
      end_date: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000), // 2 tháng sau
      status: 'active',
    },
  })

  // Gán task cho nhân viên
  await prisma.taskUser.createMany({
    data: [
      {
        task_id: completedTask1.id,
        user_id: employee.id,
        assigned_at: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
      },
      {
        task_id: completedTask2.id,
        user_id: employee2.id,
        assigned_at: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
      },
      {
        task_id: lateTask.id,
        user_id: employee3.id,
        assigned_at: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        task_id: rejectedTask.id,
        user_id: employee4.id,
        assigned_at: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000),
      },
      {
        task_id: feedbackedTask.id,
        user_id: employee.id,
        assigned_at: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000),
      },
      {
        task_id: reviewingTask.id,
        user_id: employee5.id,
        assigned_at: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        task_id: overdueCompleted1.id,
        user_id: employee2.id,
        assigned_at: new Date(now.getTime() - 80 * 24 * 60 * 60 * 1000),
      },
      {
        task_id: overdueCompleted2.id,
        user_id: employee3.id,
        assigned_at: new Date(now.getTime() - 65 * 24 * 60 * 60 * 1000),
      },
      {
        task_id: onTimeCompleted1.id,
        user_id: employee4.id,
        assigned_at: new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000),
      },
      {
        task_id: onTimeCompleted2.id,
        user_id: employee5.id,
        assigned_at: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
      },
    ],
  })

  // Tạo ProjectUser để gán nhân viên vào dự án
  await prisma.projectUser.createMany({
    data: [
      { project_id: project.id, user_id: employee.id, role: 'Developer' },
      { project_id: project.id, user_id: employee3.id, role: 'Developer' },
      { project_id: project2.id, user_id: employee2.id, role: 'Developer' },
      { project_id: project2.id, user_id: employee4.id, role: 'Developer' },
      { project_id: project3.id, user_id: employee5.id, role: 'Analyst' },
      { project_id: project3.id, user_id: employee.id, role: 'Developer' },
    ],
  })

  // 12. DailyFocusLog - Tạo dữ liệu theo dõi tập trung hàng ngày
  const focusLogs: any[] = []
  for (let i = 90; i >= 0; i--) {
    const logDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)

    // Employee 1 - performance tốt, tập trung cao
    focusLogs.push({
      user_id: employee.id,
      focused_minutes: 400 + Math.floor(Math.random() * 80), // 400-480 phút
      note: i % 10 === 0 ? 'Productive day with deep focus' : null,
      created_at: logDate,
    })

    // Employee 2 - performance trung bình
    focusLogs.push({
      user_id: employee2.id,
      focused_minutes: 300 + Math.floor(Math.random() * 100), // 300-400 phút
      note: i % 15 === 0 ? 'Some distractions but overall good' : null,
      created_at: logDate,
    })

    // Employee 3 - performance thấp hơn
    focusLogs.push({
      user_id: employee3.id,
      focused_minutes: 200 + Math.floor(Math.random() * 120), // 200-320 phút
      note: i % 20 === 0 ? 'Need to improve focus' : null,
      created_at: logDate,
    })

    // Employee 4 - performance khá tốt
    focusLogs.push({
      user_id: employee4.id,
      focused_minutes: 350 + Math.floor(Math.random() * 90), // 350-440 phút
      note: i % 12 === 0 ? 'Good focus with occasional breaks' : null,
      created_at: logDate,
    })

    // Employee 5 - performance ổn định
    focusLogs.push({
      user_id: employee5.id,
      focused_minutes: 320 + Math.floor(Math.random() * 80), // 320-400 phút
      note: i % 18 === 0 ? 'Consistent focus throughout the day' : null,
      created_at: logDate,
    })
  }
  await prisma.dailyFocusLog.createMany({ data: focusLogs })

  // 13. WorkingHoursLog - Tạo dữ liệu giờ làm việc
  const workingHoursLogs: any[] = []
  for (let i = 90; i >= 0; i--) {
    const logDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const dayOfWeek = logDate.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    if (!isWeekend) {
      // Employee 1 - punctual và đều đặn
      workingHoursLogs.push({
        user_id: employee.id,
        date: logDate,
        start_time: new Date(logDate.getTime() + 8 * 60 * 60 * 1000), // 8:00 AM
        end_time: new Date(logDate.getTime() + 17 * 60 * 60 * 1000), // 5:00 PM
        break_minutes: 60,
        total_minutes: 480, // 8 giờ
        overtime_minutes: Math.random() > 0.7 ? Math.floor(Math.random() * 60) : 0,
      })

      // Employee 2 - thường xuyên đến muộn
      workingHoursLogs.push({
        user_id: employee2.id,
        date: logDate,
        start_time: new Date(logDate.getTime() + (8.5 + Math.random()) * 60 * 60 * 1000), // 8:30-9:30 AM
        end_time: new Date(logDate.getTime() + 17.5 * 60 * 60 * 1000), // 5:30 PM
        break_minutes: 60,
        total_minutes: 450, // 7.5 giờ trung bình
        overtime_minutes: Math.random() > 0.8 ? Math.floor(Math.random() * 30) : 0,
      })

      // Employee 3 - không đều đặn
      workingHoursLogs.push({
        user_id: employee3.id,
        date: logDate,
        start_time: new Date(logDate.getTime() + (8 + Math.random() * 2) * 60 * 60 * 1000), // 8:00-10:00 AM
        end_time: new Date(logDate.getTime() + (16 + Math.random() * 2) * 60 * 60 * 1000), // 4:00-6:00 PM
        break_minutes: 60 + Math.floor(Math.random() * 30),
        total_minutes: 420 + Math.floor(Math.random() * 120), // 7-9 giờ
        overtime_minutes: 0,
      })

      // Employee 4 - khá đều đặn nhưng ít overtime
      workingHoursLogs.push({
        user_id: employee4.id,
        date: logDate,
        start_time: new Date(logDate.getTime() + (8.2 + Math.random() * 0.3) * 60 * 60 * 1000), // 8:12-8:30 AM
        end_time: new Date(logDate.getTime() + 17.2 * 60 * 60 * 1000), // 5:12 PM
        break_minutes: 60,
        total_minutes: 480,
        overtime_minutes: Math.random() > 0.9 ? Math.floor(Math.random() * 30) : 0,
      })

      // Employee 5 - làm giờ hành chính chuẩn
      workingHoursLogs.push({
        user_id: employee5.id,
        date: logDate,
        start_time: new Date(logDate.getTime() + 8.5 * 60 * 60 * 1000), // 8:30 AM
        end_time: new Date(logDate.getTime() + 17.5 * 60 * 60 * 1000), // 5:30 PM
        break_minutes: 90, // Break dài hơn
        total_minutes: 450,
        overtime_minutes: 0, // Không làm overtime
      })
    }
  }
  await prisma.workingHoursLog.createMany({ data: workingHoursLogs })

  // 14. PerformanceData - Dữ liệu hiệu suất theo dự án
  // Sử dụng upsert để tránh unique constraint error

  // Employee 1 - Performance tốt trên nhiều dự án (Q3-2024)
  await prisma.performanceData.upsert({
    where: { user_id_project_id: { user_id: employee.id, project_id: project.id } },
    update: {},
    create: {
      user_id: employee.id,
      project_id: project.id,
      performance_cycle: 'Q3-2024',
      working_hours: 720,
      task_completed: 18,
      task_delay_count: 1,
      burnout_index: 0.2,
      quality_score: 4.5,
      feedback_score: 4.3,
      notes: 'Excellent performance with high quality deliverables',
    },
  })

  await prisma.performanceData.upsert({
    where: { user_id_project_id: { user_id: employee.id, project_id: project3.id } },
    update: {},
    create: {
      user_id: employee.id,
      project_id: project3.id,
      performance_cycle: 'Q3-2024',
      working_hours: 360,
      task_completed: 8,
      task_delay_count: 0,
      burnout_index: 0.15,
      quality_score: 4.7,
      feedback_score: 4.5,
      notes: 'Outstanding cross-project contributor',
    },
  })

  // Employee 2 - Performance trung bình
  await prisma.performanceData.upsert({
    where: { user_id_project_id: { user_id: employee2.id, project_id: project2.id } },
    update: {},
    create: {
      user_id: employee2.id,
      project_id: project2.id,
      performance_cycle: 'Q3-2024',
      working_hours: 675,
      task_completed: 14,
      task_delay_count: 4,
      burnout_index: 0.4,
      quality_score: 4.0,
      feedback_score: 3.8,
      notes: 'Good performance but needs improvement on time management',
    },
  })

  // Employee 3 - Performance cần cải thiện
  await prisma.performanceData.upsert({
    where: { user_id_project_id: { user_id: employee3.id, project_id: project.id } },
    update: {},
    create: {
      user_id: employee3.id,
      project_id: project.id,
      performance_cycle: 'Q3-2024',
      working_hours: 630,
      task_completed: 10,
      task_delay_count: 6,
      burnout_index: 0.6,
      quality_score: 3.2,
      feedback_score: 3.1,
      notes: 'Needs significant improvement in productivity and quality',
    },
  })

  await prisma.performanceData.upsert({
    where: { user_id_project_id: { user_id: employee3.id, project_id: project2.id } },
    update: {},
    create: {
      user_id: employee3.id,
      project_id: project2.id,
      performance_cycle: 'Q3-2024',
      working_hours: 320,
      task_completed: 5,
      task_delay_count: 3,
      burnout_index: 0.65,
      quality_score: 3.0,
      feedback_score: 2.9,
      notes: 'Struggling with workload distribution',
    },
  })

  // Employee 4 - Performance khá tốt
  await prisma.performanceData.upsert({
    where: { user_id_project_id: { user_id: employee4.id, project_id: project2.id } },
    update: {},
    create: {
      user_id: employee4.id,
      project_id: project2.id,
      performance_cycle: 'Q3-2024',
      working_hours: 700,
      task_completed: 16,
      task_delay_count: 2,
      burnout_index: 0.3,
      quality_score: 4.2,
      feedback_score: 4.0,
      notes: 'Consistent performer with room for growth',
    },
  })

  // Employee 5 - Performance ổn định
  await prisma.performanceData.upsert({
    where: { user_id_project_id: { user_id: employee5.id, project_id: project3.id } },
    update: {},
    create: {
      user_id: employee5.id,
      project_id: project3.id,
      performance_cycle: 'Q3-2024',
      working_hours: 650,
      task_completed: 12,
      task_delay_count: 2,
      burnout_index: 0.25,
      quality_score: 4.3,
      feedback_score: 4.1,
      notes: 'Reliable team member with analytical skills',
    },
  })

  // Employee 4 cho project khác để có nhiều data
  await prisma.performanceData.upsert({
    where: { user_id_project_id: { user_id: employee4.id, project_id: project.id } },
    update: {},
    create: {
      user_id: employee4.id,
      project_id: project.id,
      performance_cycle: 'Q3-2024',
      working_hours: 400,
      task_completed: 9,
      task_delay_count: 1,
      burnout_index: 0.28,
      quality_score: 4.1,
      feedback_score: 3.9,
      notes: 'Good cross-project performance',
    },
  })

  // Employee 5 cho project khác
  await prisma.performanceData.upsert({
    where: { user_id_project_id: { user_id: employee5.id, project_id: project2.id } },
    update: {},
    create: {
      user_id: employee5.id,
      project_id: project2.id,
      performance_cycle: 'Q3-2024',
      working_hours: 300,
      task_completed: 6,
      task_delay_count: 0,
      burnout_index: 0.2,
      quality_score: 4.4,
      feedback_score: 4.2,
      notes: 'Efficient cross-team collaboration',
    },
  })

  // Employee 2 cho project khác
  await prisma.performanceData.upsert({
    where: { user_id_project_id: { user_id: employee2.id, project_id: project.id } },
    update: {},
    create: {
      user_id: employee2.id,
      project_id: project.id,
      performance_cycle: 'Q3-2024',
      working_hours: 380,
      task_completed: 8,
      task_delay_count: 2,
      burnout_index: 0.35,
      quality_score: 3.9,
      feedback_score: 3.7,
      notes: 'Supporting main project effectively',
    },
  })

  // 15. OverallPerformance - Hiệu suất tổng thể
  await prisma.overallPerformance.createMany({
    data: [
      {
        user_id: employee.id,
        working_hours: 1080, // Tổng từ tất cả dự án
        task_completed: 26,
        task_delay_count: 1,
        burnout_index: 0.18,
        quality_score: 4.6,
        feedback_score: 4.4,
        notes: 'Top performer in the team, consistently delivers high-quality work',
      },
      {
        user_id: employee2.id,
        working_hours: 675,
        task_completed: 14,
        task_delay_count: 4,
        burnout_index: 0.4,
        quality_score: 4.0,
        feedback_score: 3.8,
        notes: 'Solid performer with room for improvement in time management',
      },
      {
        user_id: employee3.id,
        working_hours: 950, // Nhiều giờ nhưng hiệu quả thấp
        task_completed: 15,
        task_delay_count: 9,
        burnout_index: 0.63,
        quality_score: 3.1,
        feedback_score: 3.0,
        notes: 'High effort but low efficiency, needs performance improvement plan',
      },
      {
        user_id: employee4.id,
        working_hours: 700,
        task_completed: 16,
        task_delay_count: 2,
        burnout_index: 0.3,
        quality_score: 4.2,
        feedback_score: 4.0,
        notes: 'Reliable team member with consistent performance',
      },
      {
        user_id: employee5.id,
        working_hours: 650,
        task_completed: 12,
        task_delay_count: 2,
        burnout_index: 0.25,
        quality_score: 4.3,
        feedback_score: 4.1,
        notes: 'Excellent analytical skills, strong attention to detail',
      },
    ],
  })

  // 16. TaskReview - Đánh giá chất lượng task
  await prisma.taskReview.createMany({
    data: [
      {
        task_id: completedTask1.id,
        reviewer_id: manager.id,
        task_owner_id: employee.id,
        quality_score: 4.8,
        notes: 'Excellent work with clean architecture and proper documentation',
        reviewed_at: new Date(now.getTime() - 51 * 24 * 60 * 60 * 1000),
      },
      {
        task_id: completedTask2.id,
        reviewer_id: manager.id,
        task_owner_id: employee2.id,
        quality_score: 4.0,
        notes: 'Good implementation but could be optimized further',
        reviewed_at: new Date(now.getTime() - 39 * 24 * 60 * 60 * 1000),
      },
      {
        task_id: lateTask.id,
        reviewer_id: manager.id,
        task_owner_id: employee3.id,
        quality_score: 3.2,
        notes: 'Completed late and has some issues that need to be addressed',
        reviewed_at: new Date(now.getTime() - 19 * 24 * 60 * 60 * 1000),
      },
      {
        task_id: feedbackedTask.id,
        reviewer_id: manager.id,
        task_owner_id: employee.id,
        quality_score: 4.5,
        notes: 'Great optimization work, significantly improved performance',
        reviewed_at: new Date(now.getTime() - 22 * 24 * 60 * 60 * 1000),
      },
      {
        task_id: overdueCompleted1.id,
        reviewer_id: manager.id,
        task_owner_id: employee2.id,
        quality_score: 3.5,
        notes: 'Bug fixed correctly but took too long to complete',
        reviewed_at: new Date(now.getTime() - 69 * 24 * 60 * 60 * 1000),
      },
      {
        task_id: overdueCompleted2.id,
        reviewer_id: manager.id,
        task_owner_id: employee3.id,
        quality_score: 3.0,
        notes: 'Performance improvements made but delivery was delayed',
        reviewed_at: new Date(now.getTime() - 54 * 24 * 60 * 60 * 1000),
      },
      {
        task_id: onTimeCompleted1.id,
        reviewer_id: manager.id,
        task_owner_id: employee4.id,
        quality_score: 4.3,
        notes: 'Monitoring system setup perfectly, delivered on time',
        reviewed_at: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
      },
      {
        task_id: onTimeCompleted2.id,
        reviewer_id: manager.id,
        task_owner_id: employee5.id,
        quality_score: 4.1,
        notes: 'Code review process well established, good documentation',
        reviewed_at: new Date(now.getTime() - 34 * 24 * 60 * 60 * 1000),
      },
    ],
  })

  // 16.1 TaskRejectionHistory - Lịch sử từ chối task
  await prisma.taskRejectionHistory.createMany({
    data: [
      {
        task_id: rejectedTask.id,
        rejected_by: manager.id,
        rejected_at: new Date(now.getTime() - 32 * 24 * 60 * 60 * 1000),
        reason: 'Documentation quality does not meet standards',
        notes: 'API documentation lacks proper examples and error handling descriptions',
      },
    ],
  })

  // 17. MicroFeedback - Phản hồi nhanh hàng ngày
  const microFeedbacks: any[] = []
  for (let i = 30; i >= 0; i--) {
    const feedbackDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)

    microFeedbacks.push(
      {
        user_id: employee.id,
        rating: 4 + Math.floor(Math.random() * 2), // 4-5 rating
        created_at: feedbackDate,
      },
      {
        user_id: employee2.id,
        rating: 3 + Math.floor(Math.random() * 2), // 3-4 rating
        created_at: feedbackDate,
      },
      {
        user_id: employee3.id,
        rating: 2 + Math.floor(Math.random() * 2), // 2-3 rating
        created_at: feedbackDate,
      },
      {
        user_id: employee4.id,
        rating: 3 + Math.floor(Math.random() * 2), // 3-4 rating
        created_at: feedbackDate,
      },
      {
        user_id: employee5.id,
        rating: 4 + Math.floor(Math.random() * 2), // 4-5 rating
        created_at: feedbackDate,
      },
    )
  }
  await prisma.microFeedback.createMany({ data: microFeedbacks })

  // 18. Notification - Thông báo liên quan đến hiệu suất
  await prisma.notification.createMany({
    data: [
      {
        user_id: employee.id,
        title: 'Performance Recognition',
        content: 'Congratulations! You have maintained excellent performance this quarter.',
        type: 'info',
        is_read: false,
        data: { performance_score: 4.6, period: 'Q3-2024' },
        created_at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        user_id: employee2.id,
        title: 'Performance Review',
        content: 'Your performance review is scheduled. Please prepare your self-assessment.',
        type: 'task',
        is_read: true,
        data: { review_date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
        created_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        user_id: employee3.id,
        title: 'Performance Improvement Plan',
        content: 'We have created a performance improvement plan to help you succeed.',
        type: 'warning',
        is_read: false,
        data: { improvement_areas: ['time_management', 'quality_control', 'task_completion'] },
        created_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        user_id: employee4.id,
        title: 'Task Assignment',
        content: 'You have been assigned to a new high-priority task.',
        type: 'task',
        is_read: false,
        data: { task_priority: 'high', project: 'Mobile App Development' },
        created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        user_id: employee5.id,
        title: 'Project Milestone',
        content: 'Great work on completing the data analysis milestone ahead of schedule.',
        type: 'info',
        is_read: true,
        data: { milestone: 'data_analysis', completion_status: 'early' },
        created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        user_id: manager.id,
        title: 'Team Performance Summary',
        content: 'Weekly team performance report is ready for your review.',
        type: 'info',
        is_read: false,
        data: { report_type: 'weekly', team_score: 4.1 },
        created_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
    ],
  })

  // 19. Thêm dữ liệu mở rộng cho AI Analysis và KPI

  // Tạo thêm task hoàn thành để có đủ dữ liệu tính KPI
  const additionalCompletedTasks: any[] = []
  for (let i = 0; i < 15; i++) {
    const taskStartDate = new Date(now.getTime() - (15 + i * 3) * 24 * 60 * 60 * 1000)
    const taskDueDate = new Date(taskStartDate.getTime() + (2 + Math.floor(Math.random() * 5)) * 24 * 60 * 60 * 1000)
    const taskCompletedDate = new Date(taskDueDate.getTime() - Math.floor(Math.random() * 2) * 24 * 60 * 60 * 1000) // Hoàn thành trước hoặc đúng hạn

    const isOverdue = Math.random() > 0.7 // 30% tasks overdue
    const actualCompletedDate = isOverdue
      ? new Date(taskDueDate.getTime() + Math.floor(Math.random() * 3) * 24 * 60 * 60 * 1000)
      : taskCompletedDate

    const taskData = {
      id: generateUuid(),
      name: `Task ${i + 1} - ${['Bug Fix', 'Feature Development', 'Code Review', 'Testing', 'Documentation'][Math.floor(Math.random() * 5)]}`,
      project_id: [project.id, project2.id, project3.id][Math.floor(Math.random() * 3)],
      start_at: taskStartDate,
      due_at: taskDueDate,
      completed_at: actualCompletedDate,
      status: 'completed',
      priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      time_spent_in_minutes: 240 + Math.floor(Math.random() * 480), // 4-12 giờ
    }

    additionalCompletedTasks.push(taskData)
  }

  // Tạo các task
  for (const taskData of additionalCompletedTasks) {
    await prisma.task.create({ data: taskData })

    // Gán task cho nhân viên ngẫu nhiên
    const randomEmployee = [employee.id, employee2.id, employee3.id, employee4.id, employee5.id][
      Math.floor(Math.random() * 5)
    ]
    await prisma.taskUser.create({
      data: {
        task_id: taskData.id,
        user_id: randomEmployee,
        assigned_at: taskData.start_at,
      },
    })

    // Tạo task review cho mỗi task
    await prisma.taskReview.create({
      data: {
        task_id: taskData.id,
        reviewer_id: manager.id,
        task_owner_id: randomEmployee,
        quality_score: 2.5 + Math.random() * 2.5, // 2.5-5.0
        notes: [
          'Good implementation with minor issues',
          'Excellent work, well documented',
          'Needs improvement in code structure',
          'Great attention to detail',
          'Could be optimized further',
        ][Math.floor(Math.random() * 5)],
        reviewed_at: new Date(taskData.completed_at.getTime() + 24 * 60 * 60 * 1000),
      },
    })
  }

  // 20. Tạo thêm PerformanceData cho tất cả combinations để có đủ KPI data
  const performanceEntries = [
    // Thêm performance cho employee1 trên tất cả projects
    {
      user_id: employee.id,
      project_id: project2.id,
      performance_cycle: 'Q3-2024',
      working_hours: 450,
      task_completed: 12,
      task_delay_count: 1,
      burnout_index: 0.2,
      quality_score: 4.6,
      feedback_score: 4.4,
      notes: 'Consistent high performance across projects',
    },

    // Thêm performance cho employee2 trên project3
    {
      user_id: employee2.id,
      project_id: project3.id,
      performance_cycle: 'Q3-2024',
      working_hours: 380,
      task_completed: 9,
      task_delay_count: 2,
      burnout_index: 0.35,
      quality_score: 4.1,
      feedback_score: 3.9,
      notes: 'Good adaptation to new project requirements',
    },

    // Thêm performance cho employee3 trên project3
    {
      user_id: employee3.id,
      project_id: project3.id,
      performance_cycle: 'Q3-2024',
      working_hours: 420,
      task_completed: 7,
      task_delay_count: 4,
      burnout_index: 0.55,
      quality_score: 3.3,
      feedback_score: 3.2,
      notes: 'Showing some improvement but still needs support',
    },

    // Thêm performance cho employee4 trên project3
    {
      user_id: employee4.id,
      project_id: project3.id,
      performance_cycle: 'Q3-2024',
      working_hours: 600,
      task_completed: 13,
      task_delay_count: 2,
      burnout_index: 0.28,
      quality_score: 4.2,
      feedback_score: 4.0,
      notes: 'Strong contributor across multiple projects',
    },
  ]

  for (const perfData of performanceEntries) {
    await prisma.performanceData.upsert({
      where: { user_id_project_id: { user_id: perfData.user_id, project_id: perfData.project_id } },
      update: {},
      create: perfData,
    })
  }

  // 21. Tạo thêm MicroFeedback lịch sử cho AI analysis
  const historicalFeedbacks: any[] = []
  for (let monthOffset = 6; monthOffset >= 1; monthOffset--) {
    for (let day = 0; day < 30; day++) {
      const feedbackDate = new Date(now.getTime() - (monthOffset * 30 + day) * 24 * 60 * 60 * 1000)

      // Tạo trend cải thiện cho employee3
      const employee3Rating = Math.min(5, 2 + (6 - monthOffset) * 0.3 + Math.random() * 0.5)

      historicalFeedbacks.push(
        {
          user_id: employee.id,
          rating: 4 + Math.floor(Math.random() * 2), // Consistently high
          created_at: feedbackDate,
        },
        {
          user_id: employee2.id,
          rating: 3 + Math.floor(Math.random() * 2), // Stable average
          created_at: feedbackDate,
        },
        {
          user_id: employee3.id,
          rating: Math.floor(employee3Rating), // Improving trend
          created_at: feedbackDate,
        },
        {
          user_id: employee4.id,
          rating: 3 + Math.floor(Math.random() * 2), // Good performance
          created_at: feedbackDate,
        },
        {
          user_id: employee5.id,
          rating: 4 + Math.floor(Math.random() * 2), // High performance
          created_at: feedbackDate,
        },
      )
    }
  }
  await prisma.microFeedback.createMany({ data: historicalFeedbacks })

  // 22. Tạo dữ liệu WorkingHours lịch sử để có trend data cho AI
  const historicalWorkingHours: any[] = []
  // Bắt đầu từ 120 ngày trước để tránh trùng với dữ liệu 90 ngày gần đây đã tạo
  for (let monthOffset = 6; monthOffset >= 4; monthOffset--) {
    // Chỉ tạo cho 3 tháng cũ hơn
    for (let day = 0; day < 20; day++) {
      // 20 working days per month
      const workDate = new Date(now.getTime() - (monthOffset * 30 + day + 120) * 24 * 60 * 60 * 1000)

      historicalWorkingHours.push(
        {
          user_id: employee.id,
          date: workDate,
          start_time: new Date(workDate.getTime() + 8 * 60 * 60 * 1000),
          end_time: new Date(workDate.getTime() + 17 * 60 * 60 * 1000),
          break_minutes: 60,
          total_minutes: 480,
          overtime_minutes: Math.random() > 0.8 ? Math.floor(Math.random() * 60) : 0,
        },
        {
          user_id: employee2.id,
          date: workDate,
          start_time: new Date(workDate.getTime() + 8.5 * 60 * 60 * 1000),
          end_time: new Date(workDate.getTime() + 17.5 * 60 * 60 * 1000),
          break_minutes: 60,
          total_minutes: 450,
          overtime_minutes: 0,
        },
        {
          user_id: employee3.id,
          date: workDate,
          start_time: new Date(workDate.getTime() + (8 + Math.random()) * 60 * 60 * 1000),
          end_time: new Date(workDate.getTime() + (16.5 + Math.random()) * 60 * 60 * 1000),
          break_minutes: 60 + Math.floor(Math.random() * 30),
          total_minutes: 420 + Math.floor(Math.random() * 60),
          overtime_minutes: 0,
        },
        {
          user_id: employee4.id,
          date: workDate,
          start_time: new Date(workDate.getTime() + 8.2 * 60 * 60 * 1000),
          end_time: new Date(workDate.getTime() + 17.2 * 60 * 60 * 1000),
          break_minutes: 60,
          total_minutes: 480,
          overtime_minutes: 0,
        },
        {
          user_id: employee5.id,
          date: workDate,
          start_time: new Date(workDate.getTime() + 8.5 * 60 * 60 * 1000),
          end_time: new Date(workDate.getTime() + 17.5 * 60 * 60 * 1000),
          break_minutes: 90,
          total_minutes: 450,
          overtime_minutes: 0,
        },
      )
    }
  }
  await prisma.workingHoursLog.createMany({ data: historicalWorkingHours })

  console.log('📊 Enhanced Performance data created successfully:')
  console.log(`- ${5} employees with detailed performance tracking`)
  console.log(`- ${3} projects with comprehensive task management`)
  console.log(`- ${25} tasks with various statuses (including 15 additional completed tasks)`)
  console.log(`- ${91 * 5 + historicalFeedbacks.length} focus log entries (6+ months of data)`)
  console.log(`- ${65 * 5 + historicalWorkingHours.length} working hours log entries`)
  console.log(`- ${14} performance data records across different projects and quarters`)
  console.log(`- ${23} task reviews for quality assessment`)
  console.log(`- ${31 * 5 + historicalFeedbacks.length} micro feedback entries (6+ months)`)
  console.log(`- ${6} performance-related notifications`)
  console.log('- Historical data for AI analysis and KPI calculations')
  console.log('- Cross-project performance metrics')
  console.log('- Trend data for employee improvement tracking')

  return {
    createdRoleCount: roles.count,
    superAdminUser,
    admin,
    manager,
    employee,
    employee2,
    employee3,
    employee4,
    employee5,
    workspace,
    project,
    project2,
    project3,
    totalTasks: 10,
    performanceDataCount: 10,
  }
}

main()
  .then((result) => {
    console.log('✅ Seed done')
    console.info(result)
    if (result && result.superAdminUser && result.admin && result.manager && result.employee) {
      console.table([result.superAdminUser, result.admin, result.manager, result.employee], ['email', 'name'])
    }
  })
  .catch(console.error)
