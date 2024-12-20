/*
{
    "_id": "675c852615fee0925c8d2e52",
    "text": "First Post",
    "username": "GurjotS",
    "createdAt": "2024-12-13T19:04:06.252Z",
    "likes": [
      {
        "_id": "675c8a3715fee0925c8d2e9e",
        "postId": "675c852615fee0925c8d2e52",
        "username": "buttercupx",
        "createdAt": "2024-12-13T19:25:43.034Z"
      }
    ]
  },
*/
// function getMessage(m) {
//    return `
//        <div data-post_id="${m._id}" class="message">
//            FROM:  ${m.username}<br>\n    
//            WHEN:  ${m.createdAt}<br>\n    
//            TEXT:  ${m.text}<br>\n
//            LIKES: ${m.likes.length}
//        </div>
//    `;
//}

function getMessage(m) {
  const e = document.createElement("div");
  e.setAttribute("class", "message");
  e.dataset.post_id = m._id;
  e.innerHTML = `
    <hr>
    FROM:  ${m.username}<br>\n    
    WHEN:  ${m.createdAt}<br>\n    
    TEXT:  ${m.text}<br>\n
    LIKES: ${m.likes.length}
  `;
  const b = document.createElement("button");
  b.addEventListener("click", async ()=>{
    //is username in list of likes?
    const like = m.likes.find(like=>like.username===localStorage.username);
    if( like != undefined){
      //found - delete
      await toggleLikes(m._id);
      window.location.href = 'posts.html'; //refresh page
    }else{
      //not found - create
      await toggleLikes(m._id);
      window.location.href = 'posts.html'; //refresh page
    }
  });//end click
  
  const like = m.likes.find(like=>like.username===localStorage.username);
  b.innerText = like != undefined ? "UnLike" : "Like";
  e.appendChild(b);
  return e;
}
document.addEventListener("DOMContentLoaded", async () => {
  const messages = await getMessageList();
  //output.innerHTML = messages.map(getMessage).join("<hr>\n")
  messages.forEach(m => output.appendChild(getMessage(m)));
});//end load

document.querySelectorAll(".deletePostBtn").forEach(btn => {
  btn.addEventListener("click", async (e)=>{
      const postId = e.target.getAttribute("data-post-id");
      const confirmed = confirm("Are you sure you want to delete this post?");
      if(confirmed) {
          const success = await deletePost(postId);
          if(success) {
              alert("Post deleted successfully.");
              location.reload();
          } else {
              alert("Failed to delete the post. Please try again.")
          };
      };
  });
});