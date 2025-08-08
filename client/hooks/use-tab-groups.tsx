import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export interface TabGroup {
  id: string;
  name: string;
  color: string;
  collapsed: boolean;
  createdAt: Date;
  tabIds: string[];
}

interface TabGroupSettings {
  autoGroup: boolean;
  groupByDomain: boolean;
  maxTabsPerGroup: number;
  collapseInactiveGroups: boolean;
}

const defaultSettings: TabGroupSettings = {
  autoGroup: false,
  groupByDomain: true,
  maxTabsPerGroup: 8,
  collapseInactiveGroups: false,
};

const groupColors = [
  { name: "Blue", value: "#3b82f6", class: "bg-blue-500" },
  { name: "Green", value: "#10b981", class: "bg-green-500" },
  { name: "Purple", value: "#8b5cf6", class: "bg-purple-500" },
  { name: "Red", value: "#ef4444", class: "bg-red-500" },
  { name: "Orange", value: "#f97316", class: "bg-orange-500" },
  { name: "Pink", value: "#ec4899", class: "bg-pink-500" },
  { name: "Yellow", value: "#eab308", class: "bg-yellow-500" },
  { name: "Teal", value: "#14b8a6", class: "bg-teal-500" },
  { name: "Indigo", value: "#6366f1", class: "bg-indigo-500" },
  { name: "Gray", value: "#6b7280", class: "bg-gray-500" },
];

