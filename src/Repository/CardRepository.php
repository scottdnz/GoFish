<?php

namespace App\Repository;

use App\Entity\Card;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Common\Persistence\ManagerRegistry;

/**
 * @method Card|null find($id, $lockMode = null, $lockVersion = null)
 * @method Card|null findOneBy(array $criteria, array $orderBy = null)
 * @method Card[]    findAll()
 * @method Card[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class CardRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Card::class);
    }
    
    public function insertMany($cards, $game, $deck=null, $hand=null) {
        $previousDeckPositionsAlreadyTaken = [];
        $deckLen = count($cards);
        $em = $this->getEntityManager();
        
        foreach ($cards as $card) {
            $newCard = new Card();
            $newCard->setSuit($card["suit"]);
            $newCard->setDisplayLabel($card["display_label"]);
            $newCard->setValue($card["value"]);
            $newCard->setImageName($card["image_name"]);
            $newCard->setGame($game);
            if (! is_null($deck)) {
                $newCard->setDeck($deck);
            }
            if (! is_null($hand)) {
                $newCard->setHand($hand);
            }
            
            // As if shuffled and the card has a random position in the deck
            $takePosition = false;
            while ($takePosition === false) {
                $randomNo = rand(0, $deckLen - 1);
                if (! in_array($randomNo, $previousDeckPositionsAlreadyTaken)) {
                    $previousDeckPositionsAlreadyTaken[] = $randomNo;
                    $position = $randomNo;
                    $takePosition = true;
                }
            }
            $newCard->setPosition($position);
            $em->persist($newCard);
        };
        $em->flush();
    }
    
    public function fetchCardsInDeck($deckId, $numCards=null) {             
        $q =  $this->createQueryBuilder('c');
        $q->join('c.deck', 'd')
            ->where('d.id = :deckId')
            ->andWhere($q->expr()->isNull('c.hand'))
            ->setParameter('deckId', $deckId)
            ->orderBy('c.position', 'ASC');
        if (! is_null($numCards)) {
            $q->setMaxResults($numCards);
        } 
            
        return $q->getQuery()->getResult();
    }
    
    public function fetchCardsByHand($handId) {
        return $this->createQueryBuilder('c')
            ->join('c.hand', 'h')
            ->where('h.id = :val')
            ->setParameter('val', $handId)
            ->orderBy('c.position', 'ASC')
            ->getQuery()
            ->getResult();
    }
    
//    public function updateCardAssignToPlayer($handId) {
//        
//    }
    
    public function dealCardsToPlayers($deckId, $playersHands) {
        $cardsDealt = [];
        
        $em = $this->getEntityManager();
        foreach ($playersHands as $player) {
            $hand = $player->getHand();
            $handId = $hand->getId();
            // take 5 cards from top position
            $cards = $this->fetchCardsInDeck($deckId, 5);
            
            // update the cards so position = null, hand_id populated
            foreach ($cards as $card) {
                $card->setHand($hand);
                $card->setDeck(null);
                $card->setPosition(null);
                $em->persist($card);
            }
            $cardsDealt[] = [
                "player" => [
                    "id" => $player->getId(),
                    "name" => $player->getName()
                ],
                "hand" => [
                    "id" => $handId
                ],
                "cards" => $this->serializeCards($cards)
            ];
            
            $em->flush();
        }
        
        return $cardsDealt;
    }
    
//    public function takeCardsFromTopOfDeck($deckId, $numCards) {
//        $cards = $this->fetchCards($deckId, $numCards);
////        foreach ($cards as $card) {
////            
////        }
//        $i = 0;
//    }
    
    public function listAll() {
        return $this->findAll();
    }
    
    public function countAll() {
        return (int)$this->count([]);
//            createQueryBuilder('c')
//            ->select('count(c.id)')
//            ->getQuery()
//            ->getSingleScalarResult();
    }
    
    public function wipeTable($tableName) {
        $conn = $this->getEntityManager()->getConnection();
        $platform = $conn->getDatabasePlatform();
        
        $conn->executeQuery('SET FOREIGN_KEY_CHECKS = 0;');
        
        $truncateSql = $platform->getTruncateTableSQL($tableName);
        $conn->executeUpdate($truncateSql);
        
        $conn->executeQuery('SET FOREIGN_KEY_CHECKS = 1;');
    }
    
    public function serializeCard($card) {
        $hand = $card->getHand();
        $deck = $card->getDeck();

        $cardArr = [
            "id" => $card->getId(),
            "suit" => $card->getSuit(),
            "display_label" => $card->getDisplayLabel(),
            "value" => $card->getValue(),
            "image_name" => $card->getImageName(),
            "position" => $card->getPosition(),
            "hand_id" => is_null($hand) ? null: $hand->getId(),
            "deck_id" => is_null($deck) ? null: $deck->getId(),
            "game_id" => $card->getGame()->getId(),
        ];
        return $cardArr;
    }
    
    public function serializeCards($cards) {
        $cardsJson = [];
//        $keys = ["id", "suit", "display_label", "value", "image_name", "hand_id", "deck_id", "game_id", "position"];
        foreach ($cards as $card) {
            $cardArr = $this->serializeCard($card);
            $cardsJson[] = $cardArr;
        }
        return $cardsJson;
    }

    // /**
    //  * @return Card[] Returns an array of Card objects
    //  */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('c.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?Card
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
