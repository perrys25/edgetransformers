import useMessageContext from "@/hooks/useMessageContext";
import Message from "@/components/chat/message";

export default function ChatContainer() {
  const [messages, addMessage, removeMessage, updateMessage] =
    useMessageContext([
      {
        role: "user",
        content:
          "Hello, World! Hello, World! Hello, World! Hello, World! Hello, World!",
      },
      // {
      //   role: "assistant",
      //   content:
      //     "Hello, User! Hello, User! Hello, User! Hello, User! Hello, User!",
      // },
    ]);
  return (
    <div className="w-96 rounded-xl bg-gray-100 p-4 shadow-lg">
      <div className="row-auto grid grid-flow-dense grid-cols-chat gap-y-1">
        {messages.map((message) => (
          <Message
            role={message.role}
            content={message.content}
            key={message.uuid}
            changeRole={() => {
              updateMessage(message.uuid, {
                role: message.role === "user" ? "assistant" : "user",
              });
            }}
            textChange={(text) => {
              updateMessage(message.uuid, { content: text });
            }}
          />
        ))}
      </div>
    </div>
  );
}
