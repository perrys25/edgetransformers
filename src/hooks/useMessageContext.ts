import { useEffect, useState } from "react";
import { RoleScopedChatInput } from "@cloudflare/workers-types/2023-07-01/index";

export type IdentifiedRoleMessage = RoleScopedChatInput & { uuid: string };

export default function useMessageContext(
  baseMessages: IdentifiedRoleMessage[] = [],
) {
  const [messages, setMessages] = useState<IdentifiedRoleMessage[]>(
    baseMessages.map(addUUID),
  );

  useEffect(() => {}, [messages]);

  function addUUID(
    message: RoleScopedChatInput | IdentifiedRoleMessage,
  ): IdentifiedRoleMessage {
    if ((message as IdentifiedRoleMessage)?.uuid)
      return message as IdentifiedRoleMessage;
    return { ...message, uuid: crypto.randomUUID() };
  }

  function addMessage(...add: RoleScopedChatInput[]) {
    setMessages([...messages, ...add.map(addUUID)]);
  }

  function removeMessage(uuid: string) {
    setMessages(messages.filter((message) => message.uuid !== uuid));
  }

  function updateMessage(uuid: string, message: Partial<RoleScopedChatInput>) {
    setMessages(
      messages.map((m) => (m.uuid === uuid ? { ...m, ...message } : m)),
    );
  }

  function clearMessages(messages: RoleScopedChatInput[] = []) {
    setMessages(messages.map(addUUID));
  }

  return [
    messages,
    addMessage,
    removeMessage,
    setMessages,
    updateMessage,
    clearMessages,
  ] as const;
}
