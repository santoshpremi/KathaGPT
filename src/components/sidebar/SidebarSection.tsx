import Typography from "@mui/joy/Typography";
import { AnimatePresence } from "framer-motion";

export function SidebarSection({
  id,
  title,
  actions,
  isSidebarOpen,
  children,
}: {
  id?: string;
  title: string;
  actions?: React.ReactNode;
  isSidebarOpen: boolean;
  children: React.ReactNode;
}) {
  return (
    <div id={id}>
      <div className="flex w-full items-center justify-between px-2">
        <AnimatePresence>
          {isSidebarOpen && (
            <Typography level="body-sm" noWrap>
              {title}
            </Typography>
          )}
        </AnimatePresence>
        {actions}
      </div>
      {children}
    </div>
  );
}
