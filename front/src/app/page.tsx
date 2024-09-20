'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"

export default function Home() {
  const [account, setAccount] = useState('')
  const [connected, setConnected] = useState(false)
  const [networkError, setNetworkError] = useState(false)
  const [loading, setLoading] = useState(false)

  const productPrice = ethers.parseEther('0.01') // 0.01 ETH
  const sepoliaChainId = '0xaa36a7' // Chain ID for Sepolia testnet

  useEffect(() => {
    checkWalletConnection()
  }, [])

  async function checkWalletConnection() {
    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          setAccount(accounts[0])
          setConnected(true)
          await checkNetwork()
        }
      } catch (error) {
        console.error('Failed to get accounts', error)
      }
    }
  }

  async function checkNetwork() {
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      if (chainId !== sepoliaChainId) {
        setNetworkError(true)
      } else {
        setNetworkError(false)
      }
    } catch (error) {
      console.error('Failed to get network', error)
    }
  }

  async function switchToSepolia() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: sepoliaChainId }],
      })
      setNetworkError(false)
    } catch (error) {
      console.error('Failed to switch network', error)
      toast({
        title: "Network Switch Failed",
        description: "Failed to switch to Sepolia network. Please try manually in your wallet.",
        variant: "destructive",
      })
    }
  }

  async function connectWallet() {
    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' })
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        setAccount(accounts[0])
        setConnected(true)
        await checkNetwork()
      } catch (error) {
        console.error('Failed to connect wallet', error)
        toast({
          title: "Connection Failed",
          description: "Failed to connect to your wallet. Please try again.",
          variant: "destructive",
        })
      }
    } else {
      toast({
        title: "Wallet Not Found",
        description: "Please install MetaMask or another Ethereum wallet.",
        variant: "destructive",
      })
    }
  }

  async function buyProduct() {
    if (!connected) {
      toast({
        title: "Not Connected",
        description: "Please connect your wallet first!",
        variant: "destructive",
      })
      return
    }

    if (networkError) {
      toast({
        title: "Network Error",
        description: "Please switch to Sepolia network!",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      
      const transaction = await signer.sendTransaction({
        to: '0xYourAddressHere', // Replace with your Ethereum address
        value: productPrice
      })

      // 发送交易详情到服务器
      const response = await fetch('http://localhost:2333/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: account,
          to: '0xYourAddressHere', // 替换为您的以太坊地址
          value: ethers.formatEther(productPrice),
          transactionHash: transaction.hash,
        }),
      })

      // 检查服务器响应是否成功
      if (!response.ok) {
        throw new Error('Server error')
      }

      // 等待交易确认
      await transaction.wait()
      toast({
        title: "Purchase Successful",
        description: "Your transaction has been confirmed!",
      })
    } catch (error) {
      console.error('Purchase failed', error)
      toast({
        title: "Purchase Failed",
        description: "There was an error processing your purchase. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Exclusive Product</CardTitle>
          <CardDescription>One-of-a-kind blockchain-powered item on Sepolia</CardDescription>
        </CardHeader>
        <CardContent>
          <img 
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='100%25' height='100%25' fill='white' stroke='black' stroke-width='2'/%3E%3Ctext x='50%25' y='50%25' font-size='20' text-anchor='middle' fill='black'%3EProduct%3C/text%3E%3C/svg%3E" 
            alt="Product" 
            className="w-full h-[200px] object-cover rounded-md mb-4"
          />
          <p className="text-2xl font-bold text-center">0.01 ETH</p>
          {networkError && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Network Error</AlertTitle>
              <AlertDescription>
                Please switch to Sepolia network.
                <Button onClick={switchToSepolia} variant="outline" size="sm" className="mt-2">
                  Switch to Sepolia
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          {!connected ? (
            <Button onClick={connectWallet} className="w-full">
              Connect Wallet
            </Button>
          ) : (
            <Button onClick={buyProduct} className="w-full" disabled={networkError || loading}>
              <ShoppingCart className="mr-2 h-4 w-4" /> 
              {loading ? 'Processing...' : 'Buy Now'}
            </Button>
          )}
          {connected && (
            <p className="text-sm text-muted-foreground text-center">
              Connected: {account.slice(0, 6)}...{account.slice(-4)}
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}