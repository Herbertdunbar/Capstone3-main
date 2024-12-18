const BASE_URL = "http://microbloglite.us-east-2.elasticbeanstalk.com";
const NO_AUTH_HEADERS = { 'accept': 'application/json', 'Content-Type': 'application/json' };
// ONLY 2 - INSECURE TOKEN FREE ACTIONS

//create user - sign up
/*
curl -X 'POST' \
  'http://microbloglite.us-east-2.elasticbeanstalk.com/api/users' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "username": "string",
  "fullName": "string",
  "password": "string"
}'
*/
async function signUp(username, fullName, password) {
    const payload = JSON.stringify(
        { "username": username, "fullName": fullName, "password": password }
    );

    const response = await fetch(BASE_URL + "/api/users", {
        method: "POST",
        headers: NO_AUTH_HEADERS,
        body: payload
    }); //end fetch

    //TODO check for error response status codes
    if (response.status != 201) {
        console.log(response.status, response.statusText);
        return response.statusText;
    }
    const object = await response.json(); //COnvert body to object
    return object;
}


//login and store username and token received
/*
curl -X 'POST' \
  'http://microbloglite.us-east-2.elasticbeanstalk.com/auth/login' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "username": "string",
  "password": "string"
}'
*/
async function login(username, password) {
    const payload = JSON.stringify({ "username": username, "password": password });
    const response = await fetch(BASE_URL + "/auth/login", {
        method: "POST",
        headers: NO_AUTH_HEADERS,
        body: payload
    }); //end fetch

    //TODO check for error response status codes
    if (response.status != 200) {
        console.log(response.status, response.statusText);
        return response.statusText;
    }
    const object = await response.json(); //COnvert body to object
    localStorage.token = object.token;
    localStorage.username = object.username;
    return object;
}

// ALL THE OTHERS NEED A TOKEN IN THE HEADER
function headersWithAuth() {
    //SAME AS NO AUTH BUT WITH AUTH ADDED
    return { 
        ...NO_AUTH_HEADERS, 
        'Authorization': `Bearer ${localStorage.token}`,
    }
}
// get secure list of message using token
async function getMessageList() {
    const LIMIT_PER_PAGE = 1000;
    const OFFSET_PAGE = 0;
    const queryString = `?limit=${LIMIT_PER_PAGE}&offset=${OFFSET_PAGE}`;

    const response = await fetch(
        BASE_URL + "/api/posts" + queryString, {
        method: "GET",
        headers: headersWithAuth(),
    });
    const object = await response.json();
    return object;
};
async function toggleLikes(postId) {
    // Fetch the messages to get the full list of posts and likes
    const messages = await getMessageList();
    const post = messages.find(p => p._id === postId);  // Find the post by its ID

    // Check if the current user has liked the post
    const userLike = post.likes.find(like => like.username === localStorage.username); // Find the like by the user

    let response;
    if (userLike) {
        // If the user has already liked the post, remove the like
        const likeId = userLike._id;
        response = await fetch(BASE_URL + `/api/likes/${likeId}`, {
            method: "DELETE",
            headers: headersWithAuth(),
        });
    } else {
        // If the user hasn't liked the post yet, add a like
        const payload = JSON.stringify({ postId });
        response = await fetch(BASE_URL + "/api/likes", {
            method: "POST",
            headers: headersWithAuth(),
            body: payload,
        });
    }

    if (response.status === 200 || response.status === 201) {
        const updatedMessages = await getMessageList();
        output.innerHTML = updatedMessages.map(getMessage).join("<hr>");  // Re-render the messages
    }
}
async function createMessage(message) {
    // Payload to send to the API
    const payload = JSON.stringify({
        text: message,
    });
    const response = await fetch(BASE_URL + "/api/posts", {
        method: "POST",
        headers: headersWithAuth(),
        body: payload
    });
    const object = await response.json();
    return object;
};

// Calculate the difference between the current time and time posted
function timeAgo(dateString) {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInSeconds = Math.floor((now - postDate) / 1000);

    const minutes = Math.floor(diffInSeconds / 60);
    const hours = Math.floor(diffInSeconds / 3600);
    const days = Math.floor(diffInSeconds / (3600 * 24));

    if (minutes < 1) {
        return "Just now";
    } else if (minutes < 60) {
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
        return `${days} day${days > 1 ? 's' : ''} ago`;
    };
};

async function getUserInfo(username) {
    const response = await fetch(BASE_URL + `/api/users/${username}`, {
        method: "GET",
        headers: headersWithAuth(),
    });

    if (response.status === 200) {
        const user = await response.json(); // Convert response to JSON
        displayUserInfo(user); // Call a function to display the user's information
    } else {
        alert("User not found or an error occurred.");
    };
};

async function getUserPosts(username) {
    const response = await fetch(BASE_URL + "/api/posts", {
        method: "GET",
        headers: headersWithAuth(),
    });

    if (response.status === 200) {
        const posts = await response.json();
        return posts.filter(post => post.username === username); // Filter posts by username
    } else {
        console.error("Failed to fetch user posts:", response.statusText);
        return [];
    };
};
async function getUserProfile(username) {
    const response = await fetch(BASE_URL + `/api/users/${username}`, {
        method: "GET",
        headers: headersWithAuth(),
    });

    if (response.status === 200) {
        return response.json();
    } else {
        console.error("Failed to fetch user profile:", response.statusText);
        return null;
    };
};

async function updateUserProfile(username, updates) {
    const response = await fetch(BASE_URL + `/api/users/${username}`, {
        method: "PUT",
        headers: headersWithAuth(),
        body: JSON.stringify(updates),
    });

    if(response.status === 200) {
        return true;
    } else {
        console.error("Failed to fetch user profile:", response.statusText);
        return false;
    };
};

async function deletePost(postId) {
    const response = await fetch(BASE_URL + `/api/posts/${postId}`, {
        method: "DELETE",
        headers: headersWithAuth(),
    });

    if(response.status === 202){
        console.log("Your post has been deleted");
        return true;
    } else {
        console.error("Failed to delete post:", response.statusText);
    };
};

