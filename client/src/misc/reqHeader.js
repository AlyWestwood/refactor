function requestHeader(){
    return {
        headers: {
            accessToken: localStorage.getItem("accessToken")
        }    
    }
}

export var reqHeader = requestHeader();