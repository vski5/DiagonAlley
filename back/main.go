package main

import (
	"back/controllers"
	"back/ini"
	"back/routers"
	"fmt"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// 初始化配置
	ini.InitConfig("./ini/config.ini")

	router := gin.Default()

	// 配置CORS中间件
	config := cors.DefaultConfig()

	// 设置允许的源
	config.AllowOrigins = ini.GetCORSOrigins()

	// 设置允许的HTTP方法
	config.AllowMethods = ini.GetCORSMethods()

	// 设置允许的HTTP头
	config.AllowHeaders = ini.GetCORSHeaders()

	// 设置是否允许携带凭证
	config.AllowCredentials = ini.GetCORSAllowCredentials()

	// 应用CORS中间件到路由器
	router.Use(cors.New(config))

	// 初始化购买的控制器 /purchase
	var purchaseController controllers.PurchaseController = controllers.NewPurchaseController()
	// 设置购买的路由
	routers.SetupPurchaseRoutes(router, purchaseController)

	// 初始化商品的控制器 /goods
	var goodsController controllers.GoodsController = controllers.NewGoodsController()
	// 设置商品的路由
	routers.SetupGoodsRoutes(router, goodsController)

	dsn := ini.GetDatabaseKey()

	var DB *gorm.DB
	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		fmt.Println("数据库连接失败:", err)
	} else {
		fmt.Println("数据库连接成功", DB)
	}
	// 启动服务器
	serverPort := ini.GetServerPort()
	router.Run(":" + serverPort) // 监听并在指定端口上启动服务
}
