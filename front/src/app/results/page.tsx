'use client'

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
  const [scoreMessage, setScoreMessage] = useState<string>('')

  const { data: txData, error: txError, isLoading: txLoading } = useTransactionReceipt({ hash: transactionHash })
  const { data: blockData, error: blockError, isLoading: blockLoading } = useBlock({ blockIdentifier: blockNumber })

  useEffect(() => {
    if (typeof hash === 'string') {
      setTransactionHash(hash)
    }
  }, [hash])

  useEffect(() => {
    if (txData && txData.block_number) {
      setBlockNumber(txData.block_number)
    }
  }, [txData])

  const handleSendToStarkChan = async () => {
    const extractedData = [
      // provisionary
      txData.execution_status === 'SUCCEEDED' ? 1 : 0,  // Binary: 1 if succeeded else 0
      Number(txData.block_number  || 0),  // block number of the transaction hash
      Number(txData.actual_fee?.amount || 0),  // fee of the transaction
      Number(txData.actual_fee?.unit / 10 || 0),  // Ensure this is a number
      txData.block_hash.length > 0 ? parseInt(txData.block_hash, 16) : 0,  
      txData.finality_status === 'ACCEPTED_ON_L2' ? 1 : 0,  // Binary: 1 if accepted else 0
      Number(txData.events?.[0]?.data?.[0] || 0),  // sender address
      Number(txData.events?.[0]?.data?.[1]  || 0)   // receiver address
    ];

    try {
      const response = await fetch('https://mltest-production.up.railway.app/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          features: extractedData,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
  
      const result = await response.json();
      console.log('Data sent to Stark-chan:', result);
      
      // Update the prediction score and message
      const score = parseFloat(result.prediction).toFixed(2);
      setPredictionScore(score);
      
      if (score < 0.9) {
        setScoreMessage('Dangerous');
      } else {
        setScoreMessage('Safe');
      }
      
    } catch (error) {
      console.error('Error sending data to Stark-chan:', error);
    }
  };

  if (txLoading) {
    return <div className="p-4">Loading transaction data...</div>
  }

  if (txError) {
    return <div className="p-4 text-red-500">Error fetching transaction: {txError.message}</div>
  }

  if (!txData) {
    return <div className="p-4">No transaction data found for hash: {transactionHash}</div>
  }

  if (blockLoading) {
    return <div className="p-4">Loading block data...</div>
  }

  if (blockError) {
    return <div className="p-4 text-red-500">Error fetching block data: {blockError.message}</div>
  }

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
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Send details to stark-chan for sybil attack detection
                </p>
                <button
                  onClick={handleSendToStarkChan}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Send
                </button>
                {predictionScore !== null && (
                  <div className="bg-black-100 p-4 rounded-lg">
                  <h3 className="text-lg text-black font-semibold">Prediction Score: {predictionScore}</h3>
                  <p className="text-sm text-black">{scoreMessage}</p>

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
            <label htmlFor="showEvents" className="text-sm font-medium">
              Show Events
            </label>
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
              <h3 className="text-lg">New Root: {blockData.new_root}</h3>
              <h3 className="text-lg">Timestamp: {new Date(blockData.timestamp * 1000).toLocaleString()}</h3>
              <h3 className="text-lg">Sequencer Address: {blockData.sequencer_address}</h3>
              <h3 className="text-lg">StarkNet Version: {blockData.starknet_version}</h3>
            </div>

            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="showTx" 
                checked={showTx} 
                onChange={() => setShowTx(!showTx)} 
                className="mr-2"
              />
              <label htmlFor="showTx" className="text-sm font-medium">
                Show Transactions
              </label>
            </div>

            {showTx && (
              <ul className="space-y-4 list-disc list-inside">
                {blockData.transactions && blockData.transactions.length > 0 ? (
                  blockData.transactions.map((tx, index) => (
                    <li key={index} className="text-sm">
                      <strong>Transaction Hash:</strong> {tx.hash} <br />
                      <strong>Block Number:</strong> {tx.block_number} <br />
                      <strong>Status:</strong> {tx.execution_status}
                    </li>
                  ))
                ) : (
                  <li>No transactions found for this block.</li>
                )}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
