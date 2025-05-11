type CodeGeneratorOptions = {
  className: string;
  useInterfaces?: boolean;
  useOptionalProps?: boolean;
  usePascalCase?: boolean;
  useJSONAttributes?: boolean;
};

// 辅助函数：将字符串转为首字母大写（PascalCase）
export const toPascalCase = (str: string): string => {
  return str
    .replace(/[-_]/g, ' ')
    .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase())
    .replace(/\s+/g, '');
};

// 辅助函数：将字符串转为驼峰式（camelCase）
export const toCamelCase = (str: string): string => {
  // 先确保字符串是一个正常的单词格式
  const normalized = str
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // 如果是空字符串，直接返回
  if (!normalized) return '';
  
  // 转换为驼峰格式：首字母小写，后续单词首字母大写
  return normalized
    .replace(/\s(.)/g, ($1) => $1.toUpperCase())
    .replace(/\s/g, '')
    .replace(/^(.)/, ($1) => $1.toLowerCase());
};

// 辅助函数：格式化属性名
export const formatPropertyName = (name: string, usePascalCase: boolean): string => {
  // 处理特殊情况：已经是驼峰或帕斯卡格式的字符串
  const isCamelCase = /^[a-z]([A-Z0-9]*[a-z][a-z0-9]*[A-Z]|[a-z0-9]*[A-Z][A-Z0-9]*[a-z])[A-Za-z0-9]*$/.test(name);
  const isPascalCase = /^[A-Z][a-zA-Z0-9]*$/.test(name);
  
  if (usePascalCase) {
    // 如果已经是帕斯卡格式，直接返回
    if (isPascalCase) return name;
    // 如果是驼峰格式，转换首字母为大写
    if (isCamelCase) return name.charAt(0).toUpperCase() + name.slice(1);
    // 否则转换为帕斯卡格式
    return toPascalCase(name);
  } else {
    // 如果已经是驼峰格式，直接返回
    if (isCamelCase) return name;
    // 如果是帕斯卡格式，转换首字母为小写
    if (isPascalCase) return name.charAt(0).toLowerCase() + name.slice(1);
    // 否则转换为驼峰格式
    return toCamelCase(name);
  }
};

// 辅助函数：检测数据类型
export const detectType = (value: any): string => {
  if (value === null) return 'null';
  if (Array.isArray(value)) {
    if (value.length === 0) return 'array';
    return `array:${detectType(value[0])}`;
  }
  if (typeof value === 'object') return 'object';
  return typeof value;
};

