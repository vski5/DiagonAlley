package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// GoodsController 定义购买控制器的接口
type GoodsController interface {
	HandleGoods(c *gin.Context)
}

// GoodsController 实现 GoodsController 接口的具体控制器
type goodsController struct{}

// NewGoodsController 创建一个新的 GoodsController 实例
func NewGoodsController() GoodsController {
	return &goodsController{}
}

// HandleGoods 处理购买请求的控制器
func (pc *goodsController) HandleGoods(c *gin.Context) {

	// 响应前端
	c.String(http.StatusOK, "goods request received and processed")
}
