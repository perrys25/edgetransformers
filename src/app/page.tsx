"use client";

import Center from "@/components/center";
import { chatCompletion } from "@/actions/chat/chat-completion";

export const runtime = "edge";

export default function Home() {
  return (
    <Center>
      <div>
        <h1>Chat</h1>
        <p>Chat with an AI.</p>
        <button
          onClick={async () => {
            const response = await chatCompletion(undefined, [
              { role: "user", content: "Hello, world!" },
            ]);
            console.log(response);
          }}
        >
          Chat
        </button>
      </div>
    </Center>
  );
}