// =================== TypeScript 代码生成 ===================
export const generateTypeScript = (json: any, options: CodeGeneratorOptions): string => {
  const { className, useInterfaces = true, useOptionalProps = true, usePascalCase = true } = options;
  
  // 生成接口或类定义的内部代码
  const generateInterface = (obj: any, name: string, indent = 0): string => {
    const indentStr = ' '.repeat(indent);
    let result = '';
    
    // 对象属性
    if (typeof obj === 'object' && obj !== null) {
      const isArray = Array.isArray(obj);
      
      if (isArray) {
        if (obj.length === 0) {
          return `${indentStr}export ${useInterfaces ? 'interface' : 'class'} ${name} {\n${indentStr}  // Empty array\n${indentStr}}\n\n`;
        }
        
        // 处理数组第一项，判断类型
        const firstItem = obj[0];
        if (typeof firstItem === 'object' && firstItem !== null) {
          // 复杂对象数组，生成接口
          return generateInterface(firstItem, name, indent);
        } else {
          // 简单类型数组
          const itemType = typeof firstItem;
          return `${indentStr}// ${name} is a simple array of ${itemType}\n`;
        }
      }
      
      // 创建接口
      result += `${indentStr}export ${useInterfaces ? 'interface' : 'class'} ${name} {\n`;
      
      // 添加属性
      for (const [key, value] of Object.entries(obj)) {
        const propName = formatPropertyName(key, usePascalCase);
        const optional = useOptionalProps ? '?' : '';
        
        if (value === null) {
          result += `${indentStr}  ${propName}${optional}: null;\n`;
          continue;
        }
        
        if (Array.isArray(value)) {
          if (value.length === 0) {
            result += `${indentStr}  ${propName}${optional}: any[];\n`;
          } else {
            const firstItem = value[0];
            if (typeof firstItem === 'object' && firstItem !== null) {
              const arrayItemName = toPascalCase(key);
              result += `${indentStr}  ${propName}${optional}: ${arrayItemName}[];\n`;
              // 生成嵌套接口
              const nestedInterface = generateInterface(firstItem, arrayItemName, indent);
              result = result.replace(`export ${useInterfaces ? 'interface' : 'class'} ${name}`, nestedInterface + `export ${useInterfaces ? 'interface' : 'class'} ${name}`);
            } else {
              result += `${indentStr}  ${propName}${optional}: ${typeof firstItem}[];\n`;
            }
          }
        } else if (typeof value === 'object') {
          const nestedName = toPascalCase(key);
          result += `${indentStr}  ${propName}${optional}: ${nestedName};\n`;
          // 生成嵌套接口
          const nestedInterface = generateInterface(value, nestedName, indent);
          result = result.replace(`export ${useInterfaces ? 'interface' : 'class'} ${name}`, nestedInterface + `export ${useInterfaces ? 'interface' : 'class'} ${name}`);
        } else {
          result += `${indentStr}  ${propName}${optional}: ${typeof value};\n`;
        }
      }
      
      result += `${indentStr}}\n\n`;
    }
    
    return result;
  };
  
  // 开始生成代码
  let code = '// Auto-generated TypeScript code from JSON\n\n';
  code += generateInterface(json, className);
  
  return code;
};

// =================== Java 代码生成 ===================
export const generateJava = (json: any, options: CodeGeneratorOptions): string => {
  const { className, useOptionalProps = true, usePascalCase = false, useJSONAttributes = true } = options;
  
  // 生成Java类定义
  const generateClass = (obj: any, name: string, indent = 0): string => {
    const indentStr = ' '.repeat(indent);
    let result = '';
    
    // 处理对象
    if (typeof obj === 'object' && obj !== null) {
      const isArray = Array.isArray(obj);
      
      if (isArray) {
        if (obj.length === 0) {
          return `${indentStr}// ${name} is empty array\n`;
        }
        
        // 处理数组第一项
        const firstItem = obj[0];
        if (typeof firstItem === 'object' && firstItem !== null) {
          // 复杂对象数组，生成类
          return generateClass(firstItem, name, indent);
        } else {
          // 简单类型数组
          return `${indentStr}// ${name} is array of ${typeof firstItem}\n`;
        }
      }
      
      // 创建类
      result += `${indentStr}public class ${name} {\n`;
      
      // 收集所有字段以生成字段、getter、setter
      const fields: string[] = [];
      const getters: string[] = [];
      const setters: string[] = [];
      
      // 处理属性
      for (const [key, value] of Object.entries(obj)) {
        // Java属性名使用驼峰命名（首字母小写）
        const propName = formatPropertyName(key, false);
        let javaType = 'Object';
        let needsNestedClass = false;
        let nestedClassName = '';
        
        // 确定Java类型
        if (value === null) {
          javaType = 'Object';
        } else if (Array.isArray(value)) {
          if (value.length === 0) {
            javaType = 'List<Object>';
          } else {
            const firstItem = value[0];
            if (typeof firstItem === 'object' && firstItem !== null) {
              nestedClassName = toPascalCase(key);
              javaType = `List<${nestedClassName}>`;
              needsNestedClass = true;
            } else {
              const typeMap: Record<string, string> = {
                'string': 'String',
                'number': 'Double',
                'boolean': 'Boolean'
              };
              javaType = `List<${typeMap[typeof firstItem] || 'Object'}>`;
            }
          }
        } else if (typeof value === 'object') {
          nestedClassName = toPascalCase(key);
          javaType = nestedClassName;
          needsNestedClass = true;
        } else {
          const typeMap: Record<string, string> = {
            'string': 'String',
            'number': value % 1 === 0 ? 'Integer' : 'Double',
            'boolean': 'Boolean'
          };
          javaType = typeMap[typeof value] || 'Object';
        }
        
        // 添加JSON注解
        const jsonAnnotation = useJSONAttributes ? 
          `    @JsonProperty("${key}")\n` : '';
        
        // 添加字段
        fields.push(`${jsonAnnotation}    private ${javaType} ${propName};`);
        
        // 添加Getter - 使用帕斯卡命名
        const pascalPropName = toPascalCase(propName);
        getters.push(`    public ${javaType} get${pascalPropName}() {\n        return ${propName};\n    }`);
        
        // 添加Setter
        setters.push(`    public void set${pascalPropName}(${javaType} ${propName}) {\n        this.${propName} = ${propName};\n    }`);
        
        // 生成嵌套类
        if (needsNestedClass) {
          let nestedCode = '';
          if (Array.isArray(value) && value.length > 0) {
            nestedCode = generateClass(value[0], nestedClassName, indent + 4);
          } else if (typeof value === 'object') {
            nestedCode = generateClass(value, nestedClassName, indent + 4);
          }
          
          if (nestedCode) {
            result += nestedCode;
          }
        }
      }
      
      // 添加字段
      result += fields.join('\n\n') + '\n\n';
      
      // 添加Getter和Setter
      result += getters.join('\n\n') + '\n\n';
      result += setters.join('\n\n') + '\n';
      
      result += `${indentStr}}\n\n`;
    }
    
    return result;
  };
  
  // 开始生成代码
  let code = '// Auto-generated Java code from JSON\n\n';
  code += 'import java.util.List;\n';
  code += 'import java.util.ArrayList;\n';
  
  if (useJSONAttributes) {
    code += 'import com.fasterxml.jackson.annotation.JsonProperty;\n';
  }
  
  code += '\n';
  code += generateClass(json, className);
  
  return code;
};

