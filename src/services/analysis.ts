import { ATSAnalysis, UserProfile } from '@/types/ats';
import { SAMPLE_ANALYSES, generateDynamicAnalysis } from '@/lib/mockData';

const STORAGE_KEY = 'ats_analyses_history';

function getLocalHistory(): ATSAnalysis[] {
  if (typeof window === 'undefined') return SAMPLE_ANALYSES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading history from localStorage', e);
  }
  return SAMPLE_ANALYSES;
}

function saveLocalHistory(list: ATSAnalysis[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Error saving history to localStorage', e);
  }
}

export async function runATSAnalysis(data: {
  resumeName: string;
  jobTitle: string;
  targetCompany?: string;
  jobDescription: string;
  resumeText?: string;
  file?: File | null;
}): Promise<ATSAnalysis> {
  try {
    const formData = new FormData();
    formData.append('jobTitle', data.jobTitle);
    if (data.targetCompany) formData.append('targetCompany', data.targetCompany);
    formData.append('jobDescription', data.jobDescription);
    formData.append('resumeName', data.resumeName);
    if (data.resumeText) formData.append('resumeText', data.resumeText);
    if (data.file) formData.append('file', data.file);

    const response = await fetch('/api/analysis', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      const current = getLocalHistory();
      saveLocalHistory([result, ...current.filter((c) => c.id !== result.id)]);
      return result;
    }
  } catch (error) {
    console.warn('[Analysis] Server route error, generating local dynamic result:', error);
  }

  const dynamicResult = generateDynamicAnalysis(
    data.resumeName,
    data.jobTitle,
    data.targetCompany,
    data.jobDescription,
    data.resumeText || ''
  );
  const current = getLocalHistory();
  saveLocalHistory([dynamicResult, ...current]);
  return dynamicResult;
}

export async function getAnalysisById(id: string): Promise<ATSAnalysis> {
  try {
    const response = await fetch(`/api/analysis/${id}`);
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // fallback to local
  }
  const history = getLocalHistory();
  const found = history.find((item) => item.id === id);
  return found || SAMPLE_ANALYSES[0];
}

export async function getAnalysisHistory(): Promise<ATSAnalysis[]> {
  try {
    const response = await fetch('/api/analysis/history');
    if (response.ok) {
      const { data } = await response.json();
      if (data && Array.isArray(data) && data.length > 0) {
        saveLocalHistory(data);
        return data;
      }
    }
  } catch {
    // fallback to local
  }
  return getLocalHistory();
}

export async function deleteAnalysis(id: string): Promise<boolean> {
  try {
    await fetch(`/api/analysis/${id}`, {
      method: 'DELETE',
    });
  } catch {
    // fallback
  }
  const history = getLocalHistory();
  saveLocalHistory(history.filter((item) => item.id !== id));
  return true;
}

export async function updateBulletStatus(
  analysisId: string,
  bulletId: string,
  status: 'ACCEPTED' | 'REJECTED'
): Promise<boolean> {
  try {
    await fetch(`/api/analysis/${analysisId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bulletId, status }),
    });
  } catch {
    // fallback
  }
  const history = getLocalHistory();
  const updated = history.map((item) => {
    if (item.id === analysisId) {
      return {
        ...item,
        bulletSuggestions: item.bulletSuggestions.map((b) =>
          b.id === bulletId ? { ...b, status } : b
        ),
      };
    }
    return item;
  });
  saveLocalHistory(updated);
  return true;
}

export async function loginUser(email: string) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (response.ok) {
      const data = await response.json();
      if (typeof window !== 'undefined') {
        localStorage.setItem('ats_user', JSON.stringify(data.user));
      }
      return data;
    }
  } catch {
    // fallback
  }
  const user: UserProfile = {
    id: `usr-${Date.now()}`,
    name: email.split('@')[0],
    email,
    targetRoles: ['Full Stack Developer'],
    totalScans: 2,
    avgScore: 82,
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem('ats_user', JSON.stringify(user));
  }
  return { success: true, user };
}

export async function registerUser(name: string, email: string) {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });
    if (response.ok) {
      const data = await response.json();
      if (typeof window !== 'undefined') {
        localStorage.setItem('ats_user', JSON.stringify(data.user));
      }
      return data;
    }
  } catch {
    // fallback
  }
  const user: UserProfile = {
    id: `usr-${Date.now()}`,
    name,
    email,
    targetRoles: [],
    totalScans: 0,
    avgScore: 0,
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem('ats_user', JSON.stringify(user));
  }
  return { success: true, user };
}

export function logoutUser() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('ats_user');
  }
}

export function getCurrentUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('ats_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
