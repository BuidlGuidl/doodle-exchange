import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { isAddress } from "viem";
import { normalize } from "viem/ens";
import { useAccount, useEnsAvatar, useEnsName } from "wagmi";
import { CheckIcon, PencilIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { createUsername, editUsername } from "~~/utils/doodleExchange/api/apiUtils";

const Username = () => {
  const pathname = usePathname();
  const { address } = useAccount();

  const [userName, setUsername] = useState("");
  const [ensAvatar, setEnsAvatar] = useState<string | null>();
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");

  const isHomePage = pathname === "/";

  const { data: fetchedEns } = useEnsName({
    address: address,
    chainId: 1,
    query: {
      enabled: isAddress(address ?? ""),
    },
  });

  const { data: fetchedEnsAvatar } = useEnsAvatar({
    name: fetchedEns ? normalize(fetchedEns) : undefined,
    chainId: 1,
    query: {
      enabled: Boolean(fetchedEns),
      gcTime: 30_000,
    },
  });

  useEffect(() => {
    setEnsAvatar(fetchedEnsAvatar);
  }, [fetchedEnsAvatar]);

  useEffect(() => {
    const fetchUsername = async () => {
      if (address) {
        const data = await createUsername(address as string);
        if (data.success) {
          setUsername(data.username);
          setNewUsername(data.username);
        } else {
          console.error("Error creating username");
        }
      }
    };

    fetchUsername();
  }, [address]);

  return (
    <div className="flex gap-1 items-center">
      <summary tabIndex={0} className=" bg-secondary rounded-full btn-sm flex items-center pl-0 pr-2 shadow-md gap-0">
        <BlockieAvatar address={address || ""} size={30} ensImage={ensAvatar} />
        {userName == "" && (
          <div className="animate-pulse">
            <div className="rounded-full bg-slate-300 h-5 mx-1 w-24"></div>
          </div>
        )}
        {isEditing ? (
          <div className="flex items-center justify-between border-2 rounded-full ">
            <input
              className="input input-ghost input-sm focus-within:border-transparent focus:outline-none focus:bg-transparent focus:text-gray-500 border font-medium placeholder:text-accent/80 text-gray-500 w-32"
              placeholder="New Username"
              value={newUsername}
              onChange={e => setNewUsername(e.target.value)}
            />
            <button className="btn btn-sm btn-ghost">
              <XMarkIcon
                className="h-4 w-4 cursor-pointer"
                onClick={() => {
                  setNewUsername(userName);
                  setIsEditing(false);
                }}
              />
            </button>
          </div>
        ) : (
          <span className="ml-2 mr-1">{userName}</span>
        )}
      </summary>
      {isHomePage && (
        <button
          className="btn btn-secondary btn-sm tooltip tooltip-bottom"
          data-tip={isEditing ? "Submit" : "Edit"}
          disabled={userName === newUsername && isEditing}
          onClick={async () => {
            if (isEditing) {
              const data = await editUsername(address as string, newUsername);
              if (data.success) {
                setUsername(data.username);
                setNewUsername(data.username);
              } else return;
            }
            setIsEditing(!isEditing);
          }}
        >
          {isEditing ? <CheckIcon className="h-4 w-4" /> : <PencilIcon className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
};

export default Username;
