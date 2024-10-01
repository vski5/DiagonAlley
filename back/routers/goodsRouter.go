package routers

import (
	"back/controllers"

	"github.com/gin-gonic/gin"
)

// SetupGoodsRoutes 设置购买相关的路由，使用路由组
func SetupGoodsRoutes(router *gin.Engine, controller controllers.GoodsController) {
	goodsGroup := router.Group("/goods")
	{
		goodsGroup.GET("", controller.HandleGoods)
	}
}
