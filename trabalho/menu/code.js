document.addEventListener("DOMContentLoaded", function() {
    const searchBar = document.getElementById("search-bar");
    const jogos = document.querySelectorAll(".jogo");


    const searchQuery = localStorage.getItem("searchQuery") || "";
    searchBar.value = searchQuery;


    function filtrojogo() {
        const query = searchBar.value.toLowerCase();
        localStorage.setItem("searchQuery", query); 

        jogos.forEach(jogo => {
            const title = jogo.querySelector("h2").textContent.toLowerCase();
            if (title.includes(query)) {
                jogo.style.display = "block"; 
            } else {
                jogo.style.display = "none"; 
            }
        });
    }


    searchBar.addEventListener("input", filtrojogo);


    filtrojogo();
});