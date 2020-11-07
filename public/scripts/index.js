//Atribuindo caminho ao document.querySelector("#page-home main a") para uma variavel
const buttonSearch = document.querySelector("#page-home main a")

//Atribuindo o document.querySelector("#modal") para uma variavel
const modal = document.querySelector("#modal")

//Atrbuindo o document.querySelector("#modal .header a") para uma variavel
const close = document.querySelector("#modal .header a")


//Criando um "ouvidor de eventos" para o click do botão
buttonSearch.addEventListener("click", () =>{
        //inputar a classe caso não tenha
        modal.classList.remove("hide")
})

close.addEventListener("click", () =>{
    modal.classList.add("hide")
})