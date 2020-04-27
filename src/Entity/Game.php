<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Annotation\MaxDepth;


/**
 * @ORM\Entity(repositoryClass="App\Repository\GameRepository")
 */
class Game
{
    /**
     * @MaxDepth(1)
     * @Groups("game")
     * @ORM\Id()
     * @ORM\GeneratedValue()
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(type="datetime", nullable=true)
     */
    private $started;

    /**
     * @ORM\Column(type="boolean")
     */
    private $active;

    /*
     * @MaxDepth(1)
     * @Groups("game")
     * @ORM\OneToMany(targetEntity="App\Entity\Player", mappedBy="game")
     */
    private $player;

    /**
     * @MaxDepth(1)
     * @Groups("game")
     * @ORM\OneToOne(targetEntity="App\Entity\Deck", cascade={"persist", "remove"})
     */
    private $deck;

    /**
     * @MaxDepth(1)
     * @Groups("game")
     * @ORM\OneToMany(targetEntity="App\Entity\Card", mappedBy="game")
     */
    private $cards;

    public function __construct()
    {
        $this->player = new ArrayCollection();
        $this->cards = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getStarted(): ?\DateTimeInterface
    {
        return $this->started;
    }

    public function setStarted(?\DateTimeInterface $started): self
    {
        $this->started = $started;

        return $this;
    }

    public function getActive(): ?bool
    {
        return $this->active;
    }

    public function setActive(bool $active): self
    {
        $this->active = $active;

        return $this;
    }

    /**
     * @return Collection|Player[]
     */
    public function getPlayer(): Collection
    {
        return $this->player;
    }

    public function addPlayer(Player $player): self
    {
        if (!$this->player->contains($player)) {
            $this->player[] = $player;
            $player->setGame($this);
        }

        return $this;
    }

    public function removePlayer(Player $player): self
    {
        if ($this->player->contains($player)) {
            $this->player->removeElement($player);
            // set the owning side to null (unless already changed)
            if ($player->getGame() === $this) {
                $player->setGame(null);
            }
        }

        return $this;
    }

    public function getDeck(): ?deck
    {
        return $this->deck;
    }

    public function setDeck(?Deck $deck): self
    {
        $this->deck = $deck;

        return $this;
    }

//    /**
//     * @return Collection|Card[]
//     */
//    public function getCards(): Collection
//    {
//        return $this->cards;
//    }
//
//    public function addCard(Card $card): self
//    {
//        if (!$this->cards->contains($card)) {
//            $this->cards[] = $card;
//            $card->setGame($this);
//        }
//
//        return $this;
//    }
//
//    public function removeCard(Card $card): self
//    {
//        if ($this->cards->contains($card)) {
//            $this->cards->removeElement($card);
//            // set the owning side to null (unless already changed)
//            if ($card->getGame() === $this) {
//                $card->setGame(null);
//            }
//        }
//
//        return $this;
//    }
}
