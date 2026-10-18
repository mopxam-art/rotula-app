import React from "react";
import { UserPlus } from "lucide-react";

export type MemberStatus =
  | "CONTRIBUTED"
  | "WAITING"
  | "PENDING"
  | "PAYOUT_RECEIVED"
  | "LATE";

export interface Member {
  id: string;
  name: string;
  role: string;
  status: MemberStatus;
  avatarUrl?: string;
}

const STATUS_LABELS: Record<MemberStatus, string> = {
  CONTRIBUTED: "Contributed",
  WAITING: "Waiting",
  PENDING: "Pending",
  PAYOUT_RECEIVED: "Payout received",
  LATE: "Late",
};

const UNKNOWN_STATUS_LABEL = "Unknown";

const getStatusLabel = (status: MemberStatus): string =>
  STATUS_LABELS[status] ?? UNKNOWN_STATUS_LABEL;

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  OWNER: "Owner",
  MEMBER: "Member",
};

const getRoleLabel = (role: string): string => ROLE_LABELS[role] ?? role;

interface MembersListProps {
  members: Member[];
  onInvite: () => void;
}

export const MembersList: React.FC<MembersListProps> = ({
  members,
  onInvite,
}) => {
  const getStatusStyle = (status: MemberStatus) => {
    switch (status) {
      case "CONTRIBUTED":
        return "bg-[#a3f4cd] text-[#047857]";
      case "PAYOUT_RECEIVED":
        return "bg-blue-100 text-blue-700";
      case "LATE":
        return "bg-red-100 text-red-700";
      case "WAITING":
        return "bg-gray-100 text-gray-500";
      case "PENDING":
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_12px_40px_rgba(0,0,0,0.08)] mb-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Members</h3>
        <button
          onClick={onInvite}
          aria-label="Invite member"
          className="p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors"
        >
          <UserPlus size={18} aria-hidden="true" />
        </button>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-8 px-4 rounded-xl bg-[#f4f7f5] border border-gray-100">
          <p className="text-sm font-medium text-gray-600">No members yet</p>
          <p className="text-xs text-gray-400 mt-1 mb-4">
            Share an invite link to bring members into this circle.
          </p>
          <button
            type="button"
            onClick={onInvite}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#047857] text-white hover:bg-[#065f46] transition-colors"
          >
            <UserPlus size={14} />
            Invite Member
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden mr-3">
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt=""
                      width={40}
                      height={40}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      className="w-full h-full flex items-center justify-center text-gray-500 font-semibold bg-blue-50"
                    >
                      {member.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {member.name}
                  </p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                    {getRoleLabel(member.role)}
                  </p>
                </div>
              </div>
              <div>
                <span
                  className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${getStatusStyle(member.status)}`}
                >
                  {getStatusLabel(member.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
