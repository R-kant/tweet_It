window.onload = function () {
  let likeBtns = $(".likeBtn");
  let readCommentBtns = $(".readComments");
  readCommentBtns.on("click", readComments);

  likeBtns.on("click", likeTweet);
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

    if (likeBtn.hasClass("liked")) {
      likeBtn.removeClass("liked");
      likeBtn.text("Like");
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
