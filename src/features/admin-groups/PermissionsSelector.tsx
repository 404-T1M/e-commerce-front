import { memo, useCallback, useMemo } from 'react';
import { cn } from '@/utils';
import type { Permission } from '@/types';

// ─── Single checkbox item – memoized so only changed items re-render ──────────
const PermissionItem = memo(function PermissionItem({
    perm,
    checked,
    onToggle,
}: {
    perm: string;
    checked: boolean;
    onToggle: (perm: string) => void;
}) {
    return (
        <label className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer">
            <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(perm)}
                className="accent-brand-600 w-3.5 h-3.5"
            />
            <span className="text-xs text-slate-600">{perm}</span>
        </label>
    );
});

// ─── Group header – memoized to avoid re-rendering on unrelated group changes ─
const PermissionGroup = memo(function PermissionGroup({
    group,
    perms,
    selectedSet,
    onToggle,
    onToggleGroup,
}: {
    group: string;
    perms: Permission[];
    selectedSet: Set<string>;
    onToggle: (perm: string) => void;
    onToggleGroup: (perms: Permission[]) => void;
}) {
    const allChecked = perms.every((p) => selectedSet.has(p));
    const someChecked = !allChecked && perms.some((p) => selectedSet.has(p));

    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
                type="button"
                onClick={() => onToggleGroup(perms)}
                className="w-full flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
            >
                <div
                    className={cn(
                        'w-4 h-4 rounded border-2 flex items-center justify-center transition-colors',
                        allChecked
                            ? 'bg-brand-600 border-brand-600'
                            : someChecked
                              ? 'bg-brand-200 border-brand-400'
                              : 'border-slate-300',
                    )}
                >
                    {(allChecked || someChecked) && <div className="w-2 h-2 bg-white rounded-sm" />}
                </div>
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">{group}</span>
            </button>

            <div className="p-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {perms.map((perm) => (
                    <PermissionItem
                        key={perm}
                        perm={perm}
                        checked={selectedSet.has(perm)}
                        onToggle={onToggle}
                    />
                ))}
            </div>
        </div>
    );
});

// ─── Main component ───────────────────────────────────────────────────────────
export function PermissionsSelector({
    availablePermissions,
    value,
    onChange,
}: {
    availablePermissions: Permission[];
    value: string[];
    onChange: (v: string[]) => void;
}) {
    // O(1) lookups instead of O(n) array.includes on every render
    const selectedSet = useMemo(() => new Set(value), [value]);

    const toggle = useCallback(
        (perm: string) => {
            if (selectedSet.has(perm)) {
                onChange(value.filter((p) => p !== perm));
            } else {
                onChange([...value, perm]);
            }
        },
        [selectedSet, value, onChange],
    );

    const toggleGroup = useCallback(
        (perms: Permission[]) => {
            const allSelected = perms.every((p) => selectedSet.has(p));
            if (allSelected) {
                const remove = new Set(perms);
                onChange(value.filter((p) => !remove.has(p)));
            } else {
                const next = new Set(value);
                perms.forEach((p) => next.add(p));
                onChange([...next]);
            }
        },
        [selectedSet, value, onChange],
    );

    // Group permissions dynamically based on the prefix (e.g., 'customers.list' -> 'Customers')
    const groupedPermissions = useMemo(() => {
        const groups: Record<string, Permission[]> = {};
        availablePermissions.forEach((perm) => {
            const parts = perm.split('.');
            // e.g. "adminGroups" -> "Admin Groups", "deliveryMen" -> "Delivery Men", "customers" -> "Customers"
            const rawPrefix = parts[0];
            const groupName = rawPrefix
                // add space before capital letters
                .replace(/([A-Z])/g, ' $1')
                // capitalize first letter
                .replace(/^./, (str: string) => str.toUpperCase())
                .trim();

            if (!groups[groupName]) {
                groups[groupName] = [];
            }
            groups[groupName].push(perm);
        });
        return Object.entries(groups);
    }, [availablePermissions]);

    if (availablePermissions.length === 0) {
        return <div className="text-sm text-slate-500 py-4">No permissions available.</div>;
    }

    return (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {groupedPermissions.map(([group, perms]) => (
                <PermissionGroup
                    key={group}
                    group={group}
                    perms={perms}
                    selectedSet={selectedSet}
                    onToggle={toggle}
                    onToggleGroup={toggleGroup}
                />
            ))}
        </div>
    );
}
