# Tasks

- [x] Task 1: 初始化前端应用骨架
  - [x] SubTask 1.1: 使用 Vite、React 和 TypeScript 建立单页应用与基础目录
  - [x] SubTask 1.2: 配置基础样式变量、字体层级、响应式断点和图标库
  - [x] SubTask 1.3: 建立首页、方法学习、闯关练习和练习总结的页面状态切换

- [x] Task 2: 实现百以内算题领域逻辑
  - [x] SubTask 2.1: 定义四类题型、难度、题目、答题结果和学习进度的数据结构
  - [x] SubTask 2.2: 实现满足 0 至 100 边界及进位/退位条件的题目生成器
  - [x] SubTask 2.3: 实现答案校验、一次计分、连续答对和星星奖励规则
  - [x] SubTask 2.4: 为题目生成器和判题计分逻辑补充单元测试

- [x] Task 3: 构建首页与学习导航
  - [x] SubTask 3.1: 展示品牌主题、星星、连续答对和题型进度
  - [x] SubTask 3.2: 提供“学习方法”和“闯关练习”的明确入口
  - [x] SubTask 3.3: 展示四类题型的学习状态并支持快速进入对应内容

- [x] Task 4: 实现分步方法讲解
  - [x] SubTask 4.1: 为四类题型建立正确的示例和逐步讲解数据
  - [x] SubTask 4.2: 实现十位/个位数位板及进位、借位的视觉呈现
  - [x] SubTask 4.3: 实现上一步、下一步和重新演示控制
  - [x] SubTask 4.4: 确保减少动态效果偏好下讲解仍完整可用

- [x] Task 5: 实现分层闯关练习
  - [x] SubTask 5.1: 实现题型选择、综合练习和固定题量的一轮练习
  - [x] SubTask 5.2: 实现答案输入、Enter 提交、输入校验和防重复提交
  - [x] SubTask 5.3: 实现正确反馈、错误解析、下一题和当前进度
  - [x] SubTask 5.4: 实现练习总结、准确率、奖励和复习建议

- [x] Task 6: 实现趣味反馈与本地进度
  - [x] SubTask 6.1: 实现连续答对里程碑、星星奖励和轻量庆祝效果
  - [x] SubTask 6.2: 使用带版本和数据校验的本地存储持久化学习进度
  - [x] SubTask 6.3: 处理存储不可用、内容损坏和旧版本数据的回退

- [x] Task 7: 完善响应式与无障碍体验
  - [x] SubTask 7.1: 适配 320 像素宽手机、平板和桌面布局
  - [x] SubTask 7.2: 补充语义标签、可见焦点、状态播报和非颜色反馈
  - [x] SubTask 7.3: 检查长文本、动态内容和固定格式控件不引发布局跳动或重叠

- [x] Task 8: 验证完整学习流程
  - [x] SubTask 8.1: 执行单元测试，覆盖题目约束、边界输入、判题和进度回退
  - [x] SubTask 8.2: 使用浏览器验证桌面和手机视口的首页、讲解、练习与总结流程
  - [x] SubTask 8.3: 验证键盘操作、减少动态效果、本地进度恢复和异常数据回退
  - [x] SubTask 8.4: 检查控制台无应用错误，关键界面无溢出、遮挡或空白

# Task Dependencies

- Task 2 depends on Task 1.
- Task 3 depends on Task 1.
- Task 4 depends on Task 1 and Task 2.
- Task 5 depends on Task 1 and Task 2.
- Task 6 depends on Task 2 and Task 5.
- Task 7 depends on Tasks 3, 4, 5 and 6.
- Task 8 depends on all implementation tasks.
- Task 3 and Task 2 can proceed in parallel after Task 1.
- Task 4 and Task 5 can proceed in parallel after Task 2.
