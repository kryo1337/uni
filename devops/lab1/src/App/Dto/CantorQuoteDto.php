<?php

declare(strict_types=1);

namespace App\Dto;

use App\Value\TradeSide;

class CantorQuoteDto
{
    public function __construct(
        public string $code,
        public string $side,
        public float $nbpMid,
        public float $price,
        public \DateTimeImmutable $effectiveDate
    ) {
    }

    public static function fromRate(CurrencyRateDto $rate, TradeSide $side, float $price): self
    {
        return new self($rate->code, $side->value, $rate->mid, $price, $rate->effectiveDate);
    }
}


