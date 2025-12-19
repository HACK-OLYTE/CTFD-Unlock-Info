document.addEventListener("DOMContentLoaded", function () {
    let unlockMap = {};
    let isDataLoaded = false;
    let isLoading = false;
    let debounceTimer = null;

    function chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    function processButtons() {
        if (!isDataLoaded) return;

        const challengeButtons = document.querySelectorAll(".challenge-button");

        challengeButtons.forEach((btn) => {
            const challengeId = btn.value;

            if (
                btn.querySelector(".unlock-info-icon") ||
                btn.closest(".modal, .challenge-modal") ||
                !btn.closest(".category-challenges")
            ) return;

            const depList = unlockMap[challengeId];

            if (!Array.isArray(depList) || depList.length === 0) return;

            const infoIcon = document.createElement("span");
            infoIcon.textContent = "i";
            infoIcon.classList.add("unlock-info-icon");
            Object.assign(infoIcon.style, {
                position: "absolute",
                top: "5px",
                right: "10px",
                color: "#fff",
                background: "rgba(0, 29, 74, 0.4)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "50%",
                width: "16px",
                height: "16px",
                fontSize: "11px",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 10,
                backdropFilter: "blur(2px)",
            });

            const tooltip = document.createElement("div");
            tooltip.classList.add("unlock-info-tooltip");
            Object.assign(tooltip.style, {
                position: "absolute",
                top: "30px",
                right: "0",
                background: "rgba(255, 255, 255, 0.15)",
                color: "#fff",
                padding: "6px 10px",
                borderRadius: "8px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                fontSize: "13px",
                display: "none",
                whiteSpace: "normal",
                zIndex: 100,
                backdropFilter: "blur(6px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                maxWidth: "300px",
            });

            const title = document.createElement("div");
            title.textContent = "Débloqué après avoir résolu le(s) challenge(s): ";
            title.style.fontWeight = "bold";
            title.style.marginBottom = "5px";
            tooltip.appendChild(title);

            // ✅ SANITIZE : Filtrer les valeurs invalides
            chunkArray(depList, 3).forEach(group => {
                const validNames = group.filter(name => name && typeof name === 'string');
                if (validNames.length > 0) {
                    const line = document.createElement("div");
                    line.textContent = validNames.join("; "); // ✅ textContent = safe
                    tooltip.appendChild(line);
                }
            });

            infoIcon.addEventListener("mouseenter", () => {
                tooltip.style.display = "block";
            });

            infoIcon.addEventListener("mouseleave", () => {
                tooltip.style.display = "none";
            });

            infoIcon.addEventListener("click", (e) => {
                e.stopPropagation();
                tooltip.style.display = tooltip.style.display === "block" ? "none" : "block";
            });

            btn.style.position = "relative";
            btn.appendChild(infoIcon);
            btn.appendChild(tooltip);
        });
    }

    // ✅ Protection contre les appels multiples
    function loadUnlockData() {
        if (isLoading) return Promise.resolve();
        
        isLoading = true;
        return fetch("/plugins/ctfd-unlock-info/api/unlock_info_all")
            .then(res => res.json())
            .then(data => {
                unlockMap = data;
                isDataLoaded = true;
                processButtons();
            })
            .catch(err => {
                console.error("Erreur chargement dépendances :", err);
                isDataLoaded = true;
            })
            .finally(() => {
                isLoading = false;
            });
    }

    // Chargement initial
    loadUnlockData();

    // Rechargement des données quand la page change
    let lastUrl = location.href;
    const checkForUrlChange = () => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            isDataLoaded = false;
            loadUnlockData();
        }
    };
    setInterval(checkForUrlChange, 1000);

    // ✅ Observer avec debounce
    let lastChallengeCount = 0;

    const observer = new MutationObserver(() => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const currentCount = document.querySelectorAll(".challenge-button").length;
            
            if (currentCount > lastChallengeCount) {
                lastChallengeCount = currentCount;
                isDataLoaded = false;
                loadUnlockData();
            } else {
                processButtons();
            }
            
            lastChallengeCount = currentCount;
        }, 300); // ✅ Attend 300ms sans changement
    });

    observer.observe(document.body, { childList: true, subtree: true });
});