"use client"; // Needed for client-side rendering in Next.js

import React from "react";
import { sepolia, mainnet } from "@starknet-react/chains";
import {
  StarknetConfig,
  publicProvider,
  argent,
  braavos,
  useInjectedConnectors,
  voyager
} from "@starknet-react/core";

export function StarknetProvider({ children }: { children: React.ReactNode }) {
  const { connectors } = useInjectedConnectors({
    // Show these connectors if the user has no connector installed.
    recommended: [
      argent(),
      braavos(),
    ],
    // Hide recommended connectors if the user has any connector installed.
    includeRecommended: "onlyIfNoConnectors",
    // Randomize the order of the connectors.
    order: "random"
  });

  return (
    <StarknetConfig
      chains={[mainnet, sepolia]}   // Define the chains to support
      provider={publicProvider()}   // Use the public provider
      connectors={connectors}       // Wallet connectors for Starknet
      explorer={voyager}            // Explorer configuration (Voyager)
    >
      {children}
    </StarknetConfig>
  );
}
