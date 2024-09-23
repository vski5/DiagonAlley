package routers

import (
	"back/controllers"

	"github.com/gin-gonic/gin"
)

// SetupPurchaseRoutes 设置购买相关的路由，使用路由组
func SetupPurchaseRoutes(router *gin.Engine, controller controllers.PurchaseController) {
	purchaseGroup := router.Group("/purchase")
	{
		purchaseGroup.POST("", controller.HandlePurchase)
	}
}
