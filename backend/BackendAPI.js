import settings from "./Settings";


const API_PROTOCOL = "http";//"http";//
const API_HOST =  "192.168.1.12:8000"; //"apiextra.pythonanywhere.com"; //"192.168.43.84:8000";//"192.168.1.57:8000";//
const API_BASE = `${API_PROTOCOL}://${API_HOST}/`;
const API_VERSION = "1";
const BASE_URL = `${API_PROTOCOL}://${API_HOST}/api/v${API_VERSION}/`;

class BackendAPI {
    static API_BASE = API_BASE;

    constructor(component) {
        this._component = component;
    }

    getUserReviews(){
        return this.createGetPrivate(({userID, count, offset}) => `reviews/user/${userID}/?count=${count}&offset=${offset}`);
    }

    static async createUser(phoneNumber, accountType){
        return await postPublic(`${BASE_URL}create_user/`, {
            phone: parseInt(phoneNumber),
            username: phoneNumber,
            account_type: accountType
        })
    }

    static async deleteUser(code){
        return await deletePrivateCleanURL(`${API_BASE}auth/users/me/`, code);
    }

    static async sendSMSCode(phoneNumber){
        return await getPublic(`send_sms_code/${phoneNumber}`);
    }

    static async loginUser(username, password){
        return await postPublic(`${API_BASE}auth/token/login/`, {
            username, password
        })
    }

    static async loginUserWithFacebook(token){
        return await getPublic(`login_with_facebook/${token}`)
    }

    static async deleteUserWithFacebookToken(token){
        return await deletePrivate(`login_with_facebook/${token}`)
    }

    static async updateToken(user_id, push_id, language){
        return await post('update/device/', {
            user_id, push_id, language
        })
    }

    

    getPushTokenUpdateEndpoint(){
        return this.createPostPrivate('update-push-token/')
    }

    getLogEeConnectionEndpoint(){
        return this.createPostPrivate('util/log-eeconnection/')
    }

    getMyTasksEndpoint() {
        return this.createGetPrivate("get_my_task_list/");
    }

    getAssignedTasksEndpoint() {
        return this.createGetPrivate("get_assigned_tasks/");
    }

    getTaskEndpoint() {
        return this.createGetPrivate((id) => `task/${id}`);
    }

    getNotificationSettings() {
        return this.createGetPrivate("notification-settings/");
    }

    updateNotificationSettings() {
        return this.createPostPrivate("notification-settings/", "PUT");
    }

    getNotificationsEndpoint() {
        return this.createGetPrivate("notifications/");
    }

    static async getPossiblePerformers(taskID){
        return await get(`reviews/possible-performers/${taskID}`)
    }

    static async getPersonalQualities(appliedTo){
        return await get(`personal-qualities/${appliedTo}`)
    }

    static async postReview(authorID, rating, text, taskID, recipientID, recipientRole, qualities){
        let review = {
            "rating": rating,
            "text": text,
            "task": taskID,
            "author": authorID,
            "author_role": recipientRole === "Performer"? "Employer": "Performer",
            "recipient": recipientID,
            "recipient_role": recipientRole,
            "recipient_qualities": qualities
        }
        return await post(`review/`, review)
    }

    static async loadReviewsForTask(taskID){
        return await get(`reviews/task/${taskID}/`)
    }

    static async getEmployeeAdList(){
        return await get(`employee-ad/`)
    }

    static async getEmployeeAdListWithPage(page){
        return await get(`employee-ad/?page=${page}`)
    }

    static async getEmployeeAdDetails(adID){
        return await get(`employee-ad/${adID}`)
    }

    static async publishEmployeeAd(text){
        return await post(`employee-ad/`, {text})
    }

    static async updateEmployeeAd(employeeAdID, text){
        return await put(`employee-ad/${employeeAdID}`, {text});
    }

    static async deleteEmployeeAd(employeeAdID){
        return await deletePrivate(`employee-ad/${employeeAdID}`);
    }

    static async postAdComment(employeeAdID, text){
        return await post(`ad-comment/${employeeAdID}`, {text})
    }

    static async getAdComments(employeeAdID){
        return await get(`ad-comment/${employeeAdID}`)
    }

    static async getAdCommentsNotificationSetting(employeeAdID){
        return await get(`ad-comment-notification/${employeeAdID}`)
    }

    static async updateAdCommentsNotificationSetting(employeeAdID, isEnabled){
        return await put(`ad-comment-notification/${employeeAdID}`, {"notification_enabled": isEnabled})
    }

