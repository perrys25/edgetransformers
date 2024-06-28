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
import LoadingMessage from "@/components/chat/loading";

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
  const [model, setModel] = useLocalStorage<BaseAiTextGenerationModels>(
    "model",
    "@hf/google/gemma-7b-it",
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
    <div className="h-lvh py-12">
      <div className="h-full w-screen max-w-screen-lg flex-col rounded-xl bg-gray-100 p-4 shadow-lg">
        <div className="row-auto flex flex-grow flex-col py-1">
          <div className="mb-2 flex flex-row">
            <p className="my-auto text-lg">Model:&nbsp;</p>
            <select
              value={model}
              onChange={(e) => {
                setModel(e.target.value as BaseAiTextGenerationModels);
              }}
              className="rounded-lg bg-gray-200 p-1"
            >
              {[
                "@cf/deepseek-ai/deepseek-math-7b-instruct",
                "@cf/defog/sqlcoder-7b-2",
                "@cf/fblgit/una-cybertron-7b-v2-bf16",
                "@cf/google/gemma-2b-it-lora",
                "@cf/google/gemma-7b-it-lora",
                "@cf/meta-llama/llama-2-7b-chat-hf-lora",
                "@cf/meta/llama-3-8b-instruct",
                "@cf/meta/llama-3-8b-instruct-awq",
                "@cf/microsoft/phi-2",
                "@cf/mistral/mistral-7b-instruct-v0.2-lora",
                "@cf/openchat/openchat-3.5-0106",
                "@cf/qwen/qwen1.5-0.5b-chat",
                "@cf/qwen/qwen1.5-1.8b-chat",
                "@cf/qwen/qwen1.5-14b-chat-awq",
                "@cf/qwen/qwen1.5-7b-chat-awq",
                "@cf/thebloke/discolm-german-7b-v1-awq",
                "@cf/tiiuae/falcon-7b-instruct",
                "@cf/tinyllama/tinyllama-1.1b-chat-v1.0",
                "@hf/google/gemma-7b-it",
                "@hf/mistral/mistral-7b-instruct-v0.2",
                "@hf/nexusflow/starling-lm-7b-beta",
                "@hf/nousresearch/hermes-2-pro-mistral-7b",
                "@hf/thebloke/deepseek-coder-6.7b-base-awq",
                "@hf/thebloke/deepseek-coder-6.7b-instruct-awq",
                "@hf/thebloke/llama-2-13b-chat-awq",
                "@hf/thebloke/llamaguard-7b-awq",
                "@hf/thebloke/mistral-7b-instruct-v0.1-awq",
                "@hf/thebloke/neural-chat-7b-v3-1-awq",
                "@hf/thebloke/openhermes-2.5-mistral-7b-awq",
                "@hf/thebloke/zephyr-7b-beta-awq",
              ].map((model) => (
                <option key={model} value={model}>
                  {model.split("/").pop()}
                </option>
              ))}
            </select>
          </div>
        </div>
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
                className="row-auto flex grow flex-col overflow-scroll"
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
        {waiting && <LoadingMessage />}
        <div className="mt-3 flex h-6 flex-row">
          <button
            onClick={async () => {
              setWaiting(true);
              const response = await chatCompletion(model, messages);
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
    </div>
  );
}
