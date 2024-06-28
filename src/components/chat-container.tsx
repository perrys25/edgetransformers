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
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
  ResponderProvided,
} from "@hello-pangea/dnd";

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
  const [
    messages,
    addMessage,
    removeMessage,
    setMessages,
    updateMessage,
    clearMessages,
  ] = useMessageContext([]);
  const [waiting, setWaiting] = React.useState(false);

  useEffect(() => {
    addMessage(...JSON.parse(stored));
  }, []);

  useEffect(() => {
    setStored(JSON.stringify(messages));
  }, [messages]);

  function onDragEnd(result: DropResult, provided: ResponderProvided): void {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    function reorder<K>(list: K[], startIndex: number, endIndex: number) {
      const result = Array.from(list);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);

      return result;
    }

    const items = reorder(
      messages,
      result.source.index,
      result.destination.index,
    );

    setMessages(items);
  }

  return (
    <div className="flex w-screen max-w-screen-lg flex-col rounded-xl bg-gray-100 p-4 shadow-lg">
      <div className="row-auto flex flex-col py-1">
        <DragDropContext
          onDragEnd={onDragEnd}
          onDragStart={(start, provided) => {
            start.mode = "SNAP";
          }}
        >
          <Droppable droppableId="droppable">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="row-auto flex flex-col"
              >
                {messages.map((message, index) => (
                  <Draggable
                    key={message.uuid}
                    draggableId={message.uuid}
                    index={index}
                    isDragDisabled={waiting}
                  >
                    {(provided, snapshot) => (
                      <div ref={provided.innerRef} {...provided.draggableProps}>
                        <Message
                          handle={provided.dragHandleProps}
                          role={message.role}
                          content={message.content}
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
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        {waiting && (
          <div className="mb-2 flex flex-row rounded-lg bg-gray-200">
            <RoleIcon role={"assistant"} changeRole={() => {}} />
            <div className="mx-auto flex w-full flex-row px-2 py-[1.625rem] pl-4">
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
    <div className="typing-dot h-2 w-2 animate-bounce rounded-full bg-gray-400 animation-delay-75"></div>
    <div className="typing-dot h-2 w-2 animate-bounce rounded-full bg-gray-400 animation-delay-150"></div>
  </div>
);
