"use client"; // Needed for client-side rendering in Next.js

import React from "react";
import { sepolia, mainnet } from "@starknet-react/chains";
import {
  StarknetConfig,
  nethermindProvider,
  argent,
  braavos,
  useInjectedConnectors,
  voyager
} from "@starknet-react/core";

export function StarknetProvider({ children }: { children: React.ReactNode }) {
  const { connectors } = useInjectedConnectors({
    recommended: [
      argent(),
      braavos(),
    ],
    includeRecommended: "onlyIfNoConnectors",
    order: "random"
  });

  // Access the API key from the environment variable
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;

  // Ensure the API key is defined
  if (!apiKey) {
    throw new Error("API key is undefined. Make sure to set NEXT_PUBLIC_API_KEY in .env.local");
  }

  return (
    <StarknetConfig
      chains={[mainnet, sepolia]}   // Define the chains to support
      provider={nethermindProvider({ apiKey })} // Pass the API key as an object
      connectors={connectors}        // Wallet connectors for Starknet
      explorer={voyager}             // Explorer configuration (Voyager)
    >
      {children}
    </StarknetConfig>
  );
}
