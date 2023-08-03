const analytics = firebase.analytics()
const db = firebase.firestore()

function loadArticle(article, id, i) {
    // const color_palette = ["#FBE7C6", "#A0E7E5", "#B4F8C8", "#FFAEBC"]
    // const color = color_palette[(i) % color_palette.length]
    const color = article.color

    let fill = 0
    if (checkCookie(id) == 1) {
        fill = 1
    }

    document.getElementById("articles").innerHTML +=
        /*html*/`
        <div class="article" id="${id}" style="background-color: ${color};">
        <a href="${article.coverImage}">
            <div class="coverImage" style="background-image: linear-gradient(to top, ${color}, transparent, transparent), url(${article.coverImage});"></div>
        </a>
        <div class="textContent">
            <div>
                <span class="header tag">${article.tag}</span>
                <div class="headline">${article.headline}</div>
            </div>
            <div class="story">${linkify(article.story)}</div>
            <div class="footer">
                <div id="creditsGroup">
                    <span class="credits">by</span>
                    <span class="author">${article.author}</span>
                    <span class="timestamp" style="padding-left: 0.25rem">• ${timeAgo(article.publishDate.toDate())}</span>
                </div>
                <div>
                    <span class="likeGroup" data-id="${id}">
                        <span class="likeButton material-symbols-rounded" style="font-variation-settings: 'FILL' ${fill};">thumb_up</span>
                        <span class="likeCounter">${article.likes}</span>
                    </span>
                    <span class="shareButton material-symbols-rounded" style="padding-left: 0.75rem; transform: translateY(-10%)" data-id="${id}">ios_share</span>
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

function linkify(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, url => `<a class="linkified" href="${url}">${new URL(url).hostname}</a>`)
}

function shareArticle() {
    let shareButtons = document.querySelectorAll(".shareButton");
    shareButtons.forEach(function(button) {

        button.addEventListener("click", () => {

            const articleID = button.getAttribute("data-id")
            const articleURL = new URL("https://dlrc-daily.web.app/")
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
    console.log(articleID)

    if (articleID) {
        const article = document.getElementById(articleID)
        console.log(articleID, article)
        article.scrollIntoView()
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
        loadArticle(article[0], article[1], i)
    })

    if (i !== -1) {
        setTimeout(unhideArticles, 250)
    }
})
