const analytics = firebase.analytics()
const db = firebase.firestore()
const messaging = firebase.messaging()

const isMobile = /iPhone|iPod|iPad|Android/i.test(navigator.userAgent)
const isPWA = window.matchMedia("(display-mode: standalone)").matches

function loadArticle(article, id, hidden=false) {
    const color = article.color

    let fill = 0
    if (localStorage.getItem(`${id}_liked`) == 1) {
        fill = 1
    }

    console.log(window.innerWidth)

    document.getElementById("articles").innerHTML += /*html*/
    `<div class="article" id="${id}" style="background-color: ${color};" ${hidden ? "hidden" : ""}>
        <div class="coverImg" style="background-image: linear-gradient(to ${window.innerWidth >= 1000 ? 'left' : 'top'}, ${color}, transparent, transparent), url(${article.coverImage});"></div>
        <div class="txtContent">
            <header>
                <div class="title">
                    <a href="https://daily.dlrc.in/gallery?category=${article.tag}" class="tag">${article.tag}</a>
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
    if (localStorage.getItem("instructionPrompt") == null && isMobile && isPWA) {
        setTimeout(alert("• Swipe up for the next short\n• Click fullscreen to open an image\n• Click share to share the short"))
        localStorage.setItem("instructionPrompt", "1")
    }
}

function linkify(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, url => `${new URL(url).hostname}`)
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
        console.log(article)

        if (article != null) {
            if (article.hidden === true) {
                article.hidden = false
            }
            article.scrollIntoView()
        }
        else {
            alert("Article not found")
        }

        window.history.replaceState({}, document.title, "/")
    }
}

function checkSlideshowMode() {
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    const slideshow = urlParams.get("slideshow")

    if (slideshow) {
        alert('Slideshow mode enabled')
        document.getElementsByClassName('logoTxt')[0].style.animation = 'none';
		const articles = document.querySelectorAll('.article')
		let currentIndex = 0;

		function scrollNext() {
			const nextIndex = (currentIndex + 1) % articles.length
			articles[nextIndex].scrollIntoView({ behavior: 'smooth' })
			currentIndex = nextIndex
		
			setTimeout(scrollNext, 5000); // 5 seconds delay before the next scroll
		}

		setTimeout(scrollNext, 5000)
    }
}

function getArticleInView() {
    let elements = document.querySelectorAll(".article")
  
    elements.forEach(element => {
        if (element.hidden !== true) {
            const rect = element.getBoundingClientRect()
    
            if (rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)) {
                const articleID = element.id
                window.history.replaceState({}, document.title, `/?article=${articleID}`)
            }
        }
    })
}

function showForegroundNotification() {
    if (typeof navigator.serviceWorker !== "undefined") {
        navigator.serviceWorker.ready.then((registration) => {
            messaging.onMessage((payload) => {
                payload = JSON.parse(JSON.stringify(payload))
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
    messaging.getToken(messaging, { vapidKey: "BL1R4Annaua2hasnfjxlLFYoZIn6NaoM45RfddzZxsjby1SQEa-l3mMapA4__Q5zFa5YYvgdPi3NT6tZtUOicxE" }).then((currentToken) => {
        // console.log(currentToken)
    })
}

function notifyMe() {
    Notification.requestPermission((status) => {
        console.log('Notification permission status:', status)

        if (status === "granted") {
            showForegroundNotification()
            getFCMToken()
        }
    })
    if (!(Notification in window) && (window.matchMedia('(display-mode: standalone)').matches) && (localStorage.getItem("notificationAlert") == null)) {
        setTimeout(alert("To receive notifications enable them in the app settings"))
        localStorage.setItem("notificationAlert", "1")
    }
}

function promptInstallIfWeb() {
    const promptIgnored = localStorage.getItem("installPrompt") == "1"

    if (isMobile && !isPWA && !promptIgnored) {
        window.location.replace("/install.html")
        return false
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
            const articleData = doc.data()
            const id = doc.id
            const publishDate = articleData.publishDate.toDate()
            if (!articleData.hidden) {
                const article = {data: articleData, id: id, publishDate: publishDate}
                articles.push(article)
            }
            else {
                const id = doc.id
                const publishDate = articleData.publishDate.toDate()
                const article = {data: articleData, id: id, publishDate: publishDate}
                articles.push(article)
            }
        })

        articles.sort((a, b) => a.publishDate - b.publishDate).reverse() // sorting the articles by publishDate
        articles.forEach(article => {
            i++
            loadArticle(article.data, article.id, article.data.hidden)
        })

        if (i !== -1) {
            setTimeout(() => {
                unhideArticles()
                goToSharedArticle()
                instructionPromptCheck()
                updateLikes()
                shareArticle()
                window.addEventListener("scroll", getArticleInView)
                checkSlideshowMode()
            }, 250)
        }
    })
}

main()
