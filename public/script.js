const db = firebase.firestore()

function loadArticle(article, id, i) {
    const color_palette = ["#FBE7C6", "#A0E7E5", "#B4F8C8", "#FFAEBC"]
    const color = color_palette[(i) % color_palette.length]

    document.getElementById("articles").innerHTML +=
        `<div class="article" style="background-color: ${color};">
            <div class="coverImage" style="background-image: linear-gradient(to top, ${color}, transparent), url(${article.coverImage});"></div>
            <div class="textContent">
                <div class="heading">
                    <div class="tag">${article.tag}</div>
                    <div class="headline">${article.headline}</div>
                </div>
                <div class="story">${article.story}</div>
                <div class="footer">
                    <span id="creditsGroup">
                        <span class="credits">short by</span>
                        <span class="author">${article.author}</span>
                    </span>
                    <span id="likeGroup" class="likeGroup" data-id="${id}" data-clicked=${0}>
                        <span class="likeIcon material-symbols-rounded">thumb_up</span>
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

function updateLikes() {
    let likeButtons = document.querySelectorAll(".likeGroup");
    likeButtons.forEach(function(button) {

        button.addEventListener("click", () => {

            if (button.getAttribute("data-clicked") == 0) {

                const articleID = button.getAttribute("data-id")
                const articleDoc = db.collection("articles").doc(articleID)
                const increment = firebase.firestore.FieldValue.increment(1)

                articleDoc.update({"likes": increment})
                console.log(articleID)
                console.log('Button clicked!')
                button.setAttribute("data-clicked", 1)

                const articleLikeButton = button.querySelector(":nth-child(1)")
                const articleLikeCounter = button.querySelector(":nth-child(2)")
                articleLikeButton.style = "font-variation-settings: 'FILL' 1;"
                articleLikeCounter.innerHTML = parseInt(articleLikeCounter.innerHTML) + 1
            }
        })
    })
}

db.collection("articles").get().then((snapshot) => {
    let i = -1
    const today = new Date()

    snapshot.docs.forEach(doc => {
        let article = doc.data()
        let id = doc.id
        let publishDate = article.publishDate.toDate()
        let timeDelta = (today.getTime() - publishDate.getTime()) / 1000
        // if the article is less than a day old
        if (timeDelta <= 86400) {
            i++
            loadArticle(article, id, i)
        }
    })
    setTimeout(unhideArticles, 250)
})