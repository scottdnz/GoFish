<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;
//use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
//use Symfony\Component\Serializer\Encoder\JsonEncoder;
//use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
//use Symfony\Component\Serializer\Serializer;
//use Symfony\Component\Serializer\SerializerInterface;
use App\Repository\CardRepository;
use App\Repository\DeckRepository;
use App\Repository\HandRepository;
use App\Repository\PlayerRepository;
use App\Repository\GameRepository;
use \DateTime;

class MainController extends AbstractController
{
    /**
     * @Route("/main", name="main")
     */
    public function index()
    {
        return $this->render('main/index.html.twig', [
        ]);
    }
    
    /**
     * API call
     * @Route("/game/{gameId}/deck/{deckId}", name="deckFetchSingle", methods={"GET"})
     */
    public function deckFetchSingle(string $deckId, DeckRepository $deckRepo, 
        CardRepository $cardRepo) { 
//        $deck = $deckRepo->find($deckId);
        $deckId = intval($deckId);
        
        if ($cardRepo->countAll() === 0) {
            $cards = $this->getDeckInitialCards();
            $cardRepo->insertMany($cards); 
        }
        $cards = $cardRepo->fetchCardsInDeck($deckId);
        
        $json = [
            "deck" => [
                "id" => $deckId
            ],
            "cards" => $cardRepo->serializeCards($cards)
        ];
        
        return new JsonResponse($json);
       
        // Previous version with serializer for JSON. Ran into troubles with circular reference error
//           $serializer = new Serializer([new ObjectNormalizer()], [new JsonEncoder()]);
//        $cardsJson = $serializer->serialize($cards, 'json', ['groups' => ['game', 'card', 'player', 'hand', 'deck']]);
//         $response = new Response($cardsJson);
//        $response->headers->set('Content-Type', 'application/json');
//      
//       return $response;
    }
    
    /**
     * API call
     * @Route("/game/{gameId}/player/{playerId}/hand/{handId}", name="handFetchSingle", methods={"GET"})
     */
    public function handFetchSingle(string $handId, HandRepository $handRepo, 
        CardRepository $cardRepo) {
        $cardsInHand = $cardRepo->fetchCardsByHand(intval($handId));
            
        $json = [
            "hand" => [
                "id" => $handId
            ],
            "cards" => $cardRepo->serializeCards($cardsInHand)
        ];
        
        return new JsonResponse($json);
    }
    
    /**
     * API call
     * @Route("/game/{gameId}/deal", name="gameDealCardsToPlayers", methods={"GET"})
     */
    public function gameDealCardsToPlayers($gameId, GameRepository $gameRepo, 
        PlayerRepository $playerRepo, 
        CardRepository $cardRepo) {
        $playersHands = $playerRepo->findByGameId($gameId);
        
//        $hands = [];
//        foreach ($players as $player) {
//            $hands[] = $player->getHand();
//        }
        
        $game = $gameRepo->find($gameId);
        $deckId = intval($game->getDeck()->getId());
        $cardsDealt = $cardRepo->dealCardsToPlayers($deckId, $playersHands);
        
        return new JsonResponse($cardsDealt);
    }
    
    /**
     * API call
     * @Route("/game/{gameId}/player/{playerId}/hand/{handId}/card/{cardId}", name="cardFetchSingle", methods={"GET"})
     */
    public function cardFetchSingle($cardId, CardRepository $cardRepo) {
        $card = $cardRepo->fetchSingle($cardId);
        return new JsonResponse(["cards" => [$card]]);
    }
    
    /**
     * API call
     * @Route("/game/{gameId}/player/{playerId}/hand/{handId}/card", 
     * name="handContainsCardWithNumber", methods={"GET"})
     */
    public function handContainsCardWithNumber($handId, HandRepository $handRepo, 
        CardRepository $cardRepo, Request $request) {
        
        $cardValue = $request->query->get("card_value");
        
        $cardsInHand = $cardRepo->fetchCardsByHand(intval($handId));
        $cardNum = intval($cardValue);
        
        $cardFound = null;
        foreach ($cardsInHand as $card) {
            if (intval($card->getValue()) === $cardNum) {
                $cardFound = $card;
                break;
            }
        }
        
        if (is_null($cardFound)) {
            $card = [];
        }
        else {
            $card = [$cardRepo->serializeCard($cardFound)];
        }
        
        return new JsonResponse(["cards" => $card]);
    }
    
