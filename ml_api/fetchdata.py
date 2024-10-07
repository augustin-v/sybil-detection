# function used to fetch blocks transaction data
import aiohttp
import asyncio
import json
import time
from aiohttp import ClientSession

API_URL = "https://free-rpc.nethermind.io/mainnet-juno/?apikey=SECRET" # need a free nethermind rpc api key or none but limited
# API_URL = "https://free-rpc.nethermind.io/mainnet-juno" # if none

async def fetch_data(session: ClientSession, method: str, params: list):
    payload = {
        "jsonrpc": "2.0",
        "method": method,
        "params": params,
        "id": 0
    }
    headers = {
        'Content-Type': 'application/json'
    }
    
    try:
        async with session.post(API_URL, headers=headers, json=payload, timeout=10) as response:
            if response.status == 200:
                return await response.json()
            else:
                print(f"Error fetching data: {response.status}")
                return None
    except Exception as e:
        print(f"Exception occurred while fetching data: {e}")
        return None

async def fetch_block_with_transactions(session: ClientSession, block_number: int):
    block_data = await fetch_data(session, "starknet_getBlockWithTxs", [{"block_number": block_number}])
    await asyncio.sleep(3)  # Wait 3 seconds after each request
    
    if not block_data or 'result' not in block_data:
        print(f"Failed to fetch block {block_number}")
        return None

    block_info = block_data['result']
    transactions = []

    for tx in block_info['transactions']:
        tx_hash = tx['transaction_hash']
        tx_receipt = await fetch_data(session, "starknet_getTransactionReceipt", [tx_hash])
        await asyncio.sleep(3)  # Wait 3 seconds after each request
        
        if tx_receipt and 'result' in tx_receipt:
            transaction = {
                "hash": tx_hash,
                "block_number": block_number,
                "timestamp": block_info['timestamp'],
                "from_address": tx.get('sender_address', 'Unknown'),
                "to_address": tx.get('contract_address', 'Unknown'),
                "calldata": tx.get('calldata', []),
                "status": tx_receipt['result'].get('status', 'Unknown'),
                "actual_fee": tx_receipt['result'].get('actual_fee', 'Unknown'),
            }
            transactions.append(transaction)
        else:
            print(f"Failed to fetch transaction receipt for {tx_hash}")

    return {
        "block_number": block_info['block_number'],
        "block_hash": block_info['block_hash'],
        "parent_hash": block_info['parent_hash'],
        "timestamp": block_info['timestamp'],
        "transactions": transactions,
        "l1_gas_price": block_info['l1_gas_price'],
        "l1_data_gas_price": block_info['l1_data_gas_price'],
        "starknet_version": block_info['starknet_version'],
    }

async def fetch_latest_blocks(num_blocks=100):
    async with aiohttp.ClientSession() as session:
        latest_block_data = await fetch_data(session, "starknet_blockNumber", [])
        await asyncio.sleep(3)  
        
        if not latest_block_data or 'result' not in latest_block_data:
            print("Failed to fetch latest block number")
            return []

        latest_block_number = latest_block_data['result']
        if isinstance(latest_block_number, str):
            if latest_block_number.startswith('0x'):
                latest_block_number = int(latest_block_number, 16)
            else:
                latest_block_number = int(latest_block_number)
        elif not isinstance(latest_block_number, int):
            print(f"Unexpected type for block number: {type(latest_block_number)}")
            return []

        print(f"Latest block number: {latest_block_number}")
        blocks = []
        errors = 0

        for block_number in range(latest_block_number, max(0, latest_block_number - num_blocks), -1):
            try:
                block_data = await fetch_block_with_transactions(session, block_number)
                if block_data:
                    blocks.append(block_data)
                    print(f"Successfully fetched block {block_number} with {len(block_data['transactions'])} transactions")
                else:
                    print(f"Failed to fetch block {block_number}")
                    errors += 1
            except Exception as e:
                print(f"Exception occurred while fetching block {block_number}: {e}")
                errors += 1
            
            if errors > 5:
                print("Too many errors encountered. Stopping.")
                break

        return blocks

async def main():
    start_time = time.time()
    blocks = await fetch_latest_blocks(100)  
    end_time = time.time()
    
    print(f"Collected data for {len(blocks)} blocks")
    print(f"Time taken: {end_time - start_time:.2f} seconds")

    if blocks:
        with open('starknet_blocks_data.json', 'w') as f:
            json.dump(blocks, f, indent=2)
        print("Block data saved to starknet_blocks_data.json")
    else:
        print("No block data collected.")

if __name__ == "__main__":
    asyncio.run(main())