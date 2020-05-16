$(document).ready(function() {
    let gameIdCurrent = -1;
    
    let deckIdCurrent = -1;
    
    let testMode = true;
    
    let numPlayers = 0;
    
    let currentPlayerTurn = {};
    
    let currentPlayers = [];
   
    let fillPlayerRow = function(playerName, playerElem, cards) {
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
        playerCardsRow.className = "row";
        
        let currentCardValue = -1;
        let newCardValue = -2
        let cardBox = document.createElement("div");
        cardBox.className = "cardBox col-1";
        
        // Show all cards in player row
        if (testMode === true || playerName == "clientPlayer") {
        
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
        
        let statusMessages = ["No. of players: " + numPlayers,  
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
    
//    $("#btnDealCards").click(function() {
    let dealCards = function() {
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
            numPlayers = data.length;
            currentPlayerTurn = data[0];
            currentPlayers = data;
            updateStatusArea();
            populateActionBar();
        });
    }
//    })

    let populateActionBar = function() {
        
        
        let currentPlayerId = currentPlayerTurn["player"]["id"];
        
        for (let i = 0; i < currentPlayers.length; i++) {
            if (currentPlayers[i]["player"]["id"] === currentPlayerId) {
                continue;
            }
            let btnMsg = "Ask " + currentPlayers[i]["player"]["name"] + " for a card";
            let btnText = document.createTextNode(btnMsg);

            let btnAsk = document.createElement("button");
            btnAsk.setAttribute("data-player-id", currentPlayers[i]["player"]["id"]);
            btnAsk.setAttribute("data-player-name", currentPlayers[i]["player"]["name"]);
            btnAsk.setAttribute("data-hand-id", currentPlayers[i]["hand"]["id"]);
            
            btnAsk.className = "btnAsk";
            btnAsk.appendChild(btnText);

            let div = document.createElement("div");
            div.className = "col-sm-2";
            div.appendChild(btnAsk);

            $("#actionBar").append(div);
        }
        
        $(".btnAsk").click(function() {
            respondToBtnAskClick($(this));
        });
    }; 

    let clearActionBar = function() {
        $("#actionBar").empty();
    };
    
    let buildCardSelector = function() {
       let lblText = document.createTextNode("Ask for which card?");
       
       let label = document.createElement("label");
       label.appendChild(lblText);
       
       let selectBox = document.createElement("select");
       selectBox.id = "selectCardInHand";
       let optionVals = {1: "Ace",
            2: "2", 
            3: "3", 
            4: "4", 
            5: "5",
            6: "6",
            7: "7",
            8: "8",
            9: "9",
            10: "10",
            11: "Jack",
            12: "Queen",
            13: "King"
       };
       let keys = Object.keys(optionVals);
       for (let i = 0; i < keys.length; i++) {
           let optText = document.createTextNode(optionVals[keys[i]]);
           
           let option = document.createElement("option");
           option.setAttribute("value", keys[i]);
           option.appendChild(optText);
           
           selectBox.appendChild(option);
       }
       
       let selector = document.createElement("div");
       selector.className = "col-sm-4";
       selector.appendChild(label);
       selector.appendChild(selectBox);
       
       return selector;
    };
    
    let actionResponse = function(cards, playerName) {
//        console.log("Cards");
//        console.log(cards.length);
        let cardFound = (cards.length > 0);
        let resultClass = (cardFound === true ? "success" : "fail");
        let msg = playerName;
        
        if (cardFound === true) {
            msg += " has the card & gives it to you!";
        }
        else {
            msg += " does not have the card. Go Fish!";
        }
        
        let resultMsg = document.createTextNode(msg);
        
        let resultContainer = document.createElement("span")
        resultContainer.className = resultClass;
        resultContainer.appendChild(resultMsg);
        
        let actionResp = document.createElement("div");
        actionResp.id = "actionResponse";
        actionResp.appendChild(resultContainer);
        return actionResp;
    }
    
    let checkIfHandContainsCard = function($selectElem, gameId, playerId, playerName, handId) {
        let cardNum = $selectElem.val();
        let requestUrl = "/gofish/game/" + gameId + "/player/" + playerId + "/hand/" + 
                handId + "/card?card_value=" + cardNum;
//        alert(requestUrl);
        
        $.ajax({
            method: "GET",
            url: requestUrl,
//            contentType: "application/json",
            dataType: "json"
//            data: JSON.stringify(reqData) 
        })
        .done(function(data) {
//            console.log(data);
            let actionResp = actionResponse(data["cards"], playerName);
            $("#actionBar").append(actionResp);
        });
    };
    
    let respondToBtnAskClick = function($btnElem) {
       
       let selector = buildCardSelector();
       
       $("#actionBar").append(selector);
       
       let gameId = $("#gameId").text();
       let playerId = $btnElem.data("player-id");
       let playerName = $btnElem.data("player-name");
       let handId = $btnElem.data("hand-id");
       
       $("#selectCardInHand").change(function() {
           checkIfHandContainsCard($(this), gameId, playerId, playerName, handId);
       });
       

    };
       
    $("#btnGameNew").click(function() {
        let reqData = { 
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
    
    $("#btnGoFish").click(function() {
        let url = "/gofish/game/" + gameIdCurrent + "/deck/" + deckIdCurrent + "/take/1";
//       let url = "/gofish/game/122/deck/122/take/1";

        // Take a card from the top
        $.ajax({
            method: "GET",
            url: url
        })
        .done(function(data) {
            let cardId = data["cards"][0]["id"];
            // Assign card to player
            let mainPlayer = [];
            for (i = 0; i < currentPlayers.length; i++) {
                if (currentPlayers[i]["player"]["name"] = "clientPlayer") {
                    mainPlayer = currentPlayers[i];
                }
            }
    
            let url = "/gofish/game/" + gameIdCurrent + "/player/" + mainPlayer["player"]["id"] + 
                    "/hand/" + mainPlayer["hand"]["id"] + "/card/" + cardId;
//            console.log("url: " + url);
            
            let reqData = {
                "deck": {
                    "id": deckIdCurrent
                }
            };
            
            $.ajax({
                method: "POST",
                url: url,
                contentType: "application/json",
                dataType: "json",
                data: JSON.stringify(reqData) 
            })
            .done(function(data) {
                alert ("Card retrieved & assigned to hand: " + data["cards"][0]["image_name"]);
//                console.log("response from assign card");
//                console.log(data)
            });
    
    
        });
    });
    
});