    getDeleteNotificationEndpoint() {
        return this.createDeletePrivate((id) => `notification/${id}`);
    }

    makeReadNotificationEndpoint() {
        return this.createPostPrivate((id) => `read_notification/${id}`, "PUT");
    }

    getReadAllNotificationEndpoint() {
        return this.createPostPrivate(`notifications/`, "PUT");
    }

    getDeleteTaskEndpoint() {
        return this.createDeletePrivate((id) => `delete_task/${id}/`);
    }

    getTaskSeenEndpoint() {
        return this.createGetPrivate((id) => `view_task/${id}`);
    }

    getOfferTaskEndpoint(){
        return this.createGetPrivate((params) => `offer_task/${params.userId}/${params.taskId}`)
    }

    getAppointedTasksEndpoint() {
        return this.createGetPrivate("get_appointed_tasks/");
    }

    getCreateTask() {
        return this.createPostPrivate("create_task/");
    }

    getEditTaskEndpoint() {
        return this.createPostPrivate(({id}) => `edit_task/${id}`, "PUT");
    }

    getSetPerformerEndpoint() {
        return this.createGetPrivate((data) => `set_performer/${data.taskId}/${data.applicantId}/`);
    }

    getMakeApplicantPerformerEndpoint(){
        return this.createGetPrivate((data) => `make_applicant_performer/${data.taskId}/${data.applicantId}/`);
    }

    getApplyAction_TaskOwnerEndpoint(){
        return this.createPostPrivate(`manage_apply/`, "PUT");
    }

    getDeleteApply_TaskOwnerEndpoint(){
        return this.createPostPrivate(`manage_apply/`, "DELETE");
    }

    getRefuseApplicantEndpoint(){
        return this.createGetPrivate((data) => `refuse_applicant/${data.taskId}/${data.applicantId}/`);
    }

    getRemindToConfirmEndpoint(){
        return this.createGetPrivate((applyId) => `remind_confirm/${applyId}/`);
    }

    getRemindAboutApplyEndpoint(){
        return this.createGetPrivate((taskId) => `remind_apply/${taskId}`);
    }

    getCompleteTaskEndpoint(){
        return this.createGetPrivate((taskId) => `complete_task/${taskId}`);
    }

    getFavoriteTaskListEndpoint(){
        return this.createGetPrivate(`get_favorite_tasks/`);
    }

    getAddTaskToFavoriteEndpoint() {
        return this.createPostPrivate( (task_id) => `update_favorite_tasks/${task_id}`, "PUT");
    }

    getRemoveTaskFromFavoriteEndpoint() {
        return this.createDeletePrivate((task_id) => `update_favorite_tasks/${task_id}`);
    }

    getAcceptTaskEndpoint(){
        return this.createGetPrivate(({taskId}) => `accept_task/${taskId}/`);
    }

    getRefuseTaskEndpoint(){
        return this.createGetPrivate(({taskId}) => `refuse_task/${taskId}/`);
    }

    getCancelAssignedPerformerEndpoint(){
        return this.createGetPrivate((data) => `cancel_assigned_performer/${data.taskId}/${data.performerId}/`);
    }

    getRemovePendingApplicantEndpoint(){
        return this.createGetPrivate((data) => `remove_pending_applicant/${data.taskId}/${data.applicantId}/`);
    }

    getCustomerReviewEndpoint(){
        return this.createPostPrivate(({taskId}) => `customer_review/${taskId}/`);
    }

    getPerformerReviewEndpoint(){
        return this.createPostPrivate(({taskId}) => `performer_review/${taskId}/`);
    }

    getRegions() {
        return this.createGetPublic("get_regions/");
    }

    getCategories() {
        return this.createGetPublic("get_categories/");
    }

    getSubcategoriesEndpoint() {
        return this.createGetPublic(({categoryId}) => `get_subcategories/${categoryId}/`);
    }

