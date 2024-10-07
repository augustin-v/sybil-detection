'use client'
import {} from 'recharts'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { useTransactionReceipt, useBlock } from "@starknet-react/core"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Results() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const hash = searchParams.get('hash')
  const [transactionHash, setTransactionHash] = useState<string | undefined>(hash)
  const [blockNumber, setBlockNumber] = useState<number | undefined>(undefined)
  const [showEvents, setShowEvents] = useState(false)
  const [showTx, setShowTx] = useState(false)
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
    };

    try {
      const response = await fetch('https://mltest-production.up.railway.app/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([extractedData]),  
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Data sent to Stark-chan:', result);

      const score = result.decision_scores?.[0] ? parseFloat(result.decision_scores[0]).toFixed(2) : 0;
      setPredictionScore(score);

      // Calculate risk percentage
      const riskScore = calculateRiskPercentage(score);
      setRiskPercentage(riskScore);

      // Update score message
      updateScoreMessage(score);

    } catch (error) {
      console.error('Error sending data to Stark-chan:', error);
    }
  };

  const calculateRiskPercentage = (score) => {
    const MAX_SCORE = 0;
    const MIN_SCORE = -0.2; 
    const riskScore = ((MAX_SCORE - score) / (MAX_SCORE - MIN_SCORE)) * 100;
    return Math.min(Math.max(riskScore, 0), 100); 
  };

  const updateScoreMessage = (score) => {
    if (score < 0) {
      setScoreMessage('Dangerous');
    } else {
      setScoreMessage('Safe');
    }
  };

  if (txLoading) return <div className="p-4">Loading transaction data...</div>
  if (txError) return <div className="p-4 text-red-500">Error fetching transaction: {txError.message}</div>
  if (!txData) return <div className="p-4">No transaction data found for hash: {transactionHash}</div>
  if (blockLoading) return <div className="p-4">Loading block data...</div>
  if (blockError) return <div className="p-4 text-red-500">Error fetching block data: {blockError.message}</div>

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Transaction and Block Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-yellow-100 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-600">Successfully fetched.</h3>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 mb-2">Send details to AI for Sybil attack detection</p>
                <button
                  onClick={handleSendToStarkChan}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Send
                </button>
                {predictionScore !== null && (
                  <div className="bg-black-100 p-4 rounded-lg">
                    <h3 className="text-lg text-black font-semibold">Decision Score: {predictionScore}</h3>
                    <p className="text-sm text-black">{scoreMessage}</p>
                    <p className="text-sm text-black">Risk percentage: {riskPercentage !== null ? riskPercentage.toFixed(2) + '%' : 'N/A'}</p>
                  </div>
                )}
              </div>
            </div>
            <h2 className="text-xl font-bold">Transaction Hash: {transactionHash}</h2>
            <h3 className="text-lg">Status: {txData.execution_status}</h3>
            <h3 className="text-lg">From: {txData.events?.[0]?.data?.[0] || "N/A"}</h3>
            <h3 className="text-lg">To: {txData.events?.[0]?.data?.[1] || "N/A"}</h3>
            <h3 className="text-lg">Block Number: {txData.block_number}</h3>
            <h3 className="text-lg">Actual Fee: {txData.actual_fee ? `${txData.actual_fee.amount} ${txData.actual_fee.unit}` : "N/A"}</h3>
            <h3 className="text-lg">Block Hash: {txData.block_hash}</h3>
            <h3 className="text-lg">Finality Status: {txData.finality_status}</h3>
          </div>

          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="showEvents"
              checked={showEvents} 
              onChange={() => setShowEvents(!showEvents)} 
              className="mr-2"
            />
            <label htmlFor="showEvents" className="text-sm font-medium">Show Events</label>
          </div>

          {showEvents && (
            <ul className="space-y-4 list-disc list-inside">
              {Array.isArray(txData.events) && txData.events.length > 0 ? (
                txData.events.map((event, index) => (
                  <li key={index} className="text-sm">
                    <strong>Event:</strong> {event.type} <br />
                    <strong>Transaction Hash:</strong> {event.transaction_hash} <br />
                    <strong>Data:</strong> <pre className="mt-2 p-2 bg-black-100 rounded">{JSON.stringify(event, null, 2)}</pre>
                  </li>
                ))
              ) : (
                <li>No events found.</li>
              )}
            </ul>
          )}
          
          <div>
            <h3 className="text-lg font-semibold">Execution Resources:</h3>
            <pre className="mt-2 p-4 bg-black-100 rounded overflow-x-auto">
              {JSON.stringify(txData.execution_resources, null, 2)}
            </pre>
          </div>
        </div>

        {blockData && (
          <div className="mt-8 space-y-6">
            <h2 className="text-2xl font-bold">Block Data:</h2>
            <div className="space-y-2">
              <h3 className="text-lg">Status: {blockData.status}</h3>
              <h3 className="text-lg">Block Hash: {blockData.block_hash}</h3>
              <h3 className="text-lg">Parent Hash: {blockData.parent_hash}</h3>
              <h3 className="text-lg">Block Number: {blockData.block_number}</h3>
              <h3 className="text-lg">Timestamp: {new Date(blockData.timestamp * 1000).toLocaleString()}</h3>
              <h3 className="text-lg">Sequencer Address: {blockData.sequencer_address}</h3>
              <h3 className="text-lg">StarkNet Version: {blockData.starknet_version}</h3>
              <h3 className="text-lg">Number of Block Transactions in the block: {blockData.transactions.length}</h3>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
