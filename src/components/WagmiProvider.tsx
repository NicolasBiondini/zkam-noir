import { createAppKit } from "@reown/appkit/react";
import { PropsWithChildren } from "react";

import { WagmiProvider } from "wagmi";
import { mainnet, type AppKitNetwork } from "@reown/appkit/networks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

// 0. Setup queryClient
const queryClient = new QueryClient();

// 1. Get projectId from https://cloud.reown.com
const projectId = "YOUR_PROJECT_ID";

// 2. Create a metadata object - optional
const metadata = {
  name: "ZKAM",
  description: "ZKam project for photo verification",
  url: "https://example.com", // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

// 3. Set the networks
const networks = [mainnet as AppKitNetwork] as [
  AppKitNetwork,
  ...AppKitNetwork[]
];

// 4. Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
});

// 5. Create modal
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,

  features: {
    analytics: true, // Optional - defaults to your Cloud configuration,
    email: true, // default to true
    socials: ["google", "x"],
    emailShowWallets: true, // default to true
  },
  allWallets: "SHOW", // default to SHOW
});

export function AppKitProvider({ children }: PropsWithChildren) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