    getTaskListEndpoint(){
        return this.createGetPrivate(data => {
            const queryString = Object.keys(data)
                .filter(k => data[k])
                .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(data[k])}`)
                .join('&');
            return `get_task_list/?${queryString}`;
        })
    }

    getPerformersEndpoint(){
        return this.createGetPrivate(data => {
            const queryString = Object.keys(data)
                .filter(k => data[k])
                .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(data[k])}`)
                .join('&');
            return `performers/?${queryString}`;
        })
    }

    getTasksCountEndpoint() {
        return this.createGetPublic("get_tasks_count/");
    }

    getNewsEndpoint() {
        return this.createGetPublic("news/");
    }

    getApplyForTaskEndpoint() {
        return this.createGetPrivate(({taskId}) => `add_to_applicants/${taskId}/`);
    }

    getApplyEndpoint() {
        return this.createPostPrivate('apply/')
    }

    getRemoveApplyEndpoint() {
        return this.createPostPrivate('apply/', "DELETE")
    }

    getConfirmDenyApplyEndpoint() {
        return this.createPostPrivate('apply/', "PUT")
    }

    getFavoriteUsersListEndpoint() {
        return this.createGetPrivate(`favorite_users/`);
    }

    getAddFavoriteUserEndpoint() {
        return this.createPostPrivate((userId) => `favorite_users/${userId}/`, "PUT");
        // return this.createGetPrivate();
    }

    getRemoveFavoriteUserEndpoint() {
        return this.createDeletePrivate((userId) => `favorite_users/${userId}/`);
    }

    getRemoveApplyForTaskEndpoint() {
        return this.createGetPrivate(({taskId}) => `remove_from_applicants/${taskId}/`);
    }

    getApplyListEndpoint(){
        return this.createGetPrivate((taskId) => `apply_list/${taskId}/`);
    }

    getCreateDialogEndpoint() {
        return this.createGetPrivate(({userId}) => `create_dialog/${userId}/`);
    }

    getDialogsEndpoint() {
        return this.createGetPrivate("get_dialogs/");
    }

    getCreateDialogMessageEndpoint() {
        return this.createPostPrivate(({dialogId}) => `create_message/${dialogId}/`);
    }

    getDialogMessagesEndpoint() {
        return this.createGetPrivate(({dialogId}) => `dialog/messages/${dialogId}/`);
    }

    getDialogInfoEndpoint() {
        return this.createGetPrivate(({dialogId}) => `dialog/${dialogId}/`);
    }

    getUserEndpoint() {
        return this.createGetPublic(({userId}) => `user/${userId}/`);
    }

    setUserLanguageEndpoint(){
        return this.createGetPrivate((language) => `set_user_language/${language}`);
    }

    getUpdateUserEndpoint() {
        return this.createPostPrivate("update_profile/", "PUT");
    }

    getUpdateScheduleEndpoint(){
        return this.createPostPrivate("update_schedule/", "PUT");
    }

    getSetRatingEndpoint() {
        return this.createPostPrivate(({taskId}) => `set_rating/${taskId}/`);
    }

    getBlockUserEndpoint() {
        return this.createGetPrivate(({userId}) => `block/user/${userId}/`);
    }

    getUnblockUserEndpoint() {
        return this.createGetPrivate(({userId}) => `unblock/user/${userId}/`);
    }

    getBlockCheckEndpoint() {
        return this.createGetPrivate(({userId}) => `block/check/${userId}/`);
    }

    getUsersCountEndpoint() {
        return this.createGetPrivate("user/count/performers/");
    }

    getAdsEndpoint() {
        return this.createGetPublic('get_ads/');
    }

    _handleError(e) {
        console.error("Error making request:");
        console.log(e);
        // TODO: send error message to server
        // Alert.alert(
        //     strings["error01"],
        //     strings["error02"],
        //     [{text: 'OK'}],
        //     {cancelable: true}
        // );
    }

    createGetPublic(url, baseUrl = BASE_URL) {
        return async (data, opts = {before: true, after: true}) => {
            if (opts.before){
                //if(this._component){this._component.setState({isLoading: true});}
            }
                

            try {
                const endpointUrl = (typeof url === "function")
                    ? baseUrl + url(data)
                    : baseUrl + url;

                const resp = await fetch(endpointUrl, {
                    method: "GET",
                    headers: {
                        "Accept": "application/json"
                    }
                });
                const result = await resp.json();

                

                return result;
            } catch (e) {
                console.log(endpointUrl)
                this._handleError(e);
            } finally {
                if (opts.after){
                    //if(this._component){this._component.setState({isLoading: false});}
                }
            }
        };
    }

    createPostPublic(url, baseUrl = BASE_URL) {
        return async (data) => {
            //this._component.setState({isLoading: true});

            try {
                const endpointUrl = baseUrl + url;

                

                const resp = await fetch(endpointUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await resp.json();

                

                return result;
            } catch (e) {
                console.log(endpointUrl)
                this._handleError(e);
            } finally {
                //this._component.setState({isLoading: false});
            }
        };
    }

    createGetPrivate(url) {
        return async (data, opts = {before: true, after: true}) => {
            if (opts.before){
                //if(this._component){this._component.setState({isLoading: true});}
            }

            try {
                const endpointUrl = (typeof url === "function")
                    ? BASE_URL + url(data)
                    : BASE_URL + url;
                const apiKey = await this.getApiKey();
                

                const resp = await fetch(endpointUrl, {
                    method: "GET",
                    headers: {
                        "Accept": "application/json",
                        "Authorization": `Token ${apiKey}`
                    }
                });
                const result = await resp.json();

                return result;
            } catch (e) {
                console.log(endpointUrl)
                this._handleError(e);
                // throw e;
            } finally {
                if (opts.after){
                    // if(this._component){this._component.setState({isLoading: false});}
                }
            }
        };
    }

    

    createPostPrivate(url, method = "POST", baseUrl = BASE_URL) {
        return async (data) => {
            //if(this._component){this._component.setState({isLoading: true});}

            try {
                const endpointUrl = (typeof url === "function")
                    ? BASE_URL + url(data)
                    : BASE_URL + url;
                const apiKey = await this.getApiKey();

                

                const resp = await fetch(endpointUrl, {
                    method,
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "Authorization": `Token ${apiKey}`
                    },
                    body: JSON.stringify(data)
                });
                const result = await resp.json();
                return result;
            } catch (e) {
                console.log(endpointUrl)
                this._handleError(e);
            } finally {
                //if(this._component){this._component.setState({isLoading: false});}
            }
        };
    }

    createDeletePrivate(url) {
        return async (data) => {
            try {
                const endpointUrl = (typeof url === "function")
                    ? BASE_URL + url(data)
                    : BASE_URL + url;
                const apiKey = await this.getApiKey();

                const resp = await fetch(endpointUrl, {
                    method: "DELETE",
                    headers: {
                        "Accept": "application/json",
                        "Authorization": `Token ${apiKey}`
                    }
                });
                
                return;
            } catch (e) {
                console.log(endpointUrl)
                this._handleError(e);
            } finally {
                
            }
        };
    }

    async getApiKey() {
        return await settings.getApiKey();
    }
}

