let isProcessPending = false; // for stopping multiple request simultaneously
let recordsPerPage = 2; // you can set as you want to get data per ajax request
let recordsOffset = 0; // get data from given no
let recordsTotal = 0; // store total number of record
let tweets_list = [];
//get first time article as page load
loadTweets({ action: "initialization" });
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
        tweets_list = response.data.tweets_list;
      } else {
        if (recordsOffset === 0) {
          tweets_list = response.data.tweets_list;
          recordsTotal = response.data.recordsTotal;
        }
      }
      console.log("Tweet list");
      console.log(tweets_list); // form this you can append or manage html as you want
      tweets_list.forEach(function (tweet) {
        appendinHTML(tweet);
      });
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
    ($(window).scrollTop() / ($(document).height() - $(window).height())) * 100
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
var tweetid;
function appendinHTML(tweet) {
  let userid = $("#userId").text();
  console.log(tweet);
  let exploreContainer = $("#exploreContainer");
  exploreContainer.append(
    $(`            <div class="tweetCards homepage_tweets mt-4 mb-4">
    <div class="tweet_heading clearfix">
        <div class="tweet_card_profile_pic d-inline-block">
            <img src="${tweet.author.profile_pic}" alt="Profile Picture">
        </div>
        <div class="tweet_username d-inline-block">
            <p>
                <span class="font-weight-bold"></span>
                <br>
                <a href="/profile/${tweet.author.username}">
                    <span class="text-muted usernameLink">
                        @${tweet.author.username}
                    </span>
                </a>
            </p>
        </div>
        <div class="d-inline-block float-right">
            <small class="text-muted">
                <span>${tweet.dateTime}</span>
            </small>
        </div>
    </div>
    <p class="tweetContent lead">
        ${tweet.content}
    </p>
    <div class="actionButtons">

        ${if(userid )}
        <button class="btn btn-primary liked likeBtn" tweet_id="${tweet._id}">Liked</button>
        {{else}}
        <button class="likeBtn btn btn-primary" tweet_id="${tweet._id}">Like</button>
        {{/ifSet}}
        <small class="no_of_likes" class="text-muted">
            <span id="no_of_likes${tweet._id}">${tweet.likes.length}</span>
            likes
        </small>
        {{!-- =============== --}}
                {{!-- ========================= --}}
        <small>
            <a href="" class="text-muted" class="readComments" tweet_id="${tweet._id}">
                <span>${tweet.comments.length}</span>
                Comments
            </a>
        </small>
    </div>
    <div class="commentsWrapper " id="commentsWrapper${tweet._id}">
            
        
        <div class="comments_container d-flex">
            <div class="tweet_card_profile_pic d-inline-block">
                <img src="{{@root.currentUser.profile_pic}}" alt="Profile Picture">
            </div>
            <div class="commentInfo pl-2">
                <div class="user_info">
                    <span class="font-weight-bold">
                        {{@root.currentUser.name}}
                    </span>
                    <a href="/profile/{{@root.user.username}}">
                        <span class="text-muted usernameLink">
                            @{{@root.currentUser.username}}
                        </span>
                    </a>
                </div>
                <div class="user_comment">
                    <p>
                        <input type="text" id="inputComment{{tweet._id}}" tweet_id="{{tweet._id}}"
                            placeholder="Write a Comment....">
                        <button class="btn-sm btn btn-success commentPostBtn"
                            tweet_id="{{tweet._id}}">Post</button>
                    </p>
                </div>
            </div>
        </div>

    </div>
</div>`)
  );
}

function addComment(comment) {
  console.log("called");
  let commentWrapper = $("#commentsWrapper" + tweetid);
  console.log(commentWrapper);
  commentWrapper.append(
    $(
      `<div class=" comments_container d-flex">
             <div class=" tweet_card_profile_pic d-inline-block">
                 <img src="${comment.author.profile_pic}" alt="Profile Picture">
             </div>
             <div class="commentInfo pl-2">
                 <div class="user_info">
                     <span class="font-weight-bold">
                         ${comment.author.name}
                     </span>
                     <a href="/profile/${comment.author.username}">
                         <span class="text-muted usernameLink">
                             @${comment.author.username}
                         </span>
                     </a>
                 </div>
                 <div class="user_comment">
                     <p>
                         ${comment.content}
                     </p>
                 </div>
             </div>
         </div>`
    )
  );
}
