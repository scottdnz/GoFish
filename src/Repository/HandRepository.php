<?php

namespace App\Repository;

use App\Entity\Hand;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Common\Persistence\ManagerRegistry;

/**
 * @method Hand|null find($id, $lockMode = null, $lockVersion = null)
 * @method Hand|null findOneBy(array $criteria, array $orderBy = null)
 * @method Hand[]    findAll()
 * @method Hand[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class HandRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Hand::class);
    }
    
    public function insertMany($hands) {
        $em = $this->getEntityManager();
        foreach ($hands as $hand) {
            $newHand = new Hand();
            $em->persist($newHand);
        }
        $em->flush();
    }
    
    public function insertOne() {
        $newHand = new Hand();

        $em = $this->getEntityManager();
        $em->persist($newHand);
        $em->flush();
        return $newHand;
    }
    
//    public function getHandsByIds() {
//        
//    }

    // /**
    //  * @return Hand[] Returns an array of Hand objects
    //  */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('h')
            ->andWhere('h.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('h.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }

    /*
    public function findOneBySomeField($value): ?Hand
    {
        return $this->createQueryBuilder('h')
            ->andWhere('h.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
