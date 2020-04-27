<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Annotation\MaxDepth;

/**
 * @ORM\Entity(repositoryClass="App\Repository\DeckRepository")
 */
class Deck
{
    /**
     * @MaxDepth(1)
     * @Groups("deck")
     * @ORM\Id()
     * @ORM\GeneratedValue()
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @MaxDepth(1)
     * @Groups("deck")
     * @ORM\OneToMany(targetEntity="App\Entity\Card", mappedBy="deck")
     */
    private $deck;

    public function __construct()
    {
        $this->deck = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    /**
     * @return Collection|Card[]
     */
    public function getDeck(): Collection
    {
        return $this->deck;
    }

    public function addDeck(Card $deck): self
    {
        if (!$this->deck->contains($deck)) {
            $this->deck[] = $deck;
            $deck->setDeck($this);
        }

        return $this;
    }

    public function removeDeck(Card $deck): self
    {
        if ($this->deck->contains($deck)) {
            $this->deck->removeElement($deck);
            // set the owning side to null (unless already changed)
            if ($deck->getDeck() === $this) {
                $deck->setDeck(null);
            }
        }

        return $this;
    }
}
