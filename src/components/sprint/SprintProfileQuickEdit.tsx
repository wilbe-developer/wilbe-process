
import React, { useState } from "react";
import { useSprintProfileQuickEdit } from "@/hooks/useSprintProfileQuickEdit";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface SprintProfileQuickEditProps {
  profileKey: string;
  label?: string;
  type?: "string" | "boolean" | "select" | "multi-select";
  options?: { value: string; label: string }[];
  description?: string;
  children?: React.ReactNode;
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
  const [editValue, setEditValue] = useState<string | string[]>("");

  React.useEffect(() => {
    if (open && sprintProfile && profileKey in sprintProfile) {
      const v = sprintProfile[profileKey];
      if (v !== null && v !== undefined) {
        if (Array.isArray(v)) {
          setEditValue(v);
        } else {
          setEditValue(v.toString());
        }
      } else {
        setEditValue(type === "multi-select" ? [] : "");
      }
    }
  }, [open, sprintProfile, profileKey, type]);

  if (isLoading) return <div className="text-gray-400 text-sm">loading...</div>;
  if (!sprintProfile) return <div className="text-gray-400 text-sm">No data found.</div>;

  const value = sprintProfile[profileKey];

  const showValue = () => {
    if (type === "boolean") return value ? "Yes" : "No";
    if (type === "multi-select" && Array.isArray(value)) {
      return value.join(", ");
    }
    if (type === "select" && options) {
      const option = options.find(opt => opt.value === value);
      return option ? option.label : value;
    }
    return value && value !== "" ? value : <span className="text-gray-400 italic">No answer</span>;
  };

  const handleMultiSelectToggle = (value: string) => {
    setEditValue(prev => {
      const values = Array.isArray(prev) ? prev : [];
      if (values.includes(value)) {
        return values.filter(v => v !== value);
      } else {
        return [...values, value];
      }
    });
  };

  const onEdit = async () => {
    await updateSprintProfile.mutateAsync({ 
      [profileKey]: type === "boolean" ? editValue === "true" : editValue 
    });
    setOpen(false);
  };

  return (
    <div className="inline-flex items-center gap-2">
      <span>{showValue()}</span>
      <Button
        variant="secondary"
        size="sm"
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
            {type === "select" && options ? (
              <RadioGroup
                value={editValue as string}
                onValueChange={setEditValue}
                className="space-y-2"
              >
                {options.map(opt => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt.value} id={`${profileKey}-${opt.value}`} />
                    <Label htmlFor={`${profileKey}-${opt.value}`} className="cursor-pointer">
                      {opt.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : type === "multi-select" && options ? (
              <div className="space-y-2">
                {options.map(opt => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`${profileKey}-${opt.value}`}
                      checked={Array.isArray(editValue) && editValue.includes(opt.value)}
                      onCheckedChange={() => handleMultiSelectToggle(opt.value)}
                    />
                    <Label htmlFor={`${profileKey}-${opt.value}`} className="cursor-pointer">
                      {opt.label}
                    </Label>
                  </div>
                ))}
              </div>
            ) : type === "boolean" ? (
              <RadioGroup
                value={editValue as string}
                onValueChange={setEditValue}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id={`${profileKey}-true`} />
                  <Label htmlFor={`${profileKey}-true`} className="cursor-pointer">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id={`${profileKey}-false`} />
                  <Label htmlFor={`${profileKey}-false`} className="cursor-pointer">
                    No
                  </Label>
                </div>
              </RadioGroup>
            ) : (
              <input
                type="text"
                value={editValue as string}
                onChange={e => setEditValue(e.target.value)}
                className="border rounded px-3 py-2"
              />
            )}
            <div className="flex justify-end">
              <Button type="button" variant="ghost" className="mr-2" onClick={() => setOpen(false)}>
                Cancel
              </Button>
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
