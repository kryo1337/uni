<?php

declare(strict_types=1);

namespace App\Dto;

class CurrencyRateDto
{
    public function __construct(
        public readonly string $code,
        public readonly float $mid,
        public readonly \DateTimeImmutable $effectiveDate
    ) {
    }

    public static function fromSingleRatePayload(array $payload): self
    {
        $code = (string) ($payload['code'] ?? '');
        $rates = $payload['rates'] ?? [];
        $first = is_array($rates) && isset($rates[0]) && is_array($rates[0]) ? $rates[0] : [];
        $mid = (float) ($first['mid'] ?? 0.0);
        $effectiveDate = new \DateTimeImmutable((string) ($first['effectiveDate'] ?? 'now'));

        return new self($code, $mid, $effectiveDate);
    }

    public static function fromTableAItem(array $item, string $effectiveDate): self
    {
        $code = (string) ($item['code'] ?? '');
        $mid = (float) ($item['mid'] ?? 0.0);
        $date = new \DateTimeImmutable($effectiveDate);
        return new self($code, $mid, $date);
    }
}
