package main

import (
	"back/controllers"
	"back/routers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()

	// 配置CORS中间件
	config := cors.DefaultConfig()
	// 在开发环境中允许本地前端访问，生产环境请替换为实际前端域名
	config.AllowOrigins = []string{"http://localhost:3000"} // 生产环境中请使用 "http://your-frontend-domain.com"
	// 允许的HTTP方法
	config.AllowMethods = []string{"GET", "POST", "OPTIONS"}
	// 允许的请求头
	config.AllowHeaders = []string{
		"Origin",
		"Content-Type",
		"Content-Length",
		"Accept-Encoding",
		"X-CSRF-Token",
		"Authorization",
	}
	// 是否允许携带凭证（如Cookies、认证头等）
	// 在生产环境中根据需求谨慎设置，确保安全性
	config.AllowCredentials = true

	router.Use(cors.New(config))

	// 初始化控制器
	var purchaseController controllers.PurchaseController = controllers.NewPurchaseController()

	// 设置路由
	routers.SetupPurchaseRoutes(router, purchaseController)

	// 启动服务器
	router.Run(":2333") // 监听并在 0.0.0.0:2333 上启动服务
}
