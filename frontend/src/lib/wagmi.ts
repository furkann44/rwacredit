import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia, hardhat } from 'wagmi/chains';
import { http } from 'viem';

const ALCHEMY_RPC = process.env.NEXT_PUBLIC_ALCHEMY_RPC || 'https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY';

export const config = getDefaultConfig({
  appName: 'RWACredit',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_WALLETCONNECT_PROJECT_ID',
  chains: [sepolia, hardhat],
  transports: {
    [sepolia.id]: http(ALCHEMY_RPC),
    [hardhat.id]: http(),
  },
  ssr: true,
});
