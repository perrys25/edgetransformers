import { RoleScopedChatInput } from "@cloudflare/workers-types/2023-07-01/index";
import RoleIcon from "@/components/chat/role-icon";
import React from "react";

export default function Message(
  props: RoleScopedChatInput & { changeRole: () => void },
) {
  return (
    <>
      <RoleIcon role={props.role} changeRole={props.changeRole} />
      <MessageText text={props.content} />
    </>
  );
}

const MessageText = ({ text }: { text: string }) => {
  return <span className="rounded-r-lg bg-gray-200 p-2 pl-0">{text}</span>;
};
