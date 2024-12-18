export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const api = {
    findAll: `${API_BASE_URL}/user/findAll`,
    insertOne: `${API_BASE_URL}/user/insertOne`,
    updateOne: `${API_BASE_URL}/user/updateOne`, 
    getByField: `${API_BASE_URL}/user`,
    updateById: `${API_BASE_URL}/user`,  
    deleteById: `${API_BASE_URL}/user`
}

