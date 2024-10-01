package ini

import (
	"log"
	"strings"

	"gopkg.in/ini.v1"
)

var cfg *ini.File

// InitConfig 初始化配置，加载指定路径的 ini 文件
func InitConfig(path string) {
	var err error
	cfg, err = ini.Load(path)
	if err != nil {
		log.Fatalf("Fail to read file: %v", err)
	}
}

// GetServerPort 获取服务器端口号
// 示例: serverPort := ini.GetServerPort() // 返回 "2333"
func GetServerPort() string {
	return cfg.Section("server").Key("port").String()
}

// GetCORSOrigins 获取允许的跨域源
// 示例: config.AllowOrigins = []string{"http://localhost:3000", "https://example.com"}
func GetCORSOrigins() []string {
	rawOrigins := cfg.Section("cors").Key("allow_origins").String()
	origins := strings.Split(rawOrigins, ",")
	for i, origin := range origins {
		origins[i] = strings.TrimSpace(origin)
	}
	return origins
}

// GetCORSMethods 获取允许的HTTP方法
// 示例: config.AllowMethods = []string{"GET", "POST", "OPTIONS"}
func GetCORSMethods() []string {
	rawMethods := cfg.Section("cors").Key("allow_methods").String()
	methods := strings.Split(rawMethods, ",")
	for i, method := range methods {
		methods[i] = strings.TrimSpace(method)
	}
	return methods
}

// GetCORSHeaders 获取允许的HTTP头
//
//	示例: config.AllowHeaders = []string{
//		"Origin",
//		"Content-Type",
//		"Content-Length",
//		"Accept-Encoding",
//		"X-CSRF-Token",
//		"Authorization",
//	}
func GetCORSHeaders() []string {
	rawHeaders := cfg.Section("cors").Key("allow_headers").String()
	headers := strings.Split(rawHeaders, ",")
	for i, header := range headers {
		headers[i] = strings.TrimSpace(header)
	}
	return headers
}

// GetCORSAllowCredentials 获取是否允许携带凭证
// 示例: allowCredentials := ini.GetCORSAllowCredentials() // 返回 true 或 false
func GetCORSAllowCredentials() bool {
	allow, err := cfg.Section("cors").Key("allow_credentials").Bool()
	if err != nil {
		return false
	}
	return allow
}

// GetSecretKey 获取全局密钥
// 示例: secretKey := ini.GetSecretKey() // 返回 "your_secret_key_here"
func GetSecretKey() string {
	return cfg.Section("security").Key("secret_key").String()
}

func GetDatabaseKey() string {
	return cfg.Section("database").Key("db_key").String()
}
