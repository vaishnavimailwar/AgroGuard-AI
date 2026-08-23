import axios from "axios";

const API = axios.create({
    baseURL: "http://127.0.0.1:8000",
});

export const getMissions = () => {
    return API.get("/missions/");
};

export const createMission = (mission) => {
    return API.post("/missions/", mission);
};

export const uploadVideo = (missionId, file) => {
    const formData = new FormData();

    formData.append("mission_id", missionId);
    formData.append("file", file);

    return API.post("/video/", formData);
};

export const getMissionResults = (missionId) => {
    return API.get(`/missions/${missionId}/results`);
};

export const getFarmerMissions = (farmerId) => {
    return API.get(`/missions/farmer/${farmerId}`);
};