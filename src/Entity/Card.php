<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Annotation\MaxDepth;

/**
 * @ORM\Entity(repositoryClass="App\Repository\CardRepository")
 */
class Card
{
    /**
     * @MaxDepth(1)
     * @Groups("card")
     * @ORM\Id()
     * @ORM\GeneratedValue()
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=10)
     */
    private $suit;

    /**
     * @ORM\Column(type="string", length=30)
     */
    private $display_label;

    /**
     * @ORM\Column(type="integer")
     */
    private $value;

    /**
     * @ORM\Column(type="string", length=30)
     */
    private $image_name;

    /**
     * @MaxDepth(1)
     * @Groups("card")
     * @ORM\ManyToOne(targetEntity="App\Entity\Hand", inversedBy="card")
     */
    private $hand;

    /**
     * @MaxDepth(1)
     * @Groups("card")
     * @ORM\ManyToOne(targetEntity="App\Entity\Deck", inversedBy="deck")
     */
    private $deck;

    /**
     * @ORM\Column(type="integer", nullable=true)
     */
    private $position;

    /**
     * @Groups("card")
     * @ORM\ManyToOne(targetEntity="App\Entity\Game", inversedBy="cards")
     */
    private $game;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getSuit(): ?string
    {
        return $this->suit;
    }

    public function setSuit(string $suit): self
    {
        $this->suit = $suit;

        return $this;
    }

    public function getDisplayLabel(): ?string
    {
        return $this->display_label;
    }

    public function setDisplayLabel(string $display_label): self
    {
        $this->display_label = $display_label;

        return $this;
    }

    public function getValue(): ?int
    {
        return $this->value;
    }

    public function setValue(int $value): self
    {
        $this->value = $value;

        return $this;
    }

    public function getImageName(): ?string
    {
        return $this->image_name;
    }

    public function setImageName(string $image_name): self
    {
        $this->image_name = $image_name;

        return $this;
    }

    public function getHand(): ?Hand
    {
        return $this->hand;
    }

    public function setHand(?Hand $hand): self
    {
        $this->hand = $hand;

        return $this;
    }

    public function getDeck(): ?Deck
    {
        return $this->deck;
    }

    public function setDeck(?Deck $deck): self
    {
        $this->deck = $deck;

        return $this;
    }

    public function getPosition(): ?int
    {
        return $this->position;
    }

    public function setPosition(?int $position): self
    {
        $this->position = $position;

        return $this;
    }

    public function getGame(): ?Game
    {
        return $this->game;
    }

    public function setGame(?Game $game): self
    {
        $this->game = $game;

        return $this;
    }
}
