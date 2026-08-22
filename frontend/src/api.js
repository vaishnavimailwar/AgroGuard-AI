import axios from "axios";

const API = axios.create({
    baseURL: "http://127.0.0.1:8000",
});


// ==========================================================
// MISSIONS
// ==========================================================

export const getMissions = () => {
    return API.get("/missions/");
};


export const createMission = (mission) => {
    return API.post("/missions/", mission);
};


// ==========================================================
// VIDEO UPLOAD
// ==========================================================

export const uploadVideo = (missionId, file) => {
    const formData = new FormData();

    formData.append("mission_id", missionId);
    formData.append("file", file);

    return API.post("/video/", formData);
};


// ==========================================================
// MISSION RESULTS
// ==========================================================

export const getMissionResults = (missionId) => {
    return API.get(`/missions/${missionId}/results`);
};


// ==========================================================
// MISSION REPORT PDF
// ==========================================================

export const downloadMissionReport = (missionId) => {
    return API.get(`/missions/${missionId}/report`, {
        responseType: "blob",
    });
};