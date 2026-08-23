import axios from "axios";

const API = axios.create({
    baseURL: "https://agroguard-ai-ak4o.onrender.com",
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

export const getFarmerFarms = (farmerId) => {
    return API.get(`/farms/farmer/${farmerId}`);
};

export const createFarm = (farm) => {
    return API.post("/farms/", farm);
};

export const downloadMissionReport = (missionId, farmerId) => {
    return API.get(`/missions/${missionId}/report`, {
        params: { farmer_id: farmerId },
        responseType: "blob"
    });
};
