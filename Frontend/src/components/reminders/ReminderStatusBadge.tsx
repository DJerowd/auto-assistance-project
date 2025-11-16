import { Badge } from "../ui/Badge";
import { ClockIcon } from "../icons/ClockIcon";
import { CheckCircleIcon } from "../icons/CheckCircleIcon";
import { XCircleIcon } from "../icons/XCircleIcon";
import type { Reminder } from "../../types";

interface Props {
  status: Reminder["status"];
}

const statusMap = {
  PENDING: {
    label: "Pendente",
    variant: "pending" as const,
    icon: <ClockIcon className="h-3 w-3" />,
  },
  COMPLETED: {
    label: "Concluído",
    variant: "completed" as const,
    icon: <CheckCircleIcon className="h-3 w-3" />,
  },
  CANCELLED: {
    label: "Cancelado",
    variant: "cancelled" as const,
    icon: <XCircleIcon className="h-3 w-3" />,
  },
};

const ReminderStatusBadge = ({ status }: Props) => {
  const { label, variant, icon } = statusMap[status];
  return (
    <Badge variant={variant} className="gap-1.5 font-medium">
      {icon}
      {label}
    </Badge>
  );
};

export default ReminderStatusBadge;
