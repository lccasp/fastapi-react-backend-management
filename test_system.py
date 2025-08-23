#!/usr/bin/env python3
"""
系统功能测试脚本
"""

import asyncio
import aiohttp
import json

async def test_backend_api():
    """测试后端API是否正常运行"""
    
    base_url = "http://localhost:8000"
    
    # 测试API端点
    endpoints = [
        "/api/v1/health",  # 健康检查
        "/api/v1/system/users",  # 用户列表
        "/api/v1/system/roles",  # 角色列表
        "/api/v1/system/permissions",  # 权限列表
        "/api/v1/system/departments",  # 部门列表
        "/api/v1/system/positions",  # 岗位列表
    ]
    
    async with aiohttp.ClientSession() as session:
        print("🔍 测试后端API端点...")
        
        for endpoint in endpoints:
            try:
                url = f"{base_url}{endpoint}"
                async with session.get(url) as response:
                    if response.status == 200:
                        print(f"✅ {endpoint} - 正常")
                    elif response.status == 401:
                        print(f"🔐 {endpoint} - 需要认证 (正常)")
                    else:
                        print(f"❌ {endpoint} - 状态码: {response.status}")
            except Exception as e:
                print(f"❌ {endpoint} - 连接错误: {str(e)}")

async def main():
    print("🚀 开始系统测试...\n")
    
    # 测试后端API
    await test_backend_api()
    
    print("\n📋 测试总结:")
    print("1. 如果看到连接错误，请确保后端服务已启动")
    print("2. 如果看到认证错误，说明API端点存在但需要登录")
    print("3. 前端页面应该能正常显示，操作按钮应该有响应")
    
    print("\n🔧 如何启动服务:")
    print("后端: cd backend && python main.py")
    print("前端: cd frontend && npm run dev")

if __name__ == "__main__":
    asyncio.run(main())
