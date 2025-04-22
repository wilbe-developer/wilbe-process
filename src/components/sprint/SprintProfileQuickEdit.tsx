import React, { useState } from "react";
import { useSprintProfileQuickEdit } from "@/hooks/useSprintProfileQuickEdit";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Pencil } from "lucide-react";

interface SprintProfileQuickEditProps {
  profileKey: string;
  label?: string;
  type?: "string" | "boolean";
  options?: { value: string; label: string }[];
  description?: string;
  children?: React.ReactNode; // exposed for future expansion
}

/**
 * profileKey: the sprint_profiles column name
 * options: for select fields, otherwise a simple input
 */
export const SprintProfileQuickEdit: React.FC<SprintProfileQuickEditProps> = ({
  profileKey,
  label,
  type = "string",
  options,
  description
}) => {
  const { sprintProfile, isLoading, updateSprintProfile } = useSprintProfileQuickEdit();
  const [open, setOpen] = useState(false);
  const [editValue, setEditValue] = useState<string>("");

  React.useEffect(() => {
    if (open && sprintProfile && profileKey in sprintProfile) {
      const v = sprintProfile[profileKey];
      setEditValue(v !== null && v !== undefined ? v.toString() : "");
    }
  }, [open, sprintProfile, profileKey]);

  if (isLoading) return <div className="text-gray-400 text-sm">loading...</div>;
  if (!sprintProfile) return <div className="text-gray-400 text-sm">No data found.</div>;

  const value = sprintProfile[profileKey];

  const showValue = () => {
    if (type === "boolean") return value ? "Yes" : "No";
    return value && value !== "" ? value : <span className="text-gray-400 italic">No answer</span>;
  };

  const onEdit = async () => {
    await updateSprintProfile.mutateAsync({ [profileKey]: type === "boolean" ? editValue === "true" : editValue });
    setOpen(false);
  };

  return (
    <div className="inline-flex items-center gap-2">
      <span>{showValue()}</span>
      <Button
        variant="secondary"
        size="xs"
        className="ml-1 h-6 px-2 py-0.5 text-xs"
        onClick={() => setOpen(true)}
        title={`Change ${label || profileKey}`}
      >
        Change
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>Edit {label || profileKey}</DialogHeader>
          {description && <div className="mb-2 text-sm text-muted-foreground">{description}</div>}
          <form
            className="flex flex-col gap-4 mt-4"
            onSubmit={e => {
              e.preventDefault();
              onEdit();
            }}
          >
            {options ? (
              <select
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="">Select...</option>
                {options.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : (
              <input
                type={type === "boolean" ? "checkbox" : "text"}
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                className="border rounded px-3 py-2"
              />
            )}
            <div className="flex justify-end">
              <Button type="button" variant="ghost" className="mr-2" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={updateSprintProfile.isPending}>
                {updateSprintProfile.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