// =================== C# 代码生成 ===================
export const generateCSharp = (json: any, options: CodeGeneratorOptions): string => {
  // C#属性名使用帕斯卡命名（首字母大写）
  const { className, useOptionalProps = true, usePascalCase = true, useJSONAttributes = true } = options;
  
  // 生成C#类定义
  const generateClass = (obj: any, name: string, indent = 0, namespace = ''): string => {
    const indentStr = ' '.repeat(indent);
    let result = '';
    
    // 处理对象
    if (typeof obj === 'object' && obj !== null) {
      const isArray = Array.isArray(obj);
      
      if (isArray) {
        if (obj.length === 0) {
          return `${indentStr}// ${name} is empty array\n`;
        }
        
        // 处理数组第一项
        const firstItem = obj[0];
        if (typeof firstItem === 'object' && firstItem !== null) {
          // 复杂对象数组，生成类
          return generateClass(firstItem, name, indent, namespace);
        } else {
          // 简单类型数组
          return `${indentStr}// ${name} is array of ${typeof firstItem}\n`;
        }
      }
      
      // 创建类
      result += `${indentStr}public class ${name}\n${indentStr}{\n`;
      
      // 处理属性
      for (const [key, value] of Object.entries(obj)) {
        // C#属性名使用帕斯卡命名（首字母大写）
        const propName = formatPropertyName(key, true);
        let csharpType = 'object';
        let needsNestedClass = false;
        let nestedClassName = '';
        
        // JSON属性注解
        if (useJSONAttributes) {
          result += `${indentStr}    [JsonProperty("${key}")]\n`;
        }
        
        // 确定C#类型
        if (value === null) {
          csharpType = 'object';
        } else if (Array.isArray(value)) {
          if (value.length === 0) {
            csharpType = 'List<object>';
          } else {
            const firstItem = value[0];
            if (typeof firstItem === 'object' && firstItem !== null) {
              nestedClassName = toPascalCase(key);
              csharpType = `List<${nestedClassName}>`;
              needsNestedClass = true;
            } else {
              const typeMap: Record<string, string> = {
                'string': 'string',
                'number': 'double',
                'boolean': 'bool'
              };
              csharpType = `List<${typeMap[typeof firstItem] || 'object'}>`;
            }
          }
        } else if (typeof value === 'object') {
          nestedClassName = toPascalCase(key);
          csharpType = nestedClassName;
          needsNestedClass = true;
        } else {
          const typeMap: Record<string, string> = {
            'string': 'string',
            'number': Number.isInteger(value) ? 'int' : 'double',
            'boolean': 'bool'
          };
          csharpType = typeMap[typeof value] || 'object';
        }
        
        // 添加属性
        result += `${indentStr}    public ${csharpType} ${propName} { get; set; }\n`;
        
        // 生成嵌套类
        if (needsNestedClass) {
          let nestedCode = '';
          if (Array.isArray(value) && value.length > 0) {
            nestedCode = generateClass(value[0], nestedClassName, indent + 4, namespace + '.' + name);
          } else if (typeof value === 'object') {
            nestedCode = generateClass(value, nestedClassName, indent + 4, namespace + '.' + name);
          }
          
          if (nestedCode) {
            result = result.replace(`${indentStr}public class ${name}`, nestedCode + `${indentStr}public class ${name}`);
          }
        }
      }
      
      result += `${indentStr}}\n\n`;
    }
    
    return result;
  };
  
  // 开始生成代码
  let code = '// Auto-generated C# code from JSON\n\n';
  code += 'using System;\n';
  code += 'using System.Collections.Generic;\n';
  
  if (useJSONAttributes) {
    code += 'using Newtonsoft.Json;\n';
  }
  
  code += '\n';
  code += 'namespace JsonModels\n{\n';
  code += generateClass(json, className, 4, 'JsonModels');
  code += '}\n';
  
  return code;
};

