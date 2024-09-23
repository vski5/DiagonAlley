package model

// TransactionData 定义交易数据的结构
type TransactionData struct {
	From            string `json:"from"`
	To              string `json:"to"`
	Value           string `json:"value"`
	TransactionHash string `json:"transactionHash"`
}
