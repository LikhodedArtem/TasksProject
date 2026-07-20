const hrefButtons = document.querySelector(".href-buttons")


hrefButtons.addEventListener("click", (event) => {
    const hrefButton = event.target.closest(".href-button")
    if (!hrefButton) return

    hrefButton.classList.add("clicked")

    setTimeout(() => {
        hrefButton.querySelector("a").click()

        setTimeout(() => {
            hrefButton.classList.remove("clicked")
        }, 100)
    }, 500)
})