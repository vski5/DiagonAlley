package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()

	// 设置路由
	router.POST("/purchase", handlePurchase)

	// 启动服务器
	router.Run(":2333") // 监听并在 0.0.0.0:2333 上启动服务
}

// 处理购买请求
func handlePurchase(c *gin.Context) {
	// 这里可以解析请求体，处理购买逻辑
	c.JSON(http.StatusOK, gin.H{
		"message": "Purchase request received",
	})
}
