"""
企业级管理系统 FastAPI 应用入口
"""
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn

from app.core.config import settings
from app.core.logging import setup_logging
from app.core.database import Base, engine
from app.schemas.common import ApiResponse
from app.modules.auth.router import router as auth_router
from app.modules.system.router import router as system_router
from app.modules.profile.router import router as profile_router


# 设置日志
logger = setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时执行
    logger.info("应用启动中...")
    
    # 创建数据库表（开发环境）
    if settings.DEBUG:
        Base.metadata.create_all(bind=engine)
        logger.info("数据库表已创建")
    
    yield
    
    # 关闭时执行
    logger.info("应用关闭中...")


# 创建FastAPI应用
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="企业级管理系统后端API",
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)


# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 全局异常处理器
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """HTTP异常处理器"""
    return JSONResponse(
        status_code=200,  # 统一返回200状态码
        content=ApiResponse(
            success=False,
            data=None,
            error=exc.detail,
            code=str(exc.status_code)
        ).dict()
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """通用异常处理器"""
    logger.error(f"未处理的异常: {str(exc)}")
    return JSONResponse(
        status_code=200,
        content=ApiResponse(
            success=False,
            data=None,
            error="服务器内部错误" if not settings.DEBUG else str(exc),
            code="500"
        ).dict()
    )


# 健康检查端点
@app.get("/health", response_model=ApiResponse[dict])
async def health_check():
    """健康检查"""
    return ApiResponse(
        success=True,
        data={"status": "healthy", "version": settings.PROJECT_VERSION}
    )


# 注册路由
app.include_router(auth_router, prefix="/api")
app.include_router(system_router, prefix="/api")
app.include_router(profile_router, prefix="/api")


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="debug" if settings.DEBUG else "info"
    )