// =================== Python 代码生成 ===================
export const generatePython = (json: any, options: CodeGeneratorOptions): string => {
  // Python通常使用snake_case命名约定，但我们保持驼峰命名以便与JSON字段一致
  const { className, usePascalCase = false } = options;
  
  // 生成Python类定义
  const generateClass = (obj: any, name: string, indent = 0): string => {
    const indentStr = ' '.repeat(indent);
    let result = '';
    
    // 处理对象
    if (typeof obj === 'object' && obj !== null) {
      const isArray = Array.isArray(obj);
      
      if (isArray) {
        if (obj.length === 0) {
          return `${indentStr}# ${name} is empty array\n`;
        }
        
        // 处理数组第一项
        const firstItem = obj[0];
        if (typeof firstItem === 'object' && firstItem !== null) {
          // 复杂对象数组，生成类
          return generateClass(firstItem, name, indent);
        } else {
          // 简单类型数组
          return `${indentStr}# ${name} is array of ${typeof firstItem}\n`;
        }
      }
      
      // 创建类
      result += `${indentStr}class ${name}:\n`;
      
      // 类初始化方法
      result += `${indentStr}    def __init__(self`;
      
      // 构造函数参数
      for (const key of Object.keys(obj)) {
        const propName = formatPropertyName(key, false);
        result += `, ${propName}=None`;
      }
      
      result += '):\n';
      
      // 添加属性赋值
      for (const [key, value] of Object.entries(obj)) {
        const propName = formatPropertyName(key, false);
        result += `${indentStr}        self.${propName} = ${propName}\n`;
        
        // 处理嵌套对象
        if (value !== null && typeof value === 'object') {
          if (Array.isArray(value)) {
            if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
              const nestedName = toPascalCase(key);
              const nestedClass = generateClass(value[0], nestedName, indent + 4);
              result = result.replace(`${indentStr}class ${name}:`, nestedClass + `${indentStr}class ${name}:`);
            }
          } else {
            const nestedName = toPascalCase(key);
            const nestedClass = generateClass(value, nestedName, indent + 4);
            result = result.replace(`${indentStr}class ${name}:`, nestedClass + `${indentStr}class ${name}:`);
          }
        }
      }
      
      // 添加表示方法
      result += `\n${indentStr}    def __repr__(self):\n`;
      result += `${indentStr}        return f"{self.__class__.__name__}({', '.join([f'{k}={v}' for k, v in self.__dict__.items()])})"`;
      
      result += '\n\n';
    }
    
    return result;
  };
  
  // 开始生成代码
  let code = '# Auto-generated Python code from JSON\n';
  code += 'from typing import List, Optional, Dict, Any\n\n';
  code += generateClass(json, className);
  
  // 添加反序列化辅助函数
  code += `def from_dict(cls, data):\n`;
  code += `    """Convert dictionary to class instance"""\n`;
  code += `    obj = cls()\n`;
  code += `    for key, value in data.items():\n`;
  code += `        attr_name = key\n`;
  code += `        if hasattr(obj, attr_name):\n`;
  code += `            setattr(obj, attr_name, value)\n`;
  code += `    return obj\n\n`;
  
  code += `# Example usage:\n`;
  code += `# data = json.loads(json_string)\n`;
  code += `# model = from_dict(${className}, data)\n`;
  
  return code;
};

