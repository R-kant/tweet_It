window.onload = function () {
  let likeBtns = $(".likeBtn");
  let readCommentBtns = $(".readComments");
  let commentPostBtns = $(".commentPostBtn");
  let followBtn = $(".followBtn");
  commentPostBtns.on("click", postComment);
  readCommentBtns.on("click", readComments);
  followBtn.on("click", followUser);
  likeBtns.on("click", likeTweet);

  function followUser() {
    followBtn = $(this);
    if (followBtn.hasClass("bg-success")) {
      // unfollow user
    } else {
      // follow user
      followBtn.addClass("bg-success");
      followBtn.removeClass("bg-primary");
      followBtn.text("Following");
      let user_id = followBtn.attr("user_id");
      $.ajax({
        type: "GET",
        url: "/" + user_id + "/followers/new",
        success: function (data) {
          console.log(data);
        },
      });
    }
  }
  function postComment() {
    let tweet_id = $(this).attr("tweet_id");
    let commentContent = $("#inputComment" + tweet_id);
    if (commentContent.val() != "") {
      let content = commentContent.val();
      commentContent.val("");
      $.ajax({
        type: "POST",
        url: "/" + tweet_id + "/comments/new",
        data: {
          comment: content,
        },
        success: function (user) {
          let commentsWrapper = $("#commentsWrapper" + tweet_id);
          commentsWrapper.prepend(
            $(
              `<div class=" comments_container d-flex"> 
              <div class=" tweet_card_profile_pic d-inline-block">
                  <img src="${user.profile_pic}" alt="Profile Picture">
              </div>\
              <div class="commentInfo pl-2">
                  <div class="user_info">
                      <span class="font-weight-bold">
                          ${user.name}
                      </span>
                      <a href="/proflie/${user.username}">
                          <span class="text-muted usernameLink">
                              ${user.username}
                          </span>
                      </a>
                  </div>
                  <div class="user_comment">
                      <p>
                          ${content}
                      </p>
                  </div>
              </div>
          </div>`
            )
          );
        },
      });
    }
  }
  function readComments() {
    let commentBtn = $(this);
    let tweet_id = commentBtn.attr("tweet_id");
    if (commentBtn.hasClass("d-block")) {
      commentBtn.addClass("d-none");
      commentBtn.removeClass("d-block");
    } else {
      $.ajax({
        type: "Get",
        url: "/" + tweet_id + "/comments",
        success: (data) => {
          console.log(data);
        },
      });
    }
  }
  function likeTweet() {
    let likeBtn = $(this);
    let tweet_id = likeBtn.attr("tweet_id");
    let no_of_likes = $("#no_of_likes" + tweet_id);
    let likes = no_of_likes.text();
    if (likeBtn.hasClass("liked")) {
      likeBtn.removeClass("liked");
      likeBtn.text("Like");

      no_of_likes.text(Number(likes) - 1);
      $.ajax({
        type: "GET",
        url: "/" + tweet_id + "/unlike",
        // data: data,
        success: (data) => {
          console.log(data);
        },
        // dataType: dataType
      });
    } else {
      likeBtn.addClass("liked");
      likeBtn.text("Liked");
      no_of_likes.text(Number(likes) + 1);
      $.ajax({
        type: "GET",
        url: "/" + tweet_id + "/like",
        // data: data,
        success: (data) => {
          console.log(data);
        },
        // dataType: dataType
      });
    }
  }
};
