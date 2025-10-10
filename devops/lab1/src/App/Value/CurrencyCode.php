<?php

declare(strict_types=1);

namespace App\Value;

enum CurrencyCode: string
{
    case EUR = 'EUR';
    case USD = 'USD';
    case CZK = 'CZK';
    case IDR = 'IDR';
    case BRL = 'BRL';

    public static function fromString(string $code): self
    {
        return match (strtoupper($code)) {
            self::EUR->value => self::EUR,
            self::USD->value => self::USD,
            self::CZK->value => self::CZK,
            self::IDR->value => self::IDR,
            self::BRL->value => self::BRL,
            default => throw new \InvalidArgumentException(sprintf('Unknown currency code: %s', $code)),
        };
    }

    public function getValue(): string
    {
        return $this->value;
    }
}


