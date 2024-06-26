"use client";

import Center from "@/components/center";
import ChatContainer from "@/components/chat-container";

export const runtime = "edge";

export default function Home() {
  return (
    <Center>
      <div>
        <ChatContainer />
      </div>
    </Center>
  );
}
