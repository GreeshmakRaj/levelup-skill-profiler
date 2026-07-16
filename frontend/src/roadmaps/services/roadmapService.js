// API service layer for roadmap functionality
// Calls the learning-recommendation backend (apex-team-2)

import { supabase } from "../../skill-profiler-agent/services/supabase";

const BASE_URL = import.meta.env.VITE_LEARNING_API_URL || "http://localhost:8001";

async function getToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token;
}

function errorMessage(data, fallback) {
  return data?.message || data?.detail?.message || data?.detail || fallback;
}

async function handleSessionExpired() {
  try {
    await supabase.auth.signOut();
  } catch {
    /* ignore */
  }
  if (window.location.pathname !== "/auth") {
    window.location.assign("/auth");
  }
}

async function request(path, { method = "GET", body } = {}) {
  const token = await getToken();
  if (!token) {
    await handleSessionExpired();
    throw new Error("Your session has expired. Please sign in again.");
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    await handleSessionExpired();
    throw new Error("Your session has expired. Please sign in again.");
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(errorMessage(data, "Request failed"));
  return data;
}

/**
 * Generate a roadmap for a given skill
 * @param {string} skillId - The skill ID to generate roadmap for
 * @param {number} [availableWeeks] - Optional cap on roadmap length (1-12 weeks)
 * @returns {Promise<Object>} - The generated roadmap
 */
export async function generateRoadmap(skillId, availableWeeks) {
  const queryParams = availableWeeks ? `?available_weeks=${availableWeeks}` : "";
  return request(`/api/v1/skills/${skillId}/roadmap${queryParams}`, { method: "POST" });
}

/**
 * Get a specific roadmap by skill ID for a user
 * @param {string} employeeId - The employee/user ID
 * @param {string} skillId - The skill ID
 * @returns {Promise<Object>} - The roadmap data
 */
export async function getRoadmap(employeeId, skillId) {
  const roadmaps = await getEmployeeRoadmaps(employeeId, skillId);
  if (roadmaps.length === 0) {
    throw new Error("Roadmap not found");
  }
  return roadmaps[0];
}

/**
 * Get all roadmaps for an employee
 * @param {string} employeeId - The employee/user ID
 * @param {string} skillId - Optional filter by skill ID
 * @returns {Promise<Array>} - Array of roadmaps
 */
export async function getEmployeeRoadmaps(employeeId, skillId = null) {
  const queryParams = skillId ? `?skill_id=${skillId}` : "";
  return request(`/api/v1/employees/${employeeId}/roadmaps${queryParams}`);
}

/**
 * Get a roadmap by roadmap ID
 * @param {string} roadmapId - The roadmap ID
 * @returns {Promise<Object>} - The roadmap data
 */
export async function getRoadmapById(roadmapId) {
  // This endpoint may not exist in the current backend
  throw new Error("Endpoint not implemented in backend yet");
}
