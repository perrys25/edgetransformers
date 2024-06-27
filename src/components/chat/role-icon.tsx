import { RoleScopedChatInput } from "@cloudflare/workers-types/2023-07-01/index";

export default function RoleIcon({
  role,
  changeRole,
}: {
  role: RoleScopedChatInput["role"];
  changeRole: () => void;
}) {
  switch (role) {
    case "assistant":
      return container("Assistant", "bg-blue-300", changeRole);
    case "user":
      return container("User", "bg-green-300", changeRole);
    case "system":
      return container("System", "bg-yellow-300", changeRole);
    default:
      return container("Unknown", "bg-gray-300", changeRole);
  }
}

const container = (name: string, color: string, changeRole: () => void) => {
  return (
    <div className="my-auto flex w-32">
      <div className="mx-auto">
        <button
          onClick={changeRole}
          className={`${color} my-auto w-max rounded-lg px-2 py-1`}
        >
          {name}
        </button>
      </div>
    </div>
  );
};
