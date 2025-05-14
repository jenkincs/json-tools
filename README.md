# JSONGeeks

A modern, user-friendly suite of JSON development tools for developers and data professionals.

## About JSONGeeks

JSONGeeks is a powerful collection of online JSON tools that run in the client-side browser without sending data to any server. All data processing happens on the user's device, ensuring data security and privacy. It offers tools for developers, data analysts, and API designers to simplify JSON data processing.

Website: [https://jsongeeks.dev](https://jsongeeks.dev)

## Key Features

### JSON Formatter & Beautifier
- Customizable indentation spacing
- Syntax error detection and highlighting
- One-click JSON minification
- Copy and download formatted results

### JSON Comparison & Diff Analysis
- Side-by-side view to compare two JSON objects
- Highlighting of additions, deletions, and modifications
- Support for complex nested structure comparisons

### Format Conversion
- JSON ↔ YAML conversion
- JSON → XML conversion
- JSON → CSV conversion
- Customizable conversion options (including XML headers, CSV delimiters, etc.)

### Data Visualization
- Support for multiple chart types (bar charts, line charts, pie charts, scatter plots, etc.)
- Multi-series data support
- Interactive chart configuration
- Tree structure visualization

### JSON Schema Validation
- Validate data against JSON Schema
- Built-in common Schema templates
- Detailed validation error messages

### JSONPath Query
- Query JSON data using JSONPath expressions
- Support for complex filtering conditions
- Preview and copy query results

### Code Generator
- Generate class definitions in TypeScript, Java, C#, and other languages from JSON data
- Support for multiple naming conventions (camelCase, PascalCase, snake_case)
- Customizable generation options

### API Mocker
- Create mock API endpoints
- Generate random test data based on JSON Schema
- Simulate network latency and error rates

### JWT Decoder
- Parse JWT token headers, payloads, and signatures
- Verify signature validity
- View standard and custom claims

### JSON Editor
- Advanced editor support with syntax highlighting and auto-completion
- Dual-mode editing with tree view and code view
- Path copying functionality

### JSON Encryption
- Encrypt and decrypt JSON data
- Support for multiple encryption algorithms

## Technical Features

- **Pure Client-Side Processing**: All data processing occurs in the browser without being sent to servers
- **Offline Availability**: Most functionality works in offline environments
- **Responsive Design**: Adapts to various screen sizes on desktop and mobile devices
- **Dark/Light Mode**: Supports system theme switching
- **Multilingual Support**: Provides English and Chinese interfaces
- **No Registration Required**: All tools are completely free to use with no login or registration

## Technology Stack

### Frontend Frameworks & Libraries
- **React 18**: For building the user interface
- **TypeScript**: For type safety
- **Material-UI (MUI) 5**: UI component library
- **React Router 7**: For routing management
- **i18next**: For internationalization and multilingual support
- **Monaco Editor**: For code editing capabilities
- **Recharts**: For data visualization charts

### Tool-Related Libraries
- **js-yaml**: For YAML conversion
- **jsontoxml**: For XML conversion
- **papaparse**: For CSV processing
- **ajv**: For JSON Schema validation
- **jsonpath-plus**: For JSONPath queries
- **json-schema-faker**: For test data generation
- **crypto-js**: For encryption and decryption
- **jose**: For JWT processing

### Build Tools
- **Vite**: For fast development environment and build tools
- **ESLint**: For code quality checking
- **TypeScript**: For static type checking

## Installation & Development

### System Requirements
- Node.js 18.0+
- npm 9.0+

### Install Dependencies
```bash
npm install
```

### Development Environment
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Code Check
```bash
npm run lint
```

## Preview Build
```bash
npm run preview
```

## Contributing
Issue reports and feature requests are welcome. If you want to contribute code, please open an issue first to discuss what you would like to change.

## License
This project is licensed under the MIT License. See the LICENSE file in the project for details.

## Contact
- GitHub: [https://github.com/jenkincs](https://github.com/jenkincs)
- Email: [contact@jsongeeks.dev](mailto:contact@jsongeeks.dev)
- X (Twitter): [https://x.com/jenkincsx](https://x.com/jenkincsx)

---

# JSONGeeks

一个现代化、用户友好的JSON开发工具套件，为开发者和数据专业人员提供全面的JSON处理解决方案。

## 关于 JSONGeeks

JSONGeeks 是一套强大的在线JSON工具集，运行在客户端浏览器中，无需将数据发送到服务器。所有数据处理都在用户的设备上完成，确保数据安全和隐私。它为开发人员、数据分析师和API设计者提供了简化JSON数据处理的工具。

网站地址：[https://jsongeeks.dev](https://jsongeeks.dev)

## 主要功能

### JSON格式化与美化
- 自定义缩进空格数
- 语法错误检测和高亮显示
- 一键压缩JSON
- 复制和下载格式化结果

### JSON比较与差异分析
- 并排视图比较两个JSON对象
- 高亮显示添加、删除和修改的内容
- 支持复杂的嵌套结构比较

### 格式转换
- JSON ↔ YAML 转换
- JSON → XML 转换
- JSON → CSV 转换
- 可自定义转换选项（包括XML头、CSV分隔符等）

### 数据可视化
- 支持多种图表类型（条形图、折线图、饼图、散点图等）
- 支持多系列数据
- 交互式图表配置
- 树形结构可视化

### JSON Schema验证
- 根据JSON Schema验证数据
- 内置常用Schema模板
- 详细的验证错误提示

### JSONPath查询
- 使用JSONPath表达式查询JSON数据
- 支持复杂的筛选条件
- 预览和复制查询结果

### 代码生成器
- 从JSON数据生成TypeScript、Java、C#等语言的类定义
- 支持多种命名规范（驼峰式、帕斯卡式、下划线式）
- 可自定义生成选项

### API模拟工具
- 创建模拟API端点
- 基于JSON Schema生成随机测试数据
- 模拟网络延迟和错误率

### JWT解码器
- 解析JWT令牌的头部、负载和签名
- 验证签名有效性
- 查看标准和自定义声明

### JSON编辑器
- 高级编辑器支持，带有语法高亮和自动补全
- 树形视图和代码视图双模式编辑
- 路径复制功能

### JSON加密工具
- 加密和解密JSON数据
- 支持多种加密算法

## 技术特点

- **纯客户端处理**：所有数据处理在浏览器中完成，不发送到服务器
- **离线可用**：大部分功能可在离线环境下使用
- **响应式设计**：适配桌面和移动设备的各种屏幕尺寸
- **深色/浅色模式**：支持系统主题切换
- **多语言支持**：提供英文和中文界面
- **无需注册**：所有工具完全免费使用，无需登录或注册

## 开发技术栈

### 前端框架与库
- **React 18**：用于构建用户界面
- **TypeScript**：提供类型安全
- **Material-UI (MUI) 5**：UI组件库
- **React Router 7**：路由管理
- **i18next**：国际化多语言支持
- **Monaco Editor**：提供代码编辑功能
- **Recharts**：数据可视化图表

### 工具相关库
- **js-yaml**：YAML转换
- **jsontoxml**：XML转换
- **papaparse**：CSV处理
- **ajv**：JSON Schema验证
- **jsonpath-plus**：JSONPath查询
- **json-schema-faker**：测试数据生成
- **crypto-js**：加密与解密
- **jose**：JWT处理

### 构建工具
- **Vite**：快速开发环境和构建工具
- **ESLint**：代码质量检查
- **TypeScript**：静态类型检查

## 安装与开发

### 系统要求
- Node.js 18.0+ 
- npm 9.0+

### 安装依赖
```bash
npm install
```

### 开发环境
```bash
npm run dev
```

### 生产构建
```bash
npm run build
```

### 代码检查
```bash
npm run lint
```

## 预览构建
```bash
npm run preview
```

## 贡献
欢迎提交问题报告和功能请求。如果您想贡献代码，请先开issue讨论您想要更改的内容。

## 许可
本项目遵循MIT许可证。详情请参阅项目中的LICENSE文件。

## 联系方式
- GitHub: [https://github.com/jenkincs](https://github.com/jenkincs)
- Email: [contact@jsongeeks.dev](mailto:contact@jsongeeks.dev)
- X (Twitter): [https://x.com/jenkincsx](https://x.com/jenkincsx) 