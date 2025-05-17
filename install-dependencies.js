#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 定义需要安装的依赖
const dependencies = [];

const devDependencies = [
  'rollup-plugin-visualizer@^5.12.0',
  'compression-webpack-plugin@^10.0.0',
  'imagemin@^8.0.1',
  'imagemin-webp@^8.0.0',
  'terser@^5.29.2',
  'vite-plugin-compression@^0.5.1',
  'vite-plugin-imagemin@^0.6.1',
  '@types/rollup-plugin-visualizer',
  '@types/compression-webpack-plugin',
  '@types/imagemin',
  '@types/imagemin-webp'
];

console.log('开始安装性能优化相关依赖...');

// 安装开发依赖
if (devDependencies.length > 0) {
  const devCommand = `npm install --save-dev ${devDependencies.join(' ')}`;
  console.log(`执行: ${devCommand}`);
  
  try {
    execSync(devCommand, { stdio: 'inherit' });
    console.log('开发依赖安装完成');
  } catch (error) {
    console.error('安装开发依赖时出错:', error);
    process.exit(1);
  }
}

// 安装生产依赖
if (dependencies.length > 0) {
  const command = `npm install ${dependencies.join(' ')}`;
  console.log(`执行: ${command}`);
  
  try {
    execSync(command, { stdio: 'inherit' });
    console.log('生产依赖安装完成');
  } catch (error) {
    console.error('安装生产依赖时出错:', error);
    process.exit(1);
  }
}

console.log('所有依赖安装完成！');
console.log('请运行 npm run build 构建优化后的应用'); 