    /**
     * @Route("/game/{gameId}/deck/{deckId}/take/{numCards}", name="deckFetchCard", methods={"GET"})
     */
    public function takeCardsFromDeck($deckId, $numCards, CardRepository $cardRepo) {
        $cards = $cardRepo->fetchTopCardsInDeck($deckId, 1);
        
        $json = [
            "cards" => $cardRepo->serializeCards($cards)
        ];
        
        return new JsonResponse($json); 
    }
    
    /**
     * API call
     * @Route("/game/{gameId}/player/{playerId}/hand/{handId}/card/{cardId}", 
     * name="assignCardToPlayer", methods={"POST"})
     */
    public function assignCardToPlayer($gameId, $playerId, $handId, $cardId, 
        CardRepository $cardRepo, HandRepository $handRepo, Request $request) {
        
        $content = json_decode($request->getContent(), true);
        $deckId = $content["deck"]["id"];
        
        $hand = $handRepo->find($handId);
        
        $cards = $cardRepo->assignCardsToPlayer($deckId, $hand, [$cardId]);
        
        $json = [
            "cards" => $cardRepo->serializeCards($cards)
        ];
        
        return new JsonResponse($json); 
    }
    
    /**
     * API call
     * @Route("/game", name="gameInitialise", methods={"POST"})
     */
    public function gameInitialise(Request $request, 
        CardRepository $cardRepo, 
        GameRepository $gameRepo, 
        DeckRepository $deckRepo, 
        PlayerRepository $playerRepo, 
        HandRepository $handRepo) {
        
        // Only for local testing
        $tablesToWipe = ["card"]; //, "deck", "hand", "game", "player"];
        foreach ($tablesToWipe as $table) {
            $cardRepo->wipeTable($table);
        }
        
        $deck = $deckRepo->insertOne();
        
        $game = $gameRepo->insertOne(true, $deck, new DateTime());
        
        // Could use: json-request-bundle JsonRequestTransformerListener
        $content = json_decode($request->getContent(), true);
        
        $numPlayers = (int)$content["number_players"];
        $players = $content["players"];
        
        for ($i = 0; $i < $numPlayers; $i++) {
            $hand = $handRepo->insertOne();
            $player = $playerRepo->insertOne($players[$i]["name"], $game, $hand);
        }
        $cards = $this->getDeckInitialCards();
        $cardRepo->insertMany($cards, $game, $deck);
        
        return new JsonResponse(
        	[
                "status" =>  "OK",
                "game" => [
                    "id" => $game->getId()
                ],
                "deck" => [
                    "id" => $deck->getId()
                ]
            ]
        );
    }
    
    private function getDeckInitialCards() {
        $cards = [];

        $suits = ["Hearts", "Diamonds", "Spades", "Clubs"];

        $suitCards = ["Ace" => 1,
            "2" => 2, 
            "3" => 3, 
            "4" => 4, 
            "5" => 5, 
            "6" => 6,
            "7" => 7,
            "8" => 8,
            "9" => 9,
            "10" => 10,
            "Jack" => 11,
            "Queen" => 12, 
            "King" => 13,
        ];

		foreach ($suits as $suitName) {
			foreach ($suitCards as $cardLabel => $cardValue) {
                
                $imageCardName = "";
                if ($cardValue < 10) {
                    $imageCardName .= "0";
                }
                $imageCardName .= (string)$cardValue . strtoupper(substr($suitName, 0, 1)) . ".png";
                
				$cards[] = ["suit" => $suitName,
					"display_label" => $cardLabel,
					"value" => $cardValue,
                    "image_name" => $imageCardName
				];
			}
		}
		return $cards;
	}

}
