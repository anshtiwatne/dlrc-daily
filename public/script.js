const db = firebase.firestore()

function loadArticle(article, i) {
    const color_palette = ["#FBE7C6", "#A0E7E5", "#B4F8C8", "#FFAEBC"]
    const color = color_palette[(i) % color_palette.length]

    document.getElementById("articles").innerHTML +=
        `<div class="article" style="background-color: ${color};">
            <div class="coverImage" style="background-image: linear-gradient(to top, ${color}, transparent), url(${article.coverImage});"></div>
            <div class="textContent">
                <div class="headline">${article.headline}</div>
                <div class="story">${article.story}</div>
                <div class="tags">${article.tags}</div>
            </div>
        </div>`
}

function unhideArticles() {
    const endScreen = document.getElementById("endScreen")
    endScreen.style.height = "10vh"
    endScreen.innerHTML = "That's all for now :("
    endScreen.style.scrollSnapAlign = "none"
    window.scrollTo(0, 0)
}

db.collection("articles").get().then((snapshot) => {
    let i = -1
    const today = new Date()

    snapshot.docs.forEach(doc => {
        let article = doc.data()
        let publishDate = article.publishDate.toDate()
        let timeDelta = (today.getTime() - publishDate.getTime()) / 1000
        // if the article is less than a day old
        if (timeDelta <= 86400) {
            i++
            loadArticle(article, i)
        }
    })
    setTimeout(unhideArticles, 250)
})