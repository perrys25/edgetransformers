import { RoleScopedChatInput } from "@cloudflare/workers-types/2023-07-01/index";
import RoleIcon from "@/components/chat/role-icon";
import React from "react";
import TextEditor from "@/components/chat/text-editor";

export default function Message(
  props: RoleScopedChatInput & {
    changeRole: () => void;
    textChange: (text: string) => void;
  },
) {
  return (
    <>
      <RoleIcon role={props.role} changeRole={props.changeRole} />
      <MessageText text={props.content} setText={props.textChange} />
    </>
  );
}

const MessageText = ({
  text,
  setText,
}: {
  text: string;
  setText: (text: string) => void;
}) => {
  return (
    <span className="rounded-r-lg bg-gray-200 p-2 pl-0">
      <TextEditor onChange={setText} initialValue={text} />
    </span>
  );
};
