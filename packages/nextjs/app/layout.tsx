import "@rainbow-me/rainbowkit/styles.css";
import PlausibleProvider from "next-plausible";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "doodle.exchange",
  description: "Built with 🏗 Scaffold-ETH 2",
});

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider enableSystem defaultTheme={"light"}>
          <PlausibleProvider domain="doodle.exchange">
            <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
          </PlausibleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
