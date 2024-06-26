import { useEffect, useState } from "react";
import { RoleScopedChatInput } from "@cloudflare/workers-types/2023-07-01/index";

export default function useMessageContext(
  baseMessages: RoleScopedChatInput[] = [],
) {
  const [messages, setMessages] = useState<RoleScopedChatInput[]>(baseMessages);

  useEffect(() => {}, [messages]);

  function addMessage(...add: RoleScopedChatInput[]) {
    setMessages([...messages, ...add]);
  }

  return [messages, addMessage] as const;
}
