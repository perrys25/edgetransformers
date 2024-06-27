import { RoleScopedChatInput } from "@cloudflare/workers-types/2023-07-01/index";
import RoleIcon from "@/components/chat/role-icon";
import React from "react";
import TextEditor from "@/components/chat/text-editor";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleMinus } from "@fortawesome/free-solid-svg-icons";

export default function Message(
  props: RoleScopedChatInput & {
    changeRole: () => void;
    textChange: (text: string) => void;
    delete: () => void;
  },
) {
  return (
    <>
      <RoleIcon role={props.role} changeRole={props.changeRole} />
      <MessageText
        del={props.delete}
        text={props.content}
        setText={props.textChange}
      />
    </>
  );
}

const MessageText = ({
  text,
  setText,
  del,
}: {
  text: string;
  setText: (text: string) => void;
  del: () => void;
}) => {
  return (
    <div className="flex w-full flex-row rounded-r-lg bg-gray-200 px-2 py-4 pl-0">
      <div className="grow">
        <TextEditor onChange={setText} initialValue={text} />
      </div>
      <div>
        <button onClick={del}>
          <FontAwesomeIcon
            icon={faCircleMinus}
            className="mx-3 h-6 w-6 text-gray-400"
          />
        </button>
      </div>
    </div>
  );
};
