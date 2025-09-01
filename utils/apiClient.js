const axios = require('axios');
const config = require('../config');

class ApiClient {
    constructor() {
        this.malClient = axios.create({
            baseURL: 'https://api.myanimelist.net/v2',
            headers: {
                'X-MAL-CLIENT-ID': config.malClientId
            }
        });
        
        this.anilistClient = axios.create({
            baseURL: 'https://graphql.anilist.co',
            headers: {
                'Authorization': `Bearer ${config.anilistToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
    }
    
    // MAL API methods
    async searchManga(query, limit = 5) {
        try {
            const response = await this.malClient.get('/manga', {
                params: {
                    q: query,
                    limit: limit,
                    fields: 'id,title,main_picture,mean,synopsis,media_type,status,num_volumes,num_chapters'
                }
            });
            return response.data;
        } catch (error) {
            console.error('MAL API Error:', error);
            throw error;
        }
    }
    
    async getMangaDetails(mangaId) {
        try {
            const response = await this.malClient.get(`/manga/${mangaId}`, {
                params: {
                    fields: 'id,title,main_picture,alternative_titles,start_date,end_date,synopsis,mean,rank,popularity,num_list_users,num_scoring_users,nsfw,created_at,updated_at,media_type,status,genres,my_list_status,num_volumes,num_chapters,authors{first_name,last_name},pictures,background,related_anime,related_manga,recommendations,serialization'
                }
            });
            return response.data;
        } catch (error) {
            console.error('MAL API Error:', error);
            throw error;
        }
    }
    
    // AniList API methods
    async anilistQuery(query, variables = {}) {
        try {
            const response = await this.anilistClient.post('', {
                query: query,
                variables: variables
            });
            return response.data;
        } catch (error) {
            console.error('AniList API Error:', error);
            throw error;
        }
    }
    
    // Generic API methods
    async get(url, options = {}) {
        try {
            const response = await axios.get(url, options);
            return response.data;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }
    
    async post(url, data, options = {}) {
        try {
            const response = await axios.post(url, data, options);
            return response.data;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }
}

module.exports = new ApiClient();
