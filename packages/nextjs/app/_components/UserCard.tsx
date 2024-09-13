import React from "react";
import Image from "next/image";
import { loogieBlo } from "loogie-blo";

type UserCardProps = {
  address: string;
  username: string;
  className?: string;
};

const UserCard = ({ address, username, className = "" }: UserCardProps) => {
  return (
    <p className={`${className}`}>
      <Image
        alt={address + " loogie"}
        src={loogieBlo(address as `0x${string}`)}
        width={20}
        height={20}
        className="rounded-full"
      />
      {username}
    </p>
  );
};

export default UserCard;