export function useTabGroups() {
  const [groups, setGroups] = useState<TabGroup[]>([]);
  const [settings, setSettings] = useState<TabGroupSettings>(defaultSettings);

  // Load from localStorage
  useEffect(() => {
    const savedGroups = localStorage.getItem("kruger-tab-groups");
    const savedSettings = localStorage.getItem("kruger-tab-group-settings");

    if (savedGroups) {
      try {
        const parsed = JSON.parse(savedGroups);
        setGroups(
          parsed.map((g: any) => ({
            ...g,
            createdAt: new Date(g.createdAt),
          })),
        );
      } catch (error) {
        console.error("Failed to load tab groups:", error);
      }
    }

    if (savedSettings) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
      } catch (error) {
        console.error("Failed to load tab group settings:", error);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("kruger-tab-groups", JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem("kruger-tab-group-settings", JSON.stringify(settings));
  }, [settings]);

  const createGroup = useCallback(
    (name: string, tabIds: string[] = [], color?: string) => {
      const availableColors = groupColors.filter(
        (color) => !groups.some((g) => g.color === color.value),
      );

      const selectedColor =
        color || availableColors[0]?.value || groupColors[0].value;

      const newGroup: TabGroup = {
        id: Date.now().toString(),
        name: name || `Group ${groups.length + 1}`,
        color: selectedColor,
        collapsed: false,
        createdAt: new Date(),
        tabIds,
      };

      setGroups((prev) => [...prev, newGroup]);
      toast.success(`Created group: ${newGroup.name}`);
      return newGroup.id;
    },
    [groups],
  );

  const deleteGroup = useCallback(
    (groupId: string) => {
      const group = groups.find((g) => g.id === groupId);
      if (group) {
        setGroups((prev) => prev.filter((g) => g.id !== groupId));
        toast.success(`Deleted group: ${group.name}`);
        return group.tabIds; // Return tab IDs that were in the group
      }
      return [];
    },
    [groups],
  );

  const renameGroup = useCallback((groupId: string, newName: string) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === groupId ? { ...group, name: newName } : group,
      ),
    );
    toast.success("Group renamed");
  }, []);

  const changeGroupColor = useCallback((groupId: string, color: string) => {
    setGroups((prev) =>
      prev.map((group) => (group.id === groupId ? { ...group, color } : group)),
    );
  }, []);

  const toggleGroupCollapse = useCallback((groupId: string) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? { ...group, collapsed: !group.collapsed }
          : group,
      ),
    );
  }, []);

  const addTabToGroup = useCallback((groupId: string, tabId: string) => {
    setGroups((prev) =>
      prev.map(
        (group) =>
          group.id === groupId
            ? {
                ...group,
                tabIds: [...group.tabIds.filter((id) => id !== tabId), tabId],
              }
            : { ...group, tabIds: group.tabIds.filter((id) => id !== tabId) }, // Remove from other groups
      ),
    );
  }, []);

  const removeTabFromGroup = useCallback((groupId: string, tabId: string) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? { ...group, tabIds: group.tabIds.filter((id) => id !== tabId) }
          : group,
      ),
    );
  }, []);

  const moveTabToGroup = useCallback(
    (tabId: string, fromGroupId: string, toGroupId: string) => {
      setGroups((prev) =>
        prev.map((group) => {
          if (group.id === fromGroupId) {
            return {
              ...group,
              tabIds: group.tabIds.filter((id) => id !== tabId),
            };
          }
          if (group.id === toGroupId) {
            return { ...group, tabIds: [...group.tabIds, tabId] };
          }
          return group;
        }),
      );
    },
    [],
  );

  const getTabGroup = useCallback(
    (tabId: string) => {
      return groups.find((group) => group.tabIds.includes(tabId));
    },
    [groups],
  );

  const getGroupTabs = useCallback(
    (groupId: string) => {
      const group = groups.find((g) => g.id === groupId);
      return group ? group.tabIds : [];
    },
    [groups],
  );

  const autoGroupByDomain = useCallback(
    (tabs: Array<{ id: string; url: string; title: string }>) => {
      if (!settings.autoGroup || !settings.groupByDomain) return;

      const domainGroups: {
        [domain: string]: Array<{ id: string; url: string; title: string }>;
      } = {};

      tabs.forEach((tab) => {
        try {
          const url = new URL(tab.url);
          const domain = url.hostname.replace("www.", "");

          if (!domainGroups[domain]) {
            domainGroups[domain] = [];
          }
          domainGroups[domain].push(tab);
        } catch (error) {
          // Invalid URL, skip
        }
      });

      Object.entries(domainGroups).forEach(([domain, domainTabs]) => {
        if (domainTabs.length >= 2) {
          // Only group if 2+ tabs from same domain
          const existingGroup = groups.find((g) =>
            g.name.toLowerCase().includes(domain.toLowerCase()),
          );

          if (!existingGroup) {
            const tabIds = domainTabs.map((tab) => tab.id);
            createGroup(domain, tabIds);
          }
        }
      });
    },
    [settings, groups, createGroup],
  );

  const updateSettings = useCallback(
    <K extends keyof TabGroupSettings>(key: K, value: TabGroupSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));

      const settingNames: Record<keyof TabGroupSettings, string> = {
        autoGroup: "Auto Group",
        groupByDomain: "Group by Domain",
        maxTabsPerGroup: "Max Tabs per Group",
        collapseInactiveGroups: "Collapse Inactive Groups",
      };

      toast.success(
        `${settingNames[key]} ${typeof value === "boolean" ? (value ? "enabled" : "disabled") : "updated"}`,
      );
    },
    [],
  );

  const getAvailableColors = useCallback(() => {
    return groupColors.filter(
      (color) => !groups.some((g) => g.color === color.value),
    );
  }, [groups]);

  const getGroupStats = useCallback(() => {
    const totalTabs = groups.reduce(
      (sum, group) => sum + group.tabIds.length,
      0,
    );
    const collapsedGroups = groups.filter((g) => g.collapsed).length;

    return {
      totalGroups: groups.length,
      totalTabs,
      collapsedGroups,
      averageTabsPerGroup:
        groups.length > 0 ? Math.round(totalTabs / groups.length) : 0,
    };
  }, [groups]);

  return {
    groups,
    settings,
    groupColors,
    createGroup,
    deleteGroup,
    renameGroup,
    changeGroupColor,
    toggleGroupCollapse,
    addTabToGroup,
    removeTabFromGroup,
    moveTabToGroup,
    getTabGroup,
    getGroupTabs,
    autoGroupByDomain,
    updateSettings,
    getAvailableColors,
    getGroupStats,
  };
}
