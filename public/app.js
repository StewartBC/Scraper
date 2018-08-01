let subreddit = ""
$("#submit").click(function (event) {
  event.preventDefault();
  $("#results").empty();
  subreddit = $("#subredditInput").val().trim();
  $.ajax({
    type: "GET",
    url: `/scrapes/${subreddit}`
  }).then(function (results) {
    for (let k = 0; k < results.length; k++) {
        $("#results").append(
          `<div class="accordion" id="accordion${k}">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">
              <button class="btn btn-link collapsed" type="button" data-toggle="collapse" data-target="#collapse${k}" aria-expanded="false"
                aria-controls="collapse${k}">
                Thread #${k + 1}
              </button>
            </h5>
          </div>
          <div id="collapse${k}" class="collapse" aria-labelledby="headingOne" data-parent="#accordion${k}">
            <div class="card-body">
              <a href="${results[k].link}"
                target="_blank">
                <h4>${results[k].title}</h4>
              </a>
              <p>
                <button class="btn btn-primary" type="button" data-toggle="collapse" data-target="#collapseComments${k}" aria-expanded="false"
                  aria-controls="collapseComments${k}">
                  Show Comments
                </button>
                <button class="btn btn-primary" type="button" data-toggle="collapse" data-target="#collapseAdd${k}" aria-expanded="false" aria-controls="collapseAdd${k}">
                  Add Comment
                </button>
              </p>
              <div class="collapse" id="collapseComments${k}">
              </div>
              </p>
              <div class="collapse" id="collapseAdd${k}">
                <div class="card card-body">
                  <form>
                    <div class="form-group">
                      <label for="nameInput">Name</label>
                      <input class="form-control" id="nameInput" placeholder="Enter your name">
                    </div>
                    <div class="form-group">
                      <label for="commentInput">Enter your comment</label>
                      <textarea class="form-control" id="commentInput" rows="3"></textarea>
                    </div>
                    <button data-title="${results[k].title}" data-id=${k} type="submit" class="submitComment btn btn-primary">Submit</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>`)
      for (let p = 0; p < results[k].comments.length; p++) {
        $(`#collapseComments${k}`).append(
          `<div class="card card-body">
          <h5>${results[k].comments[p].name}</h5>
          <p>${results[k].comments[p].text}</p>
          </div>`
        );
      }
    }
  });
});

$(document).on("click", ".submitComment", function (event) {
  event.preventDefault();
  $(".nameInput").empty();
  $(".commentInput").empty();
  const num = $(this).attr("data-id");
  const userComment = {
    name: $(".nameInput").val().trim(),
    text: $(".commentInput").val().trim(),
    title: $(this).attr("data-title")
  }
  $.ajax({
    type: "POST",
    url: "/scrapes",
    data: userComment
  }).then(function () {
    $(`#collapseComments${num}`).append(
      `<div class="card card-body">
      <h5>${userComment.name}</h5>
      <p>${userComment.text}</p>
      </div>`
    );
  });
});  