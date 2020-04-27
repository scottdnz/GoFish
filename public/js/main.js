$(document).ready(function() {
    let gameIdCurrent = -1;
   
    let fillPlayerRow = function(playerName, playerElem, cards) {
        // Sort cards by value key
        cards.sort((a, b) => (a["value"] > b["value"]) ? 1 : -1);
        
        let imgDir = $("body").data("img-dir");
        
        let playerNameText = document.createTextNode(playerName);
            
        let hdrName = document.createElement("h3");
        hdrName.className = "hdrName";
        hdrName.appendChild(playerNameText);

        let hdrRow = document.createElement("div");
        hdrRow.className = "hdrRow";
        hdrRow.appendChild(hdrName);

        let playerCardsRow = document.createElement("div");
        playerCardsRow.id = playerElem;
        playerCardsRow.className = "row";
        
        let currentCardValue = -1;
        let newCardValue = -2
        let cardBox = document.createElement("div");
        cardBox.className = "cardBox col-1";
        numCardsSame = 0;
        
        for (let i = 0; i < cards.length; i++) {
            let cardImg = document.createElement("img");
            cardImg.setAttribute("src", imgDir + "/cards_small/" + cards[i]["image_name"]);

            newCardValue = parseInt(cards[i]["value"]);
            
            if (currentCardValue === newCardValue) {
                alert("Match for value: " + currentCardValue);
                
                numCardsSame++;
                cardImg.className = "cardImg card" + numCardsSame;
                cardBox.appendChild(cardImg);
            }
            else {
                numCardsSame = 0;
                cardImg.className = "cardImg card" + numCardsSame;
                cardBox = document.createElement("div");
                cardBox.className = "cardBox col-1";
                cardBox.appendChild(cardImg);
            }
            currentCardValue = newCardValue;
            
            playerCardsRow.appendChild(cardBox);
            
        }
        
        let br = document.createElement("br");
        playerCardsRow.appendChild(br);
        
        let playerSection = document.createElement("div");
        playerSection.className = "playerSection";
        playerSection.appendChild(hdrRow);
        playerSection.appendChild(playerCardsRow);

        $("#playerRows").append(playerSection);
      
    };
    
    $("#btnDealCards").click(function() {
        $.ajax({
            method: "GET",
            url: "/gofish/game/" + gameIdCurrent + "/deal",
        })
        .done(function(data) {
            for (let i = 0; i < data.length; i++) {
                let playerCurrent = data[i];
                let playerName = playerCurrent["player"]["name"];
                let playerCards = playerCurrent["cards"];

                let playerElem = "rowPlayer" + i;
                fillPlayerRow(playerName, playerElem, playerCards);
            }
        });
    });
       
    $("#btnGameNew").click(function() {
        let data = { 
            "number_players": "3",
            "players": [
                {"name": "clientPlayer"},
                {"name": "Joel-NPC"},
                {"name": "Lauren-NPC"}
            ]
        };
        
        $.ajax({
            method: "POST",
            url: "/gofish/game",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(data) 
        })
        .done(function(data) {
            gameIdCurrent = data["game"]["id"];
            alert("gameIdCurrent: " + gameIdCurrent);
        });
    });
    
});
