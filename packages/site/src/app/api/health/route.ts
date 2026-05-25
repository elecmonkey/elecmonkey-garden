import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 获取请求信息
    const host = request.headers.get('host') || '';
    const xff = request.headers.get('x-forwarded-for')?.split(',')[0] || '';
    
    // 检查是否是本地请求
    const isLocalRequest = 
      host.startsWith('localhost:') || 
      host.startsWith('127.0.0.1:') ||
      xff === '127.0.0.1' ||
      xff === '::1';

    // 拒绝非本地请求
    if (!isLocalRequest) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // 基本健康检查
    const checks = {
      // 应用基本状态
      app: { ok: true },
      
      // 这里可以添加更多检查，例如：
      // - 数据库连接检查
      // - 文件系统访问检查
      // - 缓存服务检查
      // - 外部API可用性检查
    };

    return NextResponse.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      checks
    });
  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 