async function getPublic(url) {
    try {
        const endpoint = BASE_URL + url;
        const response = await fetch(endpoint, {
            method: "GET",
            headers: {
                "Accept": "application/json",
            }
        });
        return await response.json();
    } catch (e) {
        console.log(e);
        throw e;
    }
}

async function get(url) {
    try {
        const endpoint = BASE_URL + url;
        const apiToken = await settings.getApiKey();

        const response = await fetch(endpoint, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Authorization": `Token ${apiToken}`
            }
        });
        return await response.json();
    } catch (e) {
        throw e;
    }
}

async function post(url, payload) {
    try {
        const endpoint = BASE_URL + url;
        const apiToken = await settings.getApiKey();
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Token ${apiToken}`
            },
            body: JSON.stringify(payload)
        });

        return await response.json();
    } catch (e) {
        throw e;
    }
}

async function postPublic(url, payload) {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify(payload)
        });

        return await response.json();
    } catch (e) {
        throw e;
    }
}

async function put(url, payload) {
    try {
        const endpoint = BASE_URL + url;
        const apiToken = await settings.getApiKey();
        const response = await fetch(endpoint, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Token ${apiToken}`
            },
            body: JSON.stringify(payload)
        });

        return await response.json();
    } catch (e) {
        throw e;
    }
}

async function deletePrivate(url) {
    try {
        const endpoint = BASE_URL + url;
        const apiToken = await settings.getApiKey();
        const response = await fetch(endpoint, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Token ${apiToken}`
            },
        });

        return await response.json();
    } catch (e) {
        throw e;
    }
}

async function deletePrivateCleanURL(url, code) {
    try {
        const apiToken = await settings.getApiKey();
        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Token ${apiToken}`
            },
            body: JSON.stringify({
                current_password: code
            })
        });
        console.log(JSON.stringify(response))
        return {result: "ok"}
    } catch (e) {
        throw e;
    }
}

async function deletePublic(url) {
    try {
        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
        });
        return {result: "ok"};
    } catch (e) {
        throw e;
    }
}

export default BackendAPI;