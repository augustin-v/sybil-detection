'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTransactionReceipt, useBlock } from "@starknet-react/core"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle } from "lucide-react"
import { CoolMode } from '@/components/ui/cool-mode'

export default function Results() {
  const searchParams = useSearchParams()
  const hash = searchParams.get('hash')
  const [transactionHash, setTransactionHash] = useState<string | undefined>(hash)
  const [blockNumber, setBlockNumber] = useState<number | undefined>(undefined)
  const [showEvents, setShowEvents] = useState(false)
  const [predictionScore, setPredictionScore] = useState<number | null>(null)
  const [riskPercentage, setRiskPercentage] = useState<number | null>(null)
  const [scoreMessage, setScoreMessage] = useState('')

  const { data: txData, error: txError, isLoading: txLoading } = useTransactionReceipt({ hash: transactionHash })
  const { data: blockData, error: blockError, isLoading: blockLoading } = useBlock({ blockIdentifier: blockNumber })

  useEffect(() => {
    if (typeof hash === 'string') {
      setTransactionHash(hash)
    }
  }, [hash])

  useEffect(() => {
    if (txData?.block_number) {
      setBlockNumber(txData.block_number)
    }
  }, [txData])

  const handleSendToStarkChan = async () => {
    const extractedData = {
      block_number: Number(txData.block_number || 0),
      fee_in_eth: Number(txData.actual_fee?.amount / 1e18 || 0),
      tx_count: blockData.transactions.length,
      time_diff: blockData ? (Date.now() / 1000 - blockData.timestamp) : 0,
      avg_fee: txData.execution_status === 'SUCCEEDED' ? Number(txData.actual_fee?.amount / 1e18) : 0,
      std_fee: 0.005
    }

    try {
      const response = await fetch('https://mltest-production.up.railway.app/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([extractedData]),
      })

      if (!response.ok) throw new Error(`Error: ${response.statusText}`)

      const result = await response.json()
      const score = result.decision_scores?.[0] ? parseFloat(result.decision_scores[0]).toFixed(2) : 0
      setPredictionScore(score)
      setRiskPercentage(calculateRiskPercentage(score))
      updateScoreMessage(score)
    } catch (error) {
      console.error('Error sending data to Stark-chan:', error)
    }
  }

  const calculateRiskPercentage = (score) => {
    const MAX_SCORE = 0
    const MIN_SCORE = -0.2
    const riskScore = ((MAX_SCORE - score) / (MAX_SCORE - MIN_SCORE)) * 100
    if (score < 0 && transactionHash) {
      localStorage.setItem('negativeScoreTransaction', transactionHash)
    }
    return Math.min(Math.max(riskScore, 0), 100)
  }

  const updateScoreMessage = (score) => {
    setScoreMessage(score < 0 ? 'Dangerous' : 'Safe')
  }

  if (txLoading || blockLoading) return <div className="p-4 text-white">Loading data...</div>
  if (txError || blockError) return <div className="p-4 text-red-500">Error fetching data: {txError?.message || blockError?.message}</div>
  if (!txData) return <div className="p-4 text-white">No transaction data found for hash: {transactionHash}</div>

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <Card className="w-full max-w-4xl mx-auto bg-gray-800 text-white">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Transaction and Block Details</CardTitle>
          <p className='text-green-500'>Successfully fetched</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="bg-gray-700">
            <CardHeader>
              <CardTitle className="text-white sm:text-xl">AI Prediction</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={handleSendToStarkChan} className="mb-4 text-sm sm:text-base">
                Send to AI for Sybil Attack Detection
              </Button>
              {predictionScore !== null && (
                <div className="bg-gray-600 p-4 rounded-lg text-white sm:text-base">
                  <h3 className="text-white sm:text-lg font-semibold">Decision Score: {predictionScore}</h3>
                  <p>{scoreMessage}</p>
                  <p>Risk percentage: {riskPercentage !== null ? riskPercentage.toFixed(2) + '%' : 'N/A'}</p>
                  {scoreMessage === 'Safe' ? (
                    <CheckCircle className="text-green-500 mt-2" />
                  ) : (
                    <AlertCircle className="text-red-500 mt-2" />
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gray-700">
            <CardHeader>
              <CardTitle className="text-white sm:text-xl">Transaction Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-blue-500 sm:text-base">
              <p className="break-words"><strong className='text-white'>Transaction Hash:</strong> {transactionHash}</p>
              <p><strong className='text-white'>Status:</strong> {txData.execution_status}</p>
              <p className="break-words"><strong className='text-white'>From:</strong> {txData.events?.[0]?.data?.[0] || "N/A"}</p>
              <p className="break-words"><strong className='text-white'>To:</strong> {txData.events?.[0]?.data?.[1] || "N/A"}</p>
              <p><strong className='text-white'>Block Number:</strong> {txData.block_number}</p>
              <p className="break-words"><strong className='text-white'>Actual Fee:</strong> {txData.actual_fee ? `${txData.actual_fee.amount} ${txData.actual_fee.unit}` : "N/A"}</p>
              <p className="break-words"><strong className='text-white'>Block Hash:</strong> {txData.block_hash}</p>
              <p><strong className='text-white'>Finality Status:</strong> {txData.finality_status}</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-700">
            <CardHeader>
              <CardTitle className="text-white sm:text-xl">Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox
                  id="showEvents"
                  checked={showEvents}
                  onChange={(e) => setShowEvents(e.target.checked)}
                  label="Show Events"
                />
              </div>
{showEvents && (
  <ScrollArea className="h-64">
    <ul className="space-y-4">
      {Array.isArray(txData.events) && txData.events.length > 0 ? (
        txData.events.map((event, index) => (
          <li key={index} className="text-xs sm:text-white bg-gray-600 p-4 rounded">
            <strong>Event Type:</strong> {event.type} <br />
            <strong>From Address:</strong> <span className="break-all">{event.from_address}</span> <br />
            {event.keys && event.keys.length > 0 && (
              <>
                <strong>Keys:</strong>
                <ul className="list-disc list-inside pl-4">
                  {event.keys.map((key, keyIndex) => (
                    <li key={keyIndex} className="break-all">{key}</li>
                  ))}
                </ul>
              </>
            )}
            <strong>Data:</strong>
            <ul className="list-disc list-inside pl-4">
              {event.data.map((item, dataIndex) => (
                <li key={dataIndex} className="break-all">{item}</li>
              ))}
            </ul>
            <details>
              <summary className="cursor-pointer text-blue-400 hover:text-blue-300">View Raw JSON</summary>
              <pre className="mt-2 p-2 bg-gray-500 rounded overflow-x-auto text-xs">
                {JSON.stringify(event, null, 2)}
              </pre>
            </details>
          </li>
        ))
      ) : (
        <li>No events found.</li>
      )}
    </ul>
  </ScrollArea>
)}
            </CardContent>
          </Card>

          <Card className="bg-gray-700">
            <CardHeader>
              <CardTitle className="text-white sm:text-xl">Execution Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <pre className="text-xs sm:text-white overflow-x-auto whitespace-pre-wrap break-words">
                  {JSON.stringify(txData.execution_resources, null, 2)}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>

          {blockData && (
            <Card className="bg-gray-700">
              <CardHeader>
                <CardTitle className="text-white sm:text-xl">Block Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-blue-500 sm:text-base">
                <p><strong className='text-white'>Status:</strong> {blockData.status}</p>
                <p className="break-words"><strong className='text-white'>Block Hash:</strong> {blockData.block_hash}</p>
                <p className="break-words"><strong className='text-white'>Parent Hash:</strong> {blockData.parent_hash}</p>
                <p><strong className='text-white'>Block Number:</strong> {blockData.block_number}</p>
                <p><strong className='text-white'>Timestamp:</strong> {new Date(blockData.timestamp * 1000).toLocaleString()}</p>
                <p className="break-words"><strong className='text-white'>Sequencer Address:</strong> {blockData.sequencer_address}</p>
                <p><strong className='text-white'>StarkNet Version:</strong> {blockData.starknet_version}</p>
                <p><strong className='text-white'>Number of Transactions:</strong> {blockData.transactions.length}</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}