// =================== Go 代码生成 ===================
export const generateGo = (json: any, options: CodeGeneratorOptions): string => {
  // Go的字段名使用帕斯卡命名（首字母大写）
  const { className, usePascalCase = true, useJSONAttributes = true } = options;
  
  // 生成Go结构体定义
  const generateStruct = (obj: any, name: string, indent = 0): string => {
    const indentStr = ' '.repeat(indent);
    let result = '';
    
    // 处理对象
    if (typeof obj === 'object' && obj !== null) {
      const isArray = Array.isArray(obj);
      
      if (isArray) {
        if (obj.length === 0) {
          return `${indentStr}// ${name} is empty array\n`;
        }
        
        // 处理数组第一项
        const firstItem = obj[0];
        if (typeof firstItem === 'object' && firstItem !== null) {
          // 复杂对象数组，生成结构体
          return generateStruct(firstItem, name, indent);
        } else {
          // 简单类型数组
          return `${indentStr}// ${name} is array of ${typeof firstItem}\n`;
        }
      }
      
      // 创建结构体
      result += `${indentStr}type ${name} struct {\n`;
      
      // 处理字段
      for (const [key, value] of Object.entries(obj)) {
        // Go公共字段必须使用大写开头的帕斯卡命名
        const fieldName = toPascalCase(key);
        let goType = 'interface{}';
        let needsNestedStruct = false;
        let nestedStructName = '';
        
        // JSON标签
        let jsonTag = '';
        if (useJSONAttributes) {
          jsonTag = ` \`json:"${key}"\``;
        }
        
        // 确定Go类型
        if (value === null) {
          goType = 'interface{}';
        } else if (Array.isArray(value)) {
          if (value.length === 0) {
            goType = '[]interface{}';
          } else {
            const firstItem = value[0];
            if (typeof firstItem === 'object' && firstItem !== null) {
              nestedStructName = toPascalCase(key);
              goType = `[]${nestedStructName}`;
              needsNestedStruct = true;
            } else {
              const typeMap: Record<string, string> = {
                'string': 'string',
                'number': 'float64',
                'boolean': 'bool'
              };
              goType = `[]${typeMap[typeof firstItem] || 'interface{}'}`;
            }
          }
        } else if (typeof value === 'object') {
          nestedStructName = toPascalCase(key);
          goType = nestedStructName;
          needsNestedStruct = true;
        } else {
          const typeMap: Record<string, string> = {
            'string': 'string',
            'number': Number.isInteger(value) ? 'int' : 'float64',
            'boolean': 'bool'
          };
          goType = typeMap[typeof value] || 'interface{}';
        }
        
        // 添加字段
        result += `${indentStr}    ${fieldName} ${goType}${jsonTag}\n`;
        
        // 生成嵌套结构体
        if (needsNestedStruct) {
          let nestedCode = '';
          if (Array.isArray(value) && value.length > 0) {
            nestedCode = generateStruct(value[0], nestedStructName, indent);
          } else if (typeof value === 'object') {
            nestedCode = generateStruct(value, nestedStructName, indent);
          }
          
          if (nestedCode) {
            result = result.replace(`${indentStr}type ${name} struct`, nestedCode + `${indentStr}type ${name} struct`);
          }
        }
      }
      
      result += `${indentStr}}\n\n`;
    }
    
    return result;
  };
  
  // 开始生成代码
  let code = '// Auto-generated Go code from JSON\n\n';
  code += 'package models\n\n';
  code += generateStruct(json, className);
  
  return code;
};

