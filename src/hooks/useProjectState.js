import { useState, useCallback, useRef } from "react";

const STORAGE_KEY = "r64_fleet_projects";

function loadProjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveProjects(projects) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(projects)); } catch {}
}

export function useProjectState() {
  const [projectName, setProjectName] = useState("Untitled Project");
  const [isDirty, setIsDirty] = useState(false);
  const [recentProjects, setRecentProjects] = useState(() => {
    const p = loadProjects();
    return Object.keys(p).slice(0, 8);
  });
  const fileInputRef = useRef(null);

  const markDirty = useCallback(() => setIsDirty(true), []);

  const newProject = useCallback(() => {
    if (isDirty && !window.confirm("Unsaved changes will be lost. Continue?")) return false;
    setProjectName("Untitled Project");
    setIsDirty(false);
    return true;
  }, [isDirty]);

  const saveProject = useCallback((name) => {
    const n = name || projectName;
    const projects = loadProjects();
    projects[n] = { savedAt: new Date().toISOString(), name: n };
    saveProjects(projects);
    setProjectName(n);
    setIsDirty(false);
    setRecentProjects(Object.keys(projects).slice(0, 8));
    return true;
  }, [projectName]);

  const openProject = useCallback((name) => {
    if (isDirty && !window.confirm("Unsaved changes will be lost. Continue?")) return false;
    const projects = loadProjects();
    if (projects[name]) {
      setProjectName(name);
      setIsDirty(false);
      return true;
    }
    return false;
  }, [isDirty]);

  const saveAs = useCallback(() => {
    const name = window.prompt("Save project as:", projectName);
    if (name && name.trim()) return saveProject(name.trim());
    return false;
  }, [projectName, saveProject]);

  const exportDashboard = useCallback(() => {
    const data = {
      project: projectName,
      exportedAt: new Date().toISOString(),
      version: "5.1",
      format: "r64-fleet-export",
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, "_")}_export.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [projectName]);

  const printDashboard = useCallback(() => {
    window.print();
  }, []);

  return {
    projectName, setProjectName, isDirty, markDirty,
    newProject, saveProject, saveAs, openProject,
    exportDashboard, printDashboard,
    recentProjects, fileInputRef,
  };
}
