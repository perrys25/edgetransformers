import useMessageContext from "@/hooks/useMessageContext";
import Message from "@/components/chat/message";
import {
  faBolt,
  faCirclePlus,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
import React, { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { chatCompletion } from "@/actions/chat/chat-completion";
import RoleIcon from "@/components/chat/role-icon";
import useLocalStorage from "use-local-storage";
import { RoleScopedChatInput } from "@cloudflare/workers-types/2023-07-01/index";

const defaultMessages: RoleScopedChatInput[] = [
  {
    role: "user",
    content: "",
  },
] as const;

const emptyMessages: RoleScopedChatInput[] = [
  {
    role: "system",
    content: "",
  },
];

export default function ChatContainer() {
  const [stored, setStored] = useLocalStorage(
    "messages",
    JSON.stringify(defaultMessages),
  );
  const [messages, addMessage, removeMessage, updateMessage, clearMessages] =
    useMessageContext([]);
  const [waiting, setWaiting] = React.useState(false);

  useEffect(() => {
    addMessage(...JSON.parse(stored));
  }, []);

  useEffect(() => {
    setStored(JSON.stringify(messages));
  }, [messages]);

  return (
    <div className="flex w-screen max-w-screen-lg flex-col rounded-xl bg-gray-100 p-4 shadow-lg">
      <div className="row-auto flex flex-col gap-y-1 py-1">
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
        {waiting && (
          <div className="flex flex-row rounded-lg bg-gray-200">
            <RoleIcon role={"assistant"} changeRole={() => {}} />
            <div className="mx-auto flex w-full flex-row px-2 py-7 pl-4">
              <TypingIndicator />
            </div>
          </div>
        )}
      </div>
      <div className="mt-3 flex h-6 flex-row">
        <button
          onClick={async () => {
            setWaiting(true);
            const response = await chatCompletion(undefined, messages);
            setWaiting(false);
            if (response === null) return;
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
          onClick={() => {
            clearMessages(emptyMessages);
          }}
        >
          <FontAwesomeIcon icon={faCircleXmark} className="h-6 w-6" />
        </button>
        <button
          className="pl-2 text-gray-400"
          onClick={() => {
            addMessage({
              role: "user",
              content: "",
            });
          }}
        >
          <FontAwesomeIcon icon={faCirclePlus} className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}

const TypingIndicator = () => (
  <div className="flex items-center space-x-2">
    <div className="typing-dot h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
    <div className="typing-dot animation-delay-75 h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
    <div className="typing-dot animation-delay-150 h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
  </div>
);
