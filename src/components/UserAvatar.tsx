import { Avatar } from "@mui/material";
import { userStringToColor } from "./UserStringToColor";

const stringAvatar = (name: string) => {
  const words = name.trim().split(/\s+/);

  const initials =
    words.length === 0 || words[0] === ""
      ? "?"
      : words.length === 1
        ? words[0][0]
        : `${words[0][0]}${words[words.length - 1][0]}`;

  return {
    sx: {
      bgcolor: userStringToColor(name),
    },
    children: initials.toUpperCase(),
  };
};

type UserAvatarTypes = {
  name?: string;
};

const UserAvatar = ({ name = "" }: UserAvatarTypes) => {
  return <Avatar {...stringAvatar(name)} />;
};

export default UserAvatar;
