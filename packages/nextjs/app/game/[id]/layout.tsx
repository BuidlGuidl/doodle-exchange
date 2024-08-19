"use client";

import * as Ably from "ably";
import { AblyProvider, ChannelProvider } from "ably/react";
import doodleConfig from "~~/doodle.config";

export default function Layout({ children }: { children: React.ReactNode }) {
  const client = new Ably.Realtime({ key: process.env.NEXT_PUBLIC_ABLY_API_KEY || doodleConfig.ably_api_key });

  return (
    <>
      <AblyProvider client={client}>
        <ChannelProvider channelName="gameUpdate">
          <ChannelProvider channelName="playerUpdate">
            <ChannelProvider channelName="updateRound">
              <main>{children}</main>
            </ChannelProvider>
          </ChannelProvider>
        </ChannelProvider>
      </AblyProvider>
    </>
  );
}