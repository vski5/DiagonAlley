package controllers

import (
	"back/model"
	"net/http"

	"github.com/gin-gonic/gin"
)

// PurchaseController 定义购买控制器的接口
type PurchaseController interface {
	HandlePurchase(c *gin.Context)
}

// purchaseController 实现 PurchaseController 接口的具体控制器
type purchaseController struct{}

// NewPurchaseController 创建一个新的 PurchaseController 实例
func NewPurchaseController() PurchaseController {
	return &purchaseController{}
}

// HandlePurchase 处理购买请求的控制器
func (pc *purchaseController) HandlePurchase(c *gin.Context) {
	var data model.TransactionData
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
