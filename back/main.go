package main

import (
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type TransactionData struct {
	From            string `json:"from"`
	To              string `json:"to"`
	Value           string `json:"value"`
	TransactionHash string `json:"transactionHash"`
}

func main() {
	router := gin.Default()

	// 配置CORS中间件
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true                                                                                                  // 允许所有源
	config.AllowMethods = []string{"GET", "POST", "OPTIONS"}                                                                       // 允许的HTTP方法
	config.AllowHeaders = []string{"Origin", "Content-Type", "Content-Length", "Accept-Encoding", "X-CSRF-Token", "Authorization"} // 允许的HTTP头部

	router.Use(cors.New(config))

	// 设置路由
	router.POST("/purchase", handlePurchase)

	// 启动服务器
	router.Run(":2333") // 监听并在 0.0.0.0:2333 上启动服务
}

func handlePurchase(c *gin.Context) {
	var data TransactionData
	if err := c.BindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
		return
	}

	// 打印接收到的数据
	// fmt.Printf("Purchase received:\nFrom: %s\nTo: %s\nValue: %s ETH\nTransaction Hash: %s\n", data.From, data.To, data.Value, data.TransactionHash)

	// 响应前端
	c.JSON(http.StatusOK, gin.H{
		"message": "Purchase request received and processed",
	})
}
