import useMessageContext from "@/hooks/useMessageContext";
import Message from "@/components/chat/message";
import { faBolt, faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { chatCompletion } from "@/actions/chat/chat-completion";

export default function ChatContainer() {
  const [messages, addMessage, removeMessage, updateMessage] =
    useMessageContext([
      {
        role: "user",
        content: "",
      },
    ]);
  return (
    <div className="w-md flex flex-col rounded-xl bg-gray-100 p-4 shadow-lg">
      <div className="row-auto grid grid-flow-dense grid-cols-chat gap-y-1 py-1">
        {messages.map((message) => (
          <Message
            role={message.role}
            content={message.content}
            key={message.uuid}
            delete={() => {
              removeMessage(message.uuid);
            }}
            changeRole={() => {
              updateMessage(message.uuid, {
                role:
                  message.role === "user"
                    ? "assistant"
                    : message.role === "system"
                      ? "user"
                      : "system",
              });
            }}
            textChange={(text) => {
              updateMessage(message.uuid, { content: text });
            }}
          />
        ))}
      </div>
      <div className="mt-3 flex h-6 flex-row">
        <button
          onClick={async () => {
            const response = await chatCompletion(undefined, messages);
            addMessage({
              role: "assistant",
              content: response,
            });
          }}
        >
          <FontAwesomeIcon icon={faBolt} className="h-6 w-6 text-gray-400" />
        </button>
        <button
          className="ml-auto text-gray-400"
          onClick={() =>
            addMessage({
              role: "user",
              content: "",
            })
          }
        >
          <FontAwesomeIcon icon={faCirclePlus} className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
