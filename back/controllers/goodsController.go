package controllers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GoodsController 定义购买控制器的接口
type GoodsController interface {
	HandleGoods(c *gin.Context)
	HandleGetGoods(c *gin.Context)
}

// GoodsController 实现 GoodsController 接口的具体控制器
type goodsController struct{}

// NewGoodsController 创建一个新的 GoodsController 实例
func NewGoodsController() GoodsController {
	return &goodsController{}
}

// HandleGoods 处理展示商品列表控制器
func (pc *goodsController) HandleGoods(c *gin.Context) {
	// 定义要返回的 JSON 数据
	response := gin.H{
		"properties": []gin.H{
			{
				"id":    1,
				"title": "Kuala Lumpur Apartment",
				"location": gin.H{
					"city":     "Kuala Lumpur",
					"district": "Bukit Bintang",
				},
				"price": gin.H{
					"perMinute": 0.0005,
					"currency":  "GAS",
				},
				"image": gin.H{
					"url":     "https://example.com/kl_apartment.jpg",
					"altText": "Apartment exterior",
				},
				"landlord": gin.H{
					"name": "Aminah Binti Ahmad",
					"contact": gin.H{
						"email": "aminah@example.com",
					},
				},
				"booked": false,
			},
			{
				"id":    2,
				"title": "Penang Beach House",
				"location": gin.H{
					"city":     "Penang",
					"district": "Tanjung Bungah",
				},
				"price": gin.H{
					"perMinute": 0.0008,
					"currency":  "GAS",
				},
				"image": gin.H{
					"url":     "https://example.com/penang_beach_house.jpg",
					"altText": "Beach house view",
				},
				"landlord": gin.H{
					"name": "Lee Wei Ming",
					"contact": gin.H{
						"email": "weiming@example.com",
					},
				},
				"booked": true,
			},
			{
				"id":    3,
				"title": "Langkawi Beachfront Villa",
				"location": gin.H{
					"city":     "Langkawi",
					"district": "Pantai Cenang",
				},
				"price": gin.H{
					"perMinute": 0.0010,
					"currency":  "GAS",
				},
				"image": gin.H{
					"url":     "https://example.com/langkawi_villa.jpg",
					"altText": "Beachfront villa with sunset view",
				},
				"landlord": gin.H{
					"name": "Tan Sri Lim",
					"contact": gin.H{
						"email": "tanlim@example.com",
					},
				},
				"booked": false,
			},
			{
				"id":    4,
				"title": "Cameron Highlands Bungalow",
				"location": gin.H{
					"city":     "Cameron Highlands",
					"district": "Tanah Rata",
				},
				"price": gin.H{
					"perMinute": 0.0006,
					"currency":  "GAS",
				},
				"image": gin.H{
					"url":     "https://example.com/cameron_bungalow.jpg",
					"altText": "Bungalow in the hills",
				},
				"landlord": gin.H{
					"name": "Mohd Ali",
					"contact": gin.H{
						"email": "mohdali@example.com",
					},
				},
				"booked": true,
			},
			{
				"id":    5,
				"title": "Melaka Heritage Home",
				"location": gin.H{
					"city":     "Melaka",
					"district": "Jonker Street",
				},
				"price": gin.H{
					"perMinute": 0.0009,
					"currency":  "GAS",
				},
				"image": gin.H{
					"url":     "https://example.com/melaka_home.jpg",
					"altText": "Heritage home in the heart of Melaka",
				},
				"landlord": gin.H{
					"name": "Chong Hock Lee",
					"contact": gin.H{
						"email": "chonghocklee@example.com",
					},
				},
				"booked": false,
			},
		},
	}

	// 响应前端，返回 JSON 数据
	c.JSON(http.StatusOK, response)
}

// HandleGetGoods 处理购买请求的控制器
func (pc *goodsController) HandleGetGoods(c *gin.Context) {
	var jsonData interface{}
	if err := c.ShouldBindJSON(&jsonData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无法解析JSON"})
		return
	}

	// 打印接收到的 JSON 数据
	fmt.Printf("接收到的预订请求数据: %+v\n", jsonData)

	// 这里可以选择将 jsonData 存储到数据库或进行其他操作

	c.JSON(http.StatusOK, gin.H{
		"message": "接收成功",
		"data":    jsonData,
	})
}
