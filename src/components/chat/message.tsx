import { RoleScopedChatInput } from "@cloudflare/workers-types/2023-07-01/index";
import RoleIcon from "@/components/chat/role-icon";
import React from "react";
import TextEditor from "@/components/chat/text-editor";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleMinus,
  faGripVertical,
} from "@fortawesome/free-solid-svg-icons";
import { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";

export default function Message(
  props: RoleScopedChatInput & {
    changeRole: () => void;
    textChange: (text: string) => void;
    delete: () => void;
    handle: DraggableProvidedDragHandleProps | null;
  },
) {
  return (
    <div
      className={`break-wordbreak mb-2 flex w-full max-w-full flex-row text-wrap rounded-lg bg-gray-200`}
    >
      <RoleIcon role={props.role} changeRole={props.changeRole} />
      <MessageText
        del={props.delete}
        text={props.content}
        setText={props.textChange}
        handle={props.handle}
      />
    </div>
  );
}

const MessageText = ({
  text,
  setText,
  del,
  handle,
}: {
  text: string;
  setText: (text: string) => void;
  del: () => void;
  handle: DraggableProvidedDragHandleProps | null;
}) => {
  return (
    <div className="flex w-full max-w-full flex-row px-2 py-4 pl-0">
      <div className="w-full">
        <TextEditor onChange={setText} initialValue={text} />
      </div>
      <div className="my-auto flex flex-row">
        <button onClick={del}>
          <FontAwesomeIcon
            icon={faCircleMinus}
            className="ml-3 h-6 w-6 text-gray-400"
          />
        </button>
        <div {...handle}>
          <FontAwesomeIcon
            icon={faGripVertical}
            className="mx-2 h-6 w-6 text-gray-400"
          />
        </div>
      </div>
    </div>
  );
};
