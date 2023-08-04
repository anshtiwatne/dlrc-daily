const analytics = firebase.analytics()
const db = firebase.firestore()

function loadArticle(article, id) {
    const color = article.color

    let fill = 0
    if (localStorage.getItem(`${id}_liked`) == 1) {
        fill = 1
    }

    document.getElementById("articles").innerHTML += /*html*/
    `<div class="article" id="${id}" style="background-color: ${color};">
        <a href="${article.coverImage}">
            <div class="coverImg" style="background-image: linear-gradient(to top, ${color}, transparent, transparent), url(${article.coverImage});"></div>
        </a>
        <div class="txtContent">
            <header>
                <span class="title tag">${article.tag}</span>
                <div class="headline">${article.headline}</div>
            </header>
            <div class="story">${linkify(article.story)}</div>
            <div class="footer">
                <div>
                    <span class="credits">by</span>
                    <span class="author">${article.author}</span>
                    <span class="timestamp" style="padding-left: 0.25rem">• ${timeAgo(article.publishDate.toDate())}</span>
                </div>
                <div>
                    <span class="likeGroup" data-id="${id}">
                        <span class="likeBtn material-symbols-rounded" style="font-variation-settings: 'FILL' ${fill};">thumb_up</span>
                        <span class="likeCount">${article.likes}</span>
                    </span>
                    <span class="shareBtn material-symbols-rounded" style="padding-left: 0.75rem; transform: translateY(-10%)" data-id="${id}">ios_share</span>
                </div>
            </div>
        </div>
    </div>`

    updateLikes()
    shareArticle()
}

function timeAgo(date) {
    if (!(date instanceof Date)) {
        throw new Error("Invalid input. Please provide a valid Date object.");
    }

    const now = new Date();
    const diffInMillis = now - date;
    const oneMinuteInMillis = 60 * 1000;
    const oneHourInMillis = 60 * oneMinuteInMillis;
    const oneDayInMillis = 24 * oneHourInMillis;
    const oneWeekInMillis = 7 * oneDayInMillis;
    const oneMonthInMillis = 30 * oneDayInMillis;
    const oneYearInMillis = 365 * oneDayInMillis;

    if (diffInMillis < oneMinuteInMillis) {
        return "now";
    } else if (diffInMillis < oneHourInMillis) {
        const minutes = Math.floor(diffInMillis / oneMinuteInMillis);
        return `${minutes}min`;
    } else if (diffInMillis < oneDayInMillis) {
        const hours = Math.floor(diffInMillis / oneHourInMillis);
        return `${hours}h`;
    } else if (diffInMillis < oneWeekInMillis) {
        const days = Math.floor(diffInMillis / oneDayInMillis);
        return `${days}d`;
    } else if (diffInMillis < oneMonthInMillis) {
        const weeks = Math.floor(diffInMillis / oneWeekInMillis);
        return `${weeks}w`;
    } else if (diffInMillis < oneYearInMillis) {
        const months = Math.floor(diffInMillis / oneMonthInMillis);
        return `${months}m`;
    } else {
        const years = Math.floor(diffInMillis / oneYearInMillis);
        return `${years}y`;
    }
}

function unhideArticles() {
    const endScreen = document.getElementById("endScreen")
    endScreen.style.height = "10vh"
    endScreen.innerHTML = "That's all for now :("
    endScreen.style.scrollSnapAlign = "none"
    window.scrollTo(0, 0)
    goToSharedArticle()
    instructionPromptCheck()
}

function updateLikes() {
    let likeButtons = document.querySelectorAll(".likeGroup");
    likeButtons.forEach(function(button) {

        button.addEventListener("click", () => {

            const articleID = button.getAttribute("data-id")
            const articleDoc = db.collection("articles").doc(articleID)
            const articleLikeBtn = button.querySelector(":nth-child(1)")
            const articleLikeCount = button.querySelector(":nth-child(2)")

            if (["0", null].includes(localStorage.getItem(`${articleID}_liked`))) {
                const increment = firebase.firestore.FieldValue.increment(1)
                articleDoc.update({"likes": increment})

                button.setAttribute("data-clicked", 1)
                localStorage.setItem(`${articleID}_liked`, "1");

                articleLikeBtn.style = "font-variation-settings: 'FILL' 1;"
                articleLikeCount.innerHTML = parseInt(articleLikeCount.innerHTML) + 1
            }

            else if (localStorage.getItem(`${articleID}_liked`) == "1") {
                const increment = firebase.firestore.FieldValue.increment(-1)
                articleDoc.update({"likes": increment})

                button.setAttribute("data-clicked", 0)
                localStorage.setItem(`${articleID}_liked`, "0");

                articleLikeBtn.style = "font-variation-settings: 'FILL' 0;"
                articleLikeCount.innerHTML = parseInt(articleLikeCount.innerHTML) - 1
            }
        })
    })
}

function instructionPromptCheck() {
    if (localStorage.getItem("instructionPrompt") == null) {
        document.getElementById("instructions").style.display = "flex"
    }
    // localstorage value set in index.html
}

function linkify(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, url => `<a class="linkified" href="${url}">${new URL(url).hostname}</a>`)
}

function shareArticle() {
    const shareButtons = document.querySelectorAll(".shareBtn");
    shareButtons.forEach(function(button) {

        button.addEventListener("click", () => {

            const articleID = button.getAttribute("data-id")
            const articleURL = new URL("https://daily.dlrc.in/")
            articleURL.searchParams.append("article", articleID)

            const docRef = db.collection("articles").doc(articleID)
            docRef.get().then((doc) => {
                const shareData = {
                    title: "Dlrc Daily Article",
                    text: doc.data().headline,
                    url: articleURL,
                }
                navigator.share(shareData)
            })
        })
    })
}

function goToSharedArticle() {
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    const articleID = urlParams.get("article")

    if (articleID) {
        const article = document.getElementById(articleID)

        if (article != null) {
            article.scrollIntoView()
        }
        else {
            alert("Article not found")
        }

        window.history.pushState({}, document.title, "/")
    }
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
        loadArticle(article[0], article[1])
    })

    if (i !== -1) {
        setTimeout(unhideArticles, 250)
    }
})