// =================== Swift 代码生成 ===================
export const generateSwift = (json: any, options: CodeGeneratorOptions): string => {
  // Swift的属性名使用驼峰命名（首字母小写）
  const { className, usePascalCase = false, useOptionalProps = true } = options;
  
  // 生成Swift结构体定义
  const generateStruct = (obj: any, name: string, indent = 0): string => {
    const indentStr = ' '.repeat(indent);
    let result = '';
    
    // 处理对象
    if (typeof obj === 'object' && obj !== null) {
      const isArray = Array.isArray(obj);
      
      if (isArray) {
        if (obj.length === 0) {
          return `${indentStr}// ${name} is empty array\n`;
        }
        
        // 处理数组第一项
        const firstItem = obj[0];
        if (typeof firstItem === 'object' && firstItem !== null) {
          // 复杂对象数组，生成结构体
          return generateStruct(firstItem, name, indent);
        } else {
          // 简单类型数组
          return `${indentStr}// ${name} is array of ${typeof firstItem}\n`;
        }
      }
      
      // 创建结构体
      result += `${indentStr}struct ${name}: Codable {\n`;
      
      // 处理属性
      for (const [key, value] of Object.entries(obj)) {
        // Swift属性使用驼峰命名（首字母小写）
        const propName = formatPropertyName(key, false);
        let swiftType = 'Any';
        const optional = useOptionalProps ? '?' : '';
        let needsNestedStruct = false;
        let nestedStructName = '';
        
        // 确定Swift类型
        if (value === null) {
          swiftType = 'Any';
        } else if (Array.isArray(value)) {
          if (value.length === 0) {
            swiftType = '[Any]';
          } else {
            const firstItem = value[0];
            if (typeof firstItem === 'object' && firstItem !== null) {
              nestedStructName = toPascalCase(key);
              swiftType = `[${nestedStructName}]`;
              needsNestedStruct = true;
            } else {
              const typeMap: Record<string, string> = {
                'string': 'String',
                'number': Number.isInteger(value[0]) ? 'Int' : 'Double',
                'boolean': 'Bool'
              };
              swiftType = `[${typeMap[typeof firstItem] || 'Any'}]`;
            }
          }
        } else if (typeof value === 'object') {
          nestedStructName = toPascalCase(key);
          swiftType = nestedStructName;
          needsNestedStruct = true;
        } else {
          const typeMap: Record<string, string> = {
            'string': 'String',
            'number': Number.isInteger(value) ? 'Int' : 'Double',
            'boolean': 'Bool'
          };
          swiftType = typeMap[typeof value] || 'Any';
        }
        
        // 添加属性
        result += `${indentStr}    var ${propName}: ${swiftType}${optional}\n`;
        
        // 生成嵌套结构体
        if (needsNestedStruct) {
          let nestedCode = '';
          if (Array.isArray(value) && value.length > 0) {
            nestedCode = generateStruct(value[0], nestedStructName, indent + 4);
          } else if (typeof value === 'object') {
            nestedCode = generateStruct(value, nestedStructName, indent + 4);
          }
          
          if (nestedCode) {
            result = result.replace(`${indentStr}struct ${name}`, nestedCode + `${indentStr}struct ${name}`);
          }
        }
      }
      
      // 添加CodingKeys枚举
      result += `\n${indentStr}    enum CodingKeys: String, CodingKey {\n`;
      for (const key of Object.keys(obj)) {
        const propName = formatPropertyName(key, false);
        result += `${indentStr}        case ${propName} = "${key}"\n`;
      }
      result += `${indentStr}    }\n`;
      
      result += `${indentStr}}\n\n`;
    }
    
    return result;
  };
  
  // 开始生成代码
  let code = '// Auto-generated Swift code from JSON\n\n';
  code += 'import Foundation\n\n';
  code += generateStruct(json, className);
  
  return code;
}; 