import RoleIcon from "@/components/chat/role-icon";
import React from "react";

export default function LoadingMessage() {
  return (
    <div
      className={`break-wordbreak mb-2 flex w-full max-w-full flex-row text-wrap rounded-lg bg-gray-200`}
    >
      <RoleIcon role={"assistant"} changeRole={() => {}} />
      <div className="mx-auto flex w-full flex-row px-2 py-[1.625rem] pl-4">
        <TypingIndicator />
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
