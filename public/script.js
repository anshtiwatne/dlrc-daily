const db = firebase.firestore()

function startDownload() {
    let imageURL ="https://cdn.glitch.com/4c9ebeb9-8b9a-4adc-ad0a-238d9ae00bb5%2Fmdn_logo-only_color.svg?1535749917189";
  
    let downloadedImg = new Image();
    downloadedImg.crossOrigin = "anonymous";
    // downloadedImg.addEventListener("load", imageReceived, false);
    downloadedImg.src = imageURL;
  }
  

function loadArticle(article, id, i) {
    const color_palette = ["#FBE7C6", "#A0E7E5", "#B4F8C8", "#FFAEBC"]
    const color = color_palette[(i) % color_palette.length]

    let fill = 0
    if (checkCookie(id) == 1) {
        fill = 1
    }

    document.getElementById("articles").innerHTML +=
        /*html*/`
        <div class="article" style="background-color: ${color};">
        <div class="coverImage" style="background-image: linear-gradient(to top, ${color}, transparent), url(${article.coverImage});"></div>
        <div class="textContent">
            <div>
                <div class="header">
                    <span class="tag">${article.tag}</span>
                    <span class="timestamp">
                        <span class="material-symbols-rounded" style="padding-right: 0.25rem;">calendar_month</span>
                        <span style="padding-top: 0.125rem">${article.publishDate.toDate().toLocaleDateString()}</span>
                    </span>
                </div>
                <div class="headline">${article.headline}</div>
            </div>
            <div class="story">${article.story}</div>
            <div class="footer">
                <span id="creditsGroup">
                    <span class="credits">short by</span>
                    <span class="author">${article.author}</span>
                </span>
                <span id="likeGroup" class="likeGroup clickable" data-id="${id}">
                    <span class="likeIcon material-symbols-rounded" style="font-variation-settings: 'FILL' ${fill};">thumb_up</span>
                    <span class="likeCounter">${article.likes}</span>
                </span>
            </div>
        </div>
    </div>`

    updateLikes()
}

function unhideArticles() {
    const endScreen = document.getElementById("endScreen")
    endScreen.style.height = "10vh"
    endScreen.innerHTML = "That's all for now :("
    endScreen.style.scrollSnapAlign = "none"
    window.scrollTo(0, 0)
}

function checkCookie(cookieName) {
    let cookies = document.cookie.split(';');
  
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.indexOf(`${cookieName}=`) === 0) {
        return true;
      }
    }
  
    return false;
}  

function updateLikes() {
    let likeButtons = document.querySelectorAll(".likeGroup");
    likeButtons.forEach(function(button) {

        button.addEventListener("click", () => {

            const articleID = button.getAttribute("data-id")
            const articleDoc = db.collection("articles").doc(articleID)
            const articleLikeButton = button.querySelector(":nth-child(1)")
            const articleLikeCounter = button.querySelector(":nth-child(2)")

            if (!checkCookie(articleID)) {
                const increment = firebase.firestore.FieldValue.increment(1)
                articleDoc.update({"likes": increment})

                button.setAttribute("data-clicked", 1)
                document.cookie = `${articleID}=; path=/`;
                console.log(document.cookie)

                articleLikeButton.style = "font-variation-settings: 'FILL' 1;"
                articleLikeCounter.innerHTML = parseInt(articleLikeCounter.innerHTML) + 1
            }

            else if (checkCookie(articleID)) {
                const increment = firebase.firestore.FieldValue.increment(-1)
                articleDoc.update({"likes": increment})

                button.setAttribute("data-clicked", 0)
                document.cookie = `${articleID}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
                console.log(document.cookie)

                articleLikeButton.style = "font-variation-settings: 'FILL' 0;"
                articleLikeCounter.innerHTML = parseInt(articleLikeCounter.innerHTML) - 1
            }
        })
    })
}

db.collection("articles").get().then((snapshot) => {
    let articles = []
    let i = -1

    snapshot.docs.forEach(doc => {
        let article = doc.data()
        let id = doc.id
        let publishDate = article.publishDate.toDate()
        articles.push([article, id, publishDate])
    })

    articles.sort((a, b) => a[2] - b[2]).reverse() // sorting the articles by publishDate
    articles.forEach(article => {
        i++
        loadArticle(article[0], article[1], i)
    })

    setTimeout(unhideArticles, 250)
})

startDownload()