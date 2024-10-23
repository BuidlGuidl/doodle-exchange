import React from "react";
import Image from "next/image";
import { loogieBlo } from "loogie-blo";

type UserCardProps = {
  address: string;
  username: string;
  className?: string;
  status?: string;
  round?: number;
};

const UserCard = ({ address, username, className = "", status, round }: UserCardProps) => {
  return (
    <div className={`${className}`}>
      <div className="flex flex-col ">
        <span className="flex items-center gap-0.5">
          <Image
            alt={address + " loogie"}
            src={loogieBlo(address as `0x${string}`)}
            width={25}
            height={25}
            className="rounded-full "
          />
          {username}
        </span>
        <span className="text-[0.7rem] ml-auto -mt-2 font-semibold">{status}</span>
      </div>
      {round != undefined && (
        <div>
          <div className="border-l-2 border-black h-full ml-1 pl-1 ">R{round + 1}</div>
        </div>
      )}
    </div>
  );
};

export default UserCard;
