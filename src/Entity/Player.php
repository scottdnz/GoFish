<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

/**
 * @ORM\Entity(repositoryClass="App\Repository\PlayerRepository")
 */
class Player
{
    /**
     * @Groups("player")
     * @ORM\Id()
     * @ORM\GeneratedValue()
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=50)
     */
    private $name;

    /**
     * @Groups("player")
     * @ORM\OneToOne(targetEntity="App\Entity\Hand", cascade={"persist", "remove"})
     */
    private $hand;

    /**
     * @Groups("player")
     * @ORM\ManyToOne(targetEntity="App\Entity\Game", inversedBy="player")
     */
    private $game;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;

        return $this;
    }

    public function getHand(): ?Hand
    {
        return $this->hand;
    }

    public function setHand(?hand $hand): self
    {
        $this->hand = $hand;

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
