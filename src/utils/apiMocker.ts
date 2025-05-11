import jsonSchemaFaker from 'json-schema-faker'

// 配置JSON Schema Faker
jsonSchemaFaker.option({
  alwaysFakeOptionals: true,
  useDefaultValue: true,
  minItems: 1,
  maxItems: 10,
  minLength: 1,
  maxLength: 50,
  random: Math.random
})

/**
 * 生成基于JSON Schema的模拟数据
 * @param schema JSON Schema对象或字符串
 * @param errorRate 生成错误的概率百分比 (0-100)
 * @param delay 响应延迟毫秒数
 * @returns 生成的模拟数据或错误对象
 */
export const generateMockData = async (
  schema: object | string,
  errorRate: number = 0,
  delay: number = 0
): Promise<any> => {
  // 解析schema如果是字符串
  const schemaObj = typeof schema === 'string' ? JSON.parse(schema) : schema
  
  // 模拟延迟
  if (delay > 0) {
    await new Promise(resolve => setTimeout(resolve, delay))
  }
  
  // 根据错误率决定是否生成错误
  const shouldGenerateError = Math.random() * 100 < errorRate
  
  if (shouldGenerateError) {
    return generateErrorResponse()
  }
  
  try {
    // 生成模拟数据
    return await jsonSchemaFaker.generate(schemaObj)
  } catch (error) {
    console.error('Error generating mock data:', error)
    return {
      error: 'Failed to generate mock data',
      message: error instanceof Error ? error.message : 'Unknown error',
      schema: schemaObj
    }
  }
}

/**
 * 生成随机错误响应
 */
const generateErrorResponse = (): object => {
  const errorTypes = [
    {
      status: 400,
      error: 'Bad Request',
      message: 'The request was malformed or contains invalid parameters'
    },
    {
      status: 401,
      error: 'Unauthorized',
      message: 'Authentication is required and has failed or has not been provided'
    },
    {
      status: 403,
      error: 'Forbidden',
      message: 'The server understood the request but refuses to authorize it'
    },
    {
      status: 404,
      error: 'Not Found',
      message: 'The requested resource could not be found'
    },
    {
      status: 500,
      error: 'Internal Server Error',
      message: 'The server encountered an unexpected condition that prevented it from fulfilling the request'
    },
    {
      status: 503,
      error: 'Service Unavailable',
      message: 'The server is currently unavailable'
    }
  ]
  
  // 随机选择一种错误类型
  return errorTypes[Math.floor(Math.random() * errorTypes.length)]
}

/**
 * 注意: Mock Server功能需要在实际环境中实现
 * 此处暂时用模拟服务器替代
 */
export const createMockServer = async (
  endpoints: any[],
  port: number = 3001
): Promise<{ server: any; close: () => void }> => {
  console.log(`Mock server would start with ${endpoints.length} endpoints on port ${port}`)
  
  // 返回模拟的服务器对象
  return {
    server: {
      address: () => ({ port }),
    },
    close: () => {
      console.log('Mock server stopped')
    }
  }
} 