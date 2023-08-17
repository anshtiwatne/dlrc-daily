const analytics = firebase.analytics()
const db = firebase.firestore()
const messaging = firebase.messaging()

function loadArticle(article, id) {
    const color = article.color

    let fill = 0
    if (localStorage.getItem(`${id}_liked`) == 1) {
        fill = 1
    }

    document.getElementById("articles").innerHTML += /*html*/
    `<div class="article" id="${id}" style="background-color: ${color};">
        <div class="coverImg" style="background-image: linear-gradient(to top, ${color}, transparent, transparent), url(${article.coverImage});"></div>
        <div class="txtContent">
            <header>
                <div class="title">
                    <span class="tag">${article.tag}</span>
                    <a href="${article.coverImage}">
                        <span class="fullscreenBtn material-symbols-rounded">fullscreen</span>
                    </a>
                </div>
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
    } // localstorage value set in index.html
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

        window.history.replaceState({}, document.title, "/")
    }
}

function getArticleInView() {
    const elements = document.querySelectorAll(".article")
  
    elements.forEach(element => {
      const rect = element.getBoundingClientRect()
  
        if (rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)) {
            const articleID = element.id
            window.history.replaceState({}, document.title, `/?article=${articleID}`)
        }
    })
}

function showForegroundNotification() {
    if (typeof navigator.serviceWorker !== "undefined") {
        navigator.serviceWorker.ready.then((registration) => {
            messaging.onMessage((payload) => {
                payload = JSON.parse(JSON.stringify(payload))
                console.log(payload)
                registration.showNotification(payload.notification.title,
                    {
                        body: payload.notification.body,
                        image: payload.notification.image
                    }
                )
            })
        })
    }
}

function getFCMToken() {
    messaging.getToken(messaging, { vapidKey: "BL1R4Annaua2hasnfjxlLFYoZIn6NaoM45RfddzZxsjby1SQEa-l3mMapA4__Q5zFa5YYvgdPi3NT6tZtUOicxE" })
        .then((currentToken) => {
            console.log(currentToken)
        })
}

function notifyMe() {
    navigator.serviceWorker.ready.then((registration) => {
        console.log('Notification permission status:', status)
        registration.pushManager.subscribe()
        showForegroundNotification()
        getFCMToken()
    })
    Notification.requestPermission(function(status) {
        console.log('Notification permission status:', status)
        showForegroundNotification()
        getFCMToken()
    })
}

function promptInstallIfWeb() {
    if (/iPhone|iPod|iPad|Android/i.test(navigator.userAgent)) {
        if (localStorage.getItem("installPrompt") != null) {
            return true // value set to 1 when user clicks close on /install.html
        }
        if (!window.matchMedia('(display-mode: standalone)').matches) {
            window.location.replace("/install.html")
            return false
        }
    }
    return true
}

function main() {
    if (!promptInstallIfWeb()) {
        return false
    }

    notifyMe()
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
            setTimeout(function () {
                unhideArticles()
                goToSharedArticle()
                instructionPromptCheck()
                updateLikes()
                shareArticle()
                window.addEventListener("scroll", getArticleInView)
            }, 250)
        }
    })
}

main()
