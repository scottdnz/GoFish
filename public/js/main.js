$(document).ready(function() {
    let gameIdCurrent = -1;
    
    let deckIdCurrent = -1;
    
    let testMode = true;
    
    let numPlayers = 0;
    
    let currentPlayerTurn = {};
    
    let currentPlayers = [];
   
    let fillPlayerRow = function(playerName, playerId, playerElem, cards) {
        // Sort cards by value key        
        cards.sort(function(a, b) { return (a["value"] > b["value"]) ? 1 : -1; });
        
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
        playerCardsRow.setAttribute("data-player-id", playerId);
        playerCardsRow.className = "row";
        
        let currentCardValue = -1;
        let newCardValue = -2
        let cardBox = document.createElement("div");
        cardBox.className = "cardBox col-1";
        
        // Show all cards in player row
        if (testMode === true || playerName === "clientPlayer") {
        
            numCardsSame = 0;

            for (let i = 0; i < cards.length; i++) {
                let cardImg = document.createElement("img");
                cardImg.setAttribute("src", imgDir + "/cards_small/" + cards[i]["image_name"]);

                newCardValue = parseInt(cards[i]["value"]);

                if (currentCardValue === newCardValue) {
//                    alert("Match for value: " + currentCardValue);

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
        }
        // Show back of cards (hidden)
        if (testMode === false && playerName !== "clientPlayer") {
            let cardImg = document.createElement("img");
            cardImg.setAttribute("src", imgDir + "/cards_small/back.png");
            cardImg.className = "cardImg card0";

            cardBox = document.createElement("div");
            cardBox.className = "cardBox col-1";
            cardBox.appendChild(cardImg);
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
    
    let updateStatusArea = function() {
        $("#statusGame").html("started, game ID: <span id='gameId'>" + gameIdCurrent + "</span>");
        
        let statusMessages = [
//            "No. of players: " + numPlayers,  
            "Player's turn: " + currentPlayerTurn["player"]["name"]
        ];
        let list = document.createElement("ul");
        for (let i = 0; i < statusMessages.length; i++) {
            let item = document.createElement("li");
            let itemText = document.createTextNode(statusMessages[i]);
            item.appendChild(itemText);
            list.appendChild(item);
        }
        
        $("#statusMessages").empty().append(list);
    }
    
    let dealCards = function() {
        $.ajax({
            method: "GET",
            url: "/gofish/game/" + gameIdCurrent + "/deal",
        })
        .done(function(data) {
            for (let i = 0; i < data.length; i++) {
                let playerCurrent = data[i];
                let playerName = playerCurrent["player"]["name"];
                let playerId = playerCurrent["player"]["id"];
                let playerCards = playerCurrent["cards"];

                let playerElem = "rowPlayer" + i;
                fillPlayerRow(playerName, playerId, playerElem, playerCards);
            }
            numPlayers = data.length;
            currentPlayerTurn = data[0];
            currentPlayers = data;
            updateStatusArea();
//            populateActionBar();
            
            startTurns();
        });
    }

    let clearActionBar = function() {
        $("#actionBar").empty();
    };
    
    let clearAskBar = function() {
        $("#actionAsk").empty();
    };
    
    let clearResponseBar = function() {
        $("#actionResponse").empty();
    };
    
    let showActionResponse = function() {
        clearResponseBar();
        let player = new Player(currentPlayerTurn);
        let barCols = player.buildActionResponseBar(); 
        
        for (let i = 0; i < barCols.length; i++) {
            $("#actionResponse").append(barCols[i]);
        }
        
        let br = document.createElement("br");
        $("#actionResponse").append(br);
        
        /* // Move me!
        clearResponseBar();
        let player = new Player(currentPlayerTurn);
        let barCols = player.buildActionResponseBar(); 
        
        for (let i = 0; i < barCols.length; i++) {
            $("#actionResponse").append(barCols[i]);
        }
        
        let br = document.createElement("br");
        $("#actionResponse").append(br);
         */
    };
    
    let startTurns = function() {
        let currentPlayerId = currentPlayerTurn.player.id;
        let otherPlayers = [];
        for (let i = 0; i < currentPlayers.length; i++) {
            if (currentPlayers[i].player.id !== currentPlayerId) {
                otherPlayers.push(currentPlayers[i]);
            }
        }
        
        clearAskBar();
        let player = new Player(currentPlayerTurn);
        barCols = player.buildAskBar(otherPlayers);
        for (let i = 0; i < barCols.length; i++) {
            $("#actionAsk").append(barCols[i]);
        }
        
        $(".btnAskPlayer").click(function() {
            let playerToAskId = $(this).data("player-id");
            console.log("playerToAskId: " + playerToAskId);
            let playerToAskHandId = $(this).data("hand-id");
            let cardNum = $("#selectCardInHand").val();

            checkIfHandContainsCardThenUpdate(currentPlayerTurn.player.id, playerToAskId, 
                playerToAskHandId, cardNum);
            
        });
        
        
    }   
       
    $("#btnGameNew").click(function() {
        let reqData = { 
            "number_players": "3",
            "players": [
                {"name": "You"},
                {"name": "Joel-NPC"},
                {"name": "Lauren-NPC"}
            ]
        };
        
        $.ajax({
            method: "POST",
            url: "/gofish/game",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(reqData) 
        })
        .done(function(data) {
            gameIdCurrent = data["game"]["id"];
            deckIdCurrent = data["deck"]["id"]
//            $("#btnGameNew").attr("readonly", "true");
            clearActionBar();
            dealCards();
            
            
           
    
//            alert("gameIdCurrent: " + gameIdCurrent);
        });
    });
    
//    $("#btnNextTurn").click(function() {
//        console.log("currentPlayerTurn");
//        console.log(currentPlayerTurn);
//        
//    });
//    
//    $("#btnGoFish").click(function() {
//        let url = "/gofish/game/" + gameIdCurrent + "/deck/" + deckIdCurrent + "/take/1";
////       let url = "/gofish/game/122/deck/122/take/1";
//
//        // Take a card from the top
//        $.ajax({
//            method: "GET",
//            url: url
//        })
//        .done(function(data) {
//            let cardId = data["cards"][0]["id"];
//            // Assign card to player
//            let mainPlayer = [];
//            for (i = 0; i < currentPlayers.length; i++) {
//                if (currentPlayers[i]["player"]["name"] = "clientPlayer") {
//                    mainPlayer = currentPlayers[i];
//                }
//            }
//    
//            let url = "/gofish/game/" + gameIdCurrent + "/player/" + mainPlayer["player"]["id"] + 
//                    "/hand/" + mainPlayer["hand"]["id"] + "/card/" + cardId;
////            console.log("url: " + url);
//            
//            let reqData = {
//                "deck": {
//                    "id": deckIdCurrent
//                }
//            };
//            
//            $.ajax({
//                method: "POST",
//                url: url,
//                contentType: "application/json",
//                dataType: "json",
//                data: JSON.stringify(reqData) 
//            })
//            .done(function(data) {
//                alert ("Card retrieved & assigned to hand: " + data["cards"][0]["image_name"]);
////                console.log("response from assign card");
////                console.log(data)
//            });
//    
//    
//        });
//    });

//    let populateActionBar = function() {
//        
//        
//        let currentPlayerId = currentPlayerTurn["player"]["id"];
//        
//        for (let i = 0; i < currentPlayers.length; i++) {
//            if (currentPlayers[i]["player"]["id"] === currentPlayerId) {
//                continue;
//            }
//            let btnMsg = "Ask " + currentPlayers[i]["player"]["name"] + " for a card";
//            let btnText = document.createTextNode(btnMsg);
//
//            let btnAsk = document.createElement("button");
//            btnAsk.setAttribute("data-player-id", currentPlayers[i]["player"]["id"]);
//            btnAsk.setAttribute("data-player-name", currentPlayers[i]["player"]["name"]);
//            btnAsk.setAttribute("data-hand-id", currentPlayers[i]["hand"]["id"]);
//            
//            btnAsk.className = "btnAsk";
//            btnAsk.appendChild(btnText);
//
//            let div = document.createElement("div");
//            div.className = "col-sm-2";
//            div.appendChild(btnAsk);
//
//            $("#actionBar").append(div);
//        }
//        
//        $(".btnAsk").click(function() {
//            respondToBtnAskClick($(this));
//        });
//    }; 

//    let actionResponse = function(cards, playerName) {
////        console.log("Cards");
////        console.log(cards.length);
//        let cardFound = (cards.length > 0);
//        let resultClass = (cardFound === true ? "success" : "fail");
//        let msg = playerName;
//        let buttons = [];
//        
//        if (cardFound === true) {
//            msg += " has the card & gives it to you!";
//        }
//        else {
//            msg += " does not have the card. Go Fish!";
//            
//            let $btnText = document.createTextNode("Go Fish");
//            let $btnGoFish = document.createElement("button");
//            $btnGoFish.id = "btnGoFish";
//            $btnGoFish.appendChild($btnText);
//            
//            buttons.push($btnGoFish);
//        }
//        
//        let $btnNextTurn = document.createElement("button");
//        $btnNextTurn.id = "btnNextTurn";
//        let $btnText = document.createTextNode("Next turn");
//        $btnNextTurn.appendChild($btnText);
//        buttons.push($btnNextTurn);
//        
//        let resultMsg = document.createTextNode(msg);
//        
//        let resultContainer = document.createElement("div")
//        resultContainer.className = resultClass;
//        resultContainer.appendChild(resultMsg);
//        
//        
//        for (let i = 0; i < buttons.length; i++) {
//            resultContainer.appendChild(buttons[i]);
//            let $space = document.createTextNode("\xa0"); //&nbsp;");
//            resultContainer.appendChild($space);
//        }
//        
//        let actionResp = document.createElement("div");
//        actionResp.id = "actionResponse";
//        actionResp.appendChild(resultContainer);
//        return actionResp;
//    }
//    

    let checkIfHandContainsCardThenUpdate = function(currentPlayerId, playerToAskId, 
        playerToAskHandId, cardNum) {
        let requestUrl = "/gofish/game/" + gameIdCurrent + "/player/" + playerToAskId + 
            "/hand/" + playerToAskHandId + "/card?card_value=" + cardNum;
        
        $.ajax({
            method: "GET",
            url: requestUrl,
//            contentType: "application/json",
            dataType: "json"
//            data: JSON.stringify(reqData) 
        })
        .done(function(data) {
            let playerAsked = null;
            for (let i = 0; i < currentPlayers.length; i++) {
                if (currentPlayers[i].player.id === playerToAskId) {
                    playerAsked = currentPlayers[i];
                    break;
                }
            }
            
            let actionResult = (data.cards.length > 0);
            // Success
            let player = new Player(currentPlayerTurn);
            let actionResponse = player.buildActionResponseBarFromAsk(playerAsked, 
                currentPlayerTurn, actionResult);
            clearResponseBar();
            $("#actionResponse").append(actionResponse);
        });
    };

/*
    let respondToBtnAskClick = function($btnElem) {
       let gameId = $("#gameId").text();
       let playerId = $btnElem.data("player-id");
       let playerName = $btnElem.data("player-name");
       let handId = $btnElem.data("hand-id");
       
       $("#selectCardInHand").change(function() {
           checkIfHandContainsCard($(this), gameId, playerId, playerName, handId);
       });
  */     

    
});
