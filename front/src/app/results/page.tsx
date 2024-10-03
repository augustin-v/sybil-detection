import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Mock data for demonstration
const results = [
  { hash: '0x123...abc', accountId: '0x456...def', type: 'declare', riskScore: 0.2, date: '2023-06-01' },
  { hash: '0x789...ghi', accountId: '0x101...jkl', type: 'deploy', riskScore: 0.7, date: '2023-06-02' },
  { hash: '0xmno...pqr', accountId: '0xstu...vwx', type: 'declare', riskScore: 0.9, date: '2023-06-03' },
]

function RiskIndicator({ score }: { score: number }) {
  if (score < 0.4) return <CheckCircle className="w-6 h-6 text-green-500" />
  if (score < 0.7) return <AlertTriangle className="w-6 h-6 text-yellow-500" />
  return <XCircle className="w-6 h-6 text-red-500" />
}

export default function Results() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Detection Results</h1>
      
      <div className="space-y-4">
        {results.map((result, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Transaction {index + 1}</span>
                <RiskIndicator score={result.riskScore} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Hash</dt>
                  <dd className="mt-1 text-sm text-gray-100">{result.hash}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Account ID</dt>
                  <dd className="mt-1 text-sm text-gray-100">{result.accountId}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Type</dt>
                  <dd className="mt-1 text-sm text-gray-100">{result.type}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Risk Score</dt>
                  <dd className="mt-1 text-sm text-gray-100">{result.riskScore.toFixed(2)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Date</dt>
                  <dd className="mt-1 text-sm text-gray-100">{result.date}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}