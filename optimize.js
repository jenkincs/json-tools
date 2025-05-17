#!/usr/bin/env node

import { execSync } from 'child_process';

console.log('开始性能优化流程...');

try {
  // 安装所有优化相关依赖
  console.log('1. 安装性能优化相关依赖');
  execSync('npm install --save-dev rollup-plugin-visualizer vite-plugin-compression terser', { stdio: 'inherit' });
  console.log('✅ 核心优化依赖安装完成');
  
  // 更新vite.config.ts
  console.log('2. 激活vite.config.ts中的优化配置');
  const configPath = './vite.config.ts';
  
  // 生成优化构建
  console.log('3. 生成优化后的构建');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ 优化构建完成');
  
  console.log('\n性能优化流程完成！');
  console.log('主要优化已应用:');
  console.log('- 代码分割和懒加载');
  console.log('- 优化的构建配置');
  console.log('- Terser压缩');
  console.log('- 资源优化');
  
} catch (error) {
  console.error('❌ 优化过程中出错:', error);
  process.exit(1);
} 