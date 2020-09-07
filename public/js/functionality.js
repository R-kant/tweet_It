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
    let user_id = followBtn.attr("user_id");
    if (followBtn.hasClass("btn-success")) {
      // unfollow user
      followBtn.addClass("btn-primary");
      followBtn.removeClass("btn-success");
      followBtn.text("Follow");
      $.ajax({
        type: "GET",
        url: "/" + user_id + "/followers/unfollow",
        success: function (data) {
          console.log(data);
        },
      });
    } else {
      // follow user
      followBtn.addClass("btn-success");
      followBtn.removeClass("btn-primary");
      followBtn.text("Following");

      $.ajax({
        type: "GET",
        url: "/" + user_id + "/followers/follow",
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
  // ============================
  // Infinite Scrolling

  let isProcessPending = false; // for stopping multiple request simultaneously
  let recordsPerPage = 2; // you can set as you want to get data per ajax request
  let recordsOffset = 0; // get data from given no
  let recordsTotal = 0; // store total number of record
  let tweets_list = [];
  //get first time article as page load

  function loadTweets(params) {
    if (!!params && params.action === "VIEW_MORE") {
      recordsOffset = recordsOffset + recordsPerPage;
    }
    $.ajax({
      type: "GET",
      url: "/explore/tweets",
      data: {
        recordsPerPage: recordsPerPage,
        recordsOffset: recordsOffset,
      },
      success: function (response) {
        isProcessPending = false; // for making process done so new data can be fetched on scroll
        if (!!params && params.action === "VIEW_MORE") {
          tweets_list = tweets_list.concat(response.data.tweets_list);
        } else {
          if (recordsOffset === 0) {
            tweets_list = response.data.tweets_list;
            recordsTotal = response.data.recordsTotal;
          }
        }
        console.log("Tweet list");
        console.log(tweets_list); // form this you can append or manage html as you want
        $("<div>").append(tweets_list);
      },
      error: function (xhr) {
        //Do Something to handle error
        isProcessPending = false; // for make process done so new data can be get on scroll
      },
    });
  }
  //on scroll new get data
  $(window).scroll(function () {
    let scrollPercent = Math.round(
      ($(window).scrollTop() / ($(document).height() - $(window).height())) *
        100
    );
    // get new data only if scroll bar is greater 70% of screen
    if (scrollPercent > 70) {
      //this condition only satisfy ony one pending ajax completed and records offset is less than  total record
      if (isProcessPending === false && recordsOffset < recordsTotal) {
        isProcessPending = true;
        loadTweets({ action: "VIEW_MORE" });
      }
    }
  });
};
