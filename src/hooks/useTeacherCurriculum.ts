import { useCallback, useEffect, useState } from 'react';

// Teacher can edit level names and add custom content/levels.
// Custom data is stored per set in localStorage and merged with defaults.
// This only affects the teacher dashboard view — students see the built-in curriculum.

const CUSTOM_KEY = 'madrasa-teacher-custom-curriculum';

export interface CustomLevelContent {
  title: string;
  content: string; // free-form text the teacher adds (Arabic words, notes, questions, etc.)
}

export interface CustomSetData {
  // keyed by level number (string because JSON keys are strings)
  editedLevels: Record<string, CustomLevelContent>;
  addedLevels: CustomLevelContent[];
}

type CustomCurriculum = Record<string, CustomSetData>; // keyed by setId

const EMPTY: CustomCurriculum = {};

function load(): CustomCurriculum {
  try {
    const raw = localStorage.getItem(CUSTOM_KEY);
    if (!raw) return EMPTY;
    return JSON.parse(raw) as CustomCurriculum;
  } catch {
    return EMPTY;
  }
}

function save(data: CustomCurriculum) {
  try {
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function useTeacherCurriculum() {
  const [custom, setCustom] = useState<CustomCurriculum>(() => load());

  useEffect(() => {
    save(custom);
  }, [custom]);

  const getSetData = useCallback((setId: string): CustomSetData => {
    return custom[setId] || { editedLevels: {}, addedLevels: [] };
  }, [custom]);

  const editLevelTitle = useCallback((setId: string, level: number, title: string) => {
    setCustom((prev) => {
      const next = { ...prev };
      const sd = { ...(next[setId] || { editedLevels: {}, addedLevels: [] }) };
      const existing = sd.editedLevels[String(level)] || { title: '', content: '' };
      sd.editedLevels = { ...sd.editedLevels, [String(level)]: { ...existing, title } };
      next[setId] = sd;
      return next;
    });
  }, []);

  const editLevelContent = useCallback((setId: string, level: number, content: string) => {
    setCustom((prev) => {
      const next = { ...prev };
      const sd = { ...(next[setId] || { editedLevels: {}, addedLevels: [] }) };
      const existing = sd.editedLevels[String(level)] || { title: '', content: '' };
      sd.editedLevels = { ...sd.editedLevels, [String(level)]: { ...existing, content } };
      next[setId] = sd;
      return next;
    });
  }, []);

  const addLevel = useCallback((setId: string, title: string, content: string) => {
    setCustom((prev) => {
      const next = { ...prev };
      const sd = { ...(next[setId] || { editedLevels: {}, addedLevels: [] }) };
      sd.addedLevels = [...sd.addedLevels, { title, content }];
      next[setId] = sd;
      return next;
    });
  }, []);

  const deleteAddedLevel = useCallback((setId: string, index: number) => {
    setCustom((prev) => {
      const next = { ...prev };
      const sd = { ...(next[setId] || { editedLevels: {}, addedLevels: [] }) };
      sd.addedLevels = sd.addedLevels.filter((_, i) => i !== index);
      next[setId] = sd;
      return next;
    });
  }, []);

  const resetCustom = useCallback(() => {
    setCustom(EMPTY);
  }, []);

  return {
    custom,
    getSetData,
    editLevelTitle,
    editLevelContent,
    addLevel,
    deleteAddedLevel,
    resetCustom,
  };
}
