const { axios } = require('../services/imports');

const request = {
    get: async (ctx, hitUrl, requestConfig = {}) => {
        try {
            const configData = { headers: ((requestConfig && requestConfig.headers) || (ctx && ctx.request && ctx.request.headers) || undefined), ...requestConfig };
            const getResp = await axios.get(hitUrl, configData);
            return { data: getResp.data, status: getResp.status };
        } catch (error) {
            return Promise.reject({
                status: ((error.response && error.response.status) || 500),
                error: (error.response && error.response.data) || error
            });
        }
    },
    post: async (ctx, hitUrl, postData, requestConfig) => {
        try {
            const configData = { headers: ((requestConfig && requestConfig.headers) || (ctx && ctx.request && ctx.request.headers) || undefined), ...requestConfig };
            const postResp = await axios.post(hitUrl, postData, configData);
            return { data: postResp.data, status: postResp.status };
        } catch (error) {
            return Promise.reject({
                status: ((error.response && error.response.status) || 500),
                error: (error.response && error.response.data) || error
            });
        }
    },
    put: async (ctx, hitUrl, putData, requestConfig) => {
        try {
            const configData = { headers: ((requestConfig && requestConfig.headers) || (ctx && ctx.request && ctx.request.headers) || undefined), ...requestConfig };
            const putResp = await axios.put(hitUrl, putData, configData);
            return { data: putResp.data, status: putResp.status };
        } catch (error) {
            return Promise.reject({
                status: ((error.response && error.response.status) || 500),
                error: (error.response && error.response.data) || error
            });
        }
    },
    patch: async (ctx, hitUrl, patchData, requestConfig) => {
        try {
            const configData = { headers: ((requestConfig && requestConfig.headers) || (ctx && ctx.request && ctx.request.headers) || undefined), ...requestConfig };
            const patchResp = await axios.patch(hitUrl, patchData, configData);
            return { data: patchResp.data, status: patchResp.status };
        } catch (error) {
            return Promise.reject({
                status: ((error.response && error.response.status) || 500),
                error: (error.response && error.response.data) || error
            });
        }
    },
    delete: async (ctx, hitUrl, requestConfig) => {
        try {
            const configData = { headers: ((requestConfig && requestConfig.headers) || (ctx && ctx.request && ctx.request.headers) || undefined), ...requestConfig };
            const deleteResp = await axios.delete(hitUrl, configData);
            return { data: deleteResp.data, status: deleteResp.status };
        } catch (error) {
            return Promise.reject({
                status: ((error.response && error.response.status) || 500),
                error: (error.response && error.response.data) || error
            });
        }
    },
};

module.exports = request;